package com.wedding.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Filter giới hạn tần suất gửi yêu cầu (Rate Limiting) theo địa chỉ IP của Client
 * nhằm ngăn chặn hành vi brute-force mật khẩu và spam đăng ký hàng loạt.
 */
@Component
@Order(1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private final ConcurrentHashMap<String, RequestBucket> bucketMap = new ConcurrentHashMap<>();

    private static final int MAX_REGISTER_PER_WINDOW = 5;
    private static final long REGISTER_WINDOW_MS = 15 * 60 * 1000L;

    private static final int MAX_LOGIN_PER_WINDOW = 10;
    private static final long LOGIN_WINDOW_MS = 5 * 60 * 1000L;

    private static final int MAX_RESEND_PER_WINDOW = 3;
    private static final long RESEND_WINDOW_MS = 15 * 60 * 1000L;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("POST".equalsIgnoreCase(method)) {
            String clientIp = extractClientIp(request);

            if (path.endsWith("/auth/register")) {
                if (!isAllowed(clientIp + ":register", MAX_REGISTER_PER_WINDOW, REGISTER_WINDOW_MS)) {
                    rejectRequest(response, "Bạn đã thực hiện quá nhiều yêu cầu đăng ký. Vui lòng thử lại sau 15 phút.");
                    return;
                }
            } else if (path.endsWith("/auth/login")) {
                if (!isAllowed(clientIp + ":login", MAX_LOGIN_PER_WINDOW, LOGIN_WINDOW_MS)) {
                    rejectRequest(response, "Bạn đã nhập đăng nhập quá nhiều lần từ IP này. Vui lòng thử lại sau 5 phút.");
                    return;
                }
            } else if (path.endsWith("/auth/resend-verification")) {
                if (!isAllowed(clientIp + ":resend", MAX_RESEND_PER_WINDOW, RESEND_WINDOW_MS)) {
                    rejectRequest(response, "Bạn đã yêu cầu gửi lại email quá nhiều lần. Vui lòng thử lại sau 15 phút.");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean isAllowed(String key, int maxRequests, long windowMs) {
        long now = System.currentTimeMillis();
        RequestBucket bucket = bucketMap.compute(key, (k, existing) -> {
            if (existing == null || now - existing.startTime > windowMs) {
                return new RequestBucket(now, new AtomicInteger(1));
            }
            existing.counter.incrementAndGet();
            return existing;
        });

        if (bucketMap.size() > 5000) {
            bucketMap.entrySet().removeIf(entry -> now - entry.getValue().startTime > windowMs * 2);
        }

        return bucket.counter.get() <= maxRequests;
    }

    private void rejectRequest(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Retry-After", "60");

        String payload = String.format(
                "{\"code\":429,\"message\":\"%s\",\"data\":null,\"timestamp\":\"%s\"}",
                message,
                Instant.now()
        );
        response.getWriter().write(payload);
    }

    private String extractClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isBlank() || "unknown".equalsIgnoreCase(xfHeader)) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private record RequestBucket(long startTime, AtomicInteger counter) {
    }
}

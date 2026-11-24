package com.wedding.auth.service;

import com.wedding.common.exception.AppException;
import com.wedding.common.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

/** Verifies Google-issued credentials for the configured web client and browser challenge. */
@Service
public class GoogleIdentityService {

    private final String clientId;
    private final NimbusJwtDecoder decoder;

    @Autowired
    public GoogleIdentityService(@Value("${app.google.client-id}") String clientId) {
        this(clientId, NimbusJwtDecoder.withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs").build());
    }

    GoogleIdentityService(String clientId, NimbusJwtDecoder decoder) {
        this.clientId = clientId;
        this.decoder = decoder;
        JwtClaimValidator<String> presenterValidator = new JwtClaimValidator<>("azp", clientId::equals);
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefault(),
                new JwtClaimValidator<String>("iss", issuer ->
                        "https://accounts.google.com".equals(issuer) || "accounts.google.com".equals(issuer)),
                new JwtClaimValidator<List<String>>("aud", audience ->
                        audience != null && audience.equals(List.of(clientId))),
                token -> token.hasClaim("azp") ? presenterValidator.validate(token) : OAuth2TokenValidatorResult.success(),
                new JwtClaimValidator<Object>("exp", expiration -> expiration != null)
        ));
    }

    /** Rejects requests when Google sign-in has no configured audience. */
    public void requireConfigured() {
        if (clientId.isBlank()) {
            throw new AppException(HttpStatus.SERVICE_UNAVAILABLE, "Đăng nhập Google chưa được cấu hình.");
        }
    }

    /** Resolves the stable Google subject after signature, claims and browser nonce validation. */
    public GoogleIdentity verify(String credential, String expectedNonce) {
        requireConfigured();
        Jwt token;
        try {
            token = decoder.decode(credential);
        } catch (JwtException exception) {
            throw new UnauthorizedException("Không thể xác thực với Google. Vui lòng thử lại.");
        }

        String subject = token.getSubject();
        if (!expectedNonce.equals(token.getClaimAsString("nonce"))
                || subject == null || subject.isBlank() || subject.length() > 255) {
            throw new UnauthorizedException("Phiên đăng nhập Google không hợp lệ. Vui lòng thử lại.");
        }

        String email = token.getClaimAsString("email");
        boolean verifiedEmail = Boolean.TRUE.equals(token.getClaimAsBoolean("email_verified"));
        email = email == null ? "" : email.strip().toLowerCase(Locale.ROOT);
        String hostedDomain = token.getClaimAsString("hd");
        boolean authoritativeEmail = verifiedEmail && (email.endsWith("@gmail.com")
                || (hostedDomain != null && !hostedDomain.isBlank()));
        return new GoogleIdentity(subject, email, token.getClaimAsString("name"), authoritativeEmail);
    }

    public record GoogleIdentity(String subject, String email, String name, boolean authoritativeEmail) {
    }
}

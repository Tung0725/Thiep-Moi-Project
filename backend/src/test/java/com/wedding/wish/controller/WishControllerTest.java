package com.wedding.wish.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wedding.common.exception.AppException;
import com.wedding.common.exception.GlobalExceptionHandler;
import com.wedding.wish.dto.request.SubmitWishRequest;
import com.wedding.wish.dto.response.WishResponseDto;
import com.wedding.wish.entity.AttendanceStatus;
import com.wedding.wish.service.WishService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class WishControllerTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private WishService wishService;

    @InjectMocks
    private WishController wishController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(wishController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("QA Gate 1.1: POST để trống guestName trả về 400 Bad Request kèm message lỗi")
    void submitWish_BlankGuestName_Returns400() throws Exception {
        SubmitWishRequest invalidRequest = SubmitWishRequest.builder()
                .guestName("   ")
                .attendanceStatus("ATTENDING")
                .guestCount(2)
                .message("Chúc mừng!")
                .build();

        mockMvc.perform(post("/public/invitations/hb04-demo/wishes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.message").value("Tên khách mời không được để trống"));
    }

    @Test
    @DisplayName("QA Gate 1.2: POST với slug không tồn tại trả về 404 Not Found")
    void submitWish_SlugNotFound_Returns404() throws Exception {
        SubmitWishRequest request = SubmitWishRequest.builder()
                .guestName("Bạn Minh")
                .attendanceStatus("ATTENDING")
                .guestCount(1)
                .message("Chúc mừng hạnh phúc!")
                .build();

        when(wishService.submitWish(eq("slug-fake-123"), any(SubmitWishRequest.class)))
                .thenThrow(new AppException(HttpStatus.NOT_FOUND, "Không tìm thấy thiệp mời với đường dẫn yêu cầu."));

        mockMvc.perform(post("/public/invitations/slug-fake-123/wishes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value(404))
                .andExpect(jsonPath("$.message").value("Không tìm thấy thiệp mời với đường dẫn yêu cầu."));
    }

    @Test
    @DisplayName("QA Gate 1.3: POST hợp lệ trả về 201 Created trong wrapper ApiResponse<WishResponseDto>")
    void submitWish_ValidRequest_Returns201() throws Exception {
        SubmitWishRequest request = SubmitWishRequest.builder()
                .guestName("Gia đình Bác Hùng")
                .attendanceStatus("ATTENDING")
                .guestCount(2)
                .message("Chúc hai cháu trăm năm hạnh phúc!")
                .build();

        WishResponseDto responseDto = WishResponseDto.builder()
                .id(1L)
                .guestName("Gia đình Bác Hùng")
                .attendanceStatus(AttendanceStatus.ATTENDING)
                .guestCount(2)
                .message("Chúc hai cháu trăm năm hạnh phúc!")
                .createdAt(Instant.parse("2026-10-30T16:00:00Z"))
                .build();

        when(wishService.submitWish(eq("hb04-demo"), any(SubmitWishRequest.class))).thenReturn(responseDto);

        mockMvc.perform(post("/public/invitations/hb04-demo/wishes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value(201))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.guestName").value("Gia đình Bác Hùng"))
                .andExpect(jsonPath("$.data.attendanceStatus").value("ATTENDING"))
                .andExpect(jsonPath("$.data.guestCount").value(2));
    }

    @Test
    @DisplayName("QA Gate 1.4: GET danh sách lời chúc phân trang trả về 200 OK")
    void getWishes_ValidSlug_Returns200Page() throws Exception {
        WishResponseDto item = WishResponseDto.builder()
                .id(1L)
                .guestName("Hội Bạn Thân")
                .attendanceStatus(AttendanceStatus.ATTENDING)
                .guestCount(3)
                .message("Chúc mừng đôi trẻ!")
                .createdAt(Instant.parse("2026-10-30T16:05:00Z"))
                .build();

        when(wishService.getWishesBySlug(eq("hb04-demo"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(item), PageRequest.of(0, 5), 1));

        mockMvc.perform(get("/public/invitations/hb04-demo/wishes")
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.content[0].guestName").value("Hội Bạn Thân"))
                .andExpect(jsonPath("$.data.content[0].guestCount").value(3))
                .andExpect(jsonPath("$.data.totalElements").value(1));
    }
}

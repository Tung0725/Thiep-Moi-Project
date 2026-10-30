package com.wedding.invitation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO phản hồi dữ liệu công khai của thiệp cưới cho khách mời (/t/[slug]).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicCardResponse {

    private String slug;
    private String title;
    private String groomName;
    private String brideName;
    private String eventDate;
    private String venueName;
    private String contentSchema;
}

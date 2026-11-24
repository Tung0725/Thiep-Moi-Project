package com.wedding.auth.service;

import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class EmailServiceTest {

    @Test
    void sendsVerificationLinkFromConfiguredGmailAccount() {
        JavaMailSender sender = mock(JavaMailSender.class);
        EmailService service = new EmailService(sender, "sender@gmail.com", "https://wedding.example/");

        service.sendVerificationEmail(new EmailService.VerificationEmailRequested("guest@example.com", "Nguyễn An", "token+test"));

        ArgumentCaptor<SimpleMailMessage> messageCaptor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(sender).send(messageCaptor.capture());
        SimpleMailMessage message = messageCaptor.getValue();
        assertThat(message.getFrom()).isEqualTo("sender@gmail.com");
        assertThat(message.getTo()).containsExactly("guest@example.com");
        assertThat(message.getText()).contains("Nguyễn An", "https://wedding.example/verify-email?token=token%2Btest", "24 giờ");
    }

    @Test
    void skipsDeliveryWhenGmailAccountIsMissing() {
        JavaMailSender sender = mock(JavaMailSender.class);
        EmailService service = new EmailService(sender, "", "https://wedding.example");

        service.sendVerificationEmail(new EmailService.VerificationEmailRequested("guest@example.com", "Nguyễn An", "token"));

        verifyNoInteractions(sender);
    }
}

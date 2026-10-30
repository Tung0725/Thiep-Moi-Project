package com.wedding;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * WeddingApplication
 * Entry point for the Online Wedding Invitation Backend Service (JSON-Driven UI Architecture).
 */
@SpringBootApplication
@EnableAsync
public class WeddingApplication {

    public static void main(String[] args) {
        SpringApplication.run(WeddingApplication.class, args);
    }
}

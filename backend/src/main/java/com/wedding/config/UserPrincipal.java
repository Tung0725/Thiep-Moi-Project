package com.wedding.config;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.security.Principal;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class UserPrincipal implements Principal {

    private final UUID id;
    private final String email;
    private final String role;

    @Override
    public String getName() {
        return id.toString();
    }
}

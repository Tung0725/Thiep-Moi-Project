package com.wedding.auth.service;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.wedding.common.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.interfaces.RSAPublicKey;
import java.time.Instant;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GoogleIdentityServiceTest {

    private static final String CLIENT_ID = "test-google-client";
    private static final String ISSUER = "https://accounts.google.com";
    private static KeyPair keys;
    private static GoogleIdentityService googleIdentityService;

    @BeforeAll
    static void setUp() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        keys = generator.generateKeyPair();
        googleIdentityService = new GoogleIdentityService(CLIENT_ID,
                NimbusJwtDecoder.withPublicKey((RSAPublicKey) keys.getPublic()).build());
    }

    @Test
    void verifiesSignedCredentialForThisBrowser() throws Exception {
        String token = credential(CLIENT_ID, ISSUER, Instant.now().plusSeconds(300), keys);

        assertThat(googleIdentityService.verify(token, "browser-challenge"))
                .isEqualTo(new GoogleIdentityService.GoogleIdentity("google-subject", "test@gmail.com", "Test User", true));
        assertThatThrownBy(() -> googleIdentityService.verify(token, "another-browser"))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void rejectsWrongAudienceIssuerExpiredAndMissingExpiry() throws Exception {
        Instant future = Instant.now().plusSeconds(300);
        String[] invalidTokens = {
                credential("other-client", ISSUER, future, keys),
                credential(CLIENT_ID, "https://identity.example.com", future, keys),
                credential(CLIENT_ID, ISSUER, Instant.now().minusSeconds(300), keys),
                credential(CLIENT_ID, ISSUER, null, keys)
        };
        for (String token : invalidTokens) {
            assertThatThrownBy(() -> googleIdentityService.verify(token, "browser-challenge"))
                    .isInstanceOf(UnauthorizedException.class);
        }
    }

    @Test
    void rejectsTokenSignedWithDifferentKey() throws Exception {
        KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
        generator.initialize(2048);
        String token = credential(CLIENT_ID, ISSUER, Instant.now().plusSeconds(300), generator.generateKeyPair());

        assertThatThrownBy(() -> googleIdentityService.verify(token, "browser-challenge"))
                .isInstanceOf(UnauthorizedException.class);
    }

    private String credential(String audience, String issuer, Instant expiration, KeyPair signer) throws Exception {
        JWTClaimsSet.Builder claims = new JWTClaimsSet.Builder()
                .audience(audience)
                .issuer(issuer)
                .subject("google-subject")
                .claim("nonce", "browser-challenge")
                .claim("email", "Test@gmail.com")
                .claim("email_verified", true)
                .claim("name", "Test User");
        if (expiration != null) {
            claims.expirationTime(Date.from(expiration));
        }
        SignedJWT token = new SignedJWT(new JWSHeader(JWSAlgorithm.RS256), claims.build());
        token.sign(new RSASSASigner(signer.getPrivate()));
        return token.serialize();
    }
}

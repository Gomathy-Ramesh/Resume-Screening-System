package com.resume.resume_screening_system.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

import io.jsonwebtoken.SignatureAlgorithm;

import io.jsonwebtoken.security.Keys;

import org.springframework.stereotype.Service;

import java.security.Key;

import java.util.Date;

@Service
public class JwtService {

    // =========================
    // SECRET KEY
    // =========================

    private static final String SECRET_KEY =

            "resume_screening_system_secret_key_12345678987654321";

    // =========================
    // GENERATE SIGN KEY
    // =========================

    private Key getSignKey() {

        return Keys.hmacShaKeyFor(

                SECRET_KEY.getBytes()
        );
    }

    // =========================
    // GENERATE JWT TOKEN
    // =========================

    public String generateToken(
            String username
    ) {

        return Jwts.builder()

                .setSubject(
                        username
                )

                .setIssuedAt(
                        new Date()
                )

                .setExpiration(

                        new Date(

                                System.currentTimeMillis()

                                        + 1000 * 60 * 60 * 10
                        )
                )

                .signWith(

                        getSignKey(),

                        SignatureAlgorithm.HS256
                )

                .compact();
    }

    // =========================
    // EXTRACT USERNAME
    // =========================

    public String extractUsername(
            String token
    ) {

        return extractClaims(token)
                .getSubject();
    }

    // =========================
    // EXTRACT CLAIMS
    // =========================

    private Claims extractClaims(
            String token
    ) {

        return Jwts.parserBuilder()

                .setSigningKey(
                        getSignKey()
                )

                .build()

                .parseClaimsJws(
                        token
                )

                .getBody();
    }

    // =========================
    // VALIDATE TOKEN
    // =========================

    public boolean isTokenValid(
            String token
    ) {

        try {

            extractClaims(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }
}
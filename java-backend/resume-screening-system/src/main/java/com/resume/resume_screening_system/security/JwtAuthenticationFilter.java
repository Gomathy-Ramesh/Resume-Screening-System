package com.resume.resume_screening_system.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Override
    protected void doFilterInternal(

            HttpServletRequest request,

            HttpServletResponse response,

            FilterChain filterChain

    ) throws ServletException, IOException {

        // =========================
        // GET AUTH HEADER
        // =========================

        String authHeader =
                request.getHeader(
                        "Authorization"
                );

        // =========================
        // CHECK TOKEN EXISTS
        // =========================

        if (

                authHeader == null

                        ||

                        !authHeader.startsWith(
                                "Bearer "
                        )

        ) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        // =========================
        // EXTRACT TOKEN
        // =========================

        String token =
                authHeader.substring(7);

        // =========================
        // EXTRACT USERNAME
        // =========================

        String username =
                jwtService.extractUsername(
                        token
                );

        // =========================
        // SET AUTHENTICATION
        // =========================

        if (

                username != null

                        &&

                        SecurityContextHolder
                                .getContext()
                                .getAuthentication()
                                == null

        ) {

            UsernamePasswordAuthenticationToken
                    authenticationToken =
                    new UsernamePasswordAuthenticationToken(

                            username,

                            null,

                            Collections.emptyList()
                    );

            authenticationToken.setDetails(

                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(
                            authenticationToken
                    );
        }

        // =========================
        // CONTINUE FILTER
        // =========================

        filterChain.doFilter(
                request,
                response
        );
    }
}
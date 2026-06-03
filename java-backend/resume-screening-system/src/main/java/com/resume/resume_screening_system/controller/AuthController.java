package com.resume.resume_screening_system.controller;

import com.resume.resume_screening_system.dto.LoginRequest;
import com.resume.resume_screening_system.dto.LoginResponse;
import com.resume.resume_screening_system.security.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import com.resume.resume_screening_system.entity.AdminUser;
import com.resume.resume_screening_system.repository.AdminUserRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private AdminUserRepository adminUserRepository;

    // =========================================
    // TEMP TOKEN STORAGE
    // =========================================

    private final Map<String, String> resetTokens =
            new HashMap<>();

    // =========================================
    // TEMP ADMIN PASSWORD
    // =========================================


    // =========================================
    // LOGIN
    // =========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        System.out.println(
                "Username: " + request.getUsername()
        );

        System.out.println(
                "Password: " + request.getPassword()
        );

        AdminUser admin =
        adminUserRepository
                .findByUsername(
                        request.getUsername()
                )
                .orElse(null);

if (
        admin != null
                &&
        admin.getPassword().equals(
                request.getPassword()
        )
) {

            String token =
                    jwtService.generateToken(
                            request.getUsername()
                    );

            return ResponseEntity.ok(
                    new LoginResponse(token)
            );
        }

        return ResponseEntity.status(401)
                .body(
                        "Invalid username or password"
                );
    }

    // =========================================
    // FORGOT PASSWORD
    // =========================================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody Map<String, String> request
    ) {

        String email =
                request.get("email");

        if (
                email == null
                        ||
                email.isBlank()
        ) {

            return ResponseEntity.badRequest()
                    .body(
                            "Email is required."
                    );
        }

        try {

            // Generate Token

            String resetToken =
                    UUID.randomUUID().toString();

            // Store Token

            resetTokens.put(
                    resetToken,
                    email
            );

            // Reset URL

            String resetLink =
                    "http://localhost:3000/reset-password?token="
                            + resetToken;

            // Create Email

            SimpleMailMessage message =
                    new SimpleMailMessage();

            message.setFrom(
                    "resumeiqscreening@gmail.com"
            );

            message.setTo(email);

            message.setSubject(
                    "Selectra Password Reset"
            );

            message.setText(
                    "Hello,\n\n"
                            + "We received a password reset request.\n\n"
                            + "Click the link below to reset your password:\n\n"
                            + resetLink
                            + "\n\n"
                            + "If you did not request this request, please ignore this email.\n\n"
                            + "Regards,\n"
                            + "Selectra Team"
            );

            mailSender.send(message);

            System.out.println(
                    "Reset Token: "
                            + resetToken
            );

            return ResponseEntity.ok(
                    "Password reset link sent successfully."
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(
                            "Failed to send password reset email."
                    );
        }
    }

    // =========================================
    // RESET PASSWORD
    // =========================================

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> request
    ) {

        String token =
                request.get("token");

        String newPassword =
                request.get("newPassword");

        if (
                token == null
                        ||
                !resetTokens.containsKey(token)
        ) {

            return ResponseEntity.badRequest()
                    .body(
                            "Invalid or expired token."
                    );
        }

        if (
                newPassword == null
                        ||
                newPassword.isBlank()
        ) {

            return ResponseEntity.badRequest()
                    .body(
                            "New password is required."
                    );
        }

        String email =
                resetTokens.get(token);

        System.out.println(
                "Password reset for: "
                        + email
        );

        // =========================================
        // UPDATE PASSWORD
        // =========================================

        AdminUser admin =
        adminUserRepository
                .findByEmail(email)
                .orElse(null);

if (admin != null) {

    admin.setPassword(
            newPassword
    );

    adminUserRepository.save(
            admin
    );
}

        System.out.println(
                "Password Changed Successfully"
        );

        // Remove used token

        resetTokens.remove(token);

        return ResponseEntity.ok(
                "Password updated successfully."
        );
    }

}
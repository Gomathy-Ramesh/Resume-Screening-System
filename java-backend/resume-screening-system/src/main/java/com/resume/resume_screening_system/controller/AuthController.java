package com.resume.resume_screening_system.controller;

import com.resume.resume_screening_system.dto.LoginRequest;
import com.resume.resume_screening_system.dto.LoginResponse;
import com.resume.resume_screening_system.security.JwtService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import com.resume.resume_screening_system.service.EmailService;
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
    private EmailService emailService;

    @Autowired
    private AdminUserRepository adminUserRepository;

    private final Map<String, String> resetTokens =
            new HashMap<>();

    // =========================================
    // LOGIN
    // =========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        System.out.println("================================");
        System.out.println("LOGIN REQUEST RECEIVED");
        System.out.println("Username Entered : " + request.getUsername());
        System.out.println("Password Entered : " + request.getPassword());

        AdminUser admin =
                adminUserRepository
                        .findByUsername(
                                request.getUsername()
                        )
                        .orElse(null);

        System.out.println("Admin Found : " + (admin != null));

        if (admin != null) {

            System.out.println("DB Username : " + admin.getUsername());
            System.out.println("DB Password : " + admin.getPassword());

            boolean passwordMatch =
                    admin.getPassword().trim()
                            .equals(
                                    request.getPassword().trim()
                            );

            System.out.println(
                    "Password Match : "
                            + passwordMatch
            );

            if (passwordMatch) {

                String token =
                        jwtService.generateToken(
                                admin.getUsername()
                        );

                System.out.println("LOGIN SUCCESS");

                return ResponseEntity.ok(
                        new LoginResponse(token)
                );
            }
        }

        System.out.println("LOGIN FAILED");

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

            String resetToken =
                    UUID.randomUUID().toString();

            resetTokens.put(
                    resetToken,
                    email
            );

            String resetLink =
                   "https://resume-screening-frontend-ojtd.onrender.com/reset-password?token="
                    + resetToken;

            emailService.sendForgotPasswordEmail(
                    email,
                    resetLink
            );

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
        "EMAIL : " + email
);

AdminUser admin =
        adminUserRepository
                .findByEmail(email)
                .orElse(null);

System.out.println(
        "ADMIN FOUND : "
                + (admin != null)
);

if (admin == null) {

    return ResponseEntity
            .badRequest()
            .body(
                    "Admin account not found."
            );
}

System.out.println(
        "OLD PASSWORD : "
                + admin.getPassword()
);

admin.setPassword(
        newPassword
);

adminUserRepository.save(
        admin
);

System.out.println(
        "NEW PASSWORD SAVED : "
                + admin.getPassword()
);

resetTokens.remove(token);

return ResponseEntity.ok(
        "Password updated successfully."
);
    }
}
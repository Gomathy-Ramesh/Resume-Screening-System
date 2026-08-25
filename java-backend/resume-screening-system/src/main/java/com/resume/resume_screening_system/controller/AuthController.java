package com.resume.resume_screening_system.controller;

import com.resume.resume_screening_system.dto.LoginRequest;
import com.resume.resume_screening_system.dto.LoginResponse;
import com.resume.resume_screening_system.security.JwtService;
import com.resume.resume_screening_system.service.EmailService;

import com.resume.resume_screening_system.entity.AdminUser;
import com.resume.resume_screening_system.entity.Candidate;

import com.resume.resume_screening_system.repository.AdminUserRepository;
import com.resume.resume_screening_system.repository.CandidateRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @Autowired
    private CandidateRepository candidateRepository;

    private final Map<String, String> resetTokens =
            new HashMap<>();


    // ======================================================
    // ADMIN / RECRUITER LOGIN
    // ======================================================

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request
    ) {

        System.out.println("================================");
        System.out.println("ADMIN LOGIN REQUEST");
        System.out.println("Username : " + request.getUsername());

        AdminUser admin =
                adminUserRepository
                        .findByUsername(
                                request.getUsername()
                        )
                        .orElse(null);

        System.out.println(
                "Admin Found : "
                        + (admin != null)
        );

        if (admin != null) {

            boolean passwordMatch =
                    admin.getPassword()
                            .trim()
                            .equals(
                                    request.getPassword()
                                            .trim()
                            );

            System.out.println(
                    "Password Match : "
                            + passwordMatch
            );

            if (passwordMatch) {

                String token =
                        jwtService.generateToken(
                                "admin:" + admin.getUsername()
                        );

                System.out.println(
                        "ADMIN LOGIN SUCCESS"
                );

                return ResponseEntity.ok(
                        new LoginResponse(token)
                );
            }
        }

        return ResponseEntity
                .status(401)
                .body(
                        "Invalid username or password"
                );
    }


    // ======================================================
    // CANDIDATE LOGIN
    // ======================================================
    //
    // Candidate enters:
    //
    // Name
    // Applied Position
    //
    // Backend finds candidate and returns:
    //
    // candidateId
    // jobId
    // candidateName
    // appliedPosition
    // token
    //
    // ======================================================

    @PostMapping("/candidate-login")
    public ResponseEntity<?> candidateLogin(
            @RequestBody Map<String, String> request
    ) {

        String name =
                request.get("name");

        String appliedPosition =
                request.get("appliedPosition");


        // =========================================
        // VALIDATION
        // =========================================

        if (
                name == null
                        ||
                name.isBlank()
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Candidate name is required."
                    );
        }


        if (
                appliedPosition == null
                        ||
                appliedPosition.isBlank()
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Applied position is required."
                    );
        }


        System.out.println("================================");
        System.out.println("CANDIDATE LOGIN REQUEST");
        System.out.println(
                "Name : " + name
        );
        System.out.println(
                "Applied Position : "
                        + appliedPosition
        );


        // =========================================
        // FIND CANDIDATE
        // =========================================

        Candidate candidate =
                candidateRepository
                        .findByNameIgnoreCaseAndAppliedPositionIgnoreCase(
                                name.trim(),
                                appliedPosition.trim()
                        )
                        .orElse(null);


        if (candidate == null) {

            System.out.println(
                    "CANDIDATE NOT FOUND"
            );

            return ResponseEntity
                    .status(401)
                    .body(
                            "Candidate not found. Please check your name and applied position."
                    );
        }


        // =========================================
        // CHECK JOB
        // =========================================

        if (candidate.getJob() == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "No job is associated with this candidate."
                    );
        }


        Long jobId =
                candidate.getJob().getJobId();


        // =========================================
        // GENERATE CANDIDATE TOKEN
        // =========================================

        String token =
                jwtService.generateToken(
                        "candidate:"
                                + candidate.getCandidateId()
                );


        // =========================================
        // RESPONSE
        // =========================================

        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "token",
                token
        );

        response.put(
                "candidateId",
                candidate.getCandidateId()
        );

        response.put(
                "candidateName",
                candidate.getName()
        );

        response.put(
                "appliedPosition",
                candidate.getAppliedPosition()
        );

        response.put(
                "jobId",
                jobId
        );


        System.out.println(
                "CANDIDATE LOGIN SUCCESS"
        );

        System.out.println(
                "Candidate ID : "
                        + candidate.getCandidateId()
        );

        System.out.println(
                "Job ID : "
                        + jobId
        );


        return ResponseEntity.ok(
                response
        );
    }


    // ======================================================
    // FORGOT PASSWORD
    // ======================================================

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

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Email is required."
                    );
        }

        try {

            String resetToken =
                    UUID.randomUUID()
                            .toString();

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

            return ResponseEntity
                    .status(500)
                    .body(
                            "Failed to send password reset email."
                    );
        }
    }


    // ======================================================
    // RESET PASSWORD
    // ======================================================

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

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Invalid or expired token."
                    );
        }


        if (
                newPassword == null
                        ||
                newPassword.isBlank()
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "New password is required."
                    );
        }


        String email =
                resetTokens.get(token);


        AdminUser admin =
                adminUserRepository
                        .findByEmail(email)
                        .orElse(null);


        if (admin == null) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Admin account not found."
                    );
        }


        admin.setPassword(
                newPassword
        );


        adminUserRepository.save(
                admin
        );


        resetTokens.remove(
                token
        );


        return ResponseEntity.ok(
                "Password updated successfully."
        );
    }
}
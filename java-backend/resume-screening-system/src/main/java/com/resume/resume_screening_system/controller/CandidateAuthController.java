package com.resume.resume_screening_system.controller;

import com.resume.resume_screening_system.entity.Candidate;
import com.resume.resume_screening_system.repository.CandidateRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/candidate-auth")
@CrossOrigin("*")
public class CandidateAuthController {

    @Autowired
    private CandidateRepository candidateRepository;


    // =====================================================
    // CANDIDATE LOGIN
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<?> candidateLogin(
            @RequestBody Map<String, String> request
    ) {

        // =================================================
        // GET LOGIN DATA
        // =================================================

        String name =
                request.get("name");

        String appliedPosition =
                request.get("appliedPosition");


        // =================================================
        // VALIDATE NAME
        // =================================================

        if (name == null ||
                name.isBlank()) {

            return ResponseEntity.badRequest()
                    .body(
                            "Candidate name is required."
                    );
        }


        // =================================================
        // VALIDATE APPLIED POSITION
        // =================================================

        if (appliedPosition == null ||
                appliedPosition.isBlank()) {

            return ResponseEntity.badRequest()
                    .body(
                            "Applied position is required."
                    );
        }


        // =================================================
        // FIND CANDIDATE
        // =================================================

        Candidate candidate =
                candidateRepository
                        .findByNameIgnoreCaseAndAppliedPositionIgnoreCase(
                                name.trim(),
                                appliedPosition.trim()
                        )
                        .orElse(null);


        // =================================================
        // CANDIDATE NOT FOUND
        // =================================================

        if (candidate == null) {

            return ResponseEntity.status(404)
                    .body(
                            "Candidate not found. Please check your name and applied position."
                    );
        }


        // =================================================
        // CHECK JOB
        // =================================================

        if (candidate.getJob() == null) {

            return ResponseEntity.badRequest()
                    .body(
                            "No job is associated with this candidate."
                    );
        }


        // =================================================
        // GET IDS
        // =================================================

        Long candidateId =
                candidate.getCandidateId();

        Long jobId =
                candidate.getJob().getJobId();


        // =================================================
        // RESPONSE
        // =================================================

        Map<String, Object> response =
                new HashMap<>();


        response.put(
                "candidateId",
                candidateId
        );


        response.put(
                "jobId",
                jobId
        );


        response.put(
                "name",
                candidate.getName()
        );


        response.put(
                "appliedPosition",
                candidate.getAppliedPosition()
        );


        response.put(
                "message",
                "Candidate login successful."
        );


        // =================================================
        // RETURN
        // =================================================

        return ResponseEntity.ok(
                response
        );
    }
}
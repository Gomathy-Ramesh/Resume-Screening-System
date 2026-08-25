package com.resume.resume_screening_system.controller;

import com.resume.resume_screening_system.dto.HiringDecisionResponse;
import com.resume.resume_screening_system.service.HiringDecisionReportService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/hiring-decisions")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173"
})
public class HiringDecisionController {

    private final HiringDecisionReportService hiringDecisionReportService;


    // ======================================================
    // CONSTRUCTOR
    // ======================================================

    public HiringDecisionController(
            HiringDecisionReportService hiringDecisionReportService
    ) {

        this.hiringDecisionReportService =
                hiringDecisionReportService;
    }


    // ======================================================
    // GET HIRING DECISION
    // ======================================================

    @GetMapping("/{candidateId}")
    public ResponseEntity<?> getHiringDecision(
            @PathVariable Long candidateId
    ) {

        try {

            HiringDecisionResponse response =
                    hiringDecisionReportService
                            .getHiringDecision(candidateId);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (Exception e) {

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to generate hiring decision.",
                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }
}
package com.resume.resume_screening_system.controller;

import com.resume.resume_screening_system.dto.AssessmentQuestionResponse;
import com.resume.resume_screening_system.dto.AssessmentResultResponse;
import com.resume.resume_screening_system.dto.TechnicalAssessmentResponse;
import com.resume.resume_screening_system.entity.Candidate;
import com.resume.resume_screening_system.entity.Job;
import com.resume.resume_screening_system.entity.TechnicalAssessment;
import com.resume.resume_screening_system.repository.CandidateRepository;
import com.resume.resume_screening_system.repository.JobRepository;
import com.resume.resume_screening_system.repository.TechnicalAssessmentRepository;
import com.resume.resume_screening_system.service.GeminiAssessmentService;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/technical-assessments")
@CrossOrigin("*")
public class TechnicalAssessmentController {

    // =========================================================
    // ASSESSMENT CONFIGURATION
    // =========================================================

    private static final long ASSESSMENT_DURATION_MINUTES = 20;

    // =========================================================
    // REPOSITORIES
    // =========================================================

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private TechnicalAssessmentRepository technicalAssessmentRepository;

    // =========================================================
    // GEMINI SERVICE
    // =========================================================

    @Autowired
    private GeminiAssessmentService geminiAssessmentService;

    // =========================================================
    // GENERATE TECHNICAL ASSESSMENT
    // =========================================================

    @PostMapping("/generate/{candidateId}/{jobId}")
public ResponseEntity<?> generateAssessment(
        @PathVariable Long candidateId,
        @PathVariable Long jobId
) {

    try {

        Candidate candidate =
                candidateRepository
                        .findById(candidateId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                )
                        );

        Job job =
                jobRepository
                        .findById(jobId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found"
                                )
                        );

        // =====================================================
        // CHECK IF ASSESSMENT ALREADY EXISTS
        // =====================================================

        var existingAssessment =
                technicalAssessmentRepository
                        .findByCandidateIdAndJobId(
                                candidateId,
                                jobId
                        );

        if (existingAssessment.isPresent()) {

            // Assessment already exists.
            // Return the existing assessment instead of
            // generating another one.

            TechnicalAssessmentResponse response =
                    convertToResponse(
                            existingAssessment.get()
                    );

            return ResponseEntity.ok(response);
        }

        // =====================================================
        // GENERATE NEW ASSESSMENT
        // =====================================================

        TechnicalAssessment assessment =
                geminiAssessmentService.generateAssessment(
                        candidate,
                        job
                );

        TechnicalAssessmentResponse response =
                convertToResponse(assessment);

        return ResponseEntity.ok(response);

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity
                .internalServerError()
                .body(
                        "Failed to generate technical assessment: "
                                + e.getMessage()
                );
    }
}
    // =========================================================
    // REGENERATE TECHNICAL ASSESSMENT
    // =========================================================
    //
    // Wipes any existing assessment (submitted, in-progress,
    // or not-started) for this candidate/job and creates a
    // brand new one. Used by the "Regenerate Assessment"
    // button so candidates/testers can start over.
    //
    // =========================================================

    @PostMapping("/regenerate/{candidateId}/{jobId}")
    public ResponseEntity<?> regenerateAssessment(
            @PathVariable Long candidateId,
            @PathVariable Long jobId
    ) {

        try {

            Candidate candidate =
                    candidateRepository
                            .findById(candidateId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Candidate not found"
                                    )
                            );

            Job job =
                    jobRepository
                            .findById(jobId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Job not found"
                                    )
                            );

            TechnicalAssessment assessment =
                    geminiAssessmentService.generateAssessment(
                            candidate,
                            job,
                            true
                    );

            TechnicalAssessmentResponse response =
                    convertToResponse(assessment);

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to regenerate technical assessment: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================================
    // GET EXISTING ASSESSMENT
    // =========================================================

    @GetMapping("/{candidateId}/{jobId}")
    public ResponseEntity<?> getAssessment(
            @PathVariable Long candidateId,
            @PathVariable Long jobId
    ) {

        return technicalAssessmentRepository
                .findByCandidateIdAndJobId(
                        candidateId,
                        jobId
                )
                .map(assessment -> {

                    /*
                     * If the candidate left the assessment open
                     * and the 30-minute duration has expired,
                     * automatically submit it.
                     */
                    if ("IN_PROGRESS".equalsIgnoreCase(
                            assessment.getStatus()
                    ) && isAssessmentExpired(assessment)) {

                        try {

                            AssessmentResultResponse result =
                                    submitAssessmentInternally(
                                            assessment,
                                            Map.of()
                                    );

                            TechnicalAssessmentResponse response =
                                    convertToResponse(assessment);

                            return ResponseEntity.ok(response);

                        } catch (Exception e) {

                            e.printStackTrace();

                            return ResponseEntity
                                    .internalServerError()
                                    .body(
                                            "Failed to automatically submit expired assessment: "
                                                    + e.getMessage()
                                    );
                        }
                    }

                    TechnicalAssessmentResponse response =
                            convertToResponse(assessment);

                    return ResponseEntity.ok(response);

                })
                .orElseGet(() ->
                        ResponseEntity.notFound().build()
                );
    }

    // =========================================================
    // GET ALL ASSESSMENTS FOR A JOB (ADMIN DASHBOARD)
    // =========================================================
    //
    // Used by the admin Candidates page to show each
    // candidate's technical assessment status/score for a job.
    //
    // =========================================================

    // =========================================================
// GET ALL ASSESSMENTS FOR A JOB
// Used by recruiter/admin dashboard
// =========================================================

@GetMapping("/job/{jobId}")
public ResponseEntity<?> getJobAssessments(
        @PathVariable Long jobId
) {

    try {

        List<TechnicalAssessmentResponse> response =
                technicalAssessmentRepository
                        .findByJobId(jobId)
                        .stream()
                        .map(this::convertToResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);

    } catch (Exception e) {

        e.printStackTrace();

        return ResponseEntity
                .internalServerError()
                .body(
                        "Failed to load job assessments: "
                                + e.getMessage()
                );
    }
}
    // =========================================================
    // START TECHNICAL ASSESSMENT
    // =========================================================

    @PostMapping("/{assessmentId}/start")
    public ResponseEntity<?> startAssessment(
            @PathVariable Long assessmentId
    ) {

        try {

            TechnicalAssessment assessment =
                    technicalAssessmentRepository
                            .findById(assessmentId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Assessment not found"
                                    )
                            );

            // -------------------------------------------------
            // PREVENT STARTING A SUBMITTED ASSESSMENT
            // -------------------------------------------------

            if ("SUBMITTED".equalsIgnoreCase(
                    assessment.getStatus()
            )) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Assessment has already been submitted."
                        );
            }

            // -------------------------------------------------
            // START ONLY ONCE
            // -------------------------------------------------

            if ("NOT_STARTED".equalsIgnoreCase(
                    assessment.getStatus()
            )) {

                assessment.setStatus(
                        "IN_PROGRESS"
                );

                assessment.setStartedAt(
                        LocalDateTime.now()
                );

                technicalAssessmentRepository.save(
                        assessment
                );
            }

            // -------------------------------------------------
            // CHECK WHETHER IT EXPIRED
            // -------------------------------------------------

            if ("IN_PROGRESS".equalsIgnoreCase(
                    assessment.getStatus()
            ) && isAssessmentExpired(assessment)) {

                submitAssessmentInternally(
                        assessment,
                        Map.of()
                );

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Assessment time has expired."
                        );
            }

            TechnicalAssessmentResponse response =
                    convertToResponse(assessment);

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to start assessment: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================================
    // SUBMIT TECHNICAL ASSESSMENT
    // =========================================================

    @PostMapping("/{assessmentId}/submit")
    public ResponseEntity<?> submitAssessment(
            @PathVariable Long assessmentId,
            @RequestBody Map<String, String> answers
    ) {

        try {

            // -------------------------------------------------
            // FIND ASSESSMENT
            // -------------------------------------------------

            TechnicalAssessment assessment =
                    technicalAssessmentRepository
                            .findById(assessmentId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Assessment not found"
                                    )
                            );

            // -------------------------------------------------
            // PREVENT DOUBLE SUBMISSION
            // -------------------------------------------------

            if ("SUBMITTED".equalsIgnoreCase(
                    assessment.getStatus()
            )) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Assessment has already been submitted."
                        );
            }

            // -------------------------------------------------
            // CHECK STATUS
            // -------------------------------------------------

            if (!"IN_PROGRESS".equalsIgnoreCase(
                    assessment.getStatus()
            )) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Assessment has not been started."
                        );
            }

            // -------------------------------------------------
            // CHECK SERVER-SIDE TIME LIMIT
            // -------------------------------------------------

            if (isAssessmentExpired(assessment)) {

                AssessmentResultResponse result =
                        submitAssessmentInternally(
                                assessment,
                                answers
                        );

                return ResponseEntity.ok(result);
            }

            // -------------------------------------------------
            // NORMAL SUBMISSION
            // -------------------------------------------------

            AssessmentResultResponse result =
                    submitAssessmentInternally(
                            assessment,
                            answers
                    );

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to submit technical assessment: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================================
    // INTERNAL SUBMISSION METHOD
    // =========================================================
    //
    // This method is used for both:
    //
    // 1. Normal submission
    // 2. Automatic submission after timeout
    //
    // =========================================================

    private AssessmentResultResponse submitAssessmentInternally(
            TechnicalAssessment assessment,
            Map<String, String> answers
    ) {

        // -----------------------------------------------------
        // VARIABLES
        // -----------------------------------------------------

        int correctAnswers = 0;

        int wrongAnswers = 0;

        double score = 0.0;

        int totalQuestions =
                assessment.getQuestions() != null
                        ? assessment.getQuestions().size()
                        : 0;

        // -----------------------------------------------------
        // CHECK EVERY QUESTION
        // -----------------------------------------------------

        if (assessment.getQuestions() != null) {

            for (var question :
                    assessment.getQuestions()) {

                String submittedAnswer =
                        answers != null
                                ? answers.get(
                                        String.valueOf(
                                                question.getId()
                                        )
                                )
                                : null;

                // ---------------------------------------------
                // UNANSWERED QUESTION
                // ---------------------------------------------

                if (submittedAnswer == null
                        || submittedAnswer.trim().isEmpty()) {

                    question.setCandidateAnswer(
                            null
                    );

                    question.setCorrect(
                            false
                    );

                    wrongAnswers++;

                    continue;
                }

                // ---------------------------------------------
                // NORMALIZE ANSWER
                // ---------------------------------------------

                submittedAnswer =
                        submittedAnswer
                                .trim()
                                .toUpperCase();

                question.setCandidateAnswer(
                        submittedAnswer
                );

                // ---------------------------------------------
                // GET CORRECT ANSWER
                // ---------------------------------------------

                String correctAnswer =
                        question.getCorrectAnswer();

                boolean isCorrect =
                        correctAnswer != null
                                &&
                        correctAnswer
                                .trim()
                                .equalsIgnoreCase(
                                        submittedAnswer
                                );

                // ---------------------------------------------
                // SAVE RESULT
                // ---------------------------------------------

                question.setCorrect(
                        isCorrect
                );

                if (isCorrect) {

                    correctAnswers++;

                    Double marks =
                            question.getMarks();

                    if (marks != null) {

                        score += marks;

                    } else {

                        score += 1.0;
                    }

                } else {

                    wrongAnswers++;
                }
            }
        }

        // -----------------------------------------------------
        // SAVE ASSESSMENT STATUS
        // -----------------------------------------------------

        assessment.setStatus(
                "SUBMITTED"
        );

        assessment.setScore(
                score
        );

        assessment.setSubmittedAt(
                LocalDateTime.now()
        );

        // -----------------------------------------------------
        // SAVE
        // -----------------------------------------------------

        technicalAssessmentRepository.save(
                assessment
        );

        // -----------------------------------------------------
        // CALCULATE PERCENTAGE
        // -----------------------------------------------------

        double percentage = 0.0;

        if (totalQuestions > 0) {

            percentage =
                    ((double) correctAnswers
                            / totalQuestions)
                            * 100.0;
        }

        percentage =
                Math.round(
                        percentage * 100.0
                ) / 100.0;

        // -----------------------------------------------------
        // CREATE RESULT RESPONSE
        // -----------------------------------------------------

        AssessmentResultResponse result =
                new AssessmentResultResponse();

        result.setAssessmentId(
                assessment.getId()
        );

        result.setCandidateId(
                assessment.getCandidateId()
        );

        result.setJobId(
                assessment.getJobId()
        );

        result.setStatus(
                assessment.getStatus()
        );

        result.setTotalQuestions(
                totalQuestions
        );

        result.setCorrectAnswers(
                correctAnswers
        );

        result.setWrongAnswers(
                wrongAnswers
        );

        result.setScore(
                score
        );

        result.setPercentage(
                percentage
        );

        result.setSubmittedAt(
                assessment
                        .getSubmittedAt()
                        .toString()
        );

        return result;
    }

    // =========================================================
    // CHECK ASSESSMENT EXPIRATION
    // =========================================================

    private boolean isAssessmentExpired(
            TechnicalAssessment assessment
    ) {

        if (assessment.getStartedAt() == null) {

            return false;
        }

        LocalDateTime deadline =
                assessment
                        .getStartedAt()
                        .plusMinutes(
                                ASSESSMENT_DURATION_MINUTES
                        );

        return LocalDateTime.now()
                .isAfter(deadline);
    }

    // =========================================================
    // GET REMAINING TIME
    // =========================================================
    //
    // This endpoint allows React to get the server-calculated
    // remaining time if needed.
    //
    // =========================================================

    @GetMapping("/{assessmentId}/time")
    public ResponseEntity<?> getRemainingTime(
            @PathVariable Long assessmentId
    ) {

        try {

            TechnicalAssessment assessment =
                    technicalAssessmentRepository
                            .findById(assessmentId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Assessment not found"
                                    )
                            );

            if (!"IN_PROGRESS".equalsIgnoreCase(
                    assessment.getStatus()
            )) {

                return ResponseEntity.ok(
                        Map.of(
                                "remainingSeconds",
                                0,
                                "expired",
                                true
                        )
                );
            }

            if (assessment.getStartedAt() == null) {

                return ResponseEntity.ok(
                        Map.of(
                                "remainingSeconds",
                                0,
                                "expired",
                                true
                        )
                );
            }

            LocalDateTime deadline =
                    assessment
                            .getStartedAt()
                            .plusMinutes(
                                    ASSESSMENT_DURATION_MINUTES
                            );

            long remainingSeconds =
                    Duration
                            .between(
                                    LocalDateTime.now(),
                                    deadline
                            )
                            .getSeconds();

            if (remainingSeconds <= 0) {

                return ResponseEntity.ok(
                        Map.of(
                                "remainingSeconds",
                                0,
                                "expired",
                                true
                        )
                );
            }

            return ResponseEntity.ok(
                    Map.of(
                            "remainingSeconds",
                            remainingSeconds,
                            "expired",
                            false
                    )
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to calculate remaining assessment time: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================================
    // GET ASSESSMENT RESULT
    // =========================================================

    @GetMapping("/{assessmentId}/result")
    public ResponseEntity<?> getAssessmentResult(
            @PathVariable Long assessmentId
    ) {

        try {

            TechnicalAssessment assessment =
                    technicalAssessmentRepository
                            .findById(assessmentId)
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Assessment not found"
                                    )
                            );

            // -------------------------------------------------
            // IF STILL IN PROGRESS BUT TIME EXPIRED
            // -------------------------------------------------

            if ("IN_PROGRESS".equalsIgnoreCase(
                    assessment.getStatus()
            ) && isAssessmentExpired(assessment)) {

                submitAssessmentInternally(
                        assessment,
                        Map.of()
                );
            }

            // -------------------------------------------------
            // CHECK SUBMITTED
            // -------------------------------------------------

            if (!"SUBMITTED".equalsIgnoreCase(
                    assessment.getStatus()
            )) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Assessment has not been submitted yet."
                        );
            }

            int correctAnswers = 0;

            int wrongAnswers = 0;

            double score = 0.0;

            int totalQuestions =
                    assessment.getQuestions() != null
                            ? assessment
                                    .getQuestions()
                                    .size()
                            : 0;

            // -------------------------------------------------
            // CALCULATE RESULT
            // -------------------------------------------------

            if (assessment.getQuestions() != null) {

                for (var question :
                        assessment.getQuestions()) {

                    if (Boolean.TRUE.equals(
                            question.getCorrect()
                    )) {

                        correctAnswers++;

                        Double marks =
                                question.getMarks();

                        if (marks != null) {

                            score += marks;

                        } else {

                            score += 1.0;
                        }

                    } else {

                        wrongAnswers++;
                    }
                }
            }

            // -------------------------------------------------
            // CALCULATE PERCENTAGE
            // -------------------------------------------------

            double percentage = 0.0;

            if (totalQuestions > 0) {

                percentage =
                        ((double) correctAnswers
                                / totalQuestions)
                                * 100.0;
            }

            percentage =
                    Math.round(
                            percentage * 100.0
                    ) / 100.0;

            // -------------------------------------------------
            // CREATE RESULT
            // -------------------------------------------------

            AssessmentResultResponse result =
                    new AssessmentResultResponse();

            result.setAssessmentId(
                    assessment.getId()
            );

            result.setCandidateId(
                    assessment.getCandidateId()
            );

            result.setJobId(
                    assessment.getJobId()
            );

            result.setStatus(
                    assessment.getStatus()
            );

            result.setTotalQuestions(
                    totalQuestions
            );

            result.setCorrectAnswers(
                    correctAnswers
            );

            result.setWrongAnswers(
                    wrongAnswers
            );

            result.setScore(
                    assessment.getScore() != null
                            ? assessment.getScore()
                            : score
            );

            result.setPercentage(
                    percentage
            );

            result.setSubmittedAt(
                    assessment
                            .getSubmittedAt()
                            .toString()
            );

            return ResponseEntity.ok(
                    result
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .internalServerError()
                    .body(
                            "Failed to load assessment result: "
                                    + e.getMessage()
                    );
        }
    }

    // =========================================================
    // CONVERT ENTITY TO SAFE RESPONSE DTO
    // =========================================================

    private TechnicalAssessmentResponse convertToResponse(
            TechnicalAssessment assessment
    ) {

        TechnicalAssessmentResponse response =
                new TechnicalAssessmentResponse();

        // -----------------------------------------------------
        // ASSESSMENT DETAILS
        // -----------------------------------------------------

        response.setId(
                assessment.getId()
        );

        response.setCandidateId(
                assessment.getCandidateId()
        );

        response.setJobId(
                assessment.getJobId()
        );

        response.setStatus(
                assessment.getStatus()
        );

        response.setTotalQuestions(
                assessment.getTotalQuestions()
        );

        response.setScore(
                assessment.getScore()
        );

        response.setStartedAt(
                assessment.getStartedAt()
        );

        response.setSubmittedAt(
                assessment.getSubmittedAt()
        );

        response.setCreatedAt(
                assessment.getCreatedAt()
        );

        // -----------------------------------------------------
        // QUESTIONS
        // -----------------------------------------------------

        List<AssessmentQuestionResponse> questions =

                assessment.getQuestions()
                        .stream()
                        .map(question -> {

                            AssessmentQuestionResponse q =
                                    new AssessmentQuestionResponse();

                            q.setId(
                                    question.getId()
                            );

                            q.setQuestionNumber(
                                    question.getQuestionNumber()
                            );

                            q.setQuestionText(
                                    question.getQuestionText()
                            );

                            q.setQuestionType(
                                    question.getQuestionType()
                            );

                            q.setOptionA(
                                    question.getOptionA()
                            );

                            q.setOptionB(
                                    question.getOptionB()
                            );

                            q.setOptionC(
                                    question.getOptionC()
                            );

                            q.setOptionD(
                                    question.getOptionD()
                            );

                            q.setCandidateAnswer(
                                    question.getCandidateAnswer()
                            );

                            /*
                             * Never expose correctAnswer.
                             */

                            if ("SUBMITTED".equalsIgnoreCase(
                                    assessment.getStatus()
                            )) {

                                q.setCorrect(
                                        question.getCorrect()
                                );

                            } else {

                                q.setCorrect(
                                        null
                                );
                            }

                            q.setMarks(
                                    question.getMarks()
                            );

                            return q;

                        })
                        .collect(
                                Collectors.toList()
                        );

        response.setQuestions(
                questions
        );

        return response;
    }
}
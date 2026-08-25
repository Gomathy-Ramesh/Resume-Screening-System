package com.resume.resume_screening_system.controller;

import com.resume.resume_screening_system.entity.Candidate;
import com.resume.resume_screening_system.entity.Interview;
import com.resume.resume_screening_system.repository.CandidateRepository;
import com.resume.resume_screening_system.service.InterviewService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173"
})
public class InterviewController {

    private final InterviewService interviewService;
    private final CandidateRepository candidateRepository;


    // ======================================================
    // CONSTRUCTOR
    // ======================================================

    public InterviewController(
            InterviewService interviewService,
            CandidateRepository candidateRepository
    ) {

        this.interviewService =
                interviewService;

        this.candidateRepository =
                candidateRepository;
    }


    // ======================================================
    // GET ALL INTERVIEWS
    // ======================================================

    @GetMapping
    public ResponseEntity<?> getAllInterviews() {

        try {

            List<Interview> interviews =
                    interviewService.getAllInterviews();

            return ResponseEntity.ok(
                    interviews
            );

        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to fetch interviews.",
                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }


    // ======================================================
    // CHECK INTERVIEW ELIGIBILITY
    // ======================================================

    @GetMapping("/eligibility/{candidateId}/{jobId}")
    public ResponseEntity<?> checkEligibility(
            @PathVariable Long candidateId,
            @PathVariable Long jobId
    ) {

        try {

            Candidate candidate =
                    candidateRepository
                            .findById(candidateId)
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Candidate not found: "
                                                    + candidateId
                                    )
                            );


            boolean eligible =
                    interviewService.isInterviewEligible(
                            candidateId,
                            jobId
                    );


            double effectiveScore =
                    interviewService.getEffectiveScore(
                            candidateId,
                            jobId
                    );


            Map<String, Object> response =
                    new HashMap<>();


            response.put(
                    "candidateId",
                    candidateId
            );

            response.put(
                    "candidateName",
                    candidate.getName()
            );

            response.put(
                    "jobId",
                    jobId
            );

            response.put(
                    "originalScore",
                    candidate.getScore()
            );

            response.put(
                    "effectiveScore",
                    effectiveScore
            );

            response.put(
                    "eligible",
                    eligible
            );


            if (eligible) {

                if (candidate.getScore() != null
                        && candidate.getScore() >= 90) {

                    response.put(
                            "eligibilityReason",
                            "Candidate achieved 90% or above in the original evaluation."
                    );

                } else {

                    response.put(
                            "eligibilityReason",
                            "Candidate completed the required Skill Recovery program."
                    );
                }

            } else {

                response.put(
                        "eligibilityReason",
                        "Candidate has not achieved the required score and has not completed Skill Recovery."
                );
            }


            return ResponseEntity.ok(
                    response
            );

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
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to check interview eligibility.",
                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }


    // ======================================================
    // SCHEDULE INTERVIEW
    // ======================================================

    @PostMapping("/schedule")
    public ResponseEntity<?> scheduleInterview(
            @RequestBody ScheduleInterviewRequest request
    ) {

        try {

            Interview interview =
                    interviewService.scheduleInterview(
                            request.getCandidateId(),
                            request.getJobId(),
                            request.getRoundName(),
                            request.getInterviewType(),
                            request.getInterviewerName(),
                            request.getInterviewerEmail(),
                            request.getInterviewDate(),
                            request.getDurationMinutes(),
                            request.getInterviewMode(),
                            request.getMeetingLink(),
                            request.getLocation(),
                            request.getNotes()
                    );


            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(interview);


        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );


        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );


        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to schedule interview.",
                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }


    // ======================================================
    // GET INTERVIEW BY ID
    // ======================================================

    @GetMapping("/{interviewId}")
    public ResponseEntity<?> getInterview(
            @PathVariable Long interviewId
    ) {

        try {

            Interview interview =
                    interviewService.getInterview(
                            interviewId
                    );

            return ResponseEntity.ok(
                    interview
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // ======================================================
    // GET CANDIDATE INTERVIEW HISTORY
    // ======================================================

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<?> getCandidateInterviews(
            @PathVariable Long candidateId
    ) {

        try {

            List<Interview> interviews =
                    interviewService
                            .getCandidateInterviews(
                                    candidateId
                            );

            return ResponseEntity.ok(
                    interviews
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // ======================================================
    // GET INTERVIEWS BY STATUS
    // ======================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<?> getByStatus(
            @PathVariable String status
    ) {

        return ResponseEntity.ok(
                interviewService
                        .getInterviewsByStatus(
                                status.toUpperCase()
                        )
        );
    }


    // ======================================================
    // GET UPCOMING INTERVIEWS
    // ======================================================

    @GetMapping("/upcoming")
    public ResponseEntity<?> getUpcomingInterviews() {

        return ResponseEntity.ok(
                interviewService
                        .getUpcomingInterviews()
        );
    }


    // ======================================================
    // RESCHEDULE
    // ======================================================

    @PutMapping("/{interviewId}/reschedule")
    public ResponseEntity<?> rescheduleInterview(
            @PathVariable Long interviewId,
            @RequestBody RescheduleRequest request
    ) {

        try {

            Interview interview =
                    interviewService.rescheduleInterview(
                            interviewId,
                            request.getInterviewDate()
                    );

            return ResponseEntity.ok(
                    interview
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // ======================================================
    // CANCEL
    // ======================================================

    @PutMapping("/{interviewId}/cancel")
    public ResponseEntity<?> cancelInterview(
            @PathVariable Long interviewId
    ) {

        try {

            Interview interview =
                    interviewService.cancelInterview(
                            interviewId
                    );

            return ResponseEntity.ok(
                    interview
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // ======================================================
    // MARK AS COMPLETED
    // ======================================================

    @PutMapping("/{interviewId}/complete")
    public ResponseEntity<?> completeInterview(
            @PathVariable Long interviewId
    ) {

        try {

            Interview interview =
                    interviewService.completeInterview(
                            interviewId
                    );

            return ResponseEntity.ok(
                    interview
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );

        } catch (IllegalStateException e) {

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );
        }
    }


    // ======================================================
    // SUBMIT INTERVIEW EVALUATION
    // ======================================================

    @PutMapping("/{interviewId}/evaluation")
    public ResponseEntity<?> submitEvaluation(
            @PathVariable Long interviewId,
            @RequestBody EvaluationRequest request
    ) {

        try {

            Interview interview =
                    interviewService.submitEvaluation(
                            interviewId,
                            request.getTechnicalKnowledge(),
                            request.getProblemSolving(),
                            request.getCommunication(),
                            request.getRoleKnowledge(),
                            request.getRecommendation(),
                            request.getFeedback()
                    );


            return ResponseEntity.ok(
                    interview
            );


        } catch (IllegalArgumentException e) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(
                            Map.of(
                                    "message",
                                    e.getMessage()
                            )
                    );


        } catch (Exception e) {

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            Map.of(
                                    "message",
                                    "Failed to submit interview evaluation.",
                                    "error",
                                    e.getMessage()
                            )
                    );
        }
    }


    // ======================================================
    // SCHEDULE REQUEST DTO
    // ======================================================

    public static class ScheduleInterviewRequest {

        private Long candidateId;
        private Long jobId;

        private String roundName;
        private String interviewType;

        private String interviewerName;
        private String interviewerEmail;

        private LocalDateTime interviewDate;

        private Integer durationMinutes;

        private String interviewMode;
        private String meetingLink;

        private String location;
        private String notes;


        public Long getCandidateId() {
            return candidateId;
        }

        public void setCandidateId(Long candidateId) {
            this.candidateId = candidateId;
        }


        public Long getJobId() {
            return jobId;
        }

        public void setJobId(Long jobId) {
            this.jobId = jobId;
        }


        public String getRoundName() {
            return roundName;
        }

        public void setRoundName(String roundName) {
            this.roundName = roundName;
        }


        public String getInterviewType() {
            return interviewType;
        }

        public void setInterviewType(String interviewType) {
            this.interviewType = interviewType;
        }


        public String getInterviewerName() {
            return interviewerName;
        }

        public void setInterviewerName(String interviewerName) {
            this.interviewerName = interviewerName;
        }


        public String getInterviewerEmail() {
            return interviewerEmail;
        }

        public void setInterviewerEmail(
                String interviewerEmail
        ) {
            this.interviewerEmail =
                    interviewerEmail;
        }


        public LocalDateTime getInterviewDate() {
            return interviewDate;
        }

        public void setInterviewDate(
                LocalDateTime interviewDate
        ) {
            this.interviewDate =
                    interviewDate;
        }


        public Integer getDurationMinutes() {
            return durationMinutes;
        }

        public void setDurationMinutes(
                Integer durationMinutes
        ) {
            this.durationMinutes =
                    durationMinutes;
        }


        public String getInterviewMode() {
            return interviewMode;
        }

        public void setInterviewMode(
                String interviewMode
        ) {
            this.interviewMode =
                    interviewMode;
        }


        public String getMeetingLink() {
            return meetingLink;
        }

        public void setMeetingLink(
                String meetingLink
        ) {
            this.meetingLink =
                    meetingLink;
        }


        public String getLocation() {
            return location;
        }

        public void setLocation(
                String location
        ) {
            this.location =
                    location;
        }


        public String getNotes() {
            return notes;
        }

        public void setNotes(
                String notes
        ) {
            this.notes =
                    notes;
        }
    }


    // ======================================================
    // RESCHEDULE REQUEST DTO
    // ======================================================

    public static class RescheduleRequest {

        private LocalDateTime interviewDate;


        public LocalDateTime getInterviewDate() {
            return interviewDate;
        }

        public void setInterviewDate(
                LocalDateTime interviewDate
        ) {
            this.interviewDate =
                    interviewDate;
        }
    }


    // ======================================================
    // EVALUATION REQUEST DTO
    // ======================================================

    public static class EvaluationRequest {

        private Double technicalKnowledge;
        private Double problemSolving;
        private Double communication;
        private Double roleKnowledge;

        private String recommendation;
        private String feedback;


        public Double getTechnicalKnowledge() {
            return technicalKnowledge;
        }

        public void setTechnicalKnowledge(
                Double technicalKnowledge
        ) {
            this.technicalKnowledge =
                    technicalKnowledge;
        }


        public Double getProblemSolving() {
            return problemSolving;
        }

        public void setProblemSolving(
                Double problemSolving
        ) {
            this.problemSolving =
                    problemSolving;
        }


        public Double getCommunication() {
            return communication;
        }

        public void setCommunication(
                Double communication
        ) {
            this.communication =
                    communication;
        }


        public Double getRoleKnowledge() {
            return roleKnowledge;
        }

        public void setRoleKnowledge(
                Double roleKnowledge
        ) {
            this.roleKnowledge =
                    roleKnowledge;
        }


        public String getRecommendation() {
            return recommendation;
        }

        public void setRecommendation(
                String recommendation
        ) {
            this.recommendation =
                    recommendation;
        }


        public String getFeedback() {
            return feedback;
        }

        public void setFeedback(
                String feedback
        ) {
            this.feedback =
                    feedback;
        }
    }
}
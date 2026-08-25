package com.resume.resume_screening_system.service;

import com.resume.resume_screening_system.dto.HiringDecisionResponse;
import com.resume.resume_screening_system.entity.Candidate;
import com.resume.resume_screening_system.entity.Interview;
import com.resume.resume_screening_system.repository.CandidateRepository;
import com.resume.resume_screening_system.repository.InterviewRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class HiringDecisionReportService {

    private final CandidateRepository candidateRepository;
    private final InterviewRepository interviewRepository;


    // ======================================================
    // CONSTRUCTOR
    // ======================================================

    public HiringDecisionReportService(
            CandidateRepository candidateRepository,
            InterviewRepository interviewRepository
    ) {

        this.candidateRepository =
                candidateRepository;

        this.interviewRepository =
                interviewRepository;
    }


    // ======================================================
    // GET HIRING DECISION
    // ======================================================

    public HiringDecisionResponse getHiringDecision(
            Long candidateId
    ) {

        // --------------------------------------------------
        // FIND CANDIDATE
        // --------------------------------------------------

        Candidate candidate =
                candidateRepository
                        .findById(candidateId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Candidate not found: "
                                                + candidateId
                                )
                        );


        // --------------------------------------------------
        // FIND CANDIDATE INTERVIEWS
        // --------------------------------------------------

        List<Interview> interviews =
                interviewRepository
                        .findByCandidateCandidateIdOrderByInterviewDateDesc(
                                candidateId
                        );


        // --------------------------------------------------
        // CREATE RESPONSE
        // --------------------------------------------------

        HiringDecisionResponse response =
                new HiringDecisionResponse();


        response.setCandidateId(
                candidate.getCandidateId()
        );

        response.setCandidateName(
                candidate.getName()
        );

        response.setEmail(
                candidate.getEmail()
        );

        response.setAppliedPosition(
                candidate.getAppliedPosition()
        );

        response.setResumeScore(
                candidate.getScore()
        );

        response.setThresholdPercentage(
                candidate.getThresholdPercentage()
        );


        // --------------------------------------------------
        // NO INTERVIEW
        // --------------------------------------------------

        if (interviews == null || interviews.isEmpty()) {

            response.setInterviewId(null);

            response.setInterviewStatus(null);

            response.setRoundName(null);

            response.setInterviewerName(null);

            response.setTechnicalKnowledge(null);

            response.setProblemSolving(null);

            response.setCommunication(null);

            response.setRoleKnowledge(null);

            response.setHrOverallScore(null);

            response.setHrPercentage(null);

            response.setRecommendation(null);

            response.setFeedback(null);

            response.setDecision(
                    "PENDING_INTERVIEW"
            );

            response.setDecisionReason(
                    "Candidate does not have an interview yet."
            );

            return response;
        }


        // --------------------------------------------------
        // GET MOST RECENT INTERVIEW
        // --------------------------------------------------

        Interview interview =
                interviews.get(0);


        // --------------------------------------------------
        // INTERVIEW DETAILS
        // --------------------------------------------------

        response.setInterviewId(
                interview.getInterviewId()
        );

        response.setInterviewStatus(
                interview.getStatus()
        );

        response.setRoundName(
                interview.getRoundName()
        );

        response.setInterviewerName(
                interview.getInterviewerName()
        );


        // --------------------------------------------------
        // HR EVALUATION DETAILS
        // --------------------------------------------------

        response.setTechnicalKnowledge(
                interview.getTechnicalKnowledge()
        );

        response.setProblemSolving(
                interview.getProblemSolving()
        );

        response.setCommunication(
                interview.getCommunication()
        );

        response.setRoleKnowledge(
                interview.getRoleKnowledge()
        );

        response.setRecommendation(
                interview.getRecommendation()
        );

        response.setFeedback(
                interview.getFeedback()
        );


        // --------------------------------------------------
        // CALCULATE HR OVERALL SCORE
        // --------------------------------------------------

        Double hrOverallScore =
                calculateOverallScore(
                        interview
                );


        response.setHrOverallScore(
                hrOverallScore
        );


        // --------------------------------------------------
        // CALCULATE HR PERCENTAGE
        // --------------------------------------------------

        Double hrPercentage =
                calculatePercentage(
                        hrOverallScore
                );


        response.setHrPercentage(
                hrPercentage
        );


        // --------------------------------------------------
        // DETERMINE FINAL DECISION
        // --------------------------------------------------

        determineDecision(
                candidate,
                interview,
                response
        );


        return response;
    }


    // ======================================================
    // CALCULATE OVERALL INTERVIEW SCORE
    // ======================================================

    private Double calculateOverallScore(
            Interview interview
    ) {

        Double technical =
                interview.getTechnicalKnowledge();

        Double problemSolving =
                interview.getProblemSolving();

        Double communication =
                interview.getCommunication();

        Double roleKnowledge =
                interview.getRoleKnowledge();


        // --------------------------------------------------
        // EVALUATION NOT COMPLETE
        // --------------------------------------------------

        if (technical == null
                || problemSolving == null
                || communication == null
                || roleKnowledge == null) {

            return null;
        }


        // --------------------------------------------------
        // FOUR HR EVALUATION CRITERIA
        // --------------------------------------------------

        double total =
                technical
                        + problemSolving
                        + communication
                        + roleKnowledge;


        double average =
                total / 4.0;


        // --------------------------------------------------
        // ROUND TO 2 DECIMAL PLACES
        // --------------------------------------------------

        return Math.round(
                average * 100.0
        ) / 100.0;
    }


    // ======================================================
    // CALCULATE HR PERCENTAGE
    // ======================================================

    private Double calculatePercentage(
            Double overallScore
    ) {

        if (overallScore == null) {

            return null;
        }


        /*
         * HR interview evaluation uses a 1–5 scale.
         *
         * Example:
         *
         * Overall Score = 4.25
         *
         * HR Percentage =
         *
         * (4.25 / 5.0) × 100
         *
         * = 85%
         */

        double percentage =
                (overallScore / 5.0) * 100.0;


        // --------------------------------------------------
        // ROUND TO 2 DECIMAL PLACES
        // --------------------------------------------------

        return Math.round(
                percentage * 100.0
        ) / 100.0;
    }


    // ======================================================
    // DETERMINE FINAL HIRING DECISION
    // ======================================================

    private void determineDecision(
            Candidate candidate,
            Interview interview,
            HiringDecisionResponse response
    ) {

        String status =
                interview.getStatus();


        // --------------------------------------------------
        // INTERVIEW NOT COMPLETED
        // --------------------------------------------------

        if (status == null
                || !"COMPLETED".equalsIgnoreCase(status)) {

            response.setDecision(
                    "PENDING_INTERVIEW"
            );

            response.setDecisionReason(
                    getPendingInterviewReason(status)
            );

            return;
        }


        // --------------------------------------------------
        // INTERVIEW COMPLETED BUT EVALUATION MISSING
        // --------------------------------------------------

        Double hrPercentage =
                response.getHrPercentage();


        if (hrPercentage == null) {

            response.setDecision(
                    "PENDING_EVALUATION"
            );

            response.setDecisionReason(
                    "Interview has been completed but the HR evaluation is not available."
            );

            return;
        }


        // --------------------------------------------------
        // GET HR RECOMMENDATION
        // --------------------------------------------------

        String recommendation =
                interview.getRecommendation();


        if (recommendation != null) {

            recommendation =
                    recommendation.trim()
                            .toUpperCase();
        }


        // ==================================================
        // HR SELECTED
        // ==================================================

        if ("SELECTED".equals(
                recommendation
        )) {

            response.setDecision(
                    "SELECTED"
            );

            response.setDecisionReason(
                    "Candidate completed the interview and was selected by the HR interviewer."
            );

            return;
        }


        // ==================================================
        // HR REJECTED
        // ==================================================

        if ("REJECTED".equals(
                recommendation
        )
                || "REJECT".equals(
                recommendation
        )) {

            response.setDecision(
                    "REJECTED"
            );

            response.setDecisionReason(
                    "Candidate completed the interview but was rejected by the HR interviewer."
            );

            return;
        }


        // ==================================================
        // HR ON HOLD
        // ==================================================

        if ("HOLD".equals(
                recommendation
        )
                || "ON_HOLD".equals(
                recommendation
        )) {

            response.setDecision(
                    "ON_HOLD"
            );

            response.setDecisionReason(
                    "Candidate completed the interview and the HR interviewer placed the candidate on hold."
            );

            return;
        }


        // ==================================================
        // FALLBACK SCORE-BASED DECISION
        // ==================================================

        /*
         * If the HR interviewer did not provide an explicit
         * recommendation, use the HR percentage.
         *
         * Current selection threshold:
         *
         * 70% or above = SELECTED
         * Below 70%    = REJECTED
         */

        if (hrPercentage >= 70.0) {

            response.setDecision(
                    "SELECTED"
            );

            response.setDecisionReason(
                    "Candidate completed the interview and achieved the required HR evaluation score."
            );

        } else {

            response.setDecision(
                    "REJECTED"
            );

            response.setDecisionReason(
                    "Candidate completed the interview but did not achieve the required HR evaluation score."
            );
        }
    }


    // ======================================================
    // PENDING INTERVIEW REASON
    // ======================================================

    private String getPendingInterviewReason(
            String status
    ) {

        if (status == null) {

            return "Candidate has an interview record but the interview status is not available.";
        }


        if ("SCHEDULED".equalsIgnoreCase(
                status
        )) {

            return "Interview is scheduled but has not been completed.";
        }


        if ("CANCELLED".equalsIgnoreCase(
                status
        )) {

            return "Interview was cancelled and has not been completed.";
        }


        if ("RESCHEDULED".equalsIgnoreCase(
                status
        )) {

            return "Interview has been rescheduled and has not been completed.";
        }


        return "Candidate has not completed the interview.";
    }
}
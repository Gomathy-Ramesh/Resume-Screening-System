package com.resume.resume_screening_system.service;

import com.resume.resume_screening_system.entity.Candidate;
import com.resume.resume_screening_system.entity.Interview;
import com.resume.resume_screening_system.repository.CandidateRepository;
import com.resume.resume_screening_system.repository.InterviewRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class InterviewService {

    private static final double INTERVIEW_THRESHOLD = 90.0;

    private final InterviewRepository interviewRepository;
    private final CandidateRepository candidateRepository;
    private final SkillRecoveryService skillRecoveryService;
    private final EmailService emailService;

    // ======================================================
    // CONSTRUCTOR
    // ======================================================

    public InterviewService(
            InterviewRepository interviewRepository,
            CandidateRepository candidateRepository,
            SkillRecoveryService skillRecoveryService,
            EmailService emailService
    ) {
        this.interviewRepository = interviewRepository;
        this.candidateRepository = candidateRepository;
        this.skillRecoveryService = skillRecoveryService;
        this.emailService = emailService;
    }

    // ======================================================
    // CHECK INTERVIEW ELIGIBILITY
    // ======================================================

    public boolean isInterviewEligible(
            Long candidateId,
            Long jobId
    ) {

        Candidate candidate = getCandidate(candidateId);

        // ==================================================
        // CONDITION 1:
        // ORIGINAL SCORE >= 90%
        // ==================================================

        if (candidate.getScore() != null
                && candidate.getScore() >= INTERVIEW_THRESHOLD) {

            return true;
        }

        // ==================================================
        // CONDITION 2:
        // SKILL RECOVERY COMPLETED
        // ==================================================

        if (jobId != null) {

            boolean recoveryCompleted =
                    skillRecoveryService.isRecoveryCompleted(
                            candidateId,
                            jobId
                    );

            if (recoveryCompleted) {
                return true;
            }
        }

        return false;
    }

    // ======================================================
    // GET EFFECTIVE SCORE
    // ======================================================

    public double getEffectiveScore(
            Long candidateId,
            Long jobId
    ) {

        Candidate candidate = getCandidate(candidateId);

        double originalScore =
                candidate.getScore() != null
                        ? candidate.getScore()
                        : 0.0;

        // --------------------------------------------------
        // Already qualified
        // --------------------------------------------------

        if (originalScore >= INTERVIEW_THRESHOLD) {
            return originalScore;
        }

        // --------------------------------------------------
        // Recovery completed
        // --------------------------------------------------

        if (jobId != null
                && skillRecoveryService.isRecoveryCompleted(
                        candidateId,
                        jobId
                )) {

            return 100.0;
        }

        return originalScore;
    }

    // ======================================================
    // GET CANDIDATE
    // ======================================================

    private Candidate getCandidate(Long candidateId) {

        if (candidateId == null) {
            throw new IllegalArgumentException(
                    "Candidate ID is required."
            );
        }

        return candidateRepository
                .findById(candidateId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Candidate not found: "
                                        + candidateId
                        )
                );
    }

    // ======================================================
    // GET ALL INTERVIEWS
    // ======================================================

    @Transactional(readOnly = true)
    public List<Interview> getAllInterviews() {

        return interviewRepository
                .findAllByOrderByInterviewDateDesc();
    }

    // ======================================================
    // SCHEDULE INTERVIEW
    // ======================================================

    public Interview scheduleInterview(
            Long candidateId,
            Long jobId,
            String roundName,
            String interviewType,
            String interviewerName,
            String interviewerEmail,
            LocalDateTime interviewDate,
            Integer durationMinutes,
            String interviewMode,
            String meetingLink,
            String location,
            String notes
    ) {

        // ==================================================
        // GET CANDIDATE
        // ==================================================

        Candidate candidate = getCandidate(candidateId);

        // ==================================================
        // CHECK ELIGIBILITY
        // ==================================================

        boolean eligible =
                isInterviewEligible(
                        candidateId,
                        jobId
                );

        if (!eligible) {

            throw new IllegalStateException(
                    "Candidate is not eligible for HR interview. "
                            + "Candidate must have an original score "
                            + "of at least 90%, or must complete "
                            + "the required Skill Recovery program."
            );
        }

        // ==================================================
        // VALIDATE INTERVIEW DATE
        // ==================================================

        if (interviewDate == null) {

            throw new IllegalArgumentException(
                    "Interview date is required."
            );
        }

        if (interviewDate.isBefore(LocalDateTime.now())) {

            throw new IllegalArgumentException(
                    "Interview date must be in the future."
            );
        }

        // ==================================================
        // VALIDATE DURATION
        // ==================================================

        if (durationMinutes == null
                || durationMinutes <= 0) {

            throw new IllegalArgumentException(
                    "Interview duration must be greater than 0 minutes."
            );
        }

        // ==================================================
        // VALIDATE INTERVIEW MODE
        // ==================================================

        if (interviewMode == null
                || interviewMode.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Interview mode is required."
            );
        }

        // ==================================================
        // ONLINE VALIDATION
        // ==================================================

        if ("ONLINE".equalsIgnoreCase(interviewMode)
                && (meetingLink == null
                || meetingLink.trim().isEmpty())) {

            throw new IllegalArgumentException(
                    "Meeting link is required for an online interview."
            );
        }

        // ==================================================
        // OFFLINE VALIDATION
        // ==================================================

        if ("OFFLINE".equalsIgnoreCase(interviewMode)
                && (location == null
                || location.trim().isEmpty())) {

            throw new IllegalArgumentException(
                    "Location is required for an offline interview."
            );
        }

        // ==================================================
        // CHECK EXISTING INTERVIEW
        // ==================================================

        boolean conflict =
                interviewRepository
                        .existsByCandidateCandidateIdAndInterviewDate(
                                candidateId,
                                interviewDate
                        );

        if (conflict) {

            throw new IllegalStateException(
                    "Candidate already has an interview "
                            + "scheduled at this date and time."
            );
        }

        // ==================================================
        // CREATE INTERVIEW
        // ==================================================

        Interview interview = new Interview();

        interview.setCandidate(candidate);

        interview.setRoundName(
                roundName != null
                        && !roundName.trim().isEmpty()
                        ? roundName.trim()
                        : "HR Interview"
        );

        interview.setInterviewType(
                interviewType != null
                        && !interviewType.trim().isEmpty()
                        ? interviewType.trim()
                        : "HR"
        );

        interview.setInterviewerName(
                interviewerName
        );

        interview.setInterviewerEmail(
                interviewerEmail
        );

        interview.setInterviewDate(
                interviewDate
        );

        interview.setDurationMinutes(
                durationMinutes
        );

        interview.setInterviewMode(
                interviewMode
        );

        interview.setMeetingLink(
                meetingLink
        );

        interview.setLocation(
                location
        );

        interview.setStatus(
                "SCHEDULED"
        );

        interview.setNotes(
                notes
        );

        // ==================================================
        // SAVE INTERVIEW
        // ==================================================

        Interview savedInterview =
                interviewRepository.save(interview);

        // ==================================================
        // SEND INTERVIEW SCHEDULED EMAIL
        // ==================================================

        try {

            System.out.println(
                    "Sending interview scheduled email to: "
                            + candidate.getEmail()
            );

            emailService.sendInterviewScheduledEmail(
                    candidate.getEmail(),
                    candidate.getName(),
                    candidate.getAppliedPosition(),
                    savedInterview.getRoundName(),
                    savedInterview.getInterviewType(),
                    savedInterview.getInterviewerName(),
                    savedInterview.getInterviewerEmail(),
                    savedInterview.getInterviewDate(),
                    savedInterview.getDurationMinutes(),
                    savedInterview.getInterviewMode(),
                    savedInterview.getMeetingLink(),
                    savedInterview.getLocation(),
                    savedInterview.getNotes()
            );

            System.out.println(
                    "Interview scheduled email sent successfully."
            );

        } catch (Exception e) {

            // ------------------------------------------------
            // IMPORTANT:
            // Do not fail the interview scheduling operation
            // only because the email failed.
            // ------------------------------------------------

            System.out.println(
                    "Failed to send interview scheduled email."
            );

            e.printStackTrace();
        }

        // ==================================================
        // RETURN SAVED INTERVIEW
        // ==================================================

        return savedInterview;
    }

    // ======================================================
    // GET INTERVIEW BY ID
    // ======================================================

    @Transactional(readOnly = true)
    public Interview getInterview(
            Long interviewId
    ) {

        if (interviewId == null) {

            throw new IllegalArgumentException(
                    "Interview ID is required."
            );
        }

        return interviewRepository
                .findById(interviewId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Interview not found: "
                                        + interviewId
                        )
                );
    }

    // ======================================================
    // GET CANDIDATE INTERVIEWS
    // ======================================================

    @Transactional(readOnly = true)
    public List<Interview> getCandidateInterviews(
            Long candidateId
    ) {

        getCandidate(candidateId);

        return interviewRepository
                .findByCandidateCandidateIdOrderByInterviewDateDesc(
                        candidateId
                );
    }

    // ======================================================
    // GET INTERVIEWS BY STATUS
    // ======================================================

    @Transactional(readOnly = true)
    public List<Interview> getInterviewsByStatus(
            String status
    ) {

        if (status == null
                || status.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Interview status is required."
            );
        }

        return interviewRepository
                .findByStatusOrderByInterviewDateAsc(
                        status
                );
    }

    // ======================================================
    // GET UPCOMING INTERVIEWS
    // ======================================================

    @Transactional(readOnly = true)
    public List<Interview> getUpcomingInterviews() {

        return interviewRepository
                .findByInterviewDateAfterOrderByInterviewDateAsc(
                        LocalDateTime.now()
                );
    }

    // ======================================================
    // RESCHEDULE INTERVIEW
    // ======================================================

    public Interview rescheduleInterview(
            Long interviewId,
            LocalDateTime newInterviewDate
    ) {

        Interview interview =
                getInterview(interviewId);

        // ==================================================
        // VALIDATE DATE
        // ==================================================

        if (newInterviewDate == null) {

            throw new IllegalArgumentException(
                    "New interview date is required."
            );
        }

        if (newInterviewDate.isBefore(
                LocalDateTime.now()
        )) {

            throw new IllegalArgumentException(
                    "New interview date must be in the future."
            );
        }

        // ==================================================
        // CHECK CONFLICT
        // ==================================================

        boolean conflict =
                interviewRepository
                        .existsByCandidateCandidateIdAndInterviewDate(
                                interview.getCandidate()
                                        .getCandidateId(),
                                newInterviewDate
                        );

        if (conflict
                && !newInterviewDate.equals(
                        interview.getInterviewDate()
                )) {

            throw new IllegalStateException(
                    "Candidate already has another "
                            + "interview at this time."
            );
        }

        // ==================================================
        // UPDATE DATE
        // ==================================================

        interview.setInterviewDate(
                newInterviewDate
        );

        interview.setStatus(
                "RESCHEDULED"
        );

        return interviewRepository.save(
                interview
        );
    }

    // ======================================================
    // CANCEL INTERVIEW
    // ======================================================

    public Interview cancelInterview(
            Long interviewId
    ) {

        Interview interview =
                getInterview(interviewId);

        // ==================================================
        // PREVENT CANCELLING COMPLETED INTERVIEW
        // ==================================================

        if ("COMPLETED".equalsIgnoreCase(
                interview.getStatus()
        )) {

            throw new IllegalStateException(
                    "A completed interview cannot be cancelled."
            );
        }

        // ==================================================
        // CANCEL
        // ==================================================

        interview.setStatus(
                "CANCELLED"
        );

        return interviewRepository.save(
                interview
        );
    }

    // ======================================================
    // MARK INTERVIEW AS COMPLETED
    // ======================================================

    public Interview completeInterview(
            Long interviewId
    ) {

        Interview interview =
                getInterview(interviewId);

        // ==================================================
        // PREVENT COMPLETING CANCELLED INTERVIEW
        // ==================================================

        if ("CANCELLED".equalsIgnoreCase(
                interview.getStatus()
        )) {

            throw new IllegalStateException(
                    "A cancelled interview cannot be completed."
            );
        }

        // ==================================================
        // COMPLETE
        // ==================================================

        interview.setStatus(
                "COMPLETED"
        );

        return interviewRepository.save(
                interview
        );
    }

    // ======================================================
    // SUBMIT INTERVIEW EVALUATION
    // ======================================================

    public Interview submitEvaluation(
            Long interviewId,
            Double technicalKnowledge,
            Double problemSolving,
            Double communication,
            Double roleKnowledge,
            String recommendation,
            String feedback
    ) {

        // ==================================================
        // GET INTERVIEW
        // ==================================================

        Interview interview =
                getInterview(interviewId);

        // ==================================================
        // VALIDATE SCORES
        // ==================================================

        validateScore(
                technicalKnowledge,
                "Technical knowledge"
        );

        validateScore(
                problemSolving,
                "Problem solving"
        );

        validateScore(
                communication,
                "Communication"
        );

        validateScore(
                roleKnowledge,
                "Role knowledge"
        );

        // ==================================================
        // SET SCORES
        // ==================================================

        interview.setTechnicalKnowledge(
                technicalKnowledge
        );

        interview.setProblemSolving(
                problemSolving
        );

        interview.setCommunication(
                communication
        );

        interview.setRoleKnowledge(
                roleKnowledge
        );

        // ==================================================
        // CALCULATE OVERALL SCORE
        // ==================================================

        double overallScore =
                (
                        technicalKnowledge
                                + problemSolving
                                + communication
                                + roleKnowledge
                ) / 4.0;

        overallScore =
                Math.round(
                        overallScore * 100.0
                ) / 100.0;

        interview.setOverallScore(
                overallScore
        );

        // ==================================================
        // SET RECOMMENDATION
        // ==================================================

        interview.setRecommendation(
                recommendation
        );

        // ==================================================
        // SET FEEDBACK
        // ==================================================

        interview.setFeedback(
                feedback
        );

        // ==================================================
        // MARK COMPLETED
        // ==================================================

        interview.setStatus(
                "COMPLETED"
        );

        // ==================================================
        // UPDATE CANDIDATE
        // ==================================================

        Candidate candidate =
                interview.getCandidate();

        if (candidate != null
                && recommendation != null
                && !recommendation.trim().isEmpty()) {

            String normalizedRecommendation =
                    recommendation
                            .trim()
                            .toUpperCase();

            // ==============================================
            // SELECTED
            // ==============================================

            if ("SELECTED".equals(
                    normalizedRecommendation
            )) {

                candidate.setSelected(true);

                candidate.setShortlisted(true);

                candidate.setStatus(
                        "Selected"
                );

                candidate.setCurrentStage(
                        "SELECTED"
                );

                // ==========================================
                // SAVE CANDIDATE FIRST
                // ==========================================

                candidateRepository.save(
                        candidate
                );

                // ==========================================
                // SEND SELECTION EMAIL
                // ==========================================

                try {

                    System.out.println(
                            "Sending selection email to: "
                                    + candidate.getEmail()
                    );

                    emailService.sendEmail(
                            candidate.getEmail(),
                            candidate.getName(),
                            candidate.getAppliedPosition(),
                            "Selected"
                    );

                    System.out.println(
                            "Selection email sent successfully."
                    );

                } catch (Exception e) {

                    System.out.println(
                            "Failed to send selection email."
                    );

                    e.printStackTrace();
                }
            }

            // ==============================================
            // REJECTED
            // ==============================================

            else if ("REJECTED".equals(
                    normalizedRecommendation
            )) {

                candidate.setSelected(false);

                candidate.setShortlisted(false);

                candidate.setStatus(
                        "Rejected"
                );

                candidate.setCurrentStage(
                        "REJECTED"
                );

                candidateRepository.save(
                        candidate
                );
            }

            // ==============================================
            // SHORTLISTED
            // ==============================================

            else if ("SHORTLISTED".equals(
                    normalizedRecommendation
            )) {

                candidate.setSelected(false);

                candidate.setShortlisted(true);

                candidate.setStatus(
                        "Shortlisted"
                );

                candidate.setCurrentStage(
                        "SHORTLISTED"
                );

                candidateRepository.save(
                        candidate
                );
            }
        }

        // ==================================================
        // SAVE INTERVIEW
        // ==================================================

        return interviewRepository.save(
                interview
        );
    }

    // ======================================================
    // VALIDATE EVALUATION SCORE
    // ======================================================

    private void validateScore(
            Double score,
            String fieldName
    ) {

        if (score == null) {

            throw new IllegalArgumentException(
                    fieldName
                            + " score is required."
            );
        }

        if (score < 0 || score > 5) {

            throw new IllegalArgumentException(
                    fieldName
                            + " score must be between 0 and 5."
            );
        }
    }
}
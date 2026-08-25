package com.resume.resume_screening_system.dto;

public class HiringDecisionResponse {

    private Long candidateId;

    private String candidateName;

    private String email;

    private String appliedPosition;

    private Double resumeScore;

    private Double thresholdPercentage;

    private Long interviewId;

    private String interviewStatus;

    private String roundName;

    private String interviewerName;

    private Double technicalKnowledge;

    private Double problemSolving;

    private Double communication;

    private Double roleKnowledge;

    private Double hrOverallScore;

    private Double hrPercentage;

    private String recommendation;

    private String feedback;

    private String decision;

    private String decisionReason;


    public HiringDecisionResponse() {
    }


    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }


    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }


    public String getAppliedPosition() {
        return appliedPosition;
    }

    public void setAppliedPosition(String appliedPosition) {
        this.appliedPosition = appliedPosition;
    }


    public Double getResumeScore() {
        return resumeScore;
    }

    public void setResumeScore(Double resumeScore) {
        this.resumeScore = resumeScore;
    }


    public Double getThresholdPercentage() {
        return thresholdPercentage;
    }

    public void setThresholdPercentage(
            Double thresholdPercentage
    ) {
        this.thresholdPercentage =
                thresholdPercentage;
    }


    public Long getInterviewId() {
        return interviewId;
    }

    public void setInterviewId(Long interviewId) {
        this.interviewId = interviewId;
    }


    public String getInterviewStatus() {
        return interviewStatus;
    }

    public void setInterviewStatus(
            String interviewStatus
    ) {
        this.interviewStatus =
                interviewStatus;
    }


    public String getRoundName() {
        return roundName;
    }

    public void setRoundName(String roundName) {
        this.roundName = roundName;
    }


    public String getInterviewerName() {
        return interviewerName;
    }

    public void setInterviewerName(
            String interviewerName
    ) {
        this.interviewerName =
                interviewerName;
    }


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


    public Double getHrOverallScore() {
        return hrOverallScore;
    }

    public void setHrOverallScore(
            Double hrOverallScore
    ) {
        this.hrOverallScore =
                hrOverallScore;
    }


    public Double getHrPercentage() {
        return hrPercentage;
    }

    public void setHrPercentage(
            Double hrPercentage
    ) {
        this.hrPercentage =
                hrPercentage;
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


    public String getDecision() {
        return decision;
    }

    public void setDecision(
            String decision
    ) {
        this.decision =
                decision;
    }


    public String getDecisionReason() {
        return decisionReason;
    }

    public void setDecisionReason(
            String decisionReason
    ) {
        this.decisionReason =
                decisionReason;
    }
}
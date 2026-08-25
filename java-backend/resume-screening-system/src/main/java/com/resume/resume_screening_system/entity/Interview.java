package com.resume.resume_screening_system.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "interviews",
        indexes = {
                @Index(name = "idx_interview_candidate", columnList = "candidate_id"),
                @Index(name = "idx_interview_status", columnList = "status"),
                @Index(name = "idx_interview_date", columnList = "interview_date")
        }
)
public class Interview {

    // ======================================================
    // PRIMARY KEY
    // ======================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long interviewId;


    // ======================================================
    // CANDIDATE
    // ======================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "candidate_id",
            nullable = false
    )
    private Candidate candidate;


    // ======================================================
    // INTERVIEW DETAILS
    // ======================================================

    @Column(name = "round_name", nullable = false)
    private String roundName;


    @Column(name = "interview_type", nullable = false)
    private String interviewType;


    @Column(name = "interviewer_name")
    private String interviewerName;


    @Column(name = "interviewer_email")
    private String interviewerEmail;


    @Column(name = "interview_date", nullable = false)
    private LocalDateTime interviewDate;


    @Column(name = "duration_minutes")
    private Integer durationMinutes;


    @Column(name = "interview_mode")
    private String interviewMode;


    @Column(name = "meeting_link", length = 2000)
    private String meetingLink;


    @Column(name = "location")
    private String location;


    // ======================================================
    // STATUS
    // ======================================================

    @Column(nullable = false)
    private String status = "SCHEDULED";


    // ======================================================
    // INTERVIEW NOTES
    // ======================================================

    @Column(length = 5000)
    private String notes;


    // ======================================================
    // EVALUATION
    // ======================================================

    @Column(name = "technical_knowledge")
    private Double technicalKnowledge;


    @Column(name = "problem_solving")
    private Double problemSolving;


    @Column(name = "communication")
    private Double communication;


    @Column(name = "role_knowledge")
    private Double roleKnowledge;


    @Column(name = "overall_score")
    private Double overallScore;


    @Column(name = "recommendation")
    private String recommendation;


    @Column(name = "feedback", length = 5000)
    private String feedback;


    // ======================================================
    // CREATED / UPDATED
    // ======================================================

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;


    @Column(name = "updated_at")
    private LocalDateTime updatedAt;


    // ======================================================
    // DEFAULT CONSTRUCTOR
    // ======================================================

    public Interview() {
    }


    // ======================================================
    // PRE-PERSIST
    // ======================================================

    @PrePersist
    protected void onCreate() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        updatedAt = LocalDateTime.now();
    }


    // ======================================================
    // PRE-UPDATE
    // ======================================================

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }


    // ======================================================
    // GETTERS / SETTERS
    // ======================================================

    public Long getInterviewId() {
        return interviewId;
    }

    public void setInterviewId(Long interviewId) {
        this.interviewId = interviewId;
    }


    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
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

    public void setInterviewerEmail(String interviewerEmail) {
        this.interviewerEmail = interviewerEmail;
    }


    public LocalDateTime getInterviewDate() {
        return interviewDate;
    }

    public void setInterviewDate(LocalDateTime interviewDate) {
        this.interviewDate = interviewDate;
    }


    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }


    public String getInterviewMode() {
        return interviewMode;
    }

    public void setInterviewMode(String interviewMode) {
        this.interviewMode = interviewMode;
    }


    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }


    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }


    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }


    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }


    public Double getTechnicalKnowledge() {
        return technicalKnowledge;
    }

    public void setTechnicalKnowledge(Double technicalKnowledge) {
        this.technicalKnowledge = technicalKnowledge;
    }


    public Double getProblemSolving() {
        return problemSolving;
    }

    public void setProblemSolving(Double problemSolving) {
        this.problemSolving = problemSolving;
    }


    public Double getCommunication() {
        return communication;
    }

    public void setCommunication(Double communication) {
        this.communication = communication;
    }


    public Double getRoleKnowledge() {
        return roleKnowledge;
    }

    public void setRoleKnowledge(Double roleKnowledge) {
        this.roleKnowledge = roleKnowledge;
    }


    public Double getOverallScore() {
        return overallScore;
    }

    public void setOverallScore(Double overallScore) {
        this.overallScore = overallScore;
    }


    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }


    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }


    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
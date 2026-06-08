package com.resume.resume_screening_system.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidates")
public class Candidate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long candidateId;

    // =========================
    // BASIC DETAILS
    // =========================

    private String name;

    private String email;

    private String phone;

    private Double experience;

    private String education;

    private String appliedPosition;

    // =========================
    // JOB RELATION
    // =========================

    @ManyToOne
    @JoinColumn(name = "job_id")
    private Job job;

    // =========================
    // JOB DESCRIPTION
    // =========================

    @Column(length = 5000)
    private String jobDescription;

    // =========================
    // AI RESULT DETAILS
    // =========================

    private Double thresholdPercentage;

    private Double score;

    @Column(length = 3000)
    private String skills;

    private String rank;

    private String status;

    // =========================
    // ATS WORKFLOW
    // =========================

    private String currentStage;

    private Boolean shortlisted = false;

    private Boolean selected = false;

    // =========================
    // DATE FIELDS
    // =========================

    private LocalDateTime appliedDate;

    private LocalDateTime expiryDate;

    // =========================
    // RESUME FILE
    // =========================

    @Column(length = 5000)
    private String resumeFilePath;

    @Column(length = 5000)
    private String resumeUrl;

    // =========================
    // DEFAULT CONSTRUCTOR
    // =========================

    public Candidate() {
    }

    // =========================
    // CANDIDATE ID
    // =========================

    public Long getCandidateId() {
        return candidateId;
    }

    public void setCandidateId(Long candidateId) {
        this.candidateId = candidateId;
    }

    // =========================
    // NAME
    // =========================

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    // =========================
    // EMAIL
    // =========================

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    // =========================
    // PHONE
    // =========================

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    // =========================
    // EXPERIENCE
    // =========================

    public Double getExperience() {
        return experience;
    }

    public void setExperience(Double experience) {
        this.experience = experience;
    }

    // =========================
    // EDUCATION
    // =========================

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    // =========================
    // APPLIED POSITION
    // =========================

    public String getAppliedPosition() {
        return appliedPosition;
    }

    public void setAppliedPosition(String appliedPosition) {
        this.appliedPosition = appliedPosition;
    }

    // =========================
    // JOB
    // =========================

    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    // =========================
    // JOB DESCRIPTION
    // =========================

    public String getJobDescription() {
        return jobDescription;
    }

    public void setJobDescription(String jobDescription) {
        this.jobDescription = jobDescription;
    }

    // =========================
    // THRESHOLD
    // =========================

    public Double getThresholdPercentage() {
        return thresholdPercentage;
    }

    public void setThresholdPercentage(Double thresholdPercentage) {
        this.thresholdPercentage = thresholdPercentage;
    }

    // =========================
    // SCORE
    // =========================

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    // =========================
    // SKILLS
    // =========================

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    // =========================
    // RANK
    // =========================

    public String getRank() {
        return rank;
    }

    public void setRank(String rank) {
        this.rank = rank;
    }

    // =========================
    // STATUS
    // =========================

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // =========================
    // CURRENT STAGE
    // =========================

    public String getCurrentStage() {
        return currentStage;
    }

    public void setCurrentStage(String currentStage) {
        this.currentStage = currentStage;
    }

    // =========================
    // SHORTLISTED
    // =========================

    public Boolean getShortlisted() {
        return shortlisted;
    }

    public void setShortlisted(Boolean shortlisted) {
        this.shortlisted = shortlisted;
    }

    // =========================
    // SELECTED
    // =========================

    public Boolean getSelected() {
        return selected;
    }

    public void setSelected(Boolean selected) {
        this.selected = selected;
    }

    // =========================
    // APPLIED DATE
    // =========================

    public LocalDateTime getAppliedDate() {
        return appliedDate;
    }

    public void setAppliedDate(LocalDateTime appliedDate) {
        this.appliedDate = appliedDate;
    }

    // =========================
    // EXPIRY DATE
    // =========================

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    // =========================
    // RESUME FILE PATH
    // =========================

    public String getResumeFilePath() {
        return resumeFilePath;
    }

    public void setResumeFilePath(String resumeFilePath) {
        this.resumeFilePath = resumeFilePath;
    }

    // =========================
    // RESUME URL
    // =========================

    public String getResumeUrl() {
        return resumeUrl;
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = resumeUrl;
    }
}
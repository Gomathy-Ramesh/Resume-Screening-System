package com.resume.resume_screening_system.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "job")
public class Job {

    // =========================
    // PRIMARY KEY
    // =========================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobId;

    // =========================
    // JOB TITLE
    // =========================

    private String jobTitle;

    // =========================
    // JOB DESCRIPTION
    // =========================

    @Column(length = 5000)
    private String jobDescription;

    // =========================
    // COMPANY NAME
    // =========================

    private String companyName;

    // =========================
    // THRESHOLD PERCENTAGE
    // =========================

    private Double thresholdPercentage;

    // =========================
    // JOB STATUS
    // =========================

    @Column(name = "status")
    private String status = "ACTIVE";

    // =========================
    // CANDIDATE COUNT
    // =========================

    @Transient
    private Long candidateCount;

    // =========================
    // DEFAULT CONSTRUCTOR
    // =========================

    public Job() {
    }

    // =========================
    // JOB ID
    // =========================

    public Long getJobId() {

        return jobId;
    }

    public void setJobId(Long jobId) {

        this.jobId = jobId;
    }

    // =========================
    // JOB TITLE
    // =========================

    public String getJobTitle() {

        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {

        this.jobTitle = jobTitle;
    }

    // =========================
    // JOB DESCRIPTION
    // =========================

    public String getJobDescription() {

        return jobDescription;
    }

    public void setJobDescription(
            String jobDescription
    ) {

        this.jobDescription = jobDescription;
    }

    // =========================
    // COMPANY NAME
    // =========================

    public String getCompanyName() {

        return companyName;
    }

    public void setCompanyName(
            String companyName
    ) {

        this.companyName = companyName;
    }

    // =========================
    // THRESHOLD PERCENTAGE
    // =========================

    public Double getThresholdPercentage() {

        return thresholdPercentage;
    }

    public void setThresholdPercentage(
            Double thresholdPercentage
    ) {

        this.thresholdPercentage =
                thresholdPercentage;
    }

    // =========================
    // JOB STATUS
    // =========================

    public String getStatus() {

        return status;
    }

    public void setStatus(
            String status
    ) {

        this.status = status;
    }

    // =========================
    // CANDIDATE COUNT
    // =========================

    public Long getCandidateCount() {

        return candidateCount;
    }

    public void setCandidateCount(
            Long candidateCount
    ) {

        this.candidateCount =
                candidateCount;
    }
}
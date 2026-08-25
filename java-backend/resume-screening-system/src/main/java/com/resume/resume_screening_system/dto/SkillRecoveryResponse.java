package com.resume.resume_screening_system.dto;

import java.util.List;

public class SkillRecoveryResponse {

    // =========================================================
    // CANDIDATE NAME
    // =========================================================

    private String candidateName;

    // =========================================================
    // JOB TITLE
    // =========================================================

    private String jobTitle;

    // =========================================================
    // RECOVERY ITEMS
    // =========================================================

    private List<SkillRecoveryItem> recoveryItems;

    // =========================================================
    // OVERALL PROGRESS
    // =========================================================

    private int overallProgress;

    // =========================================================
    // COMPLETED
    // =========================================================

    private boolean completed;


    // =========================================================
    // GET / SET CANDIDATE NAME
    // =========================================================

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }


    // =========================================================
    // GET / SET JOB TITLE
    // =========================================================

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }


    // =========================================================
    // GET / SET RECOVERY ITEMS
    // =========================================================

    public List<SkillRecoveryItem> getRecoveryItems() {
        return recoveryItems;
    }

    public void setRecoveryItems(
            List<SkillRecoveryItem> recoveryItems
    ) {
        this.recoveryItems = recoveryItems;
    }


    // =========================================================
    // GET / SET OVERALL PROGRESS
    // =========================================================

    public int getOverallProgress() {
        return overallProgress;
    }

    public void setOverallProgress(
            int overallProgress
    ) {
        this.overallProgress = overallProgress;
    }


    // =========================================================
    // GET / SET COMPLETED
    // =========================================================

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }
}
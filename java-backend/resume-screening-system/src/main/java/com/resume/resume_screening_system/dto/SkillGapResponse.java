
package com.resume.resume_screening_system.dto;

import java.util.List;

public class SkillGapResponse {

    private String candidateName;
    private String jobTitle;
    private double matchPercentage;

    private List<String> matchedSkills;
    private List<String> missingSkills;

    /**
     * Skills that were originally missing but have now
     * been completely learned through Skill Recovery.
     */
    private List<String> completedSkills;

    // Default constructor
    public SkillGapResponse() {
    }

    // Getters and Setters

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public double getMatchPercentage() {
        return matchPercentage;
    }

    public void setMatchPercentage(double matchPercentage) {
        this.matchPercentage = matchPercentage;
    }

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    public List<String> getMissingSkills() {
        return missingSkills;
    }

    public void setMissingSkills(List<String> missingSkills) {
        this.missingSkills = missingSkills;
    }

    public List<String> getCompletedSkills() {
        return completedSkills;
    }

    public void setCompletedSkills(List<String> completedSkills) {
        this.completedSkills = completedSkills;
    }
}


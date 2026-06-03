package com.resume.resume_screening_system.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class PythonResponse {

    // =========================
    // BASIC DETAILS
    // =========================

    private String name;

    private String email;

    private String phone;

    private String education;

    // =========================
    // AI ANALYSIS FIELDS
    // =========================

    private List<String> skills;

    @JsonProperty("matchedSkills")
    private List<String> matchedSkills;

    @JsonProperty("matchedSkillsCount")
    private Integer matchedSkillsCount;

    private Integer experience;

    private Double score;

    private String rank;

    @JsonProperty("similarity_score")
    private Double similarity_score;

    @JsonProperty("skillMatchPercentage")
    private Double skillMatchPercentage;

    // =========================
    // RESUME URL
    // =========================

    private String resumeUrl;

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
    // EDUCATION
    // =========================

    public String getEducation() {
        return education;
    }

    public void setEducation(String education) {
        this.education = education;
    }

    // =========================
    // SKILLS
    // =========================

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    // =========================
    // MATCHED SKILLS
    // =========================

    public List<String> getMatchedSkills() {
        return matchedSkills;
    }

    public void setMatchedSkills(List<String> matchedSkills) {
        this.matchedSkills = matchedSkills;
    }

    // =========================
    // MATCHED SKILLS COUNT
    // =========================

    public Integer getMatchedSkillsCount() {
        return matchedSkillsCount;
    }

    public void setMatchedSkillsCount(Integer matchedSkillsCount) {
        this.matchedSkillsCount = matchedSkillsCount;
    }

    // =========================
    // EXPERIENCE
    // =========================

    public Integer getExperience() {
        return experience;
    }

    public void setExperience(Integer experience) {
        this.experience = experience;
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
    // RANK
    // =========================

    public String getRank() {
        return rank;
    }

    public void setRank(String rank) {
        this.rank = rank;
    }

    // =========================
    // SIMILARITY SCORE
    // =========================

    public Double getSimilarity_score() {
        return similarity_score;
    }

    public void setSimilarity_score(Double similarity_score) {
        this.similarity_score = similarity_score;
    }

    // =========================
    // SKILL MATCH PERCENTAGE
    // =========================

    public Double getSkill_match_percentage() {
        return skillMatchPercentage;
    }

    public void setSkill_match_percentage(Double skill_match_percentage) {
        this.skillMatchPercentage = skill_match_percentage;
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
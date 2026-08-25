package com.resume.resume_screening_system.dto;

import java.util.List;

public class SkillRecoveryItem {

    // =========================================================
    // SKILL
    // =========================================================

    private String skill;

    // =========================================================
    // LEVEL
    // =========================================================

    private String level;

    // =========================================================
    // DESCRIPTION
    // =========================================================

    private String description;

    // =========================================================
    // TOPICS
    // =========================================================

    private List<String> topics;

    // =========================================================
    // COMPLETED TOPICS
    // =========================================================

    private List<String> completedTopics;

    // =========================================================
    // RECOMMENDED DURATION
    // =========================================================

    private String recommendedDuration;

    // =========================================================
    // PROGRESS
    // =========================================================

    private int progress;

    // =========================================================
    // COMPLETED
    // =========================================================

    private boolean completed;


    // =========================================================
    // GET / SET SKILL
    // =========================================================

    public String getSkill() {
        return skill;
    }

    public void setSkill(String skill) {
        this.skill = skill;
    }


    // =========================================================
    // GET / SET LEVEL
    // =========================================================

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }


    // =========================================================
    // GET / SET DESCRIPTION
    // =========================================================

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    // =========================================================
    // GET / SET TOPICS
    // =========================================================

    public List<String> getTopics() {
        return topics;
    }

    public void setTopics(List<String> topics) {
        this.topics = topics;
    }


    // =========================================================
    // GET / SET COMPLETED TOPICS
    // =========================================================

    public List<String> getCompletedTopics() {
        return completedTopics;
    }

    public void setCompletedTopics(
            List<String> completedTopics
    ) {
        this.completedTopics = completedTopics;
    }


    // =========================================================
    // GET / SET RECOMMENDED DURATION
    // =========================================================

    public String getRecommendedDuration() {
        return recommendedDuration;
    }

    public void setRecommendedDuration(
            String recommendedDuration
    ) {
        this.recommendedDuration = recommendedDuration;
    }


    // =========================================================
    // GET / SET PROGRESS
    // =========================================================

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
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
package com.resume.resume_screening_system.dto;

public class DashboardResponse {

    private Long totalCandidates;

    private Long acceptedCandidates;

    private Long rejectedCandidates;

    private Double averageScore;

    private Double highestScore;

    public Long getTotalCandidates() {
        return totalCandidates;
    }

    public void setTotalCandidates(Long totalCandidates) {
        this.totalCandidates = totalCandidates;
    }

    public Long getAcceptedCandidates() {
        return acceptedCandidates;
    }

    public void setAcceptedCandidates(Long acceptedCandidates) {
        this.acceptedCandidates = acceptedCandidates;
    }

    public Long getRejectedCandidates() {
        return rejectedCandidates;
    }

    public void setRejectedCandidates(Long rejectedCandidates) {
        this.rejectedCandidates = rejectedCandidates;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public Double getHighestScore() {
        return highestScore;
    }

    public void setHighestScore(Double highestScore) {
        this.highestScore = highestScore;
    }
}
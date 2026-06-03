package com.resume.resume_screening_system.dto;

import lombok.Data;

@Data
public class ResumeData {

    // =========================
    // FIELDS
    // =========================

    private String name;

    private String email;

    private String phone;

    private String skills;

    private Double experience;
}
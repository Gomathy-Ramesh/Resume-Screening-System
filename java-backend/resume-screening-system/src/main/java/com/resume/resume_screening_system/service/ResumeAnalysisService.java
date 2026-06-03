package com.resume.resume_screening_system.service;

import com.resume.resume_screening_system.dto.ResumeData;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import java.io.File;

import java.util.Map;

@Service
public class ResumeAnalysisService {

    @Autowired
    private ResumeParserService
            resumeParserService;

    // =========================
    // ANALYZE RESUME
    // =========================

    public ResumeData analyzeResume(
            String filePath
    ) throws Exception {

        // =========================
        // FILE OBJECT
        // =========================

        File file =
                new File(filePath);

        // =========================
        // PARSE RESUME
        // =========================

        Map<String, Object> parsedData =
                resumeParserService
                        .parseResume(file);

        // =========================
        // DTO OBJECT
        // =========================

        ResumeData data =
                new ResumeData();

        // =========================
        // SET VALUES
        // =========================

        data.setName(
                (String) parsedData.get("name")
        );

        data.setEmail(
                (String) parsedData.get("email")
        );

        data.setPhone(
                (String) parsedData.get("phone")
        );

        data.setSkills(
                (String) parsedData.get("skills")
        );

        Object experienceObj =
                parsedData.get("experience");

        if (experienceObj != null) {

            data.setExperience(
                    Double.parseDouble(
                            experienceObj.toString()
                    )
            );
        }

        return data;
    }
}
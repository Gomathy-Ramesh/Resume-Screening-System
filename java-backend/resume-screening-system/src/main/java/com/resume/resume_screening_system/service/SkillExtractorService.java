package com.resume.resume_screening_system.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SkillExtractorService {

    public List<String> extractSkills(String resumeText) {

        List<String> skills = new ArrayList<>();

        String[] predefinedSkills = {
                "java",
                "spring boot",
                "python",
                "sql",
                "mysql",
                "postgresql",
                "html",
                "css",
                "javascript",
                "react",
                "angular",
                "aws",
                "docker",
                "kubernetes",
                "git"
        };

        String lowerText = resumeText.toLowerCase();

        for (String skill : predefinedSkills) {

            if (lowerText.contains(skill.toLowerCase())) {
                skills.add(skill);
            }
        }

        return skills;
    }
}
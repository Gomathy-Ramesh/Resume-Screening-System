package com.resume.resume_screening_system.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ResumeDataExtractor {

    // =========================
    // SKILL DATABASE
    // =========================

    private final List<String> skillsDatabase =
            Arrays.asList(

                    "java",
                    "spring",
                    "spring boot",
                    "mysql",
                    "postgresql",
                    "react",
                    "javascript",
                    "python",
                    "html",
                    "css",
                    "hibernate",
                    "rest api",
                    "microservices",
                    "docker",
                    "kubernetes",
                    "aws",
                    "git",
                    "github"
            );

    // =========================
    // EXTRACT EMAIL
    // =========================

    public String extractEmail(String text) {

        Pattern pattern = Pattern.compile(
                "[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+"
        );

        Matcher matcher =
                pattern.matcher(text);

        if (matcher.find()) {

            return matcher.group();
        }

        return "Not Found";
    }

    // =========================
    // EXTRACT PHONE
    // =========================

    public String extractPhone(String text) {

        Pattern pattern = Pattern.compile(
                "\\b\\d{10}\\b"
        );

        Matcher matcher =
                pattern.matcher(text);

        if (matcher.find()) {

            return matcher.group();
        }

        return "Not Found";
    }

    // =========================
    // EXTRACT SKILLS
    // =========================

    public List<String> extractSkills(
            String text
    ) {

        List<String> foundSkills =
                new ArrayList<>();

        String lowerText =
                text.toLowerCase();

        for (String skill : skillsDatabase) {

            if (
                    lowerText.contains(skill)
            ) {

                foundSkills.add(skill);
            }
        }

        return foundSkills;
    }

    // =========================
    // EXTRACT EXPERIENCE
    // =========================

    public int extractExperience(
            String text
    ) {

        Pattern pattern = Pattern.compile(
                "(\\d+)\\s+years"
        );

        Matcher matcher =
                pattern.matcher(
                        text.toLowerCase()
                );

        if (matcher.find()) {

            return Integer.parseInt(
                    matcher.group(1)
            );
        }

        return 0;
    }

    // =========================
    // EXTRACT NAME
    // =========================

    public String extractName(String text) {

        String[] lines =
                text.split("\\r?\\n");

        for (String line : lines) {

            line = line.trim();

            if (
                    line.length() > 2
                            &&
                            line.length() < 40
                            &&
                            line.matches(
                                    "^[A-Za-z ]+$"
                            )
            ) {

                return line;
            }
        }

        return "Not Found";
    }
}
package com.resume.resume_screening_system.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;

import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ResumeParserService {

    // =========================
    // EXTRACT TEXT
    // =========================

    public String extractText(File file)
            throws IOException {

        String fileName =
                file.getName()
                        .toLowerCase();
        if (fileName.endsWith(".pdf")) {

            PDDocument document =
                    PDDocument.load(file);

            PDFTextStripper stripper =
                    new PDFTextStripper();

            String text =
                    stripper.getText(document);

            document.close();

            return text;
        }
        else if (
                fileName.endsWith(".docx")
        ) {

            FileInputStream fis =
                    new FileInputStream(file);

            XWPFDocument document =
                    new XWPFDocument(fis);

            XWPFWordExtractor extractor =
                    new XWPFWordExtractor(
                            document
                    );

            String text =
                    extractor.getText();

            extractor.close();

            document.close();

            fis.close();

            return text;
        }

        return "";
    }

    // =========================
    // PARSE RESUME
    // =========================

    public Map<String, Object> parseResume(
            File file
    ) throws IOException {

        String text =
                extractText(file);

        Map<String, Object> data =
                new HashMap<>();

        // =========================
        // NAME
        // =========================

        String[] lines =
                text.split("\\r?\\n");

        String name = "";

        for (String line : lines) {

            line = line.trim();

            if (
                    !line.isEmpty()
                            &&
                            line.length() > 3
                            &&
                            line.matches(
                                    "^[A-Za-z ]+$"
                            )
            ) {

                name = line;

                break;
            }
        }

        // =========================
        // EMAIL
        // =========================

        String email = "";

        Pattern emailPattern =
                Pattern.compile(
                        "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}"
                );

        Matcher emailMatcher =
                emailPattern.matcher(text);

        if (emailMatcher.find()) {

            email =
                    emailMatcher.group();
        }

        String phone = "";

        Pattern phonePattern =
                Pattern.compile(
                        "(\\+91[- ]?)?[6-9]\\d{9}"
                );

        Matcher phoneMatcher =
                phonePattern.matcher(text);

        if (phoneMatcher.find()) {

            phone =
                    phoneMatcher.group();
        }

        // =========================
        // EXPERIENCE
        // =========================

        Double experience = 0.0;

        Pattern expPattern =
                Pattern.compile(
                        "(\\d+(\\.\\d+)?)\\s*(years|year)"
                );

        Matcher expMatcher =
                expPattern.matcher(
                        text.toLowerCase()
                );

        if (expMatcher.find()) {

            experience =
                    Double.parseDouble(
                            expMatcher.group(1)
                    );
        }
        List<String> skillList =
                Arrays.asList(
                        "java",
                        "spring",
                        "spring boot",
                        "react",
                        "mysql",
                        "postgresql",
                        "python",
                        "html",
                        "css",
                        "javascript",
                        "docker",
                        "kubernetes",
                        "aws",
                        "machine learning",
                        "deep learning",
                        "tensorflow",
                        "rest api"
                );
        List<String> foundSkills =
                new ArrayList<>();

        String lowerText =
                text.toLowerCase();

        for (String skill : skillList) {

            if (
                    lowerText.contains(skill)
            ) {

                foundSkills.add(skill);
            }
        }

        // =========================
        // STORE DATA
        // =========================

        data.put("name", name);

        data.put("email", email);

        data.put("phone", phone);

        data.put("experience",
                experience);

        data.put(
                "skills",
                String.join(
                        ", ",
                        foundSkills
                )
        );

        return data;
    }
}
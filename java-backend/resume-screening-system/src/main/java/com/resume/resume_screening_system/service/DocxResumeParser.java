package com.resume.resume_screening_system.service;

import org.apache.poi.xwpf.usermodel.XWPFDocument;

import org.apache.poi.xwpf.extractor.XWPFWordExtractor;

import org.springframework.stereotype.Service;

import java.io.FileInputStream;

@Service
public class DocxResumeParser {

    // =========================
    // EXTRACT DOCX TEXT
    // =========================

    public String extractText(String filePath)
            throws Exception {

        FileInputStream fis =
                new FileInputStream(filePath);

        XWPFDocument document =
                new XWPFDocument(fis);

        XWPFWordExtractor extractor =
                new XWPFWordExtractor(document);

        String text = extractor.getText();

        extractor.close();

        document.close();

        fis.close();

        return text;
    }
}
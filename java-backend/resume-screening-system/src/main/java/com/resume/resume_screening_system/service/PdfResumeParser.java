package com.resume.resume_screening_system.service;

import org.apache.pdfbox.pdmodel.PDDocument;

import org.apache.pdfbox.text.PDFTextStripper;

import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class PdfResumeParser {

    // =========================
    // EXTRACT PDF TEXT
    // =========================

    public String extractText(String filePath)
            throws Exception {

        File file = new File(filePath);

        PDDocument document =
                PDDocument.load(file);

        PDFTextStripper stripper =
                new PDFTextStripper();

        String text =
                stripper.getText(document);

        document.close();

        return text;
    }
}
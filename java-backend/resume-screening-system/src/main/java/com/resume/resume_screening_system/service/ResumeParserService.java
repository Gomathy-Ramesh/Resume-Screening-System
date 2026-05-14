package com.resume.resume_screening_system.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

@Service
public class ResumeParserService {

    public String extractText(String filePath) throws IOException {

        File file = new File(filePath);

        if (!file.exists()) {
            throw new RuntimeException("File not found: " + filePath);
        }

        // ✅ Use try-with-resources (auto close)
        try (PDDocument document = PDDocument.load(file)) {

            PDFTextStripper pdfStripper = new PDFTextStripper();

            return pdfStripper.getText(document);
        }
    }
}
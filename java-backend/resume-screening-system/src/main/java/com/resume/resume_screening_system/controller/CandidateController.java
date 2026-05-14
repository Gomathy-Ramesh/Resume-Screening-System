package com.resume.resume_screening_system.controller;

import com.resume.resume_screening_system.entity.Candidate;
import com.resume.resume_screening_system.repository.CandidateRepository;
import com.resume.resume_screening_system.service.EmailService;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@RestController
@RequestMapping("/candidates")
@CrossOrigin(origins = "*")
public class CandidateController {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private EmailService emailService;

    // ✅ GET ALL
    @GetMapping
    public List<Candidate> getAllCandidates() {
        return candidateRepository.findAll();
    }

    // ✅ GET BY ID
    @GetMapping("/{id}")
    public Candidate getCandidateById(@PathVariable Long id) {
        return candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));
    }

    // ✅ UPLOAD
    @PostMapping("/upload")
    public Candidate uploadCandidate(
            @RequestParam String name,
            @RequestParam String email,
            @RequestParam String phoneNumber,
            @RequestParam Double experience,
            @RequestParam String education,
            @RequestParam MultipartFile resume
    ) throws IOException {

        // ✅ CREATE UPLOADS FOLDER
        String uploadDir = System.getProperty("user.dir") + File.separator + "uploads";

        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // ✅ FILE NAME
        String fileName = resume.getOriginalFilename();

        // ✅ SAVE FILE
        Path filePath = uploadPath.resolve(fileName);

        Files.copy(
                resume.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        // ✅ READ PDF
        PDDocument document = PDDocument.load(filePath.toFile());

        PDFTextStripper pdfStripper = new PDFTextStripper();

        String resumeText = pdfStripper.getText(document);

        document.close();

        String lowerText = resumeText.toLowerCase();

        // ✅ SKILLS
        StringBuilder skills = new StringBuilder();

        if (lowerText.contains("java")) skills.append("Java, ");
        if (lowerText.contains("spring boot")) skills.append("Spring Boot, ");
        if (lowerText.contains("mysql")) skills.append("MySQL, ");
        if (lowerText.contains("python")) skills.append("Python, ");
        if (lowerText.contains("html")) skills.append("HTML, ");

        // ✅ SCORE
        double score = 0;

        if (lowerText.contains("java")) score += 20;
        if (lowerText.contains("spring boot")) score += 20;
        if (lowerText.contains("mysql")) score += 20;
        if (lowerText.contains("python")) score += 20;
        if (lowerText.contains("html")) score += 20;

        // EXPERIENCE SCORE
        if (experience >= 5) {
            score += 30;
        } else if (experience >= 3) {
            score += 20;
        } else if (experience >= 1) {
            score += 10;
        }

        // EDUCATION SCORE
        String educationLower = education.toLowerCase();

        if (educationLower.contains("mca") ||
                educationLower.contains("msc")) {

            score += 15;

        } else if (educationLower.contains("be") ||
                educationLower.contains("btech")) {

            score += 10;
        }

        // ✅ RANKING
        String rank;

        if (score >= 90) {
            rank = "Excellent";
        } else if (score >= 70) {
            rank = "Good";
        } else if (score >= 50) {
            rank = "Average";
        } else {
            rank = "Low";
        }

        // ✅ SAVE TO DATABASE
        Candidate candidate = new Candidate();

        candidate.setName(name);
        candidate.setEmail(email);
        candidate.setPhoneNumber(phoneNumber);
        candidate.setExperience(experience);
        candidate.setEducation(education);
        candidate.setScore(score);
        candidate.setSkills(skills.toString());
        candidate.setRanking(rank);

        // SAVE FILE PATH
        candidate.setResumeFilePath(filePath.toString());

        Candidate savedCandidate = candidateRepository.save(candidate);

        // ✅ SEND EMAIL
        try {
            emailService.sendEmail(email, name, score, rank);
        } catch (Exception e) {
            System.out.println("Email sending failed: " + e.getMessage());
        }

        return savedCandidate;
    }

    // ✅ UPDATE
    @PutMapping("/{id}")
    public Candidate updateCandidate(
            @PathVariable Long id,
            @RequestBody Candidate updatedCandidate
    ) {

        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        candidate.setName(updatedCandidate.getName());
        candidate.setEmail(updatedCandidate.getEmail());
        candidate.setPhoneNumber(updatedCandidate.getPhoneNumber());
        candidate.setExperience(updatedCandidate.getExperience());
        candidate.setEducation(updatedCandidate.getEducation());
        candidate.setScore(updatedCandidate.getScore());
        candidate.setSkills(updatedCandidate.getSkills());
        candidate.setRanking(updatedCandidate.getRanking());

        return candidateRepository.save(candidate);
    }

    // ✅ DELETE
    @DeleteMapping("/{id}")
    public String deleteCandidate(@PathVariable Long id) {

        candidateRepository.deleteById(id);

        return "Candidate deleted successfully";
    }

    // ✅ DOWNLOAD RESUME
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadResume(@PathVariable Long id)
            throws IOException {

        Candidate candidate = candidateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Candidate not found"));

        Path path = Paths.get(candidate.getResumeFilePath());

        Resource resource;

        try {
            resource = new UrlResource(path.toUri());

        } catch (MalformedURLException e) {

            throw new RuntimeException("File not found");
        }

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + path.getFileName().toString() + "\""
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
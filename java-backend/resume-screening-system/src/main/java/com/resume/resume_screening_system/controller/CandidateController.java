package com.resume.resume_screening_system.controller;

import com.resume.resume_screening_system.dto.DashboardResponse;
import com.resume.resume_screening_system.dto.PythonResponse;

import com.resume.resume_screening_system.entity.Candidate;
import com.resume.resume_screening_system.entity.Job;

import com.resume.resume_screening_system.repository.CandidateRepository;
import com.resume.resume_screening_system.repository.JobRepository;

import com.resume.resume_screening_system.service.EmailService;
import com.resume.resume_screening_system.service.PythonNlpService;
import com.resume.resume_screening_system.service.ResumeParserService;


import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpHeaders;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;

import java.time.LocalDateTime;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/candidates")
@CrossOrigin("*")
public class CandidateController {

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PythonNlpService pythonNLPService;

    @Autowired
    private ResumeParserService resumeParserService;

    // =========================
    // GET ALL CANDIDATES
    // =========================

    @GetMapping
    public List<Candidate> getAllCandidates() {

        List<Candidate> candidates =
                candidateRepository.findAll();

        candidates.sort(
                Comparator.comparing(
                        Candidate::getScore,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );

        return candidates;
    }
    // =========================
// TEST ENDPOINT
// =========================

@GetMapping("/test")
public String test() {

    return "WORKING";
}

    // =========================
    // GET CANDIDATE BY ID
    // =========================

    @GetMapping("/{id}")
    public Candidate getCandidateById(
            @PathVariable Long id
    ) {

        return candidateRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Candidate not found"
                        ));
    }

    // =========================
    // UPLOAD CANDIDATE
    // =========================

    @PostMapping("/upload")
    public Candidate uploadCandidate(

            @RequestParam("name") String name,

            @RequestParam("email") String email,

            @RequestParam("phone") String phone,

            @RequestParam("experience") Double experience,

            @RequestParam("education") String education,

            @RequestParam("appliedPosition") String appliedPosition,

            @RequestParam("jobDescription") String jobDescription,

            @RequestParam("resume") MultipartFile file

    ) throws Exception {

        // =========================
        // FILE VALIDATION
        // =========================

        String originalFileName =
                file.getOriginalFilename();

        if (originalFileName == null) {

            throw new RuntimeException(
                    "Invalid file"
            );
        }

        String lowerFileName =
                originalFileName.toLowerCase();

        if (
                !lowerFileName.endsWith(".pdf")
                        &&
                        !lowerFileName.endsWith(".docx")
        ) {

            throw new RuntimeException(
                    "Only PDF and DOCX files are allowed"
            );
        }

        // =========================
        // CREATE UPLOAD DIRECTORY
        // =========================

        String uploadDir =
                System.getProperty("user.dir")
                        + File.separator
                        + "uploads";

        File directory =
                new File(uploadDir);

        if (!directory.exists()) {

            directory.mkdirs();
        }

        // =========================
        // SAVE FILE
        // =========================

        String fileName =
                System.currentTimeMillis()
                        + "_"
                        + originalFileName;

        String filePath =
                uploadDir
                        + File.separator
                        + fileName;

        File destinationFile =
        new File(filePath);

file.transferTo(destinationFile);

        // =========================
        // RESUME PARSING
        // =========================

        Map<String, Object> parsedData =
                resumeParserService.parseResume(
                        destinationFile
                );

        // =========================
        // AUTO EXTRACTED VALUES
        // =========================

        String parsedName =
                (String) parsedData.get("name");

        String parsedEmail =
                (String) parsedData.get("email");

        String parsedPhone =
                (String) parsedData.get("phone");

        Double parsedExperience =
                (Double) parsedData.get("experience");

        String parsedSkills =
                (String) parsedData.get("skills");

        // =========================
        // FIND JOB
        // =========================

        Job selectedJob =
                jobRepository.findAll()
                        .stream()
                        .filter(job ->
                                job.getJobTitle()
                                        .equalsIgnoreCase(
                                                appliedPosition
                                        )
                        )
                        .findFirst()
                        .orElse(null);

        Double thresholdPercentage = 60.0;

        if (
                selectedJob != null
                        &&
                        selectedJob.getThresholdPercentage()
                                != null
        ) {

            thresholdPercentage =
                    selectedJob
                            .getThresholdPercentage();
        }

        // =========================
        // PYTHON NLP ANALYSIS
        // =========================

        PythonResponse pythonResponse =
                pythonNLPService.analyzeResume(
                        destinationFile,
                        jobDescription,
                        appliedPosition
                );

        // =========================
        // NULL CHECK
        // =========================

        if (pythonResponse == null) {

            throw new RuntimeException(
                    "Python NLP service failed"
            );
        }

        // =========================
        // SCORE
        // =========================

        Double calculatedScore =
                pythonResponse.getScore();

        if (calculatedScore == null) {

            calculatedScore = 0.0;
        }

        // =========================
        // SKILLS
        // =========================

        String finalSkills = "";

        if (pythonResponse.getSkills() != null) {

            finalSkills =
                    String.join(
                            ", ",
                            pythonResponse.getSkills()
                    );
        }

        if (
                finalSkills == null
                        ||
                        finalSkills.isEmpty()
        ) {

            finalSkills = parsedSkills;
        }

        // =========================
        // RANK
        // =========================

        String rank =
                pythonResponse.getRank();

        if (rank == null) {

            rank = "Low";
        }

        // =========================
        // STATUS FLOW
        // =========================

        String status;

        if (
                calculatedScore
                        >= thresholdPercentage
        ) {

            status = "Pending";

        } else {

            status = "Rejected";
        }

        // =========================
        // AUTO DELETE REJECTED
        // =========================

        if (
                status.equalsIgnoreCase(
                        "Rejected"
                )
        ) {

            if (destinationFile.exists()) {

                destinationFile.delete();
            }

            System.out.println(
                    "Rejected Resume Deleted"
            );

            return null;
        }

        // =========================
        // CREATE CANDIDATE
        // =========================

        Candidate candidate =
                new Candidate();

        // NAME

        if (
                parsedName != null
                        &&
                        !parsedName.isEmpty()
        ) {

            candidate.setName(parsedName);

        } else {

            candidate.setName(name);
        }

        // EMAIL

        if (
                parsedEmail != null
                        &&
                        !parsedEmail.isEmpty()
        ) {

            candidate.setEmail(parsedEmail);

        } else {

            candidate.setEmail(email);
        }

        // PHONE

        if (
                parsedPhone != null
                        &&
                        !parsedPhone.isEmpty()
        ) {

            candidate.setPhone(parsedPhone);

        } else {

            candidate.setPhone(phone);
        }

        // EXPERIENCE

        if (
                parsedExperience != null
                        &&
                        parsedExperience > 0
        ) {

            candidate.setExperience(
                    parsedExperience
            );

        } else if (
                pythonResponse.getExperience()
                        != null
        ) {

            candidate.setExperience(

                    pythonResponse
                            .getExperience()
                            .doubleValue()
            );

        } else {

            candidate.setExperience(
                    experience
            );
        }

        // =========================
        // SAVE DETAILS
        // =========================

        candidate.setEducation(
                education
        );

        candidate.setAppliedPosition(
                appliedPosition
        );

        candidate.setJobDescription(
                jobDescription
        );

        candidate.setThresholdPercentage(
                thresholdPercentage
        );

        candidate.setScore(
                calculatedScore
        );

        candidate.setSkills(
                finalSkills
        );

        candidate.setRank(
                rank
        );

        candidate.setStatus(
                status
        );

        candidate.setCurrentStage(
                "Pending"
        );

        candidate.setShortlisted(
                false
        );

        candidate.setSelected(
                false
        );

        candidate.setResumeFilePath(
                filePath
        );

        candidate.setAppliedDate(
                LocalDateTime.now()
        );

        candidate.setExpiryDate(
                LocalDateTime.now()
                        .plusYears(1)
        );

        if (selectedJob != null) {

            candidate.setJob(
                    selectedJob
            );
        }

        // =========================
        // SAVE DATABASE
        // =========================

        return candidateRepository.save(
                candidate
        );
    }

    // =========================
    // UPDATE STATUS
    // =========================

    @PutMapping("/status/{id}")
    public Candidate updateCandidateStatus(

            @PathVariable Long id,

            @RequestParam String status

    ) {

        Candidate candidate =
                candidateRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                ));

        candidate.setStatus(status);

        return candidateRepository.save(
                candidate
        );
    }

    // =========================
    // UPDATE CANDIDATE
    // =========================

    @PutMapping("/{id}")
    public Candidate updateCandidate(

            @PathVariable Long id,

            @RequestBody Candidate updatedCandidate

    ) {

        Candidate candidate =
                candidateRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                ));

        candidate.setName(
                updatedCandidate.getName()
        );

        candidate.setEmail(
                updatedCandidate.getEmail()
        );

        candidate.setPhone(
                updatedCandidate.getPhone()
        );

        candidate.setExperience(
                updatedCandidate.getExperience()
        );

        candidate.setEducation(
                updatedCandidate.getEducation()
        );

        candidate.setAppliedPosition(
                updatedCandidate.getAppliedPosition()
        );

        candidate.setJobDescription(
                updatedCandidate.getJobDescription()
        );

        candidate.setThresholdPercentage(
                updatedCandidate.getThresholdPercentage()
        );

        candidate.setScore(
                updatedCandidate.getScore()
        );

        candidate.setSkills(
                updatedCandidate.getSkills()
        );

        candidate.setRank(
                updatedCandidate.getRank()
        );

        candidate.setStatus(
                updatedCandidate.getStatus()
        );

        candidate.setResumeUrl(
                updatedCandidate.getResumeUrl()
        );

        return candidateRepository.save(
                candidate
        );
    }

    // =========================
    // DOWNLOAD RESUME
    // =========================


@GetMapping("/download/{id}")
public ResponseEntity<Void> downloadResume(
        @PathVariable Long id
) {

    Candidate candidate =
            candidateRepository.findById(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Candidate not found"
                            ));

    return ResponseEntity
            .status(302)
            .header(
                    HttpHeaders.LOCATION,
                    candidate.getResumeUrl()
            )
            .build();
}
    // =========================
    // GET RANKING
    // =========================

    @GetMapping("/ranking")
    public List<Candidate> getRankedCandidates() {

        List<Candidate> candidates =
                candidateRepository.findAll();

        candidates.sort(

                Comparator.comparing(
                        Candidate::getScore,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );

        return candidates;
    }

    // =========================
    // SHORTLIST CANDIDATE
    // =========================

    @PutMapping("/shortlist/{id}")
public Candidate shortlistCandidate(
        @PathVariable Long id
) {

    System.out.println("SHORTLIST API HIT");

    Candidate candidate =
            candidateRepository.findById(id)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Candidate not found"
                            ));

    candidate.setCurrentStage("Shortlisted");
    candidate.setStatus("Shortlisted");
    candidate.setShortlisted(true);

    Candidate savedCandidate =
            candidateRepository.save(candidate);

    System.out.println("Candidate Saved");

    new Thread(() -> {

    try {

        emailService.sendEmail(
                candidate.getEmail(),
                candidate.getName(),
                candidate.getAppliedPosition(),
                "Shortlisted"
        );

        System.out.println("Email Sent");

    } catch (Exception e) {

        e.printStackTrace();
    }

}).start();

    return savedCandidate;
}
    // =========================
    // SELECT CANDIDATE
    // =========================

    @PutMapping("/select/{id}")
    public Candidate selectCandidate(

            @PathVariable Long id

    ) {

        Candidate candidate =
                candidateRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                ));

        candidate.setCurrentStage(
                "Selected"
        );

        candidate.setStatus(
                "Selected"
        );

        candidate.setSelected(
                true
        );

        // =========================
        // SEND SELECTION MAIL
        // =========================

       new Thread(() -> {

    try {

        emailService.sendEmail(

                candidate.getEmail(),

                candidate.getName(),

                candidate.getAppliedPosition(),

                "Selected"
        );

        emailService.sendSelectionNotificationToHR(

                candidate.getName(),

                candidate.getEmail(),

                candidate.getAppliedPosition(),

                candidate.getScore()
        );

        System.out.println("Selection Email Sent");

    } catch (Exception e) {

        System.out.println("Selection Email Error");

        e.printStackTrace();
    }

}).start();

        return candidateRepository.save(
                candidate
        );
    }

    // =========================
    // DASHBOARD ANALYTICS
    // =========================

    @GetMapping("/dashboard")
    public DashboardResponse getDashboardAnalytics() {

        List<Candidate> candidates =
                candidateRepository.findAll();

        DashboardResponse response =
                new DashboardResponse();

        response.setTotalCandidates(
                (long) candidates.size()
        );

        long shortlisted =
                candidates.stream()

                        .filter(candidate ->
                                candidate.getStatus()
                                        != null
                                        &&
                                        candidate.getStatus()
                                                .equalsIgnoreCase(
                                                        "Shortlisted"
                                                )
                        )

                        .count();

        response.setAcceptedCandidates(
                shortlisted
        );

        long selected =
                candidates.stream()

                        .filter(candidate ->
                                candidate.getStatus()
                                        != null
                                        &&
                                        candidate.getStatus()
                                                .equalsIgnoreCase(
                                                        "Selected"
                                                )
                        )

                        .count();

        response.setRejectedCandidates(
                selected
        );

        double averageScore =
                candidates.stream()

                        .mapToDouble(candidate ->

                                candidate.getScore() != null
                                        ? candidate.getScore()
                                        : 0.0
                        )

                        .average()

                        .orElse(0);

        response.setAverageScore(

                Math.round(
                        averageScore * 100.0
                ) / 100.0
        );

        double highestScore =
                candidates.stream()

                        .mapToDouble(candidate ->

                                candidate.getScore() != null
                                        ? candidate.getScore()
                                        : 0.0
                        )

                        .max()

                        .orElse(0);

        response.setHighestScore(
                highestScore
        );

        return response;
    }
}
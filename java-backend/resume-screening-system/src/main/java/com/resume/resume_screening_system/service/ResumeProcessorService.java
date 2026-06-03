package com.resume.resume_screening_system.service;

import com.resume.resume_screening_system.dto.PythonResponse;

import com.resume.resume_screening_system.entity.Candidate;
import com.resume.resume_screening_system.entity.Job;

import com.resume.resume_screening_system.repository.CandidateRepository;
import com.resume.resume_screening_system.repository.JobRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResumeProcessorService {

    @Autowired
    private PythonNlpService pythonNlpService;

    @Autowired
    private CandidateRepository candidateRepository;

    @Autowired
    private JobRepository jobRepository;

    // =========================
    // PROCESS RESUME
    // =========================

    public void processResume(

            File file,

            String appliedPositionFromEmail

    ) {

        try {

            System.out.println(
                    "Processing Resume: "
                            + file.getName()
            );

            // =========================
            // HYBRID ATS JOB FLOW
            // =========================

            List<Job> jobs;

            // =========================
            // CHECK APPLIED POSITION FIRST
            // =========================

            if (
                    appliedPositionFromEmail != null
                            &&
                            !appliedPositionFromEmail.isEmpty()
            ) {

                System.out.println(
                        "Checking Applied Position First: "
                                + appliedPositionFromEmail
                );

                jobs = jobRepository.findAll()
                        .stream()
                        .filter(job -> {

                            String dbJob =
                                    job.getJobTitle()
                                            .toLowerCase()
                                            .trim();

                            String emailJob =
                                    appliedPositionFromEmail
                                            .toLowerCase()
                                            .trim();

                            return emailJob.contains(dbJob)
                                    || dbJob.contains(emailJob);
                        })
                        .toList();

            } else {

                jobs = jobRepository.findAll();
            }

            // =========================
            // FALLBACK
            // =========================

            if (jobs.isEmpty()) {

                jobs = jobRepository.findAll();
            }

            // =========================
            // NO JOBS
            // =========================

            if (jobs.isEmpty()) {

                System.out.println(
                        "No Jobs Found In Database"
                );

                return;
            }

            // =========================
            // BEST MATCH VARIABLES
            // =========================

            PythonResponse bestResult = null;

            Job matchedJob = null;

            Double bestFinalScore = 0.0;

            Double bestSkillPercentage = 0.0;

            Integer bestMatchedSkills = 0;

            // =========================
            // CHECK JOBS
            // =========================

            for (Job job : jobs) {

                System.out.println(
                        "Checking Job: "
                                + job.getJobTitle()
                );

                PythonResponse result =

                        pythonNlpService.analyzeResume(

                                file,

                                job.getJobDescription(),

                                job.getJobTitle()
                        );

                // DEBUG

                System.out.println(
                        "PYTHON RESULT: "
                                + result
                );

                // =========================
                // NULL CHECK
                // =========================

                if (result == null) {

                    continue;
                }

                // =========================
                // GET VALUES
                // =========================

                Double currentScore =
                        result.getScore();

                Double currentSkillPercentage =
                        result.getSkill_match_percentage();

                Integer currentMatchedSkills =
                        result.getMatchedSkillsCount();

                // =========================
                // NULL SAFETY
                // =========================

                if (currentScore == null) {

                    currentScore = 0.0;
                }

                if (currentSkillPercentage == null) {

                    currentSkillPercentage = 0.0;
                }

                if (currentMatchedSkills == null) {

                    currentMatchedSkills = 0;
                }

                System.out.println(
                        "Job: "
                                + job.getJobTitle()
                                + " | Skill %: "
                                + currentSkillPercentage
                                + " | Matched Skills: "
                                + currentMatchedSkills
                                + " | Score: "
                                + currentScore
                );

                // =========================
                // ATS MATCHING LOGIC
                // =========================

                boolean isBetterMatch = false;

                // FIRST JOB AUTO SELECT

                if (matchedJob == null) {

                    isBetterMatch = true;
                }

                // PRIORITY 1:
                // MORE MATCHED SKILLS

                else if (
                        currentMatchedSkills >
                                bestMatchedSkills
                ) {

                    isBetterMatch = true;
                }

                // PRIORITY 2:
                // BETTER SKILL %

                else if (
                        currentMatchedSkills.equals(
                                bestMatchedSkills
                        )
                                &&
                                currentSkillPercentage >
                                        bestSkillPercentage
                ) {

                    isBetterMatch = true;
                }

                // PRIORITY 3:
                // BETTER SCORE

                else if (
                        currentMatchedSkills.equals(
                                bestMatchedSkills
                        )
                                &&
                                currentSkillPercentage.equals(
                                        bestSkillPercentage
                                )
                                &&
                                currentScore >
                                        bestFinalScore
                ) {

                    isBetterMatch = true;
                }

                // =========================
                // SAVE BEST MATCH
                // =========================

                if (isBetterMatch) {

                    bestMatchedSkills =
                            currentMatchedSkills;

                    bestSkillPercentage =
                            currentSkillPercentage;

                    bestFinalScore =
                            currentScore;

                    bestResult =
                            result;

                    matchedJob =
                            job;
                }
            }

            // =========================
            // HYBRID ATS FALLBACK
            // =========================

            if (
                    (
                            matchedJob == null
                                    ||
                                    bestFinalScore < 20
                    )
                            &&
                            appliedPositionFromEmail != null
            ) {

                System.out.println(
                        "Low Score For Applied Job"
                );

                System.out.println(
                        "Checking All Jobs Again..."
                );

                // RESET

                bestResult = null;

                matchedJob = null;

                bestFinalScore = 0.0;

                bestSkillPercentage = 0.0;

                bestMatchedSkills = 0;

                // =========================
                // CHECK ALL JOBS
                // =========================

                List<Job> allJobs =
                        jobRepository.findAll();

                for (Job job : allJobs) {

                    System.out.println(
                            "Fallback Checking Job: "
                                    + job.getJobTitle()
                    );

                    PythonResponse result =

                            pythonNlpService.analyzeResume(

                                    file,

                                    job.getJobDescription(),

                                    job.getJobTitle()
                            );

                    System.out.println(
                            "PYTHON RESULT: "
                                    + result
                    );

                    if (result == null) {

                        continue;
                    }

                    Double currentScore =
                            result.getScore();

                    if (currentScore == null) {

                        currentScore = 0.0;
                    }

                    Integer currentMatchedSkills =
                            result.getMatchedSkillsCount();

                    if (currentMatchedSkills == null) {

                        currentMatchedSkills = 0;
                    }

                    Double currentSkillPercentage =
                            result.getSkill_match_percentage();

                    if (currentSkillPercentage == null) {

                        currentSkillPercentage = 0.0;
                    }

                    boolean betterMatch = false;

                    // FIRST JOB AUTO SELECT

                    if (matchedJob == null) {

                        betterMatch = true;
                    }

                    else if (
                            currentMatchedSkills >
                                    bestMatchedSkills
                    ) {

                        betterMatch = true;
                    }

                    else if (
                            currentMatchedSkills.equals(
                                    bestMatchedSkills
                            )
                                    &&
                                    currentSkillPercentage >
                                            bestSkillPercentage
                    ) {

                        betterMatch = true;
                    }

                    else if (
                            currentMatchedSkills.equals(
                                    bestMatchedSkills
                            )
                                    &&
                                    currentSkillPercentage.equals(
                                            bestSkillPercentage
                                    )
                                    &&
                                    currentScore >
                                            bestFinalScore
                    ) {

                        betterMatch = true;
                    }

                    if (betterMatch) {

                        bestMatchedSkills =
                                currentMatchedSkills;

                        bestSkillPercentage =
                                currentSkillPercentage;

                        bestFinalScore =
                                currentScore;

                        bestResult =
                                result;

                        matchedJob =
                                job;
                    }
                }
            }

            // =========================
            // FINAL CHECK
            // =========================

            if (
                    matchedJob == null
                            ||
                            bestResult == null
            ) {

                System.out.println(
                        "No Matching Job Found"
                );

                return;
            }

            // =========================
            // JOB DETAILS
            // =========================

            String finalAppliedPosition =
                    matchedJob.getJobTitle();

            String jobDescription =
                    matchedJob.getJobDescription();

            Double thresholdPercentage =
                    matchedJob.getThresholdPercentage();

            if (thresholdPercentage == null) {

                thresholdPercentage = 60.0;
            }

            System.out.println(
                    "================================="
            );

            System.out.println(
                    "FINAL SELECTED JOB: "
                            + finalAppliedPosition
            );

            System.out.println(
                    "Matched Skills: "
                            + bestMatchedSkills
            );

            System.out.println(
                    "Skill Percentage: "
                            + bestSkillPercentage
            );

            System.out.println(
                    "Final Score: "
                            + bestFinalScore
            );

            System.out.println(
                    "================================="
            );

            // =========================
            // SCORE
            // =========================

            double score = bestFinalScore;

            // =========================
            // STATUS
            // =========================

            String status;

            if (
                    score >= thresholdPercentage
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

                if (file.exists()) {

                    boolean deleted =
                            file.delete();

                    System.out.println(
                            "Rejected Resume Deleted: "
                                    + deleted
                    );
                }

                return;
            }

            // =========================
            // CREATE CANDIDATE
            // =========================

            Candidate candidate =
                    new Candidate();

            candidate.setName(
                    bestResult.getName()
            );

            candidate.setEmail(
                    bestResult.getEmail()
            );

            candidate.setPhone(
                    bestResult.getPhone()
            );

            candidate.setEducation(
                    bestResult.getEducation()
            );

            if (
                    bestResult.getExperience()
                            != null
            ) {

                candidate.setExperience(

                        bestResult.getExperience()
                                .doubleValue()
                );

            } else {

                candidate.setExperience(
                        0.0
                );
            }

            candidate.setJob(
                    matchedJob
            );

            candidate.setAppliedPosition(
                    finalAppliedPosition
            );

            candidate.setJobDescription(
                    jobDescription
            );

            candidate.setThresholdPercentage(
                    thresholdPercentage
            );

            candidate.setScore(
                    score
            );

            candidate.setRank(
                    bestResult.getRank()
            );

            if (
                    bestResult.getSkills()
                            != null
            ) {

                candidate.setSkills(

                        String.join(

                                ", ",

                                bestResult.getSkills()
                        )
                );

            } else {

                candidate.setSkills("");
            }

            candidate.setStatus(
                    status
            );

            candidate.setCurrentStage(
                    status
            );

            candidate.setShortlisted(
                    false
            );

            candidate.setSelected(
                    false
            );

            candidate.setAppliedDate(
                    LocalDateTime.now()
            );

            candidate.setExpiryDate(

                    LocalDateTime.now()
                            .plusYears(1)
            );

            candidate.setResumeFilePath(
                    file.getAbsolutePath()
            );

            candidate.setResumeUrl(
                    bestResult.getResumeUrl()
            );

            // =========================
            // SAVE DATABASE
            // =========================

            candidateRepository.save(
                    candidate
            );

            System.out.println(
                    "Candidate Saved Successfully"
            );

        } catch (Exception e) {

            e.printStackTrace();
        }
    }
}
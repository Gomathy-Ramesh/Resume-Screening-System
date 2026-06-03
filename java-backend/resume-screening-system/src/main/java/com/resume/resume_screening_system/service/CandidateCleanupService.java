package com.resume.resume_screening_system.service;

import com.resume.resume_screening_system.entity.Candidate;
import com.resume.resume_screening_system.repository.CandidateRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CandidateCleanupService {

    @Autowired
    private CandidateRepository candidateRepository;

    // =========================
    // DELETE EXPIRED CANDIDATES
    // =========================

    @Scheduled(cron = "0 0 0 * * ?")
    public void deleteExpiredCandidates() {

        List<Candidate> candidates =
                candidateRepository.findAll();

        for (Candidate candidate : candidates) {

            if (
                    candidate.getExpiryDate() != null
                            &&
                            candidate.getExpiryDate()
                                    .isBefore(
                                            LocalDateTime.now()
                                    )
            ) {

                // DELETE RESUME FILE

                if (
                        candidate.getResumeFilePath()
                                != null
                ) {

                    File file =
                            new File(
                                    candidate.getResumeFilePath()
                            );

                    if (file.exists()) {

                        file.delete();
                    }
                }

                // DELETE DATABASE RECORD

                candidateRepository.delete(
                        candidate
                );

                System.out.println(
                        "Expired Candidate Deleted"
                );
            }
        }
    }
}
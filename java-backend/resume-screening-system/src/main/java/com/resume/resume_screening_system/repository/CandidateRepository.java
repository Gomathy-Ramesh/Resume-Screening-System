package com.resume.resume_screening_system.repository;

import com.resume.resume_screening_system.entity.Candidate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateRepository
        extends JpaRepository<Candidate, Long> {

    // =========================
    // COUNT CANDIDATES
    // BY APPLIED POSITION
    // =========================

    Long countByAppliedPosition(
            String appliedPosition
    );

    // =========================
    // FIND CANDIDATE
    // BY NAME + POSITION
    // =========================

    Optional<Candidate> findByNameIgnoreCaseAndAppliedPositionIgnoreCase(
            String name,
            String appliedPosition
    );
}
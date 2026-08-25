package com.resume.resume_screening_system.repository;

import com.resume.resume_screening_system.entity.TechnicalAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TechnicalAssessmentRepository
        extends JpaRepository<TechnicalAssessment, Long> {

    Optional<TechnicalAssessment> findByCandidateIdAndJobId(
            Long candidateId,
            Long jobId
    );

    List<TechnicalAssessment> findByCandidateId(
            Long candidateId
    );

    List<TechnicalAssessment> findByJobId(
            Long jobId
    );
}
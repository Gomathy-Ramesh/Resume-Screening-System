package com.resume.resume_screening_system.repository;

import com.resume.resume_screening_system.entity.Interview;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository
        extends JpaRepository<Interview, Long> {

    // ======================================================
    // GET ALL INTERVIEWS
    // ======================================================

    List<Interview> findAllByOrderByInterviewDateDesc();


    // ======================================================
    // CHECK CANDIDATE INTERVIEW CONFLICT
    // ======================================================

    boolean existsByCandidateCandidateIdAndInterviewDate(
            Long candidateId,
            LocalDateTime interviewDate
    );


    // ======================================================
    // GET CANDIDATE INTERVIEW HISTORY
    // ======================================================

    List<Interview>
    findByCandidateCandidateIdOrderByInterviewDateDesc(
            Long candidateId
    );


    // ======================================================
    // GET BY STATUS
    // ======================================================

    List<Interview>
    findByStatusOrderByInterviewDateAsc(
            String status
    );


    // ======================================================
    // GET UPCOMING
    // ======================================================

    List<Interview>
    findByInterviewDateAfterOrderByInterviewDateAsc(
            LocalDateTime date
    );


    // ======================================================
    // GET LATEST COMPLETED INTERVIEW
    // ======================================================

    Optional<Interview>
    findFirstByCandidateCandidateIdAndStatusOrderByInterviewDateDesc(
            Long candidateId,
            String status
    );
}
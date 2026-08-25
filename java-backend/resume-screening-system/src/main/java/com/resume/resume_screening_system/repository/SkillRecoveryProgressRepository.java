package com.resume.resume_screening_system.repository;

import com.resume.resume_screening_system.entity.SkillRecoveryProgress;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillRecoveryProgressRepository
        extends JpaRepository<SkillRecoveryProgress, Long> {

    // =========================================================
    // FIND ONE TOPIC
    // =========================================================

    Optional<SkillRecoveryProgress>
    findByCandidateIdAndJobIdAndSkillAndTopic(
            Long candidateId,
            Long jobId,
            String skill,
            String topic
    );


    // =========================================================
    // FIND ALL PROGRESS
    // =========================================================

    List<SkillRecoveryProgress>
    findByCandidateIdAndJobId(
            Long candidateId,
            Long jobId
    );


    // =========================================================
    // FIND PROGRESS FOR ONE SKILL
    // =========================================================

    List<SkillRecoveryProgress>
    findByCandidateIdAndJobIdAndSkill(
            Long candidateId,
            Long jobId,
            String skill
    );


    // =========================================================
    // FIND ONLY COMPLETED TOPICS
    // =========================================================

    List<SkillRecoveryProgress>
    findByCandidateIdAndJobIdAndCompletedTrue(
            Long candidateId,
            Long jobId
    );
}
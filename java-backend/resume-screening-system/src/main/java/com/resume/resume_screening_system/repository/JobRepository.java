package com.resume.resume_screening_system.repository;

import com.resume.resume_screening_system.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
}
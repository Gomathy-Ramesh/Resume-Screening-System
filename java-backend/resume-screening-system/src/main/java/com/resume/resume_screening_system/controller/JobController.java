package com.resume.resume_screening_system.controller;

import com.resume.resume_screening_system.entity.Job;
import com.resume.resume_screening_system.repository.JobRepository;
import com.resume.resume_screening_system.repository.CandidateRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/jobs")
@CrossOrigin("*")
public class JobController {

    // =========================
    // REPOSITORIES
    // =========================

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private CandidateRepository candidateRepository;

    // =========================
    // CREATE JOB
    // =========================

    @PostMapping
    public Job createJob(
            @RequestBody Job job
    ) {

        return jobRepository.save(job);
    }

    // =========================
    // GET ALL JOBS
    // =========================

    @GetMapping
    public List<Job> getAllJobs() {

        List<Job> jobs =
                jobRepository.findAll();

        for (Job job : jobs) {

            Long count =
                    candidateRepository
                            .countByAppliedPosition(
                                    job.getJobTitle()
                            );

            job.setCandidateCount(count);
        }

        return jobs;
    }

    // =========================
    // GET JOB BY ID
    // =========================

    @GetMapping("/{id}")
    public Job getJobById(
            @PathVariable Long id
    ) {

        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job not found"
                        ));

        Long count =
                candidateRepository
                        .countByAppliedPosition(
                                job.getJobTitle()
                        );

        job.setCandidateCount(count);

        return job;
    }

    // =========================
    // UPDATE JOB
    // =========================

    @PutMapping("/{id}")
    public Job updateJob(

            @PathVariable Long id,

            @RequestBody Job updatedJob

    ) {

        Job existingJob = jobRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job not found"
                        ));

        existingJob.setJobTitle(
                updatedJob.getJobTitle()
        );

        existingJob.setJobDescription(
                updatedJob.getJobDescription()
        );

        existingJob.setCompanyName(
                updatedJob.getCompanyName()
        );

        existingJob.setThresholdPercentage(
                updatedJob.getThresholdPercentage()
        );

        existingJob.setStatus(
                updatedJob.getStatus()
        );

        return jobRepository.save(existingJob);
    }

    // =========================
    // UPDATE JOB STATUS
    // =========================

    @PutMapping("/{id}/status")
    public Job updateJobStatus(

            @PathVariable Long id,

            @RequestBody Job updatedJob

    ) {

        Job existingJob = jobRepository
                .findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job not found"
                        ));

        existingJob.setStatus(
                updatedJob.getStatus()
        );

        return jobRepository.save(
                existingJob
        );
    }

    // =========================
    // DELETE JOB
    // =========================

    @DeleteMapping("/{id}")
    public String deleteJob(
            @PathVariable Long id
    ) {

        Job job = jobRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job not found"
                        ));

        jobRepository.delete(job);

        return "Job Deleted Successfully";
    }
}
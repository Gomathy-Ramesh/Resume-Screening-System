
package com.resume.resume_screening_system.controller;

import com.resume.resume_screening_system.dto.DashboardResponse;
import com.resume.resume_screening_system.dto.PythonResponse;
import com.resume.resume_screening_system.dto.SkillGapResponse;
import com.resume.resume_screening_system.dto.SkillRecoveryResponse;
import com.resume.resume_screening_system.dto.SkillRecoveryItem;

import com.resume.resume_screening_system.entity.Candidate;
import com.resume.resume_screening_system.entity.Job;

import com.resume.resume_screening_system.repository.CandidateRepository;
import com.resume.resume_screening_system.repository.JobRepository;

import com.resume.resume_screening_system.entity.SkillRecoveryProgress;
import com.resume.resume_screening_system.repository.SkillRecoveryProgressRepository;

import com.resume.resume_screening_system.service.EmailService;
import com.resume.resume_screening_system.service.PythonNlpService;
import com.resume.resume_screening_system.service.ResumeParserService;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;



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

    @Autowired
    private SkillRecoveryProgressRepository skillRecoveryProgressRepository;


    // =========================================================
    // GET ALL CANDIDATES
    // =========================================================

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


    // =========================================================
    // TEST ENDPOINT
    // =========================================================

    @GetMapping("/test")
    public String test() {

        return "WORKING";
    }


    // =========================================================
    // GET CANDIDATE BY ID
    // =========================================================

    @GetMapping("/{id}")
    public Candidate getCandidateById(
            @PathVariable Long id
    ) {

        return candidateRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Candidate not found"
                        )
                );
    }


    // =========================================================
    // SKILL GAP ANALYSIS
    // =========================================================

@GetMapping("/{candidateId}/skill-gap/{jobId}")
public SkillGapResponse analyzeSkillGap(
        @PathVariable Long candidateId,
        @PathVariable Long jobId) {

    Candidate candidate = candidateRepository.findById(candidateId)
            .orElseThrow(() -> new RuntimeException("Candidate not found"));

    Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

    // =====================================================
    // ORIGINAL CANDIDATE SKILLS
    // =====================================================
    Set<String> candidateSkills = extractCandidateSkills(candidate.getSkills());

    // =====================================================
    // JOB DESCRIPTION
    // =====================================================
    String jobDescription = job.getJobDescription();

    if (jobDescription == null) {
        jobDescription = "";
    }

    String normalizedJobDescription =
            jobDescription.toLowerCase(Locale.ROOT);

    // =====================================================
    // KNOWN SKILLS
    // =====================================================
    Map<String, List<String>> skillAliases =
            createSkillAliases();

    // =====================================================
    // REQUIRED SKILLS
    // =====================================================
    Set<String> requiredSkills =
            new LinkedHashSet<>();

    for (Map.Entry<String, List<String>> entry :
            skillAliases.entrySet()) {

        String canonicalSkill = entry.getKey();
        List<String> aliases = entry.getValue();

        boolean found = false;

        for (String alias : aliases) {

            if (containsSkill(
                    normalizedJobDescription,
                    alias)) {

                found = true;
                break;
            }
        }

        if (found) {
            requiredSkills.add(canonicalSkill);
        }
    }

    requiredSkills =
            normalizeRequiredSkills(requiredSkills);

    // =====================================================
    // RESULT LISTS
    // =====================================================
    List<String> matchedSkills =
            new ArrayList<>();

    List<String> missingSkills =
            new ArrayList<>();

    List<String> completedSkills =
            new ArrayList<>();

    // =====================================================
    // CHECK EVERY REQUIRED SKILL
    // =====================================================
    for (String requiredSkill : requiredSkills) {

        boolean alreadyMatched = false;

        // -------------------------------------------------
        // CHECK ORIGINAL RESUME SKILLS
        // -------------------------------------------------
        for (String candidateSkill : candidateSkills) {

            if (skillsMatch(
                    candidateSkill,
                    requiredSkill)) {

                alreadyMatched = true;
                break;
            }
        }

        // -------------------------------------------------
        // ORIGINAL MATCH
        // -------------------------------------------------
        if (alreadyMatched) {

            matchedSkills.add(requiredSkill);
            continue;
        }

        // -------------------------------------------------
        // CHECK SKILL RECOVERY
        // -------------------------------------------------
        boolean recovered =
                isSkillFullyRecovered(
                        candidateId,
                        jobId,
                        requiredSkill);

        if (recovered) {

            matchedSkills.add(requiredSkill);
            completedSkills.add(requiredSkill);

        } else {

            missingSkills.add(requiredSkill);
        }
    }

    // =====================================================
    // CALCULATE UPDATED MATCH PERCENTAGE
    // =====================================================
    double matchPercentage = 0.0;

    if (!requiredSkills.isEmpty()) {

        matchPercentage =
                ((double) matchedSkills.size()
                        / requiredSkills.size())
                        * 100.0;
    }

    matchPercentage =
            Math.round(matchPercentage * 100.0)
                    / 100.0;

    // =====================================================
    // UPDATE CANDIDATE SCORE
    // =====================================================
    if (!requiredSkills.isEmpty()) {

        candidate.setScore(matchPercentage);
        candidateRepository.save(candidate);
    }

    // =====================================================
    // RESPONSE
    // =====================================================
    SkillGapResponse response =
            new SkillGapResponse();

    response.setCandidateName(candidate.getName());
    response.setJobTitle(job.getJobTitle());
    response.setMatchPercentage(matchPercentage);
    response.setMatchedSkills(matchedSkills);
    response.setMissingSkills(missingSkills);
    response.setCompletedSkills(completedSkills);

    return response;
}

// =====================================================
// CHECK WHETHER A SKILL IS FULLY RECOVERED
// =====================================================
private boolean isSkillFullyRecovered(
        Long candidateId,
        Long jobId,
        String skill) {

    SkillRecoveryItem recoveryItem =
            createRecoveryItem(
                    skill,
                    candidateId,
                    jobId);

    if (recoveryItem == null) {
        return false;
    }

    List<String> topics =
            recoveryItem.getTopics();

    List<String> completedTopics =
            recoveryItem.getCompletedTopics();

    if (topics == null || topics.isEmpty()) {
        return false;
    }

    if (completedTopics == null) {
        return false;
    }

    return completedTopics.size() >= topics.size();
}

    // =========================================================
    // SKILL RECOVERY PROGRAM
    // =========================================================

    @GetMapping(
            "/{candidateId}/skill-recovery/{jobId}"
    )
    public SkillRecoveryResponse getSkillRecovery(

            @PathVariable Long candidateId,

            @PathVariable Long jobId

    ) {

        // -----------------------------------------------------
        // FIND CANDIDATE
        // -----------------------------------------------------

        Candidate candidate =
                candidateRepository.findById(candidateId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                )
                        );


        // -----------------------------------------------------
        // FIND JOB
        // -----------------------------------------------------

        Job job =
                jobRepository.findById(jobId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found"
                                )
                        );


        // -----------------------------------------------------
        // GET SKILL GAP
        // -----------------------------------------------------

        SkillGapResponse skillGap =
                analyzeSkillGap(
                        candidateId,
                        jobId
                );


        // -----------------------------------------------------
        // CREATE RESPONSE
        // -----------------------------------------------------

        SkillRecoveryResponse response =
                new SkillRecoveryResponse();


        response.setCandidateName(
                candidate.getName()
        );


        response.setJobTitle(
                job.getJobTitle()
        );


        // -----------------------------------------------------
        // CREATE RECOVERY ITEMS
        // -----------------------------------------------------

        List<SkillRecoveryItem> recoveryItems =
                new ArrayList<>();


        // -----------------------------------------------------
        // PROCESS MISSING SKILLS
        // -----------------------------------------------------

        if (
                skillGap.getMissingSkills()
                        != null
        ) {

            for (
                    String missingSkill :
                    skillGap.getMissingSkills()
            ) {

                SkillRecoveryItem item =
                        createRecoveryItem(
                                missingSkill,
                                candidateId,
                                jobId
                        );

                recoveryItems.add(
                        item
                );
            }
        }


        response.setRecoveryItems(
        recoveryItems
);



// =====================================================
// LOAD PERMANENT POSTGRESQL PROGRESS
// =====================================================

applyPersistentRecoveryProgress(
        candidateId,
        jobId,
        recoveryItems
);


return response;
    }
    // =========================================================
// START SKILL RECOVERY PROGRAM
// =========================================================

@PostMapping(
        "/{candidateId}/skill-recovery/{jobId}/start"
)
@Transactional
public Map<String, Object> startSkillRecovery(

        @PathVariable Long candidateId,

        @PathVariable Long jobId

) {

    Candidate candidate =
            candidateRepository.findById(candidateId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Candidate not found"
                            )
                    );

    Job job =
            jobRepository.findById(jobId)
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Job not found"
                            )
                    );

    SkillRecoveryResponse recoveryResponse =
            getSkillRecovery(
                    candidateId,
                    jobId
            );

    LocalDateTime now =
            LocalDateTime.now();

    if (recoveryResponse.getRecoveryItems() != null) {

        for (SkillRecoveryItem item :
                recoveryResponse.getRecoveryItems()) {

            if (item.getTopics() == null) {
                continue;
            }

            String normalizedSkill =
                    normalizeSkill(
                            item.getSkill()
                    );

            for (String topic : item.getTopics()) {

                Optional<SkillRecoveryProgress> existingProgress =
                        skillRecoveryProgressRepository
                                .findByCandidateIdAndJobIdAndSkillAndTopic(
                                        candidateId,
                                        jobId,
                                        normalizedSkill,
                                        topic
                                );

                if (existingProgress.isEmpty()) {

                    SkillRecoveryProgress progress =
                            new SkillRecoveryProgress();

                    progress.setCandidateId(candidateId);
                    progress.setJobId(jobId);
                    progress.setSkill(normalizedSkill);
                    progress.setTopic(topic);
                    progress.setCompleted(false);
                    progress.setStartedAt(now);
                    progress.setLastActivityAt(now);
                    progress.setCompletedAt(null);

                    skillRecoveryProgressRepository.save(progress);

                } else {

                    SkillRecoveryProgress progress =
                            existingProgress.get();

                    // A previously completed topic must remain completed.
                    // Starting the program again must not reset it.

                    if (progress.getStartedAt() == null) {
                        progress.setStartedAt(now);
                    }

                    // Only update activity when the record was newly
                    // initialized or has never had activity.
                    if (progress.getLastActivityAt() == null) {
                        progress.setLastActivityAt(now);
                    }

                    skillRecoveryProgressRepository.save(progress);
                }
            }
        }
    }

    Map<String, Object> response =
            new LinkedHashMap<>();

    response.put(
            "message",
            "Skill Recovery Program Started"
    );

    response.put(
            "candidateId",
            candidate.getCandidateId()
    );

    response.put(
            "candidateName",
            candidate.getName()
    );

    response.put(
            "jobId",
            job.getJobId()
    );

    response.put(
            "jobTitle",
            job.getJobTitle()
    );

    response.put(
            "startedAt",
            getEarliestStartedAt(
                    candidateId,
                    jobId
            )
    );

    response.put(
            "lastActivityAt",
            getLatestActivityAt(
                    candidateId,
                    jobId
            )
    );

    response.put(
            "status",
            getParticipationStatus(
                    candidateId,
                    jobId
            )
    );

    return response;
}

    // =========================================================
    // APPLY PERMANENT POSTGRESQL RECOVERY PROGRESS
// =========================================================

private void applyPersistentRecoveryProgress(
        Long candidateId,
        Long jobId,
        List<SkillRecoveryItem> recoveryItems
) {

    if (recoveryItems == null) {
        return;
    }


    List<SkillRecoveryProgress> storedProgress =
            skillRecoveryProgressRepository
                    .findByCandidateIdAndJobId(
                            candidateId,
                            jobId
                    );


    for (SkillRecoveryItem item : recoveryItems) {

        String normalizedSkill =
                normalizeSkill(
                        item.getSkill()
                );


        List<String> completedTopics =
                new ArrayList<>();


        for (SkillRecoveryProgress progress :
                storedProgress) {

            if (
                    progress.getSkill() != null
                    &&
                    normalizeSkill(
                            progress.getSkill()
                    ).equals(
                            normalizedSkill
                    )
                    &&
                    progress.isCompleted()
            ) {

                completedTopics.add(
                        progress.getTopic()
                );
            }
        }


        // -------------------------------------------------
        // REMOVE DUPLICATES
        // -------------------------------------------------

        completedTopics =
                new ArrayList<>(
                        new LinkedHashSet<>(
                                completedTopics
                        )
                );


        item.setCompletedTopics(
                completedTopics
        );


        // -------------------------------------------------
        // CALCULATE PROGRESS
        // -------------------------------------------------

        int progressPercentage = 0;


        if (
                item.getTopics() != null
                &&
                !item.getTopics().isEmpty()
        ) {

            progressPercentage =
                    (
                            completedTopics.size()
                                    * 100
                    )
                    /
                    item.getTopics().size();
        }


        if (progressPercentage > 100) {

            progressPercentage = 100;
        }


        item.setProgress(
                progressPercentage
        );
    }
}


    // =========================================================
    // PARTICIPATION HELPERS
    // =========================================================

    private LocalDateTime getEarliestStartedAt(
            Long candidateId,
            Long jobId
    ) {

        List<SkillRecoveryProgress> storedProgress =
                skillRecoveryProgressRepository
                        .findByCandidateIdAndJobId(
                                candidateId,
                                jobId
                        );

        LocalDateTime earliest = null;

        for (SkillRecoveryProgress progress :
                storedProgress) {

            if (progress.getStartedAt() != null
                    && (earliest == null
                    || progress.getStartedAt().isBefore(earliest))) {

                earliest =
                        progress.getStartedAt();
            }
        }

        return earliest;
    }


    private LocalDateTime getLatestActivityAt(
            Long candidateId,
            Long jobId
    ) {

        List<SkillRecoveryProgress> storedProgress =
                skillRecoveryProgressRepository
                        .findByCandidateIdAndJobId(
                                candidateId,
                                jobId
                        );

        LocalDateTime latest = null;

        for (SkillRecoveryProgress progress :
                storedProgress) {

            if (progress.getLastActivityAt() != null
                    && (latest == null
                    || progress.getLastActivityAt().isAfter(latest))) {

                latest =
                        progress.getLastActivityAt();
            }
        }

        return latest;
    }


    private String getParticipationStatus(
            Long candidateId,
            Long jobId
    ) {

        List<SkillRecoveryProgress> storedProgress =
                skillRecoveryProgressRepository
                        .findByCandidateIdAndJobId(
                                candidateId,
                                jobId
                        );

        if (storedProgress.isEmpty()) {
            return "Not Started";
        }

        int completedTopics = 0;

        for (SkillRecoveryProgress progress :
                storedProgress) {

            if (progress.isCompleted()) {
                completedTopics++;
            }
        }

        if (completedTopics >= storedProgress.size()) {
            return "Completed";
        }

        return "In Progress";
    }


    // =========================================================
    // GET PERMANENT SKILL RECOVERY PARTICIPATION
    // =========================================================

    @GetMapping(
            "/{candidateId}/skill-recovery/{jobId}/participation"
    )
    public Map<String, Object> getSkillRecoveryParticipation(

            @PathVariable Long candidateId,

            @PathVariable Long jobId

    ) {

        Candidate candidate =
                candidateRepository.findById(candidateId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                )
                        );

        Job job =
                jobRepository.findById(jobId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Job not found"
                                )
                        );

        List<SkillRecoveryProgress> storedProgress =
                skillRecoveryProgressRepository
                        .findByCandidateIdAndJobId(
                                candidateId,
                                jobId
                        );

        int totalTopics =
                storedProgress.size();

        int completedTopics = 0;

        LocalDateTime startedAt = null;

        LocalDateTime lastActivityAt = null;

        Set<String> skills =
                new LinkedHashSet<>();

        for (SkillRecoveryProgress progress :
                storedProgress) {

            if (progress.getSkill() != null) {
                skills.add(
                        normalizeSkill(
                                progress.getSkill()
                        )
                );
            }

            if (progress.isCompleted()) {
                completedTopics++;
            }

            if (progress.getStartedAt() != null
                    && (startedAt == null
                    || progress.getStartedAt()
                    .isBefore(startedAt))) {

                startedAt =
                        progress.getStartedAt();
            }

            if (progress.getLastActivityAt() != null
                    && (lastActivityAt == null
                    || progress.getLastActivityAt()
                    .isAfter(lastActivityAt))) {

                lastActivityAt =
                        progress.getLastActivityAt();
            }
        }

        int progressPercentage = 0;

        if (totalTopics > 0) {

            progressPercentage =
                    (
                            completedTopics * 100
                    )
                    /
                    totalTopics;
        }

        if (progressPercentage > 100) {
            progressPercentage = 100;
        }

       String status;

if (progressPercentage >= 100) {

    status = "Completed";

} else if (
        startedAt != null ||
        lastActivityAt != null ||
        completedTopics > 0 ||
        totalTopics > 0
) {

    status = "In Progress";

} else {

    status = "Not Started";
}
        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put(
                "candidateId",
                candidate.getCandidateId()
        );

        response.put(
                "candidateName",
                candidate.getName()
        );

        response.put(
                "jobId",
                job.getJobId()
        );

        response.put(
                "jobTitle",
                job.getJobTitle()
        );

        response.put(
                "status",
                status
        );

        response.put(
                "totalTopics",
                totalTopics
        );

        response.put(
                "completedTopics",
                completedTopics
        );

        response.put(
                "progress",
                progressPercentage
        );

        response.put(
                "startedAt",
                startedAt
        );

        response.put(
                "lastActivityAt",
                lastActivityAt
        );

        response.put(
                "skills",
                new ArrayList<>(skills)
        );

        return response;
    }


    // =========================================================
    // CREATE RECOVERY ITEM    // =========================================================
    // CREATE RECOVERY ITEM
    // =========================================================

    private SkillRecoveryItem createRecoveryItem(
            String skill
    ) {

        return createRecoveryItem(
                skill,
                null,
                null
        );
    }


    // =========================================================
    // CREATE RECOVERY ITEM WITH PROGRESS
    // =========================================================

    private SkillRecoveryItem createRecoveryItem(
            String skill,
            Long candidateId,
            Long jobId
    ) {


        SkillRecoveryItem item =
                new SkillRecoveryItem();


        String normalizedSkill =
                normalizeSkill(
                        skill
                );


        item.setSkill(
                skill
        );


        item.setLevel(
                "Beginner"
        );


        // =====================================================
        // AI
        // =====================================================

        if (
                normalizedSkill.equals("ai")
                ||
                normalizedSkill.equals(
                        "artificial intelligence"
                )
        ) {

            item.setDescription(
                    "Learn the fundamentals of Artificial Intelligence "
                            + "and intelligent system development."
            );


            item.setTopics(
                    Arrays.asList(
                            "AI Fundamentals",
                            "Intelligent Systems",
                            "AI Applications",
                            "Machine Learning Basics"
                    )
            );
        }


        // =====================================================
        // SCIKIT-LEARN
        // =====================================================

        else if (
                normalizedSkill.equals(
                        "scikit-learn"
                )
                ||
                normalizedSkill.equals(
                        "sklearn"
                )
        ) {

            item.setDescription(
                    "Learn how to build and evaluate machine learning "
                            + "models using Scikit-learn."
            );


            item.setTopics(
                    Arrays.asList(
                            "Data Preprocessing",
                            "Classification",
                            "Regression",
                            "Model Evaluation",
                            "Scikit-learn Pipelines"
                    )
            );
        }


        // =====================================================
        // REST API
        // =====================================================

        else if (
                normalizedSkill.equals(
                        "rest api"
                )
                ||
                normalizedSkill.equals(
                        "rest"
                )
                ||
                normalizedSkill.equals(
                        "api"
                )
        ) {

            item.setDescription(
                    "Learn how REST APIs work and how to develop "
                            + "and integrate APIs."
            );


            item.setTopics(
                    Arrays.asList(
                            "HTTP Methods",
                            "REST Architecture",
                            "GET and POST Requests",
                            "API Integration",
                            "REST API Development"
                    )
            );
        }


        // =====================================================
        // JAVA
        // =====================================================

        else if (
                normalizedSkill.equals(
                        "java"
                )
        ) {

            item.setDescription(
                    "Build Java programming fundamentals required "
                            + "for software development."
            );


            item.setTopics(
                    Arrays.asList(
                            "Java Basics",
                            "Object Oriented Programming",
                            "Collections",
                            "Exception Handling",
                            "Java Streams"
                    )
            );
        }


        // =====================================================
        // PYTHON
        // =====================================================

        else if (
                normalizedSkill.equals(
                        "python"
                )
        ) {

            item.setDescription(
                    "Learn Python programming for application and "
                            + "AI development."
            );


            item.setTopics(
                    Arrays.asList(
                            "Python Fundamentals",
                            "Functions",
                            "Object Oriented Programming",
                            "File Handling",
                            "Python Libraries"
                    )
            );
        }


        // =====================================================
        // REACT
        // =====================================================

        else if (
                normalizedSkill.equals(
                        "react"
                )
                ||
                normalizedSkill.equals(
                        "reactjs"
                )
        ) {

            item.setDescription(
                    "Learn React for building modern interactive "
                            + "web applications."
            );


            item.setTopics(
                    Arrays.asList(
                            "React Fundamentals",
                            "Components",
                            "Props and State",
                            "Hooks",
                            "API Integration"
                    )
            );
        }


        // =====================================================
        // DEFAULT
        // =====================================================

        else {

            item.setDescription(
                    "Develop foundational knowledge and practical "
                            + "skills in "
                            + skill
                            + "."
            );


            item.setTopics(
                    Arrays.asList(
                            "Fundamentals",
                            "Core Concepts",
                            "Practical Examples",
                            "Hands-on Practice"
                    )
            );
        }


        // =====================================================
        // RECOMMENDED DURATION
        // =====================================================

        item.setRecommendedDuration(
                getRecommendedDuration(
                        normalizedSkill
                )
        );


        // =====================================================
        // COMPLETED TOPICS - PERMANENT POSTGRESQL
        // =====================================================

        List<String> completedTopics =
                new ArrayList<>();

        if (candidateId != null && jobId != null) {

            List<SkillRecoveryProgress> storedProgress =
                    skillRecoveryProgressRepository
                            .findByCandidateIdAndJobIdAndSkill(
                                    candidateId,
                                    jobId,
                                    normalizedSkill
                            );

            for (SkillRecoveryProgress progress : storedProgress) {

                if (progress.isCompleted()
                        && progress.getTopic() != null) {

                    completedTopics.add(
                            progress.getTopic()
                    );
                }
            }

            completedTopics =
                    new ArrayList<>(
                            new LinkedHashSet<>(
                                    completedTopics
                            )
                    );
        }

        item.setCompletedTopics(
                completedTopics
        );


        // =====================================================
        // CALCULATE PROGRESS
        // =====================================================

        int progress = 0;


        if (
                item.getTopics() != null
                &&
                !item.getTopics().isEmpty()
        ) {

            progress =
                    (
                            completedTopics.size()
                            * 100
                    )
                    /
                    item.getTopics().size();
        }


        item.setProgress(
                progress
        );


        return item;
    }


    // =========================================================
    // RECOMMENDED DURATION
    // =========================================================

    private String getRecommendedDuration(
            String skill
    ) {

        if (
                skill.equals("java")
                ||
                skill.equals("python")
        ) {

            return "4 Weeks";
        }


        if (
                skill.equals("react")
                ||
                skill.equals("spring boot")
        ) {

            return "4 Weeks";
        }


        if (
                skill.equals("mysql")
                ||
                skill.equals("git")
        ) {

            return "2 Weeks";
        }


        if (
                skill.equals("rest api")
        ) {

            return "3 Weeks";
        }


        if (
                skill.equals("ai")
                ||
                skill.equals("machine learning")
                ||
                skill.equals("scikit-learn")
        ) {

            return "5 Weeks";
        }


        return "3 Weeks";
    }


    // =========================================================
    // COMPLETE / UNCOMPLETE TOPIC
    // =========================================================

    @PutMapping(
            "/{candidateId}/skill-recovery/{jobId}/topic"
    )
    @Transactional
    public SkillRecoveryItem updateTopicCompletion(

            @PathVariable Long candidateId,

            @PathVariable Long jobId,

            @RequestBody Map<String, Object> request

    ) {

        // -----------------------------------------------------
        // FIND CANDIDATE
        // -----------------------------------------------------

        candidateRepository.findById(candidateId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Candidate not found"
                        )
                );


        // -----------------------------------------------------
        // FIND JOB
        // -----------------------------------------------------

        jobRepository.findById(jobId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Job not found"
                        )
                );


        // -----------------------------------------------------
        // GET SKILL
        // -----------------------------------------------------

        Object skillObject =
                request.get("skill");

        if (skillObject == null) {
            throw new RuntimeException(
                    "Skill is required"
            );
        }

        String skill =
                skillObject.toString().trim();

        if (skill.isEmpty()) {
            throw new RuntimeException(
                    "Skill cannot be empty"
            );
        }


        // -----------------------------------------------------
        // GET TOPIC
        // -----------------------------------------------------

        Object topicObject =
                request.get("topic");

        if (topicObject == null) {
            throw new RuntimeException(
                    "Topic is required"
            );
        }

        String topic =
                topicObject.toString().trim();

        if (topic.isEmpty()) {
            throw new RuntimeException(
                    "Topic cannot be empty"
            );
        }


        // -----------------------------------------------------
        // GET COMPLETED VALUE
        // -----------------------------------------------------

        boolean completed = true;

        Object completedObject =
                request.get("completed");

        if (completedObject != null) {

            if (completedObject instanceof Boolean) {

                completed =
                        (Boolean) completedObject;

            } else {

                completed =
                        Boolean.parseBoolean(
                                completedObject.toString()
                        );
            }
        }


        // -----------------------------------------------------
        // CREATE RECOVERY ITEM
        // -----------------------------------------------------

        String normalizedSkill =
                normalizeSkill(skill);

        SkillRecoveryItem item =
                createRecoveryItem(
                        skill,
                        candidateId,
                        jobId
                );


        // -----------------------------------------------------
        // VALIDATE TOPIC
        // -----------------------------------------------------

        boolean topicExists = false;

        if (item.getTopics() != null) {

            for (String availableTopic :
                    item.getTopics()) {

                if (availableTopic.equalsIgnoreCase(topic)) {
                    topicExists = true;
                    break;
                }
            }
        }

        if (!topicExists) {

            throw new RuntimeException(
                    "Topic not found for skill: "
                            + skill
            );
        }


        // =====================================================
        // SAVE TOPIC PROGRESS ONLY IN POSTGRESQL
        // =====================================================

        LocalDateTime now =
                LocalDateTime.now();

        Optional<SkillRecoveryProgress> existingProgress =
                skillRecoveryProgressRepository
                        .findByCandidateIdAndJobIdAndSkillAndTopic(
                                candidateId,
                                jobId,
                                normalizedSkill,
                                topic
                        );

        SkillRecoveryProgress progressRecord;

        if (existingProgress.isPresent()) {

            progressRecord =
                    existingProgress.get();

        } else {

            progressRecord =
                    new SkillRecoveryProgress();

            progressRecord.setCandidateId(
                    candidateId
            );

            progressRecord.setJobId(
                    jobId
            );

            progressRecord.setSkill(
                    normalizedSkill
            );

            progressRecord.setTopic(
                    topic
            );

            progressRecord.setStartedAt(
                    now
            );
        }

        if (progressRecord.getStartedAt() == null) {
            progressRecord.setStartedAt(now);
        }

        progressRecord.setCompleted(
                completed
        );

        progressRecord.setLastActivityAt(
                now
        );

        if (completed) {

            progressRecord.setCompletedAt(
                    now
            );

        } else {

            progressRecord.setCompletedAt(
                    null
            );
        }

        skillRecoveryProgressRepository.save(
                progressRecord
        );


        // =====================================================
        // RELOAD PERMANENT DATABASE STATE
        // =====================================================

        List<SkillRecoveryProgress> storedProgress =
                skillRecoveryProgressRepository
                        .findByCandidateIdAndJobIdAndSkill(
                                candidateId,
                                jobId,
                                normalizedSkill
                        );

        List<String> completedTopics =
                new ArrayList<>();

        for (SkillRecoveryProgress progress :
                storedProgress) {

            if (progress.isCompleted()
                    && progress.getTopic() != null) {

                completedTopics.add(
                        progress.getTopic()
                );
            }
        }

        completedTopics =
                new ArrayList<>(
                        new LinkedHashSet<>(
                                completedTopics
                        )
                );

        item.setCompletedTopics(
                completedTopics
        );


        // -----------------------------------------------------
        // CALCULATE PROGRESS
        // -----------------------------------------------------

        int progress = 0;

        if (item.getTopics() != null
                && !item.getTopics().isEmpty()) {

            progress =
                    (
                            completedTopics.size()
                                    * 100
                    )
                    /
                    item.getTopics().size();
        }

        if (progress > 100) {
            progress = 100;
        }

        item.setProgress(
                progress
        );

        return item;
    }


    // =========================================================
    // CREATE SKILL ALIASES
    // =========================================================

    private Map<String, List<String>>
    createSkillAliases() {

        Map<String, List<String>> aliases =
                new LinkedHashMap<>();


        // -----------------------------------------------------
        // PROGRAMMING LANGUAGES
        // -----------------------------------------------------

        aliases.put(
                "java",
                Arrays.asList(
                        "java"
                )
        );


        aliases.put(
                "python",
                Arrays.asList(
                        "python"
                )
        );


        aliases.put(
                "c++",
                Arrays.asList(
                        "c++"
                )
        );


        aliases.put(
                "c#",
                Arrays.asList(
                        "c#"
                )
        );


        // -----------------------------------------------------
        // JAVASCRIPT
        // -----------------------------------------------------

        aliases.put(
                "javascript",
                Arrays.asList(
                        "javascript",
                        "js"
                )
        );


        aliases.put(
                "typescript",
                Arrays.asList(
                        "typescript"
                )
        );


        // -----------------------------------------------------
        // FRONTEND
        // -----------------------------------------------------

        aliases.put(
                "html",
                Arrays.asList(
                        "html"
                )
        );


        aliases.put(
                "css",
                Arrays.asList(
                        "css"
                )
        );


        aliases.put(
                "react",
                Arrays.asList(
                        "react",
                        "reactjs",
                        "react.js"
                )
        );


        aliases.put(
                "angular",
                Arrays.asList(
                        "angular"
                )
        );


        aliases.put(
                "vue",
                Arrays.asList(
                        "vue"
                )
        );


        // -----------------------------------------------------
        // JAVA FRAMEWORKS
        // -----------------------------------------------------

        aliases.put(
                "spring boot",
                Arrays.asList(
                        "spring boot",
                        "spring"
                )
        );


        aliases.put(
                "hibernate",
                Arrays.asList(
                        "hibernate"
                )
        );


        // -----------------------------------------------------
        // AI / ML
        // -----------------------------------------------------

        aliases.put(
                "ai",
                Arrays.asList(
                        "artificial intelligence",
                        "ai",
                        "generative ai"
                )
        );


        aliases.put(
                "machine learning",
                Arrays.asList(
                        "machine learning",
                        "machine-learning",
                        "ml"
                )
        );


        aliases.put(
                "deep learning",
                Arrays.asList(
                        "deep learning",
                        "deep-learning"
                )
        );


        aliases.put(
                "nlp",
                Arrays.asList(
                        "nlp",
                        "natural language processing"
                )
        );


        aliases.put(
                "tensorflow",
                Arrays.asList(
                        "tensorflow"
                )
        );


        aliases.put(
                "pytorch",
                Arrays.asList(
                        "pytorch"
                )
        );


        aliases.put(
                "keras",
                Arrays.asList(
                        "keras"
                )
        );


        aliases.put(
                "pandas",
                Arrays.asList(
                        "pandas"
                )
        );


        aliases.put(
                "numpy",
                Arrays.asList(
                        "numpy"
                )
        );


        aliases.put(
                "scikit-learn",
                Arrays.asList(
                        "scikit-learn",
                        "sklearn"
                )
        );


        aliases.put(
                "matplotlib",
                Arrays.asList(
                        "matplotlib"
                )
        );


        aliases.put(
                "seaborn",
                Arrays.asList(
                        "seaborn"
                )
        );


        // -----------------------------------------------------
        // DATABASE
        // -----------------------------------------------------

        aliases.put(
                "mysql",
                Arrays.asList(
                        "mysql",
                        "sql"
                )
        );


        aliases.put(
                "postgresql",
                Arrays.asList(
                        "postgresql",
                        "postgres"
                )
        );


        aliases.put(
                "mongodb",
                Arrays.asList(
                        "mongodb",
                        "mongo db"
                )
        );


        // -----------------------------------------------------
        // CLOUD
        // -----------------------------------------------------

        aliases.put(
                "aws",
                Arrays.asList(
                        "aws",
                        "amazon web services"
                )
        );


        aliases.put(
                "azure",
                Arrays.asList(
                        "azure",
                        "microsoft azure"
                )
        );


        aliases.put(
                "gcp",
                Arrays.asList(
                        "gcp",
                        "google cloud",
                        "google cloud platform"
                )
        );


        aliases.put(
                "cloud platforms",
                Arrays.asList(
                        "cloud",
                        "cloud platforms",
                        "cloud deployment",
                        "cloud-based"
                )
        );


        // -----------------------------------------------------
        // DEVOPS
        // -----------------------------------------------------

        aliases.put(
                "docker",
                Arrays.asList(
                        "docker"
                )
        );


        aliases.put(
                "kubernetes",
                Arrays.asList(
                        "kubernetes"
                )
        );


        // -----------------------------------------------------
        // VERSION CONTROL
        // -----------------------------------------------------

        aliases.put(
                "git",
                Arrays.asList(
                        "git"
                )
        );


        aliases.put(
                "github",
                Arrays.asList(
                        "github",
                        "git hub"
                )
        );


        // -----------------------------------------------------
        // REST API
        // -----------------------------------------------------

        aliases.put(
                "rest api",
                Arrays.asList(
                        "restful apis",
                        "restful api",
                        "rest apis",
                        "rest api",
                        "rest"
                )
        );


        // -----------------------------------------------------
        // NODE / BACKEND
        // -----------------------------------------------------

        aliases.put(
                "nodejs",
                Arrays.asList(
                        "nodejs",
                        "node.js",
                        "node"
                )
        );


        aliases.put(
                "express",
                Arrays.asList(
                        "express",
                        "express.js"
                )
        );


        aliases.put(
                "flask",
                Arrays.asList(
                        "flask"
                )
        );


        aliases.put(
                "django",
                Arrays.asList(
                        "django"
                )
        );


        // -----------------------------------------------------
        // BIG DATA
        // -----------------------------------------------------

        aliases.put(
                "spark",
                Arrays.asList(
                        "spark",
                        "apache spark"
                )
        );


        aliases.put(
                "hadoop",
                Arrays.asList(
                        "hadoop",
                        "apache hadoop"
                )
        );


        // -----------------------------------------------------
        // BI TOOLS
        // -----------------------------------------------------

        aliases.put(
                "tableau",
                Arrays.asList(
                        "tableau"
                )
        );


        aliases.put(
                "power bi",
                Arrays.asList(
                        "power bi"
                )
        );


        aliases.put(
                "excel",
                Arrays.asList(
                        "excel",
                        "microsoft excel"
                )
        );


        return aliases;
    }


    // =========================================================
    // EXTRACT CANDIDATE SKILLS
    // =========================================================

    private Set<String> extractCandidateSkills(
            String skills
    ) {

        Set<String> candidateSkills =
                new LinkedHashSet<>();


        if (
                skills == null
                ||
                skills.trim().isEmpty()
        ) {

            return candidateSkills;
        }


        String[] skillArray =
                skills.split(",");


        for (String skill :
                skillArray) {

            String cleanedSkill =
                    skill
                            .trim()
                            .toLowerCase(
                                    Locale.ROOT
                            );


            if (
                    !cleanedSkill.isEmpty()
            ) {

                candidateSkills.add(
                        normalizeSkill(
                                cleanedSkill
                        )
                );
            }
        }


        return candidateSkills;
    }


    // =========================================================
    // NORMALIZE INDIVIDUAL SKILL
    // =========================================================

    private String normalizeSkill(
            String skill
    ) {

        String value =
                skill
                        .toLowerCase(
                                Locale.ROOT
                        )
                        .trim();


        // -----------------------------------------------------
        // SKLEARN
        // -----------------------------------------------------

        if (
                value.equals("sklearn")
                ||
                value.equals("scikit learn")
        ) {

            return "scikit-learn";
        }


        // -----------------------------------------------------
        // REACT
        // -----------------------------------------------------

        if (
                value.equals("reactjs")
                ||
                value.equals("react.js")
        ) {

            return "react";
        }


        // -----------------------------------------------------
        // NODE
        // -----------------------------------------------------

        if (
                value.equals("node")
                ||
                value.equals("node.js")
        ) {

            return "nodejs";
        }


        // -----------------------------------------------------
        // AI
        // -----------------------------------------------------

        if (
                value.equals(
                        "artificial intelligence"
                )
                ||
                value.equals(
                        "generative ai"
                )
        ) {

            return "ai";
        }


        // -----------------------------------------------------
        // NLP
        // -----------------------------------------------------

        if (
                value.equals(
                        "natural language processing"
                )
        ) {

            return "nlp";
        }


        // -----------------------------------------------------
        // REST
        // -----------------------------------------------------

        if (
                value.equals("rest")
                ||
                value.equals("rest api")
                ||
                value.equals("restful api")
                ||
                value.equals("restful apis")
                ||
                value.equals("rest apis")
        ) {

            return "rest api";
        }


        // -----------------------------------------------------
        // SPRING
        // -----------------------------------------------------

        if (
                value.equals("spring")
                ||
                value.equals("spring boot")
        ) {

            return "spring boot";
        }


        // -----------------------------------------------------
        // SQL
        // -----------------------------------------------------

        if (
                value.equals("sql")
        ) {

            return "mysql";
        }


        // -----------------------------------------------------
        // CLOUD
        // -----------------------------------------------------

        if (
                value.equals("cloud")
                ||
                value.equals("cloud deployment")
                ||
                value.equals("cloud-based")
        ) {

            return "cloud platforms";
        }


        return value;
    }


    // =========================================================
    // CHECK WHETHER DESCRIPTION CONTAINS SKILL
    // =========================================================

    private boolean containsSkill(
            String text,
            String skill
    ) {

        String normalizedSkill =
                skill
                        .toLowerCase(
                                Locale.ROOT
                        )
                        .trim();


        String regex =
                "(?<![a-z0-9])"
                        +
                        Pattern.quote(
                                normalizedSkill
                        )
                        +
                        "(?![a-z0-9])";


        return Pattern
                .compile(
                        regex,
                        Pattern.CASE_INSENSITIVE
                )
                .matcher(text)
                .find();
    }


    // =========================================================
    // NORMALIZE REQUIRED SKILLS
    // =========================================================

    private Set<String> normalizeRequiredSkills(
            Set<String> skills
    ) {

        Set<String> normalized =
                new LinkedHashSet<>();


        for (String skill :
                skills) {

            String canonical =
                    normalizeSkill(
                            skill
                    );


            normalized.add(
                    canonical
            );
        }


        return normalized;
    }


    // =========================================================
    // SKILL MATCHING
    // =========================================================

    private boolean skillsMatch(
            String candidateSkill,
            String requiredSkill
    ) {

        String candidate =
                normalizeSkill(
                        candidateSkill
                );


        String required =
                normalizeSkill(
                        requiredSkill
                );


        // Exact canonical match

        if (
                candidate.equals(
                        required
                )
        ) {

            return true;
        }


        // -----------------------------------------------------
        // AI
        // -----------------------------------------------------

        if (
                required.equals("ai")
                &&
                (
                        candidate.equals("ai")
                        ||
                        candidate.equals(
                                "generative ai"
                        )
                        ||
                        candidate.equals(
                                "artificial intelligence"
                        )
                )
        ) {

            return true;
        }


        // -----------------------------------------------------
        // REST API
        // -----------------------------------------------------

        if (
                required.equals("rest api")
                &&
                (
                        candidate.equals("rest api")
                        ||
                        candidate.equals("restful api")
                        ||
                        candidate.equals("restful apis")
                )
        ) {

            return true;
        }


        // -----------------------------------------------------
        // SCikit-learn
        // -----------------------------------------------------

        if (
                required.equals("scikit-learn")
                &&
                (
                        candidate.equals(
                                "scikit-learn"
                        )
                        ||
                        candidate.equals(
                                "sklearn"
                        )
                )
        ) {

            return true;
        }


        // -----------------------------------------------------
        // REACT
        // -----------------------------------------------------

        if (
                required.equals("react")
                &&
                (
                        candidate.equals("react")
                        ||
                        candidate.equals("reactjs")
                )
        ) {

            return true;
        }


        // -----------------------------------------------------
        // NODE
        // -----------------------------------------------------

        if (
                required.equals("nodejs")
                &&
                (
                        candidate.equals("nodejs")
                        ||
                        candidate.equals("node")
                )
        ) {

            return true;
        }


        // -----------------------------------------------------
        // SPRING BOOT
        // -----------------------------------------------------

        if (
                required.equals("spring boot")
                &&
                (
                        candidate.equals(
                                "spring boot"
                        )
                        ||
                        candidate.equals(
                                "spring"
                        )
                )
        ) {

            return true;
        }


        // -----------------------------------------------------
        // MYSQL / SQL
        // -----------------------------------------------------

        if (
                required.equals("mysql")
                &&
                (
                        candidate.equals("mysql")
                        ||
                        candidate.equals("sql")
                )
        ) {

            return true;
        }


        // -----------------------------------------------------
        // CLOUD
        // -----------------------------------------------------

        if (
                required.equals("cloud platforms")
                &&
                (
                        candidate.equals(
                                "cloud platforms"
                        )
                        ||
                        candidate.equals(
                                "aws"
                        )
                        ||
                        candidate.equals(
                                "azure"
                        )
                        ||
                        candidate.equals(
                                "gcp"
                        )
                )
        ) {

            return true;
        }


        return false;
    }


    // =========================================================
    // UPLOAD CANDIDATE
    // =========================================================

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


        String uploadDir =
                System.getProperty("user.dir")
                        + File.separator
                        + "uploads";


        File directory =
                new File(uploadDir);


        if (!directory.exists()) {

            directory.mkdirs();
        }


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


        file.transferTo(
                destinationFile
        );


        var parsedData =
                resumeParserService.parseResume(
                        destinationFile
                );


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


        Double thresholdPercentage =
                60.0;


        if (
                selectedJob != null
                &&
                selectedJob
                        .getThresholdPercentage()
                        != null
        ) {

            thresholdPercentage =
                    selectedJob
                            .getThresholdPercentage();
        }


        PythonResponse pythonResponse =
                pythonNLPService.analyzeResume(
                        destinationFile,
                        jobDescription,
                        appliedPosition
                );


        if (pythonResponse == null) {

            throw new RuntimeException(
                    "Python NLP service failed"
            );
        }


        Double calculatedScore =
                pythonResponse.getScore();


        if (calculatedScore == null) {

            calculatedScore = 0.0;
        }


        String finalSkills = "";


        if (
                pythonResponse.getSkills()
                        != null
        ) {

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

            finalSkills =
                    parsedSkills;
        }


        String rank =
                pythonResponse.getRank();


        if (rank == null) {

            rank = "Low";
        }


        String status;


        if (
                calculatedScore
                        >= thresholdPercentage
        ) {

            status = "Pending";

        } else {

            status = "Rejected";
        }


        if (
                status.equalsIgnoreCase(
                        "Rejected"
                )
        ) {

            if (
                    destinationFile.exists()
            ) {

                destinationFile.delete();
            }


            System.out.println(
                    "Rejected Resume Deleted"
            );


            return null;
        }


        Candidate candidate =
                new Candidate();


        if (
                parsedName != null
                &&
                !parsedName.isEmpty()
        ) {

            candidate.setName(
                    parsedName
            );

        } else {

            candidate.setName(
                    name
            );
        }


        if (
                parsedEmail != null
                &&
                !parsedEmail.isEmpty()
        ) {

            candidate.setEmail(
                    parsedEmail
            );

        } else {

            candidate.setEmail(
                    email
            );
        }


        if (
                parsedPhone != null
                &&
                !parsedPhone.isEmpty()
        ) {

            candidate.setPhone(
                    parsedPhone
            );

        } else {

            candidate.setPhone(
                    phone
            );
        }


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


        return candidateRepository.save(
                candidate
        );
    }


    // =========================================================
    // UPDATE STATUS
    // =========================================================

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
                                )
                        );


        candidate.setStatus(
                status
        );


        return candidateRepository.save(
                candidate
        );
    }


    // =========================================================
    // UPDATE CANDIDATE
    // =========================================================

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
                                )
                        );


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


    // =========================================================
    // DOWNLOAD RESUME
    // =========================================================

    @GetMapping("/download/{id}")
    public ResponseEntity<Void> downloadResume(
            @PathVariable Long id
    ) {

        Candidate candidate =
                candidateRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                )
                        );


        return ResponseEntity
                .status(302)
                .header(
                        HttpHeaders.LOCATION,
                        candidate.getResumeUrl()
                )
                .build();
    }


    // =========================================================
    // GET RANKING
    // =========================================================

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


    // =========================================================
    // SHORTLIST CANDIDATE
    // =========================================================

    @PutMapping("/shortlist/{id}")
    public Candidate shortlistCandidate(
            @PathVariable Long id
    ) {

        System.out.println(
                "SHORTLIST API HIT"
        );


        Candidate candidate =
                candidateRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                )
                        );


        candidate.setCurrentStage(
                "Shortlisted"
        );


        candidate.setStatus(
                "Shortlisted"
        );


        candidate.setShortlisted(
                true
        );


        Candidate savedCandidate =
                candidateRepository.save(
                        candidate
                );


        System.out.println(
                "Candidate Saved"
        );


        new Thread(() -> {

            try {

                emailService.sendEmail(
                        candidate.getEmail(),
                        candidate.getName(),
                        candidate.getAppliedPosition(),
                        "Shortlisted"
                );


                System.out.println(
                        "Email Sent"
                );


            } catch (Exception e) {

                e.printStackTrace();
            }

        }).start();


        return savedCandidate;
    }


    // =========================================================
    // SELECT CANDIDATE
    // =========================================================

    @PutMapping("/select/{id}")
    public Candidate selectCandidate(
            @PathVariable Long id
    ) {

        Candidate candidate =
                candidateRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Candidate not found"
                                )
                        );


        candidate.setCurrentStage(
                "Selected"
        );


        candidate.setStatus(
                "Selected"
        );


        candidate.setSelected(
                true
        );


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


                System.out.println(
                        "Selection Email Sent"
                );


            } catch (Exception e) {

                System.out.println(
                        "Selection Email Error"
                );


                e.printStackTrace();
            }

        }).start();


        return candidateRepository.save(
                candidate
        );
    }


    // =========================================================
    // DASHBOARD ANALYTICS
    // =========================================================

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
                                candidate.getStatus() != null
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
                                candidate.getStatus() != null
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

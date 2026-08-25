package com.resume.resume_screening_system.service;

import com.resume.resume_screening_system.dto.SkillRecoveryItem;
import com.resume.resume_screening_system.dto.SkillRecoveryResponse;
import com.resume.resume_screening_system.entity.Candidate;
import com.resume.resume_screening_system.entity.Job;
import com.resume.resume_screening_system.entity.SkillRecoveryProgress;
import com.resume.resume_screening_system.repository.SkillRecoveryProgressRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class SkillRecoveryService {

    private final SkillRecoveryProgressRepository
            skillRecoveryProgressRepository;

    public SkillRecoveryService(
            SkillRecoveryProgressRepository
                    skillRecoveryProgressRepository
    ) {
        this.skillRecoveryProgressRepository =
                skillRecoveryProgressRepository;
    }

    // =========================================================
    // GET ALL PROGRESS
    // =========================================================

    public List<SkillRecoveryProgress> getProgress(
            Long candidateId,
            Long jobId
    ) {
        return skillRecoveryProgressRepository
                .findByCandidateIdAndJobId(
                        candidateId,
                        jobId
                );
    }

    // =========================================================
    // GET COMPLETED TOPIC PROGRESS
    // =========================================================

    public List<SkillRecoveryProgress> getCompletedProgress(
            Long candidateId,
            Long jobId
    ) {
        return skillRecoveryProgressRepository
                .findByCandidateIdAndJobIdAndCompletedTrue(
                        candidateId,
                        jobId
                );
    }

    // =========================================================
    // START SKILL RECOVERY
    // =========================================================

    public List<SkillRecoveryProgress> startSkillRecovery(
            Long candidateId,
            Long jobId,
            List<SkillRecoveryItem> recoveryItems
    ) {

        LocalDateTime now = LocalDateTime.now();

        List<SkillRecoveryProgress> existing =
                skillRecoveryProgressRepository
                        .findByCandidateIdAndJobId(
                                candidateId,
                                jobId
                        );

        Set<String> existingKeys =
                new LinkedHashSet<>();

        for (SkillRecoveryProgress progress : existing) {

            existingKeys.add(
                    createKey(
                            progress.getSkill(),
                            progress.getTopic()
                    )
            );
        }

        if (recoveryItems != null) {

            for (SkillRecoveryItem item : recoveryItems) {

                if (item == null) {
                    continue;
                }

                if (item.getSkill() == null ||
                        item.getSkill().isBlank()) {
                    continue;
                }

                if (item.getTopics() == null) {
                    continue;
                }

                String skill =
                        item.getSkill().trim();

                for (String rawTopic :
                        item.getTopics()) {

                    if (rawTopic == null ||
                            rawTopic.isBlank()) {
                        continue;
                    }

                    String topic =
                            rawTopic.trim();

                    String key =
                            createKey(
                                    skill,
                                    topic
                            );

                    if (existingKeys.contains(key)) {
                        continue;
                    }

                    SkillRecoveryProgress progress =
                            new SkillRecoveryProgress();

                    progress.setCandidateId(
                            candidateId
                    );

                    progress.setJobId(
                            jobId
                    );

                    progress.setSkill(
                            skill
                    );

                    progress.setTopic(
                            topic
                    );

                    progress.setCompleted(
                            false
                    );

                    progress.setStartedAt(
                            now
                    );

                    progress.setLastActivityAt(
                            now
                    );

                    progress.setCompletedAt(
                            null
                    );

                    skillRecoveryProgressRepository.save(
                            progress
                    );

                    existingKeys.add(key);
                }
            }
        }

        return skillRecoveryProgressRepository
                .findByCandidateIdAndJobId(
                        candidateId,
                        jobId
                );
    }

    // =========================================================
    // UPDATE TOPIC COMPLETION
    // =========================================================

    public SkillRecoveryProgress updateTopicCompletion(
            Long candidateId,
            Long jobId,
            String skill,
            String topic,
            boolean completed
    ) {

        if (skill == null ||
                skill.isBlank()) {

            throw new IllegalArgumentException(
                    "Skill is required"
            );
        }

        if (topic == null ||
                topic.isBlank()) {

            throw new IllegalArgumentException(
                    "Topic is required"
            );
        }

        String normalizedSkill =
                skill.trim();

        String normalizedTopic =
                topic.trim();

        SkillRecoveryProgress progress =
                skillRecoveryProgressRepository
                        .findByCandidateIdAndJobIdAndSkillAndTopic(
                                candidateId,
                                jobId,
                                normalizedSkill,
                                normalizedTopic
                        )
                        .orElse(null);

        LocalDateTime now =
                LocalDateTime.now();

        if (progress == null) {

            progress =
                    new SkillRecoveryProgress();

            progress.setCandidateId(
                    candidateId
            );

            progress.setJobId(
                    jobId
            );

            progress.setSkill(
                    normalizedSkill
            );

            progress.setTopic(
                    normalizedTopic
            );

            progress.setStartedAt(
                    now
            );
        }

        progress.setCompleted(
                completed
        );

        progress.setLastActivityAt(
                now
        );

        if (completed) {

            progress.setCompletedAt(
                    now
            );

        } else {

            progress.setCompletedAt(
                    null
            );
        }

        return skillRecoveryProgressRepository.save(
                progress
        );
    }

    // =========================================================
    // BUILD RECOVERY RESPONSE
    // =========================================================

    public SkillRecoveryResponse buildRecoveryResponse(
            Candidate candidate,
            Job job,
            List<SkillRecoveryItem> recoveryItems
    ) {

        SkillRecoveryResponse response =
                new SkillRecoveryResponse();

        response.setCandidateName(
                candidate.getName()
        );

        response.setJobTitle(
                job.getJobTitle()
        );

        List<SkillRecoveryProgress> progressList =
                skillRecoveryProgressRepository
                        .findByCandidateIdAndJobId(
                                candidate.getCandidateId(),
                                job.getJobId()
                        );

        Set<String> completedTopicKeys =
                new LinkedHashSet<>();

        for (SkillRecoveryProgress progress :
                progressList) {

            if (!progress.isCompleted()) {
                continue;
            }

            completedTopicKeys.add(
                    createKey(
                            progress.getSkill(),
                            progress.getTopic()
                    )
            );
        }

        List<SkillRecoveryItem> resultItems =
                new ArrayList<>();

        int totalTopics = 0;
        int completedTopics = 0;

        if (recoveryItems != null) {

            for (SkillRecoveryItem original :
                    recoveryItems) {

                if (original == null) {
                    continue;
                }

                SkillRecoveryItem item =
                        new SkillRecoveryItem();

                item.setSkill(
                        original.getSkill()
                );

                item.setLevel(
                        original.getLevel()
                );

                item.setDescription(
                        original.getDescription()
                );

                item.setRecommendedDuration(
                        original.getRecommendedDuration()
                );

                List<String> topics =
                        original.getTopics() != null
                                ? original.getTopics()
                                : Collections.emptyList();

                item.setTopics(
                        topics
                );

                List<String> completedForSkill =
                        new ArrayList<>();

                for (String topic : topics) {

                    if (topic == null ||
                            topic.isBlank()) {
                        continue;
                    }

                    totalTopics++;

                    String topicKey =
                            createKey(
                                    original.getSkill(),
                                    topic
                            );

                    if (completedTopicKeys.contains(
                            topicKey
                    )) {

                        completedForSkill.add(
                                topic
                        );

                        completedTopics++;
                    }
                }

                item.setCompletedTopics(
                        completedForSkill
                );

                int skillProgress = 0;

                if (!topics.isEmpty()) {

                    skillProgress =
                            (int) Math.round(
                                    (
                                            (double)
                                                    completedForSkill.size()
                                                    /
                                                    topics.size()
                                    ) * 100.0
                            );
                }

                item.setProgress(
                        skillProgress
                );

                boolean skillCompleted =
                        !topics.isEmpty()
                                &&
                        completedForSkill.size()
                                == topics.size();

                item.setCompleted(
                        skillCompleted
                );

                resultItems.add(
                        item
                );
            }
        }

        int overallProgress = 0;

        if (totalTopics > 0) {

            overallProgress =
                    (int) Math.round(
                            (
                                    (double)
                                            completedTopics
                                            /
                                            totalTopics
                            ) * 100.0
                    );
        }

        boolean recoveryCompleted =
                totalTopics > 0
                        &&
                completedTopics == totalTopics;

        response.setRecoveryItems(
                resultItems
        );

        response.setOverallProgress(
                overallProgress
        );

        response.setCompleted(
                recoveryCompleted
        );

        return response;
    }

    // =========================================================
    // CHECK ENTIRE RECOVERY COMPLETED
    // =========================================================

    public boolean isRecoveryCompleted(
            Long candidateId,
            Long jobId
    ) {

        List<SkillRecoveryProgress> progress =
                skillRecoveryProgressRepository
                        .findByCandidateIdAndJobId(
                                candidateId,
                                jobId
                        );

        if (progress == null ||
                progress.isEmpty()) {

            return false;
        }

        for (SkillRecoveryProgress item :
                progress) {

            if (!item.isCompleted()) {
                return false;
            }
        }

        return true;
    }

    // =========================================================
    // GET COMPLETED SKILLS
    //
    // IMPORTANT:
    // A skill is considered recovered only when ALL of its
    // recovery topics are complete.
    //
    // =========================================================

    public List<String> getCompletedSkills(
            Long candidateId,
            Long jobId
    ) {

        List<SkillRecoveryProgress> progress =
                skillRecoveryProgressRepository
                        .findByCandidateIdAndJobId(
                                candidateId,
                                jobId
                        );

        if (progress == null ||
                progress.isEmpty()) {

            return new ArrayList<>();
        }

        // -----------------------------------------------------
        // Group progress by skill
        // -----------------------------------------------------

        class SkillCounter {

            int total;
            int completed;
        }

        java.util.Map<String, SkillCounter>
                counters =
                new java.util.LinkedHashMap<>();

        for (SkillRecoveryProgress item :
                progress) {

            if (item.getSkill() == null ||
                    item.getSkill().isBlank()) {
                continue;
            }

            String skill =
                    item.getSkill().trim();

            String normalized =
                    normalizeSkill(skill);

            SkillCounter counter =
                    counters.computeIfAbsent(
                            normalized,
                            key -> new SkillCounter()
                    );

            counter.total++;

            if (item.isCompleted()) {
                counter.completed++;
            }
        }

        // -----------------------------------------------------
        // Only return fully completed skills
        // -----------------------------------------------------

        Set<String> completedSkills =
                new LinkedHashSet<>();

        for (SkillRecoveryProgress item :
                progress) {

            if (item.getSkill() == null ||
                    item.getSkill().isBlank()) {
                continue;
            }

            String skill =
                    item.getSkill().trim();

            String normalized =
                    normalizeSkill(skill);

            SkillCounter counter =
                    counters.get(normalized);

            if (counter != null &&
                    counter.total > 0 &&
                    counter.completed == counter.total) {

                completedSkills.add(
                        skill
                );
            }
        }

        return new ArrayList<>(
                completedSkills
        );
    }

    // =========================================================
    // CREATE UNIQUE KEY
    // =========================================================

    private String createKey(
            String skill,
            String topic
    ) {

        return normalizeSkill(skill)
                + "::"
                + normalizeTopic(topic);
    }

    // =========================================================
    // NORMALIZE SKILL
    // =========================================================

    private String normalizeSkill(
            String skill
    ) {

        if (skill == null) {
            return "";
        }

        return skill
                .trim()
                .toLowerCase()
                .replace("-", "")
                .replace("_", "")
                .replace(" ", "");
    }

    // =========================================================
    // NORMALIZE TOPIC
    // =========================================================

    private String normalizeTopic(
            String topic
    ) {

        if (topic == null) {
            return "";
        }

        return topic
                .trim()
                .toLowerCase()
                .replace(" ", "")
                .replace("-", "")
                .replace("_", "");
    }
}
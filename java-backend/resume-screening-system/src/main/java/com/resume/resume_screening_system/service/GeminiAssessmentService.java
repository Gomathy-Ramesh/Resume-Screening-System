        package com.resume.resume_screening_system.service;

        import com.fasterxml.jackson.core.type.TypeReference;
        import com.fasterxml.jackson.databind.ObjectMapper;

        import com.resume.resume_screening_system.entity.AssessmentQuestion;
        import com.resume.resume_screening_system.entity.Candidate;
        import com.resume.resume_screening_system.entity.Job;
        import com.resume.resume_screening_system.entity.TechnicalAssessment;

        import com.resume.resume_screening_system.repository.AssessmentQuestionRepository;
        import com.resume.resume_screening_system.repository.TechnicalAssessmentRepository;

        import com.google.genai.Client;
        import com.google.genai.types.GenerateContentConfig;
        import com.google.genai.types.GenerateContentResponse;
        import com.google.genai.types.Schema;

        import org.springframework.beans.factory.annotation.Value;
        import org.springframework.stereotype.Service;
        import org.springframework.transaction.annotation.Transactional;

        import java.util.ArrayList;
        import java.util.List;
        import java.util.Map;
        import java.util.Optional;

        @Service
        @Transactional
        public class GeminiAssessmentService {

        // =========================================================
        // REPOSITORIES
        // =========================================================

        private final TechnicalAssessmentRepository assessmentRepository;

        private final AssessmentQuestionRepository questionRepository;

        // =========================================================
        // OBJECT MAPPER
        // =========================================================

        private final ObjectMapper objectMapper;

        // =========================================================
        // GEMINI API KEY
        // =========================================================

        private final String geminiApiKey;

        // =========================================================
        // CONSTRUCTOR
        // =========================================================

        public GeminiAssessmentService(

                TechnicalAssessmentRepository assessmentRepository,

                AssessmentQuestionRepository questionRepository,

                ObjectMapper objectMapper,

                @Value("${gemini.api.key}") String geminiApiKey

        ) {

                this.assessmentRepository = assessmentRepository;

                this.questionRepository = questionRepository;

                this.objectMapper = objectMapper;

                this.geminiApiKey = geminiApiKey;
        }

        // =========================================================
        // GENERATE TECHNICAL ASSESSMENT
        // =========================================================
        //
        // Normal generation:
        //
        // If an assessment already exists for the candidate + job,
        // return the existing assessment.
        //
        // Otherwise generate a new assessment using Gemini.
        //
        // =========================================================

        public TechnicalAssessment generateAssessment(

                Candidate candidate,

                Job job

        ) {

                return generateAssessment(
                        candidate,
                        job,
                        false
                );
        }

        // =========================================================
        // GENERATE TECHNICAL ASSESSMENT
        // WITH FORCE REGENERATE OPTION
        // =========================================================
        //
        // forceRegenerate = false
        //
        //      Existing assessment -> return existing assessment
        //
        //      No existing assessment -> generate new assessment
        //
        //
        // forceRegenerate = true
        //
        //      Existing assessment -> delete it and create new one
        //
        //      No existing assessment -> create new one
        //
        // =========================================================

        public TechnicalAssessment generateAssessment(

                Candidate candidate,

                Job job,

                boolean forceRegenerate

        ) {

                // =====================================================
                // VALIDATE INPUT
                // =====================================================

                if (candidate == null) {

                throw new RuntimeException(
                        "Candidate cannot be null"
                );
                }

                if (job == null) {

                throw new RuntimeException(
                        "Job cannot be null"
                );
                }

                // =====================================================
                // GET CANDIDATE ID AND JOB ID
                // =====================================================

                Long candidateId =
                        candidate.getCandidateId();

                Long jobId =
                        job.getJobId();

                if (candidateId == null) {

                throw new RuntimeException(
                        "Candidate ID cannot be null"
                );
                }

                if (jobId == null) {

                throw new RuntimeException(
                        "Job ID cannot be null"
                );
                }

                // =====================================================
                // DEBUG INFORMATION
                // =====================================================

                System.out.println(
                        "================================================="
                );

                System.out.println(
                        "Technical Assessment Generation"
                );

                System.out.println(
                        "Candidate ID: " + candidateId
                );

                System.out.println(
                        "Job ID: " + jobId
                );

                System.out.println(
                        "Force Regenerate: " + forceRegenerate
                );

                System.out.println(
                        "================================================="
                );

                // =====================================================
                // CHECK EXISTING ASSESSMENT
                // =====================================================

                Optional<TechnicalAssessment> existingAssessment =
                        assessmentRepository
                                .findByCandidateIdAndJobId(
                                        candidateId,
                                        jobId
                                );

                // =====================================================
                // EXISTING ASSESSMENT FOUND
                // =====================================================

                if (existingAssessment.isPresent()) {

                TechnicalAssessment existing =
                        existingAssessment.get();

                System.out.println(
                        "Existing assessment found."
                );

                System.out.println(
                        "Existing Assessment ID: "
                                + existing.getId()
                );

                System.out.println(
                        "Existing Assessment Status: "
                                + existing.getStatus()
                );

                // =================================================
                // NORMAL GENERATION
                // =================================================
                //
                // Do NOT create another assessment.
                //
                // This prevents:
                //
                // duplicate key value violates unique constraint
                //
                // =================================================

                if (!forceRegenerate) {

                        System.out.println(
                                "Returning existing assessment."
                        );

                        return existing;
                }

                // =================================================
                // FORCE REGENERATE
                // =================================================

                System.out.println(
                        "Force regenerate requested."
                );

                System.out.println(
                        "Deleting existing assessment ID: "
                                + existing.getId()
                );

                assessmentRepository.delete(
                        existing
                );

                /*
                * IMPORTANT:
                *
                * Force Hibernate to execute the DELETE before
                * inserting the new assessment.
                *
                * This prevents the unique constraint on:
                *
                * candidate_id + job_id
                *
                * from conflicting with the new record.
                */

                assessmentRepository.flush();

                System.out.println(
                        "Existing assessment deleted successfully."
                );
                }

                // =====================================================
                // VALIDATE GEMINI API KEY
                // =====================================================

                if (geminiApiKey == null
                        || geminiApiKey.isBlank()) {

                throw new RuntimeException(
                        "Gemini API key is not configured"
                );
                }

                // =====================================================
                // CREATE GEMINI CLIENT
                // =====================================================

                Client client;

                try {

                client =
                        Client.builder()
                                .apiKey(geminiApiKey)
                                .build();

                } catch (Exception e) {

                throw new RuntimeException(
                        "Failed to initialize Gemini client: "
                                + e.getMessage(),
                        e
                );
                }

                // =====================================================
                // CREATE JSON SCHEMA
                // =====================================================

                Schema questionSchema =

                        Schema.builder()

                                .type("ARRAY")

                                .items(

                                        Schema.builder()

                                                .type("OBJECT")

                                                .properties(

                                                        Map.of(

                                                                "questionText",

                                                                Schema.builder()
                                                                        .type("STRING")
                                                                        .build(),

                                                                "optionA",

                                                                Schema.builder()
                                                                        .type("STRING")
                                                                        .build(),

                                                                "optionB",

                                                                Schema.builder()
                                                                        .type("STRING")
                                                                        .build(),

                                                                "optionC",

                                                                Schema.builder()
                                                                        .type("STRING")
                                                                        .build(),

                                                                "optionD",

                                                                Schema.builder()
                                                                        .type("STRING")
                                                                        .build(),

                                                                "correctAnswer",

                                                                Schema.builder()
                                                                        .type("STRING")
                                                                        .build()
                                                        )

                                                )

                                                .required(

                                                        List.of(

                                                                "questionText",

                                                                "optionA",

                                                                "optionB",

                                                                "optionC",

                                                                "optionD",

                                                                "correctAnswer"

                                                        )

                                                )

                                                .build()

                                )

                                .build();

                // =====================================================
                // GEMINI CONFIGURATION
                // =====================================================

                GenerateContentConfig config =

                        GenerateContentConfig.builder()

                                .responseMimeType(
                                        "application/json"
                                )

                                .responseSchema(
                                        questionSchema
                                )

                                .build();

                // =====================================================
                // CREATE PROMPT
                // =====================================================

                String prompt =
                        buildPrompt(
                                candidate,
                                job
                        );

                // =====================================================
                // CALL GEMINI
                // =====================================================

                GenerateContentResponse response;

                try {

                System.out.println(
                        "Calling Gemini to generate technical assessment..."
                );

                response =
                        client.models.generateContent(

                                "gemini-3.6-flash",

                                prompt,

                                config

                        );

                } catch (Exception e) {

                throw new RuntimeException(
                        "Failed to generate technical assessment using Gemini: "
                                + e.getMessage(),
                        e
                );
                }

                // =====================================================
                // GET GEMINI RESPONSE
                // =====================================================

                String jsonResponse;

                try {

                jsonResponse =
                        response.text();

                } catch (Exception e) {

                throw new RuntimeException(
                        "Failed to read Gemini assessment response: "
                                + e.getMessage(),
                        e
                );
                }

                // =====================================================
                // VALIDATE GEMINI RESPONSE
                // =====================================================

                if (jsonResponse == null
                        || jsonResponse.isBlank()) {

                throw new RuntimeException(
                        "Gemini returned an empty assessment response"
                );
                }

                System.out.println(
                        "Gemini assessment response received successfully."
                );

                // =====================================================
                // PARSE GEMINI JSON
                // =====================================================

                List<GeneratedQuestion> generatedQuestions;

                try {

                generatedQuestions =

                        objectMapper.readValue(

                                jsonResponse,

                                new TypeReference<
                                        List<GeneratedQuestion>
                                        >() {
                                }

                        );

                } catch (Exception e) {

                throw new RuntimeException(

                        "Failed to parse Gemini assessment JSON response: "
                                + e.getMessage(),

                        e

                );
                }

                // =====================================================
                // VALIDATE GENERATED QUESTIONS
                // =====================================================

                if (generatedQuestions == null
                        || generatedQuestions.isEmpty()) {

                throw new RuntimeException(
                        "Gemini did not generate any questions"
                );
                }

                // =====================================================
                // LIMIT TO 10 QUESTIONS
                // =====================================================

                if (generatedQuestions.size() > 10) {

                generatedQuestions =
                        new ArrayList<>(
                                generatedQuestions.subList(
                                        0,
                                        10
                                )
                        );
                }

                // =====================================================
                // CREATE TECHNICAL ASSESSMENT
                // =====================================================

                TechnicalAssessment assessment =
                        new TechnicalAssessment();

                assessment.setCandidateId(
                        candidateId
                );

                assessment.setJobId(
                        jobId
                );

                assessment.setStatus(
                        "NOT_STARTED"
                );

                assessment.setTotalQuestions(
                        generatedQuestions.size()
                );

                assessment.setScore(
                        null
                );

                // =====================================================
                // CREATE QUESTIONS
                // =====================================================

                List<AssessmentQuestion> questions =
                        new ArrayList<>();

                int questionNumber = 1;

                for (GeneratedQuestion generated :
                        generatedQuestions) {

                // =================================================
                // VALIDATE QUESTION TEXT
                // =================================================

                if (generated == null) {

                        continue;
                }

                if (generated.questionText == null
                        || generated.questionText.isBlank()) {

                        continue;
                }

                // =================================================
                // VALIDATE CORRECT ANSWER
                // =================================================

                String correctAnswer =
                        generated.correctAnswer;

                if (correctAnswer == null) {

                        correctAnswer = "";
                }

                correctAnswer =
                        correctAnswer
                                .trim()
                                .toUpperCase();

                // =================================================
                // VALIDATE CORRECT ANSWER VALUE
                // =================================================

                if (!correctAnswer.equals("A")
                        && !correctAnswer.equals("B")
                        && !correctAnswer.equals("C")
                        && !correctAnswer.equals("D")) {

                        System.out.println(
                                "Skipping question because correctAnswer "
                                        + "is invalid: "
                                        + correctAnswer
                        );

                        continue;
                }

                // =================================================
                // CREATE QUESTION ENTITY
                // =================================================

                AssessmentQuestion question =
                        new AssessmentQuestion();

                question.setAssessment(
                        assessment
                );

                question.setQuestionNumber(
                        questionNumber++
                );

                question.setQuestionText(
                        generated.questionText
                );

                question.setQuestionType(
                        "MCQ"
                );

                question.setOptionA(
                        generated.optionA
                );

                question.setOptionB(
                        generated.optionB
                );

                question.setOptionC(
                        generated.optionC
                );

                question.setOptionD(
                        generated.optionD
                );

                question.setCorrectAnswer(
                        correctAnswer
                );

                // =================================================
                // CANDIDATE ANSWER
                // =================================================

                question.setCandidateAnswer(
                        null
                );

                // =================================================
                // EVALUATION RESULT
                // =================================================

                question.setCorrect(
                        null
                );

                // =================================================
                // MARKS
                // =================================================

                question.setMarks(
                        1.0
                );

                questions.add(
                        question
                );
                }

                // =====================================================
                // VALIDATE FINAL QUESTION LIST
                // =====================================================

                if (questions.isEmpty()) {

                throw new RuntimeException(
                        "No valid questions were generated by Gemini"
                );
                }

                // =====================================================
                // UPDATE TOTAL QUESTIONS
                // =====================================================

                assessment.setTotalQuestions(
                        questions.size()
                );

                // =====================================================
                // ATTACH QUESTIONS
                // =====================================================

                assessment.setQuestions(
                        questions
                );

                // =====================================================
                // FINAL DATABASE SAFETY CHECK
                // =====================================================
                //
                // This protects against another request creating the
                // same candidate/job assessment while Gemini was
                // generating the questions.
                //
                // =====================================================

                Optional<TechnicalAssessment> assessmentBeforeSave =
                        assessmentRepository
                                .findByCandidateIdAndJobId(
                                        candidateId,
                                        jobId
                                );

                if (assessmentBeforeSave.isPresent()) {

                /*
                * If force regeneration was requested, this could
                * indicate another request generated an assessment
                * concurrently.
                *
                * Returning the existing record is safer than
                * violating the database unique constraint.
                */

                System.out.println(
                        "Assessment already exists before save. "
                                + "Returning existing assessment ID: "
                                + assessmentBeforeSave.get().getId()
                );

                return assessmentBeforeSave.get();
                }

                // =====================================================
                // SAVE ASSESSMENT
                // =====================================================

                try {

                System.out.println(
                        "Saving new technical assessment..."
                );

                TechnicalAssessment savedAssessment =
                        assessmentRepository.save(
                                assessment
                        );

                System.out.println(
                        "Technical assessment saved successfully."
                );

                System.out.println(
                        "Assessment ID: "
                                + savedAssessment.getId()
                );

                System.out.println(
                        "Total Questions: "
                                + savedAssessment.getTotalQuestions()
                );

                return savedAssessment;

                } catch (Exception e) {

                throw new RuntimeException(

                        "Failed to save technical assessment to database: "
                                + e.getMessage(),

                        e

                );
                }
        }

        // =========================================================
        // GET EXISTING ASSESSMENT
        // =========================================================
        //
        // Used by:
        //
        // GET /technical-assessments/{candidateId}/{jobId}
        //
        // =========================================================

        public Optional<TechnicalAssessment> getAssessment(

                Long candidateId,

                Long jobId

        ) {

                return assessmentRepository
                        .findByCandidateIdAndJobId(
                                candidateId,
                                jobId
                        );
        }

        // =========================================================
        // BUILD AI PROMPT
        // =========================================================

        private String buildPrompt(

                Candidate candidate,

                Job job

        ) {

                // =====================================================
                // CANDIDATE SKILLS
                // =====================================================

                String skills =

                        candidate.getSkills() != null
                                ? candidate.getSkills()
                                : "Not available";

                // =====================================================
                // CANDIDATE EDUCATION
                // =====================================================

                String education =

                        candidate.getEducation() != null
                                ? candidate.getEducation()
                                : "Not available";

                // =====================================================
                // CANDIDATE EXPERIENCE
                // =====================================================

                String experience =

                        candidate.getExperience() != null
                                ? candidate.getExperience().toString()
                                : "Not available";

                // =====================================================
                // JOB DESCRIPTION
                // =====================================================

                String jobDescription =

                        job.getJobDescription() != null
                                ? job.getJobDescription()
                                : "Not available";

                // =====================================================
                // JOB TITLE
                // =====================================================

                String jobTitle =

                        job.getJobTitle() != null
                                ? job.getJobTitle()
                                : "Not available";

                // =====================================================
                // GEMINI PROMPT
                // =====================================================

                return """

                        You are an expert technical recruitment assessment generator.

                        Generate exactly 10 technical multiple-choice questions
                        for the candidate based on the job requirements.

                        JOB TITLE:
                        %s

                        JOB DESCRIPTION:
                        %s

                        CANDIDATE SKILLS:
                        %s

                        CANDIDATE EDUCATION:
                        %s

                        CANDIDATE EXPERIENCE:
                        %s years

                        REQUIREMENTS:

                        1. Generate exactly 10 questions.

                        2. Questions must be technical.

                        3. Questions must be relevant to the job description.

                        4. Use the candidate's skills to determine appropriate difficulty.

                        5. Mix conceptual and practical technical questions.

                        6. Each question must have exactly four options.

                        7. Only one option must be correct.

                        8. correctAnswer must contain only A, B, C, or D.

                        9. Do not include explanations.

                        10. Do not include markdown.

                        11. Do not include numbering in questionText.

                        12. Do not generate questions unrelated to the job.

                        13. Return ONLY the requested JSON array.

                        """.formatted(

                        jobTitle,

                        jobDescription,

                        skills,

                        education,

                        experience

                );
        }

        // =========================================================
        // INTERNAL GEMINI QUESTION MODEL
        // =========================================================

        private static class GeneratedQuestion {

                public String questionText;

                public String optionA;

                public String optionB;

                public String optionC;

                public String optionD;

                public String correctAnswer;
        }
        }
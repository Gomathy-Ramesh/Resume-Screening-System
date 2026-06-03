package com.resume.resume_screening_system.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AIMatchingService {

    // =========================
    // CALCULATE AI MATCH SCORE
    // =========================

    public double calculateSimilarity(

            String resumeText,
            String jobDescription

    ) {

        // =========================
        // CLEAN TEXT
        // =========================

        resumeText = preprocessText(resumeText);

        jobDescription = preprocessText(jobDescription);

        // =========================
        // TOKENIZE
        // =========================

        List<String> resumeWords =
                Arrays.asList(
                        resumeText.split("\\s+")
                );

        List<String> jobWords =
                Arrays.asList(
                        jobDescription.split("\\s+")
                );

        // =========================
        // CREATE VOCABULARY
        // =========================

        Set<String> vocabulary =
                new HashSet<>();

        vocabulary.addAll(resumeWords);

        vocabulary.addAll(jobWords);

        // =========================
        // TERM FREQUENCY
        // =========================

        Map<String, Double> resumeTF =
                calculateTF(resumeWords);

        Map<String, Double> jobTF =
                calculateTF(jobWords);

        // =========================
        // TF-IDF VECTORS
        // =========================

        List<Double> resumeVector =
                new ArrayList<>();

        List<Double> jobVector =
                new ArrayList<>();

        for (String word : vocabulary) {

            double idf =
                    calculateIDF(

                            word,

                            resumeWords,

                            jobWords
                    );

            resumeVector.add(

                    resumeTF.getOrDefault(
                            word,
                            0.0
                    ) * idf
            );

            jobVector.add(

                    jobTF.getOrDefault(
                            word,
                            0.0
                    ) * idf
            );
        }

        // =========================
        // COSINE SIMILARITY
        // =========================

        double similarity =
                cosineSimilarity(

                        resumeVector,

                        jobVector
                );

        // =========================
        // CONVERT TO PERCENTAGE
        // =========================

        return Math.round(
                similarity * 10000.0
        ) / 100.0;
    }

    // =========================
    // PREPROCESS TEXT
    // =========================

    private String preprocessText(
            String text
    ) {

        return text.toLowerCase()

                .replaceAll(
                        "[^a-zA-Z ]",
                        ""
                )

                .replaceAll(
                        "\\s+",
                        " "
                )

                .trim();
    }

    // =========================
    // TERM FREQUENCY
    // =========================

    private Map<String, Double> calculateTF(

            List<String> words

    ) {

        Map<String, Double> tf =
                new HashMap<>();

        for (String word : words) {

            tf.put(

                    word,

                    tf.getOrDefault(
                            word,
                            0.0
                    ) + 1
            );
        }

        int totalWords = words.size();

        for (String word : tf.keySet()) {

            tf.put(

                    word,

                    tf.get(word)
                            / totalWords
            );
        }

        return tf;
    }

    // =========================
    // INVERSE DOCUMENT FREQUENCY
    // =========================

    private double calculateIDF(

            String word,

            List<String> resumeWords,

            List<String> jobWords

    ) {

        int documentCount = 0;

        if (resumeWords.contains(word)) {

            documentCount++;
        }

        if (jobWords.contains(word)) {

            documentCount++;
        }

        return Math.log(
                (2.0 + 1)
                        / (documentCount + 1)
        ) + 1;
    }

    // =========================
    // COSINE SIMILARITY
    // =========================

    private double cosineSimilarity(

            List<Double> vector1,

            List<Double> vector2

    ) {

        double dotProduct = 0.0;

        double norm1 = 0.0;

        double norm2 = 0.0;

        for (int i = 0;
             i < vector1.size();
             i++) {

            dotProduct +=
                    vector1.get(i)
                            * vector2.get(i);

            norm1 +=
                    Math.pow(
                            vector1.get(i),
                            2
                    );

            norm2 +=
                    Math.pow(
                            vector2.get(i),
                            2
                    );
        }

        if (norm1 == 0 || norm2 == 0) {

            return 0;
        }

        return dotProduct /

                (
                        Math.sqrt(norm1)
                                *
                                Math.sqrt(norm2)
                );
    }
}
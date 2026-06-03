package com.resume.resume_screening_system.service;

import com.resume.resume_screening_system.dto.PythonResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.stereotype.Service;

import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import org.springframework.web.client.RestTemplate;

import java.io.File;

@Service
public class PythonNlpService {

    @Autowired
    private RestTemplate restTemplate;

    // =========================
    // ANALYZE RESUME
    // =========================

    public PythonResponse analyzeResume(

            File file,

            String jobDescription,

            String jobTitle

    ) {

        try {

            System.out.println(
                    "================================="
            );

            System.out.println(
                    "CALLING FASTAPI NLP ENGINE"
            );

            System.out.println(
                    "Resume File: "
                            + file.getName()
            );

            System.out.println(
                    "Job Title: "
                            + jobTitle
            );

            // =========================
            // FASTAPI URL
            // =========================

            String pythonApiUrl =
                    "http://127.0.0.1:8000/analyze";

            // =========================
            // HEADERS
            // =========================

            HttpHeaders headers =
                    new HttpHeaders();

            headers.setContentType(
                    MediaType.MULTIPART_FORM_DATA
            );

            // =========================
            // REQUEST BODY
            // =========================

            MultiValueMap<String, Object> body =
                    new LinkedMultiValueMap<>();

            body.add(
                    "file",
                    new FileSystemResource(file)
            );

            body.add(
                    "job_description",
                    jobDescription
            );

            body.add(
                    "job_title",
                    jobTitle
            );

            // =========================
            // REQUEST ENTITY
            // =========================

            HttpEntity<MultiValueMap<String, Object>>
                    requestEntity =

                    new HttpEntity<>(
                            body,
                            headers
                    );

            // =========================
            // API CALL
            // =========================

            ResponseEntity<PythonResponse>
                    response =

                    restTemplate.exchange(

                            pythonApiUrl,

                            HttpMethod.POST,

                            requestEntity,

                            PythonResponse.class
                    );

            // =========================
            // RESPONSE
            // =========================

            PythonResponse result =
                    response.getBody();

            if (result == null) {

                System.out.println(
                        "FASTAPI RESPONSE IS NULL"
                );

                return null;
            }

            // =========================
            // DEBUG LOGS
            // =========================

            System.out.println(
                    "FASTAPI RESPONSE RECEIVED"
            );

            System.out.println(
                    "Candidate Name: "
                            + result.getName()
            );

            System.out.println(
                    "Email: "
                            + result.getEmail()
            );

            System.out.println(
                    "Score: "
                            + result.getScore()
            );

            System.out.println(
                    "Matched Skills: "
                            + result.getMatchedSkillsCount()
            );

            System.out.println(
                    "================================="
            );

            return result;

        } catch (Exception e) {

            System.out.println(
                    "FASTAPI NLP ERROR"
            );

            e.printStackTrace();

            return null;
        }
    }
}
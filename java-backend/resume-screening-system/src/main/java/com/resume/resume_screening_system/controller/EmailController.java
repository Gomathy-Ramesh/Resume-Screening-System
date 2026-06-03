package com.resume.resume_screening_system.controller;

import com.resume.resume_screening_system.service.EmailReaderService;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmailController {

    @Autowired
    private EmailReaderService
            emailReaderService;

    // =========================
    // FETCH EMAILS API
    // =========================

    @GetMapping("/fetch-emails")
    public String fetchEmails() {

        emailReaderService.readEmails();

        return "Emails fetched successfully";
    }
}
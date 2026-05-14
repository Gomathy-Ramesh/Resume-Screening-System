package com.resume.resume_screening_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendEmail(
            String toEmail,
            String candidateName,
            Double score,
            String rank
    ) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        // RECEIVER EMAIL
        message.setTo(toEmail);

        // EMAIL SUBJECT
        message.setSubject(
                "Resume Uploaded Successfully"
        );

        // EMAIL BODY
        message.setText(
                "Hello " + candidateName + ",\n\n"
                + "Your resume has been uploaded successfully.\n\n"
                + "AI Screening Result:\n"
                + "Score: " + score + "\n"
                + "Rank: " + rank + "\n\n"
                + "Thank You."
        );

        // SEND EMAIL
        mailSender.send(message);
    }
}
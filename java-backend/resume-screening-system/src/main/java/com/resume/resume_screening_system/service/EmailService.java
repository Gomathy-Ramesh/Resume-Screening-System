package com.resume.resume_screening_system.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Value("${sendgrid.api.key}")
    private String sendGridApiKey;

    @Value("${sendgrid.from.email}")
    private String fromEmail;


    // ======================================================
    // SEND EMAIL USING SENDGRID
    // ======================================================

    private void sendMailUsingSendGrid(
            String to,
            String subject,
            String body
    ) {

        try {

            Email from = new Email(fromEmail);
            Email recipient = new Email(to);

            Content content =
                    new Content(
                            "text/plain",
                            body
                    );

            Mail mail =
                    new Mail(
                            from,
                            subject,
                            recipient,
                            content
                    );

            SendGrid sendGrid =
                    new SendGrid(sendGridApiKey);

            Request request =
                    new Request();

            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response =
                    sendGrid.api(request);

            System.out.println(
                    "SendGrid Status Code : "
                            + response.getStatusCode()
            );

            System.out.println(
                    "SendGrid Response : "
                            + response.getBody()
            );

            if (response.getStatusCode() >= 200
                    && response.getStatusCode() < 300) {

                System.out.println(
                        "Email sent successfully to : "
                                + to
                );

            } else {

                System.out.println(
                        "SendGrid failed to send email."
                );
            }

        } catch (Exception e) {

            System.out.println(
                    "SENDGRID ERROR"
            );

            e.printStackTrace();
        }
    }


    // ======================================================
    // SHORTLISTED / SELECTED EMAIL
    // ======================================================

    public void sendEmail(
            String toEmail,
            String candidateName,
            String appliedPosition,
            String status
    ) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(toEmail);


        // ==================================================
        // SHORTLISTED
        // ==================================================

        if (status.equalsIgnoreCase("Shortlisted")) {

            message.setSubject(
                    "Application Shortlisted | "
                            + appliedPosition
            );

            message.setText(

                    "Dear " + candidateName + ",\n\n"

                            + "Greetings from Salem Infotech.\n\n"

                            + "Thank you for applying for the "
                            + appliedPosition
                            + " position at our organization.\n\n"

                            + "We are pleased to inform you that "
                            + "your profile has been shortlisted "
                            + "for the next stage of our recruitment process.\n\n"

                            + "Our recruitment team will contact "
                            + "you shortly with further details "
                            + "regarding the interview process.\n\n"

                            + "We appreciate your interest in "
                            + "joining Salem Infotech.\n\n"

                            + "Regards,\n"
                            + "HR Team\n"
                            + "Salem Infotech"
            );
        }


        // ==================================================
        // SELECTED
        // ==================================================

        else if (status.equalsIgnoreCase("Selected")) {

            message.setSubject(
                    "Congratulations! You Have Been Selected | "
                            + appliedPosition
            );

            message.setText(

                    "Dear " + candidateName + ",\n\n"

                            + "Congratulations!\n\n"

                            + "We are delighted to inform you that "
                            + "you have been selected for the "
                            + appliedPosition
                            + " position at Salem Infotech.\n\n"

                            + "Your performance throughout the "
                            + "selection process was highly appreciated.\n\n"

                            + "Our HR team will contact you shortly "
                            + "with the next steps and onboarding details.\n\n"

                            + "We look forward to having you "
                            + "on our team.\n\n"

                            + "Regards,\n"
                            + "HR Team\n"
                            + "Salem Infotech"
            );
        }

        else {
            return;
        }


        sendMailUsingSendGrid(
                toEmail,
                message.getSubject(),
                message.getText()
        );
    }


    // ======================================================
    // INTERVIEW SCHEDULED EMAIL
    // ======================================================

    public void sendInterviewScheduledEmail(
            String candidateEmail,
            String candidateName,
            String appliedPosition,
            String roundName,
            String interviewType,
            String interviewerName,
            String interviewerEmail,
            LocalDateTime interviewDate,
            Integer durationMinutes,
            String interviewMode,
            String meetingLink,
            String location,
            String notes
    ) {

        DateTimeFormatter dateFormatter =
                DateTimeFormatter.ofPattern(
                        "dd MMM yyyy"
                );

        DateTimeFormatter timeFormatter =
                DateTimeFormatter.ofPattern(
                        "hh:mm a"
                );


        String formattedDate =
                interviewDate != null
                        ? interviewDate.format(dateFormatter)
                        : "Not specified";

        String formattedTime =
                interviewDate != null
                        ? interviewDate.format(timeFormatter)
                        : "Not specified";


        StringBuilder body =
                new StringBuilder();


        body.append(
                "Dear "
        )
        .append(candidateName)
        .append(",\n\n");


        body.append(
                "Greetings from Salem Infotech.\n\n"
        );


        body.append(
                "We are pleased to inform you that "
                + "your interview has been scheduled "
                + "as part of the recruitment process.\n\n"
        );


        body.append(
                "INTERVIEW DETAILS\n"
        );

        body.append(
                "----------------------------------------\n"
        );


        body.append(
                "Position       : "
        )
        .append(appliedPosition)
        .append("\n");


        body.append(
                "Round          : "
        )
        .append(
                roundName != null
                        ? roundName
                        : "HR Interview"
        )
        .append("\n");


        body.append(
                "Interview Type : "
        )
        .append(
                interviewType != null
                        ? interviewType
                        : "HR"
        )
        .append("\n");


        body.append(
                "Date           : "
        )
        .append(formattedDate)
        .append("\n");


        body.append(
                "Time           : "
        )
        .append(formattedTime)
        .append("\n");


        body.append(
                "Duration       : "
        )
        .append(
                durationMinutes != null
                        ? durationMinutes + " minutes"
                        : "Not specified"
        )
        .append("\n");


        body.append(
                "Interview Mode : "
        )
        .append(
                interviewMode != null
                        ? interviewMode
                        : "Not specified"
        )
        .append("\n");


        if (interviewerName != null
                && !interviewerName.trim().isEmpty()) {

            body.append(
                    "Interviewer     : "
            )
            .append(interviewerName)
            .append("\n");
        }


        if (interviewerEmail != null
                && !interviewerEmail.trim().isEmpty()) {

            body.append(
                    "Interviewer Email: "
            )
            .append(interviewerEmail)
            .append("\n");
        }


        body.append(
                "\n"
        );


        // ==================================================
        // ONLINE INTERVIEW
        // ==================================================

        if ("ONLINE".equalsIgnoreCase(interviewMode)) {

            body.append(
                    "Meeting Link   : "
            )
            .append(
                    meetingLink != null
                            ? meetingLink
                            : "Will be provided separately"
            )
            .append("\n");
        }


        // ==================================================
        // OFFLINE INTERVIEW
        // ==================================================

        else if ("OFFLINE".equalsIgnoreCase(interviewMode)) {

            body.append(
                    "Interview Location : "
            )
            .append(
                    location != null
                            ? location
                            : "Will be provided separately"
            )
            .append("\n");
        }


        if (notes != null
                && !notes.trim().isEmpty()) {

            body.append(
                    "\nAdditional Information:\n"
            );

            body.append(
                    notes
            );

            body.append(
                    "\n"
            );
        }


        body.append(
                "\nPlease make sure you are available "
                + "at the scheduled date and time."
                + "\n\n"
        );


        body.append(
                "We wish you the very best for your interview.\n\n"
        );


        body.append(
                "Regards,\n"
                + "HR Team\n"
                + "Salem Infotech"
        );


        String subject =
                "Interview Scheduled | "
                        + appliedPosition
                        + " | "
                        + formattedDate;


        sendMailUsingSendGrid(
                candidateEmail,
                subject,
                body.toString()
        );
    }


    // ======================================================
    // HR SELECTION NOTIFICATION
    // ======================================================

    public void sendSelectionNotificationToHR(
            String candidateName,
            String email,
            String appliedPosition,
            Double score
    ) {

        SimpleMailMessage hrMessage =
                new SimpleMailMessage();

        hrMessage.setFrom(fromEmail);

        hrMessage.setTo(
                "resumeiqscreening@gmail.com"
        );

        hrMessage.setSubject(
                "Candidate Selected | "
                        + appliedPosition
        );

        hrMessage.setText(

                "Dear HR Team,\n\n"

                        + "A candidate has been selected.\n\n"

                        + "Candidate Name : "
                        + candidateName + "\n\n"

                        + "Email Address : "
                        + email + "\n\n"

                        + "Applied Position : "
                        + appliedPosition + "\n\n"

                        + "Final Screening Score : "
                        + score + "%\n\n"

                        + "Regards,\n"
                        + "Recruitment Team\n"
                        + "Salem Infotech"
        );


        sendMailUsingSendGrid(
                "resumeiqscreening@gmail.com",
                hrMessage.getSubject(),
                hrMessage.getText()
        );
    }


    // ======================================================
    // FORGOT PASSWORD EMAIL
    // ======================================================

    public void sendForgotPasswordEmail(
            String email,
            String resetLink
    ) {

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(email);

        message.setSubject(
                "Password Reset Request"
        );

        message.setText(

                "Hello,\n\n"

                        + "We received a request to reset your password.\n\n"

                        + "Click the link below to reset your password:\n\n"

                        + resetLink

                        + "\n\n"

                        + "If you did not request this, "
                        + "you can safely ignore this email.\n\n"

                        + "Regards,\n"
                        + "Resume Screening Team"
        );


        sendMailUsingSendGrid(
                email,
                message.getSubject(),
                message.getText()
        );
    }
    
}
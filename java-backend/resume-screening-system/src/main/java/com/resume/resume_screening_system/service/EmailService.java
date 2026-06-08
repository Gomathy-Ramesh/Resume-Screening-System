package com.resume.resume_screening_system.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${GMAIL_EMAIL}")
    private String fromEmail;

    // =========================================
    // CANDIDATE EMAIL
    // =========================================

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
                            + "for the next stage of the recruitment process.\n\n"

                            + "Our recruitment team will contact "
                            + "you shortly regarding the upcoming interview process.\n\n"

                            + "Regards,\n"
                            + "HR Team\n"
                            + "Salem Infotech"
            );
        }

        else if (status.equalsIgnoreCase("Selected")) {

            message.setSubject(
                    "Selection Confirmation | "
                            + appliedPosition
            );

            message.setText(

                    "Dear " + candidateName + ",\n\n"

                            + "Congratulations!\n\n"

                            + "You have been selected for the "
                            + appliedPosition
                            + " position at Salem Infotech.\n\n"

                            + "Our HR team will contact you shortly "
                            + "with onboarding details.\n\n"

                            + "Regards,\n"
                            + "HR Team\n"
                            + "Salem Infotech"
            );
        }

       try {

    System.out.println("Sending Mail To: " + toEmail);

    System.out.println("Trying SMTP Connection...");

    System.out.println("FROM EMAIL = " + fromEmail);

    System.out.println(
            "APP PASSWORD LOADED = "
                    + (System.getenv("GMAIL_APP_PASSWORD") != null)
    );

    mailSender.send(message);

    System.out.println("SMTP Success");

    System.out.println("Mail Sent Successfully");

} catch (Exception e) {

    System.out.println("=================================");
    System.out.println("MAIL ERROR OCCURRED");
    System.out.println("Exception Class : " + e.getClass().getName());
    System.out.println("Message         : " + e.getMessage());

    if (e.getCause() != null) {
        System.out.println("Cause           : " + e.getCause());
    }

    System.out.println("===== FULL STACK TRACE =====");
    e.printStackTrace();

    System.out.println("=================================");
}
    }

    // =========================================
    // HR SELECTION NOTIFICATION
    // =========================================

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

        mailSender.send(hrMessage);
    }

    // =========================================
    // FORGOT PASSWORD EMAIL
    // =========================================

    public void sendForgotPasswordEmail(
            String email
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

                        + "A password reset request was received "
                        + "for your Selectra Admin account.\n\n"

                        + "Username : admin\n"
                        + "Password : admin123\n\n"

                        + "Please login and change your password "
                        + "after signing in.\n\n"

                        + "Regards,\n"
                        + "Selectra Team"
        );

        mailSender.send(message);
    }
}
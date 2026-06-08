package com.resume.resume_screening_system.service;

import jakarta.mail.*;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.search.FlagTerm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.Properties;

@Service
public class EmailFetchService {

public EmailFetchService() {

    System.out.println(
            "EmailFetchService INITIALIZED"
    );
}

@Value("${gmail.reader.email}")
private String username;

@Value("${gmail.reader.password}")
private String password;

@Autowired
private ResumeProcessorService resumeProcessorService;

// =========================
// FETCH EMAILS EVERY 1 MINUTE
// =========================

@Scheduled(fixedRate = 60000)
public void fetchEmails() {

    System.out.println(
            "SCHEDULER RUNNING"
    );

    try {

        System.out.println(
                "================================="
        );

        System.out.println(
                "CHECKING GMAIL INBOX"
        );

        System.out.println(
                "================================="
        );

        // =========================
        // GMAIL IMAP CONFIG
        // =========================

        Properties props = new Properties();

        props.put(
                "mail.store.protocol",
                "imaps"
        );

        Session session =
                Session.getInstance(props);

        Store store =
                session.getStore("imaps");

        store.connect(
                "imap.gmail.com",
                username,
                password
        );

        // =========================
        // OPEN INBOX
        // =========================

        Folder inbox =
                store.getFolder("INBOX");

        inbox.open(Folder.READ_WRITE);

        // =========================
        // FETCH UNREAD EMAILS
        // =========================

        Message[] messages =
                inbox.search(

                        new FlagTerm(

                                new Flags(
                                        Flags.Flag.SEEN
                                ),

                                false
                        )
                );

        System.out.println(
                "Unread Emails Found: "
                        + messages.length
        );

        // =========================
        // PROCESS EMAILS
        // =========================

        for (Message message : messages) {

            try {

                System.out.println(
                        "================================="
                );

                System.out.println(
                        "EMAIL SUBJECT: "
                                + message.getSubject()
                );

                String appliedPosition =
                        message.getSubject();

                if (
                        message.isMimeType(
                                "multipart/*"
                        )
                ) {

                    Multipart multipart =
                            (Multipart) message.getContent();

                    for (
                            int i = 0;
                            i < multipart.getCount();
                            i++
                    ) {

                        BodyPart bodyPart =
                                multipart.getBodyPart(i);

                        if (
                                Part.ATTACHMENT.equalsIgnoreCase(
                                        bodyPart.getDisposition()
                                )
                        ) {

                            MimeBodyPart mimePart =
                                    (MimeBodyPart) bodyPart;

                            String fileName =
                                    mimePart.getFileName();

                            System.out.println(
                                    "Attachment Found: "
                                            + fileName
                            );

                            if (
                                    fileName != null
                                            &&
                                            (
                                                    fileName.toLowerCase().endsWith(".pdf")
                                                            ||
                                                            fileName.toLowerCase().endsWith(".docx")
                                            )
                            ) {

                                File uploadDir =
                                        new File("uploads");

                                if (!uploadDir.exists()) {

                                    uploadDir.mkdirs();
                                }

                                File savedFile =
                                        new File(
                                                uploadDir,
                                                System.currentTimeMillis()
                                                        + "_"
                                                        + fileName
                                        );

                                mimePart.saveFile(savedFile);

                                System.out.println(
                                        "Resume Saved Successfully"
                                );

                                resumeProcessorService.processResume(

                                        savedFile,

                                        appliedPosition
                                );

                                System.out.println(
                                        "Resume Processed Successfully"
                                );
                            }

                            else {

                                System.out.println(
                                        "Skipped Non Resume File"
                                );
                            }
                        }
                    }
                }

                // =========================
                // MARK EMAIL AS READ
                // =========================

                message.setFlag(
                        Flags.Flag.SEEN,
                        true
                );

                System.out.println(
                        "Email Marked As Read"
                );

            } catch (Exception emailException) {

                System.out.println(
                        "ERROR PROCESSING EMAIL"
                );

                emailException.printStackTrace();
            }
        }

        // =========================
        // CLOSE CONNECTIONS
        // =========================

        inbox.close(false);

        store.close();

        System.out.println(
                "EMAIL FETCH COMPLETED"
        );

    } catch (Exception e) {

        System.out.println(
                "EMAIL FETCH FAILED"
        );

        e.printStackTrace();
    }
}

}
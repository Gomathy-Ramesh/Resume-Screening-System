package com.resume.resume_screening_system.service;

import jakarta.mail.*;
import jakarta.mail.search.FlagTerm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;

import java.util.Properties;

@Service
public class EmailReaderService {

    @Autowired
    private ResumeProcessorService
            resumeProcessorService;

    // =========================
    // GMAIL CONFIG
    // =========================

    private final String username =
            "samsungtvat104@gmail.com";

    private final String password =
            "ngfpxyawsjuhbwph";

    // =========================
    // READ EMAILS
    // =========================

    public void readEmails() {

        try {

            // =========================
            // IMAP PROPERTIES
            // =========================

            Properties properties =
                    new Properties();

            properties.put(
                    "mail.store.protocol",
                    "imaps"
            );

            // =========================
            // CREATE SESSION
            // =========================

            Session session =
                    Session.getDefaultInstance(
                            properties,
                            null
                    );

            // =========================
            // CONNECT TO GMAIL
            // =========================

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

            inbox.open(
                    Folder.READ_WRITE
            );

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
                    "Unread Emails: "
                            + messages.length
            );

            // =========================
            // LOOP EMAILS
            // =========================

            for (Message message : messages) {

                // =========================
                // SUBJECT
                // =========================

                String subject =
                        message.getSubject();

                if (subject == null) {

                    subject = "";
                }

                System.out.println(
                        "Subject: "
                                + subject
                );

                // =========================
                // EXTRACT APPLIED POSITION
                // =========================

                String appliedPosition = "";

                String lowerSubject =
                        subject.toLowerCase();

                if (
                        lowerSubject.contains(
                                "java developer"
                        )
                ) {

                    appliedPosition =
                            "Java Developer";

                } else if (
                        lowerSubject.contains(
                                "python developer"
                        )
                ) {

                    appliedPosition =
                            "Python Developer";

                } else if (
                        lowerSubject.contains(
                                "frontend developer"
                        )
                ) {

                    appliedPosition =
                            "Frontend Developer";

                } else if (
                        lowerSubject.contains(
                                "machine learning engineer"
                        )
                ) {

                    appliedPosition =
                            "Machine Learning Engineer";

                } else if (
                        lowerSubject.contains(
                                "ai engineer"
                        )
                ) {

                    appliedPosition =
                            "AI Engineer";

                } else if (
                        lowerSubject.contains(
                                "software developer"
                        )
                ) {

                    appliedPosition =
                            "Software Developer";
                }

                System.out.println(
                        "Applied Position: "
                                + appliedPosition
                );

                // =========================
                // CHECK ATTACHMENTS
                // =========================

                if (
                        message.isMimeType(
                                "multipart/*"
                        )
                ) {

                    Multipart multipart =
                            (Multipart)
                                    message.getContent();

                    for (
                            int i = 0;
                            i < multipart.getCount();
                            i++
                    ) {

                        BodyPart bodyPart =
                                multipart.getBodyPart(i);

                        String fileName =
                                bodyPart.getFileName();

                        // =========================
                        // CHECK FILE EXISTS
                        // =========================

                        if (fileName != null) {

                            String lowerFileName =
                                    fileName.toLowerCase();

                            // =========================
                            // RESUME RULES
                            // =========================

                            boolean validResume =

                                    lowerFileName.contains("resume")
                                            ||
                                            lowerFileName.contains("cv");

                            boolean validExtension =

                                    lowerFileName.endsWith(".pdf")
                                            ||
                                            lowerFileName.endsWith(".docx");

                            // =========================
                            // VALID RESUME
                            // =========================

                            if (
                                    validResume
                                            &&
                                            validExtension
                            ) {

                                System.out.println(
                                        "Resume Found: "
                                                + fileName
                                );

                                File savedFile =
                                        saveAttachment(

                                                bodyPart,

                                                fileName
                                        );

                                if (savedFile != null) {

                                    // =========================
                                    // PROCESS RESUME
                                    // =========================

                                    resumeProcessorService
                                            .processResume(

                                                    savedFile,

                                                    appliedPosition
                                            );
                                }
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
            }

            // =========================
            // CLOSE
            // =========================

            inbox.close(false);

            store.close();

        } catch (Exception e) {

            e.printStackTrace();
        }
    }

    // =========================
    // SAVE ATTACHMENT
    // =========================

    private File saveAttachment(

            BodyPart bodyPart,

            String fileName

    ) {

        try {

            // =========================
            // CREATE UPLOADS FOLDER
            // =========================

            String uploadDir =
                    System.getProperty("user.dir")
                            + File.separator
                            + "uploads";

            File directory =
                    new File(uploadDir);

            if (!directory.exists()) {

                directory.mkdirs();
            }

            // =========================
            // SAVE FILE
            // =========================

            File file =
                    new File(

                            uploadDir
                                    + File.separator
                                    + fileName
                    );

            FileOutputStream outputStream =
                    new FileOutputStream(file);

            bodyPart.getInputStream()
                    .transferTo(outputStream);

            outputStream.close();

            System.out.println(
                    "Saved: "
                            + file.getAbsolutePath()
            );

            return file;

        } catch (Exception e) {

            e.printStackTrace();

            return null;
        }
    }
}
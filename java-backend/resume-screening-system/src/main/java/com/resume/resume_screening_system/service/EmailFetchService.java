package com.resume.resume_screening_system.service;

import jakarta.mail.*;
import jakarta.mail.internet.MimeBodyPart;
import jakarta.mail.search.FlagTerm;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
// import org.springframework.scheduling.annotation.Scheduled;
// import org.springframework.stereotype.Service;

import java.io.File;
import java.util.Properties;

//@Service
public class EmailFetchService {

    @Value("${spring.mail.username}")
    private String username;

    @Value("${spring.mail.password}")
    private String password;

    @Autowired
    private ResumeProcessorService resumeProcessorService;

    // =========================
    // DISABLED EMAIL FETCH SERVICE
    // =========================

    //@Scheduled(fixedRate = 60000)
    public void fetchEmails() {

        try {

            System.out.println(
                    "================================="
            );

            System.out.println(
                    "EMAIL FETCH SERVICE DISABLED"
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

            Message[] messages =
                    inbox.search(

                            new FlagTerm(

                                    new Flags(
                                            Flags.Flag.SEEN
                                    ),

                                    false
                            )
                    );

            for (Message message : messages) {

                try {

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

                                    resumeProcessorService.processResume(

                                            savedFile,

                                            appliedPosition
                                    );
                                }
                            }
                        }
                    }

                    message.setFlag(
                            Flags.Flag.SEEN,
                            true
                    );

                } catch (Exception emailException) {

                    emailException.printStackTrace();
                }
            }

            inbox.close(false);

            store.close();

        } catch (Exception e) {

            e.printStackTrace();
        }
    }
}
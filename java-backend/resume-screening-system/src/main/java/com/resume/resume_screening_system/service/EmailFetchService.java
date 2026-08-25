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


    // ======================================================
    // GMAIL CONFIGURATION
    // ======================================================

    @Value("${gmail.reader.email}")
    private String username;

    @Value("${gmail.reader.password}")
    private String password;


    // ======================================================
    // RESUME PROCESSOR
    // ======================================================

    @Autowired
    private ResumeProcessorService resumeProcessorService;


    // ======================================================
    // FETCH EMAILS EVERY 1 MINUTE
    // ======================================================

    @Scheduled(fixedDelay = 60000)
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


            // ==================================================
            // GMAIL IMAP CONFIG
            // ==================================================

            Properties props =
                    new Properties();

            props.put(
                    "mail.store.protocol",
                    "imaps"
            );

            props.put(
                    "mail.imaps.host",
                    "imap.gmail.com"
            );

            props.put(
                    "mail.imaps.port",
                    "993"
            );

            props.put(
                    "mail.imaps.ssl.enable",
                    "true"
            );


            // ==================================================
            // CREATE SESSION
            // ==================================================

            Session session =
                    Session.getInstance(
                            props
                    );


            // ==================================================
            // CONNECT TO GMAIL
            // ==================================================

            System.out.println(
                    "Connecting to Gmail..."
            );

            Store store =
                    session.getStore(
                            "imaps"
                    );

            store.connect(
                    "imap.gmail.com",
                    username,
                    password
            );


            System.out.println(
                    "Gmail Connected Successfully"
            );


            // ==================================================
            // OPEN INBOX
            // ==================================================

            Folder inbox =
                    store.getFolder(
                            "INBOX"
                    );

            inbox.open(
                    Folder.READ_WRITE
            );


            // ==================================================
            // FETCH UNREAD EMAILS
            // ==================================================

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


            // ==================================================
            // PROCESS EMAILS
            // ==================================================

            for (
                    Message message : messages
            ) {

                try {

                    System.out.println(
                            "================================="
                    );

                    System.out.println(
                            "EMAIL SUBJECT: "
                                    + message.getSubject()
                    );


                    // ==================================================
                    // APPLIED POSITION
                    // ==================================================

                    String appliedPosition =
                            message.getSubject();


                    if (
                            appliedPosition == null
                    ) {

                        appliedPosition = "";
                    }


                    // ==================================================
                    // CHECK MULTIPART EMAIL
                    // ==================================================

                    if (
                            message.isMimeType(
                                    "multipart/*"
                            )
                    ) {

                        Multipart multipart =
                                (Multipart)
                                        message.getContent();


                        // ==================================================
                        // LOOP ATTACHMENTS
                        // ==================================================

                        for (
                                int i = 0;
                                i < multipart.getCount();
                                i++
                        ) {

                            BodyPart bodyPart =
                                    multipart.getBodyPart(i);


                            // ==================================================
                            // CHECK ATTACHMENT
                            // ==================================================

                            if (
                                    Part.ATTACHMENT.equalsIgnoreCase(
                                            bodyPart.getDisposition()
                                    )
                            ) {

                                MimeBodyPart mimePart =
                                        (MimeBodyPart)
                                                bodyPart;


                                String fileName =
                                        mimePart.getFileName();


                                System.out.println(
                                        "Attachment Found: "
                                                + fileName
                                );


                                // ==================================================
                                // CHECK FILE EXTENSION
                                // ==================================================

                                if (
                                        fileName != null
                                                &&
                                        (
                                                fileName
                                                        .toLowerCase()
                                                        .endsWith(".pdf")

                                                        ||

                                                fileName
                                                        .toLowerCase()
                                                        .endsWith(".docx")
                                        )
                                ) {


                                    // ==================================================
                                    // CREATE UPLOAD DIRECTORY
                                    // ==================================================

                                    File uploadDir =
                                            new File(
                                                    "uploads"
                                            );


                                    if (
                                            !uploadDir.exists()
                                    ) {

                                        boolean created =
                                                uploadDir.mkdirs();

                                        System.out.println(
                                                "Uploads directory created: "
                                                        + created
                                        );
                                    }


                                    // ==================================================
                                    // SAVE RESUME
                                    // ==================================================

                                    File savedFile =
                                            new File(

                                                    uploadDir,

                                                    System.currentTimeMillis()
                                                            + "_"
                                                            + fileName
                                            );


                                    mimePart.saveFile(
                                            savedFile
                                    );


                                    System.out.println(
                                            "Resume Saved Successfully:"
                                    );

                                    System.out.println(
                                            savedFile
                                                    .getAbsolutePath()
                                    );


                                    // ==================================================
                                    // PROCESS RESUME
                                    // ==================================================

                                    resumeProcessorService
                                            .processResume(

                                                    savedFile,

                                                    appliedPosition
                                            );


                                    System.out.println(
                                            "Resume Processed Successfully"
                                    );

                                } else {

                                    System.out.println(
                                            "Skipped Non Resume File"
                                    );
                                }
                            }
                        }

                    } else {

                        System.out.println(
                                "Email does not contain attachments"
                        );
                    }


                    // ==================================================
                    // MARK EMAIL AS READ
                    // ==================================================

                    message.setFlag(
                            Flags.Flag.SEEN,
                            true
                    );


                    System.out.println(
                            "Email Marked As Read"
                    );


                } catch (
                        Exception emailException
                ) {

                    System.out.println(
                            "ERROR PROCESSING EMAIL"
                    );

                    emailException.printStackTrace();
                }
            }


            // ==================================================
            // CLOSE CONNECTIONS
            // ==================================================

            inbox.close(
                    false
            );

            store.close();


            System.out.println(
                    "EMAIL FETCH COMPLETED"
            );


        } catch (
                Exception e
        ) {

            System.out.println(
                    "EMAIL FETCH FAILED"
            );

            e.printStackTrace();
        }
    }
}
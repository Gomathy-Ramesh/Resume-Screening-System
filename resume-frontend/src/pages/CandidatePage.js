// src/pages/CandidatePage.js

import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Eye,
  CheckCircle2,
  UserCheck,
  Briefcase,
  Sparkles,
  Brain,
  RefreshCw,
  Clock,
  XCircle,
  PauseCircle,
  FileDown,
} from "lucide-react";

import { jsPDF } from "jspdf";

// =========================================================
// API URL
// =========================================================

const API_URL = "http://localhost:8080";

// =========================================================
// COMPONENT
// =========================================================

function CandidatePage() {

  // =======================================================
  // STATES
  // =======================================================

  const [candidates, setCandidates] = useState([]);

  const [expandedCandidateId, setExpandedCandidateId] =
    useState(null);

  // Technical assessment data by candidate ID
  const [assessmentByCandidate, setAssessmentByCandidate] =
    useState({});

  const [assessmentLoadingId, setAssessmentLoadingId] =
    useState(null);

  // Skill recovery data by candidate ID
  const [recoveryByCandidate, setRecoveryByCandidate] =
    useState({});

  // Hiring decision data by candidate ID
  const [hiringDecisionByCandidate, setHiringDecisionByCandidate] =
    useState({});

  const [hiringDecisionLoadingId, setHiringDecisionLoadingId] =
    useState(null);

  // PDF generation state
  const [reportGeneratingId, setReportGeneratingId] =
    useState(null);


  // =======================================================
  // FETCH CANDIDATES
  // =======================================================

  const fetchCandidates = async () => {

    try {

      const response = await axios.get(
        `${API_URL}/candidates`
      );

      console.log(
        "Candidates received:",
        response.data
      );

      setCandidates(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(
        "Error fetching candidates:",
        error
      );

      setCandidates([]);

    }

  };


  // =======================================================
  // INITIAL LOAD
  // =======================================================

  useEffect(() => {

    fetchCandidates();

  }, []);


  // =======================================================
  // VIEW RESUME
  // =======================================================

  const viewResume = (resumeUrl) => {

    if (!resumeUrl) {

      alert("Resume not found");

      return;
    }

    window.open(
      resumeUrl,
      "_blank"
    );

  };


  // =======================================================
  // SHORTLIST
  // =======================================================

  const shortlistCandidate = async (id) => {

    try {

      await axios.put(
        `${API_URL}/candidates/shortlist/${id}`
      );

      await fetchCandidates();

    } catch (error) {

      console.error(
        "Error shortlisting candidate:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to shortlist candidate."
      );

    }

  };


  // =======================================================
  // SELECT
  // =======================================================

  const selectCandidate = async (id) => {

    try {

      await axios.put(
        `${API_URL}/candidates/select/${id}`
      );

      alert(
        "Candidate Selected Successfully"
      );

      await fetchCandidates();

    } catch (error) {

      console.error(
        "Error selecting candidate:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to select candidate."
      );

    }

  };


  // =======================================================
  // GET JOB ID
  // =======================================================

  const getCandidateJobId = (candidate) => {

    return (
      candidate?.job?.jobId ||
      candidate?.job?.id ||
      candidate?.jobId ||
      null
    );

  };


  // =======================================================
  // LOAD TECHNICAL ASSESSMENT
  // =======================================================

  const loadTechnicalAssessment = async (
    candidate
  ) => {

    const candidateId =
      candidate?.candidateId;

    const jobId =
      getCandidateJobId(candidate);

    if (!candidateId) {

      return;
    }

    setAssessmentLoadingId(
      candidateId
    );

    try {

      let response;

      // ---------------------------------------------------
      // If job ID is available
      // ---------------------------------------------------

      if (jobId) {

        response = await axios.get(
          `${API_URL}/technical-assessments/${candidateId}/${jobId}`
        );

      } else {

        // -------------------------------------------------
        // No job ID
        // -------------------------------------------------

        setAssessmentByCandidate(
          (previous) => ({
            ...previous,
            [candidateId]: null,
          })
        );

        return;
      }

      setAssessmentByCandidate(
        (previous) => ({
          ...previous,
          [candidateId]: response.data,
        })
      );

    } catch (error) {

      console.error(
        "Error loading technical assessment:",
        error
      );

      setAssessmentByCandidate(
        (previous) => ({
          ...previous,
          [candidateId]: null,
        })
      );

    } finally {

      setAssessmentLoadingId(null);

    }

  };


  // =======================================================
  // LOAD SKILL RECOVERY
  // =======================================================

  const loadSkillRecovery = async (
    candidate
  ) => {

    const candidateId =
      candidate?.candidateId;

    const jobId =
      getCandidateJobId(candidate);

    if (!candidateId || !jobId) {

      if (candidateId) {

        setRecoveryByCandidate(
          (previous) => ({
            ...previous,
            [candidateId]: null,
          })
        );

      }

      return;
    }

    try {

      const response = await axios.get(
        `${API_URL}/candidates/${candidateId}/skill-recovery/${jobId}/participation`
      );

      setRecoveryByCandidate(
        (previous) => ({
          ...previous,
          [candidateId]: response.data,
        })
      );

    } catch (error) {

      console.error(
        "Error loading skill recovery:",
        error
      );

      setRecoveryByCandidate(
        (previous) => ({
          ...previous,
          [candidateId]: null,
        })
      );

    }

  };


  // =======================================================
  // LOAD HIRING DECISION
  // =======================================================

  const loadHiringDecision = async (
    candidateId
  ) => {

    if (!candidateId) {

      return;
    }

    setHiringDecisionLoadingId(
      candidateId
    );

    try {

      const response = await axios.get(
        `${API_URL}/api/hiring-decisions/${candidateId}`
      );

      console.log(
        "Hiring decision received:",
        response.data
      );

      setHiringDecisionByCandidate(
        (previous) => ({
          ...previous,
          [candidateId]: response.data,
        })
      );

    } catch (error) {

      console.error(
        "Error loading hiring decision:",
        error
      );

      setHiringDecisionByCandidate(
        (previous) => ({
          ...previous,
          [candidateId]: null,
        })
      );

    } finally {

      setHiringDecisionLoadingId(null);

    }

  };


  // =======================================================
  // GENERATE HIRING DECISION PDF REPORT
  // =======================================================

  const generateHiringDecisionReport = (
    candidate,
    hiringDecision
  ) => {

    const candidateId =
      candidate?.candidateId;

    if (!candidateId) {

      alert(
        "Candidate ID is not available."
      );

      return;
    }

    setReportGeneratingId(
      candidateId
    );

    try {

      const decision =
        hiringDecision || {};

      // ===================================================
      // CREATE PDF
      // ===================================================

      const pdf =
        new jsPDF(
          "p",
          "mm",
          "a4"
        );

      const pageWidth =
        pdf.internal.pageSize.getWidth();

      const pageHeight =
        pdf.internal.pageSize.getHeight();

      const margin = 18;

      let y = 20;


      // ===================================================
      // HELPER FUNCTIONS
      // ===================================================

      const addText = (
        text,
        x,
        yPosition,
        options = {}
      ) => {

        pdf.setFont(
          "helvetica",
          options.bold
            ? "bold"
            : "normal"
        );

        pdf.setFontSize(
          options.size || 10
        );

        pdf.setTextColor(
          options.color?.[0] ?? 40,
          options.color?.[1] ?? 40,
          options.color?.[2] ?? 40
        );

        pdf.text(
          String(text ?? "N/A"),
          x,
          yPosition
        );

      };


      const addWrappedText = (
        text,
        x,
        yPosition,
        maxWidth,
        options = {}
      ) => {

        pdf.setFont(
          "helvetica",
          options.bold
            ? "bold"
            : "normal"
        );

        pdf.setFontSize(
          options.size || 10
        );

        pdf.setTextColor(
          options.color?.[0] ?? 40,
          options.color?.[1] ?? 40,
          options.color?.[2] ?? 40
        );

        const lines =
          pdf.splitTextToSize(
            String(text ?? "N/A"),
            maxWidth
          );

        pdf.text(
          lines,
          x,
          yPosition
        );

        return (
          lines.length *
          (options.lineHeight || 5)
        );

      };


      const checkPageBreak = (
        requiredHeight
      ) => {

        if (
          y + requiredHeight >
          pageHeight - 20
        ) {

          pdf.addPage();

          y = 20;

          return true;
        }

        return false;

      };


      const drawSectionHeader = (
        title
      ) => {

        checkPageBreak(15);

        pdf.setFillColor(
          245,
          243,
          255
        );

        pdf.roundedRect(
          margin,
          y - 5,
          pageWidth - margin * 2,
          10,
          2,
          2,
          "F"
        );

        addText(
          title,
          margin + 4,
          y + 1,
          {
            bold: true,
            size: 11,
            color: [
              109,
              40,
              217
            ],
          }
        );

        y += 15;

      };


      const drawField = (
        label,
        value,
        x,
        width
      ) => {

        pdf.setDrawColor(
          225,
          225,
          235
        );

        pdf.setFillColor(
          250,
          250,
          252
        );

        pdf.roundedRect(
          x,
          y,
          width,
          22,
          2,
          2,
          "FD"
        );

        addText(
          label,
          x + 4,
          y + 7,
          {
            size: 8,
            color: [
              100,
              100,
              110
            ],
          }
        );

        addText(
          value ?? "N/A",
          x + 4,
          y + 15,
          {
            bold: true,
            size: 10,
            color: [
              30,
              30,
              40
            ],
          }
        );

      };


      // ===================================================
      // REPORT HEADER
      // ===================================================

      pdf.setFillColor(
        109,
        40,
        217
      );

      pdf.rect(
        0,
        0,
        pageWidth,
        35,
        "F"
      );

      addText(
        "TalentIQ",
        margin,
        15,
        {
          bold: true,
          size: 20,
          color: [
            255,
            255,
            255
          ],
        }
      );

      addText(
        "Hiring Decision Report",
        margin,
        25,
        {
          size: 11,
          color: [
            235,
            230,
            255
          ],
        }
      );

      y = 48;


      // ===================================================
      // REPORT INFORMATION
      // ===================================================

      addText(
        "Generated On",
        margin,
        y,
        {
          bold: true,
          size: 9,
          color: [
            100,
            100,
            110
          ],
        }
      );

      addText(
        new Date().toLocaleString(),
        margin,
        y + 6,
        {
          size: 9,
        }
      );

      y += 18;


      // ===================================================
      // CANDIDATE INFORMATION
      // ===================================================

      drawSectionHeader(
        "Candidate Information"
      );

      const columnWidth =
        (pageWidth -
          margin * 2 -
          6) / 2;

      drawField(
        "Candidate ID",
        candidate.candidateId,
        margin,
        columnWidth
      );

      drawField(
        "Candidate Name",
        candidate.name,
        margin + columnWidth + 6,
        columnWidth
      );

      y += 27;

      drawField(
        "Email",
        candidate.email,
        margin,
        columnWidth
      );

      drawField(
        "Applied Position",
        candidate.appliedPosition,
        margin + columnWidth + 6,
        columnWidth
      );

      y += 27;

      drawField(
        "Resume Score",
        candidate.score !== null &&
        candidate.score !== undefined
          ? `${candidate.score}%`
          : "N/A",
        margin,
        columnWidth
      );

      drawField(
        "Required Threshold",
        candidate.thresholdPercentage !== null &&
        candidate.thresholdPercentage !== undefined
          ? `${candidate.thresholdPercentage}%`
          : "N/A",
        margin + columnWidth + 6,
        columnWidth
      );

      y += 32;


      // ===================================================
      // FINAL DECISION
      // ===================================================

      drawSectionHeader(
        "Final Hiring Decision"
      );

      const finalDecision =
        decision.decision ||
        "PENDING";

      const normalizedDecision =
        String(
          finalDecision
        ).toUpperCase();


      let decisionColor = [
        37,
        99,
        235
      ];

      if (
        normalizedDecision ===
        "SELECTED"
      ) {

        decisionColor = [
          5,
          150,
          105
        ];

      } else if (
        normalizedDecision ===
        "REJECTED"
        ||
        normalizedDecision ===
        "REJECT"
      ) {

        decisionColor = [
          220,
          38,
          38
        ];

      } else if (
        normalizedDecision ===
        "ON_HOLD"
        ||
        normalizedDecision ===
        "HOLD"
      ) {

        decisionColor = [
          217,
          119,
          6
        ];

      }


      pdf.setFillColor(
        decisionColor[0],
        decisionColor[1],
        decisionColor[2]
      );

      pdf.roundedRect(
        margin,
        y,
        pageWidth - margin * 2,
        25,
        3,
        3,
        "F"
      );

      addText(
        "FINAL DECISION",
        margin + 5,
        y + 8,
        {
          bold: true,
          size: 8,
          color: [
            255,
            255,
            255
          ],
        }
      );

      addText(
        String(
          finalDecision
        ).replace(
          /_/g,
          " "
        ),
        margin + 5,
        y + 18,
        {
          bold: true,
          size: 15,
          color: [
            255,
            255,
            255
          ],
        }
      );

      addText(
        decision.hrPercentage !== null &&
        decision.hrPercentage !== undefined
          ? `${decision.hrPercentage}%`
          : "N/A",
        pageWidth - margin - 25,
        y + 15,
        {
          bold: true,
          size: 13,
          color: [
            255,
            255,
            255
          ],
        }
      );

      y += 33;


      // ===================================================
      // DECISION REASON
      // ===================================================

      addText(
        "Decision Reason",
        margin,
        y,
        {
          bold: true,
          size: 9,
          color: [
            80,
            80,
            90
          ],
        }
      );

      y += 6;

      const reasonHeight =
        addWrappedText(
          decision.decisionReason ||
          "No decision reason available.",
          margin,
          y,
          pageWidth - margin * 2,
          {
            size: 10,
            color: [
              50,
              50,
              60
            ],
            lineHeight: 5,
          }
        );

      y += reasonHeight + 8;


      // ===================================================
      // INTERVIEW INFORMATION
      // ===================================================

      drawSectionHeader(
        "Interview Information"
      );

      drawField(
        "Interview Status",
        decision.interviewStatus,
        margin,
        columnWidth
      );

      drawField(
        "Round",
        decision.roundName,
        margin + columnWidth + 6,
        columnWidth
      );

      y += 27;

      drawField(
        "Interviewer",
        decision.interviewerName,
        margin,
        columnWidth
      );

      drawField(
        "Interview ID",
        decision.interviewId,
        margin + columnWidth + 6,
        columnWidth
      );

      y += 32;


      // ===================================================
      // HR EVALUATION
      // ===================================================

      drawSectionHeader(
        "HR Evaluation"
      );

      drawField(
        "Technical Knowledge",
        decision.technicalKnowledge,
        margin,
        columnWidth
      );

      drawField(
        "Problem Solving",
        decision.problemSolving,
        margin + columnWidth + 6,
        columnWidth
      );

      y += 27;

      drawField(
        "Communication",
        decision.communication,
        margin,
        columnWidth
      );

      drawField(
        "Role Knowledge",
        decision.roleKnowledge,
        margin + columnWidth + 6,
        columnWidth
      );

      y += 27;

      drawField(
        "HR Overall Score",
        decision.hrOverallScore,
        margin,
        columnWidth
      );

      drawField(
        "HR Percentage",
        decision.hrPercentage !== null &&
        decision.hrPercentage !== undefined
          ? `${decision.hrPercentage}%`
          : "N/A",
        margin + columnWidth + 6,
        columnWidth
      );

      y += 32;


      // ===================================================
      // HR RECOMMENDATION
      // ===================================================

      drawSectionHeader(
        "HR Recommendation"
      );

      pdf.setFillColor(
        245,
        243,
        255
      );

      pdf.roundedRect(
        margin,
        y,
        pageWidth - margin * 2,
        20,
        3,
        3,
        "F"
      );

      addText(
        decision.recommendation ||
        "N/A",
        margin + 6,
        y + 13,
        {
          bold: true,
          size: 12,
          color: [
            109,
            40,
            217
          ],
        }
      );

      y += 30;


      // ===================================================
      // FEEDBACK
      // ===================================================

      drawSectionHeader(
        "Interviewer Feedback"
      );

      const feedback =
        decision.feedback ||
        "No interviewer feedback provided.";

      const feedbackHeight =
        addWrappedText(
          feedback,
          margin,
          y,
          pageWidth - margin * 2,
          {
            size: 10,
            color: [
              50,
              50,
              60
            ],
            lineHeight: 5,
          }
        );

      y += feedbackHeight + 15;


      // ===================================================
      // REPORT FOOTER
      // ===================================================

      if (
        y >
        pageHeight - 35
      ) {

        pdf.addPage();

      }

      const totalPages =
        pdf.internal.getNumberOfPages();

      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {

        pdf.setPage(page);

        pdf.setDrawColor(
          220,
          220,
          230
        );

        pdf.line(
          margin,
          pageHeight - 15,
          pageWidth - margin,
          pageHeight - 15
        );

        addText(
          "TalentIQ - Hiring Decision Report",
          margin,
          pageHeight - 8,
          {
            size: 8,
            color: [
              120,
              120,
              130
            ],
          }
        );

        addText(
          `Page ${page} of ${totalPages}`,
          pageWidth - margin - 28,
          pageHeight - 8,
          {
            size: 8,
            color: [
              120,
              120,
              130
            ],
          }
        );

      }


      // ===================================================
      // DOWNLOAD PDF
      // ===================================================

      const safeCandidateName =
        String(
          candidate.name ||
          "candidate"
        )
          .trim()
          .replace(
            /[^a-zA-Z0-9]+/g,
            "_"
          );

      const fileName =
        `TalentIQ_Hiring_Decision_${safeCandidateName}_${candidateId}.pdf`;

      pdf.save(
        fileName
      );

    } catch (error) {

      console.error(
        "Error generating hiring decision report:",
        error
      );

      alert(
        "Unable to generate the PDF report."
      );

    } finally {

      setReportGeneratingId(
        null
      );

    }

  };


  // =======================================================
  // TOGGLE DETAILS
  // =======================================================

  const toggleDetails = (
    candidate
  ) => {

    const candidateId =
      candidate.candidateId;

    const opening =
      expandedCandidateId !==
      candidateId;

    setExpandedCandidateId(
      opening
        ? candidateId
        : null
    );

    if (!opening) {

      return;
    }

    // -----------------------------------------------------
    // Load technical assessment
    // -----------------------------------------------------

    if (
      assessmentByCandidate[
        candidateId
      ] === undefined
    ) {

      loadTechnicalAssessment(
        candidate
      );

    }

    // -----------------------------------------------------
    // Load skill recovery
    // -----------------------------------------------------

    if (
      recoveryByCandidate[
        candidateId
      ] === undefined
    ) {

      loadSkillRecovery(
        candidate
      );

    }

    // -----------------------------------------------------
    // Load hiring decision
    // -----------------------------------------------------

    if (
      hiringDecisionByCandidate[
        candidateId
      ] === undefined
    ) {

      loadHiringDecision(
        candidateId
      );

    }

  };


  // =======================================================
  // REFRESH CANDIDATE DETAILS
  // =======================================================

  const refreshCandidateData = async (
    candidate
  ) => {

    const candidateId =
      candidate?.candidateId;

    if (!candidateId) {

      return;
    }

    await Promise.all([
      loadTechnicalAssessment(
        candidate
      ),
      loadSkillRecovery(
        candidate
      ),
      loadHiringDecision(
        candidateId
      ),
    ]);

  };


  // =======================================================
  // HIRING DECISION STYLE
  // =======================================================

  const getDecisionStyle = (
    decision
  ) => {

    const normalized =
      String(
        decision || ""
      ).toUpperCase();

    if (
      normalized ===
      "SELECTED"
    ) {

      return {

        container:
          "bg-emerald-50 border-emerald-200",

        badge:
          "bg-emerald-100 text-emerald-700",

        text:
          "text-emerald-700",

        icon:
          <CheckCircle2
            size={18}
          />,

      };

    }

    if (
      normalized ===
      "REJECTED"
      ||
      normalized ===
      "REJECT"
    ) {

      return {

        container:
          "bg-red-50 border-red-200",

        badge:
          "bg-red-100 text-red-700",

        text:
          "text-red-700",

        icon:
          <XCircle
            size={18}
          />,

      };

    }

    if (
      normalized ===
      "ON_HOLD"
      ||
      normalized ===
      "HOLD"
    ) {

      return {

        container:
          "bg-amber-50 border-amber-200",

        badge:
          "bg-amber-100 text-amber-700",

        text:
          "text-amber-700",

        icon:
          <PauseCircle
            size={18}
          />,

      };

    }

    if (
      normalized ===
      "PENDING_INTERVIEW"
      ||
      normalized ===
      "PENDING_EVALUATION"
    ) {

      return {

        container:
          "bg-blue-50 border-blue-200",

        badge:
          "bg-blue-100 text-blue-700",

        text:
          "text-blue-700",

        icon:
          <Clock
            size={18}
          />,

      };

    }

    return {

      container:
        "bg-gray-50 border-gray-200",

      badge:
        "bg-gray-100 text-gray-700",

      text:
        "text-gray-700",

      icon:
        <Clock
          size={18}
        />,

    };

  };


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <div
      className="
        h-full
        bg-[#FAFAFF]
        px-6
        pb-2
        pt-1
        overflow-hidden
      "
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        className="
          mb-4
          flex
          items-center
          justify-between
        "
      >

        <div>

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-r
                from-violet-600
                to-cyan-500
                shadow-lg
              "
            >

              <Sparkles
                size={22}
                className="text-white"
              />

            </div>

            <div>

              <h1
                className="
                  text-3xl
                  font-bold
                  bg-gradient-to-r
                  from-violet-600
                  to-cyan-500
                  bg-clip-text
                  text-transparent
                "
              >
                Candidate Screening
              </h1>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                AI-powered resume screening,
                skill extraction and candidate
                evaluation
              </p>

            </div>

          </div>

        </div>


        {/* TOTAL CANDIDATES */}

        <div
          className="
            bg-white
            px-5
            py-3
            rounded-2xl
            shadow-sm
            border
            border-violet-100
          "
        >

          <p
            className="
              text-sm
              text-gray-500
            "
          >
            Total Candidates
          </p>

          <h2
            className="
              text-2xl
              font-bold
              bg-gradient-to-r
              from-violet-600
              to-cyan-500
              bg-clip-text
              text-transparent
            "
          >
            {candidates.length}
          </h2>

        </div>

      </div>


      {/* =================================================
          CANDIDATE TABLE
      ================================================= */}

      <div
        className="
          h-[78vh]
          bg-white
          rounded-3xl
          shadow-sm
          border
          border-violet-100
          overflow-hidden
        "
      >

        <div
          className="
            h-full
            overflow-y-auto
            overflow-x-auto
          "
        >

          <table className="w-full">

            {/* TABLE HEADER */}

            <thead
              className="
                bg-gradient-to-r
                from-violet-600
                to-cyan-500
                text-white
                sticky
                top-0
                z-10
              "
            >

              <tr>

                <th
                  className="
                    px-6
                    py-4
                    text-left
                    text-sm
                    font-semibold
                  "
                >
                  ID
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-left
                    text-sm
                    font-semibold
                  "
                >
                  Candidate
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-left
                    text-sm
                    font-semibold
                  "
                >
                  Position
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-left
                    text-sm
                    font-semibold
                  "
                >
                  AI Match Score
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-left
                    text-sm
                    font-semibold
                  "
                >
                  Status
                </th>

                <th
                  className="
                    px-6
                    py-4
                    text-center
                    text-sm
                    font-semibold
                  "
                >
                  Details
                </th>

              </tr>

            </thead>


            {/* TABLE BODY */}

            <tbody>

              {candidates.length > 0 ? (

                candidates.map(
                  (candidate) => {

                    const candidateId =
                      candidate.candidateId;

                    const jobId =
                      getCandidateJobId(
                        candidate
                      );

                    const assessment =
                      assessmentByCandidate[
                        candidateId
                      ];

                    const recovery =
                      recoveryByCandidate[
                        candidateId
                      ];

                    const hiringDecision =
                      hiringDecisionByCandidate[
                        candidateId
                      ];


                    return (

                      <React.Fragment
                        key={candidateId}
                      >

                        {/* =================================================
                            MAIN ROW
                        ================================================= */}

                        <tr
                          className="
                            border-b
                            border-gray-100
                            hover:bg-violet-50
                            transition-all
                            duration-200
                          "
                        >

                          {/* ID */}

                          <td
                            className="
                              px-6
                              py-5
                              font-medium
                              text-gray-700
                            "
                          >
                            {candidateId}
                          </td>


                          {/* CANDIDATE */}

                          <td
                            className="
                              px-6
                              py-5
                            "
                          >

                            <div>

                              <h3
                                className="
                                  font-semibold
                                  text-gray-800
                                "
                              >
                                {candidate.name}
                              </h3>

                              <p
                                className="
                                  text-sm
                                  text-gray-500
                                "
                              >
                                {candidate.email}
                              </p>

                            </div>

                          </td>


                          {/* POSITION */}

                          <td
                            className="
                              px-6
                              py-5
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                gap-2
                              "
                            >

                              <Briefcase
                                size={16}
                                className="
                                  text-violet-500
                                "
                              />

                              <span
                                className="
                                  text-gray-700
                                "
                              >
                                {candidate.appliedPosition ||
                                  "Not specified"}
                              </span>

                            </div>

                          </td>


                          {/* AI MATCH SCORE */}

                          <td
                            className="
                              px-6
                              py-5
                            "
                          >

                            <div
                              className="w-36"
                            >

                              <div
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  mb-1
                                "
                              >

                                <Brain
                                  size={15}
                                  className="
                                    text-violet-600
                                  "
                                />

                                <span
                                  className="
                                    text-sm
                                    font-bold
                                    text-violet-700
                                  "
                                >
                                  {candidate.score ??
                                    0}
                                  %
                                </span>

                              </div>

                              <div
                                className="
                                  h-2
                                  rounded-full
                                  bg-violet-100
                                  overflow-hidden
                                "
                              >

                                <div
                                  className="
                                    h-2
                                    rounded-full
                                    bg-gradient-to-r
                                    from-violet-600
                                    to-cyan-500
                                    transition-all
                                    duration-500
                                  "
                                  style={{
                                    width:
                                      `${Math.min(
                                        Number(
                                          candidate.score ||
                                          0
                                        ),
                                        100
                                      )}%`,
                                  }}
                                />

                              </div>

                            </div>

                          </td>


                          {/* STATUS */}

                          <td
                            className="
                              px-6
                              py-5
                            "
                          >

                            <span
                              className={`
                                px-4
                                py-2
                                rounded-xl
                                text-sm
                                font-semibold
                                ${
                                  candidate.currentStage ===
                                  "Selected"
                                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                                    : candidate.currentStage ===
                                      "Shortlisted"
                                      ? "bg-violet-100 text-violet-700"
                                      : "bg-gray-100 text-gray-600"
                                }
                              `}
                            >
                              {candidate.currentStage ||
                                "Pending"}
                            </span>

                          </td>


                          {/* DETAILS */}

                          <td
                            className="
                              px-6
                              py-5
                              text-center
                            "
                          >

                            <button
                              onClick={() =>
                                toggleDetails(
                                  candidate
                                )
                              }
                              className="
                                bg-gradient-to-r
                                from-violet-600
                                to-cyan-500
                                hover:from-violet-700
                                hover:to-cyan-600
                                text-white
                                px-4
                                py-2
                                rounded-xl
                                text-sm
                                font-medium
                                transition-all
                                duration-300
                                hover:-translate-y-0.5
                                hover:shadow-lg
                              "
                            >
                              {expandedCandidateId ===
                              candidateId
                                ? "Hide"
                                : "Details"}
                            </button>

                          </td>

                        </tr>


                        {/* =================================================
                            EXPANDED DETAILS
                        ================================================= */}

                        {expandedCandidateId ===
                          candidateId && (

                          <tr>

                            <td
                              colSpan="6"
                              className="
                                bg-violet-50
                                p-6
                              "
                            >

                              <div
                                className="
                                  grid
                                  grid-cols-1
                                  md:grid-cols-2
                                  gap-6
                                "
                              >

                                {/* =================================================
                                    EXPERIENCE
                                ================================================= */}

                                <div
                                  className="
                                    bg-white
                                    rounded-2xl
                                    p-5
                                    border
                                    border-violet-100
                                    shadow-sm
                                  "
                                >

                                  <h4
                                    className="
                                      font-semibold
                                      text-violet-600
                                      mb-2
                                    "
                                  >
                                    Experience
                                  </h4>

                                  <p
                                    className="
                                      text-gray-700
                                    "
                                  >
                                    {candidate.experience ??
                                      0} Years
                                  </p>

                                </div>


                                {/* =================================================
                                    SKILLS
                                ================================================= */}

                                <div
                                  className="
                                    bg-white
                                    rounded-2xl
                                    p-5
                                    border
                                    border-violet-100
                                    shadow-sm
                                  "
                                >

                                  <h4
                                    className="
                                      font-semibold
                                      text-violet-600
                                      mb-2
                                    "
                                  >
                                    Extracted Skills
                                  </h4>

                                  <p
                                    className="
                                      text-gray-700
                                    "
                                  >
                                    {candidate.skills ||
                                      "Skills not available"}
                                  </p>

                                </div>


                                {/* =================================================
                                    AI MATCH
                                ================================================= */}

                                <div
                                  className="
                                    bg-white
                                    rounded-2xl
                                    p-5
                                    border
                                    border-violet-100
                                    shadow-sm
                                  "
                                >

                                  <h4
                                    className="
                                      font-semibold
                                      text-violet-600
                                      mb-2
                                    "
                                  >
                                    AI Match Analysis
                                  </h4>

                                  <div
                                    className="
                                      flex
                                      items-center
                                      gap-3
                                    "
                                  >

                                    <div
                                      className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-gradient-to-r
                                        from-violet-600
                                        to-cyan-500
                                      "
                                    >

                                      <Brain
                                        size={20}
                                        className="
                                          text-white
                                        "
                                      />

                                    </div>

                                    <div>

                                      <p
                                        className="
                                          text-sm
                                          text-gray-500
                                        "
                                      >
                                        Job Relevance Score
                                      </p>

                                      <p
                                        className="
                                          text-xl
                                          font-bold
                                          text-violet-700
                                        "
                                      >
                                        {candidate.score ??
                                          0}
                                        %
                                      </p>

                                    </div>

                                  </div>

                                </div>


                                {/* =================================================
                                    TECHNICAL ASSESSMENT
                                ================================================= */}

                                <div
                                  className="
                                    bg-white
                                    rounded-2xl
                                    p-5
                                    border
                                    border-violet-100
                                    shadow-sm
                                  "
                                >

                                  <div
                                    className="
                                      flex
                                      items-center
                                      justify-between
                                      mb-3
                                    "
                                  >

                                    <h4
                                      className="
                                        font-semibold
                                        text-violet-600
                                      "
                                    >
                                      Technical Assessment
                                    </h4>

                                    {assessment && (

                                      <button
                                        onClick={() =>
                                          refreshCandidateData(
                                            candidate
                                          )
                                        }
                                        className="
                                          text-xs
                                          text-violet-600
                                          hover:text-violet-800
                                          underline
                                          flex
                                          items-center
                                          gap-1
                                        "
                                      >

                                        <RefreshCw
                                          size={13}
                                        />

                                        Refresh

                                      </button>

                                    )}

                                  </div>


                                  {/* LOADING */}

                                  {assessmentLoadingId ===
                                  candidateId ? (

                                    <p
                                      className="
                                        text-sm
                                        text-gray-500
                                      "
                                    >
                                      Loading assessment...
                                    </p>

                                  ) : !jobId ? (

                                    <p
                                      className="
                                        text-sm
                                        text-gray-500
                                      "
                                    >
                                      No job linked to this
                                      candidate.
                                    </p>

                                  ) : assessment ===
                                    undefined ? (

                                    <p
                                      className="
                                        text-sm
                                        text-gray-500
                                      "
                                    >
                                      Loading...
                                    </p>

                                  ) : assessment ===
                                    null ? (

                                    <div>

                                      <span
                                        className="
                                          inline-block
                                          px-3
                                          py-1
                                          rounded-lg
                                          text-xs
                                          font-semibold
                                          bg-gray-100
                                          text-gray-600
                                        "
                                      >
                                        NOT ATTEMPTED
                                      </span>

                                      <p
                                        className="
                                          mt-2
                                          text-sm
                                          text-gray-500
                                        "
                                      >
                                        Candidate has not
                                        generated or attempted
                                        the technical assessment.
                                      </p>

                                    </div>

                                  ) : (

                                    (() => {

                                      const status =
                                        (
                                          assessment.status ||
                                          ""
                                        ).toUpperCase();

                                      const totalQuestions =
                                        Number(
                                          assessment.totalQuestions ??
                                          assessment.questions
                                            ?.length ??
                                          0
                                        );

                                      const score =
                                        Number(
                                          assessment.score ??
                                          0
                                        );

                                      const percentage =
                                        totalQuestions >
                                        0
                                          ? (
                                              (
                                                score /
                                                totalQuestions
                                              ) *
                                              100
                                            ).toFixed(1)
                                          : 0;

                                      return (

                                        <div>

                                          {/* STATUS */}

                                          <div
                                            className="
                                              flex
                                              items-center
                                              justify-between
                                            "
                                          >

                                            <span
                                              className={`
                                                inline-flex
                                                items-center
                                                gap-2
                                                px-3
                                                py-2
                                                rounded-lg
                                                text-xs
                                                font-semibold
                                                ${
                                                  status ===
                                                  "SUBMITTED"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : status ===
                                                      "IN_PROGRESS"
                                                      ? "bg-amber-100 text-amber-700"
                                                      : "bg-gray-100 text-gray-600"
                                                }
                                              `}
                                            >

                                              {status ===
                                                "SUBMITTED" && (

                                                <CheckCircle2
                                                  size={14}
                                                />

                                              )}

                                              {status ===
                                              "SUBMITTED"
                                                ? "COMPLETED"
                                                : status ===
                                                  "IN_PROGRESS"
                                                  ? "IN PROGRESS"
                                                  : status}

                                            </span>


                                            {status ===
                                              "SUBMITTED" && (

                                              <span
                                                className="
                                                  text-sm
                                                  font-semibold
                                                  text-emerald-600
                                                "
                                              >
                                                Assessment Completed
                                              </span>

                                            )}

                                          </div>


                                          {/* SCORE */}

                                          {status ===
                                            "SUBMITTED" && (

                                            <div
                                              className="
                                                mt-4
                                              "
                                            >

                                              <div
                                                className="
                                                  flex
                                                  items-end
                                                  justify-between
                                                "
                                              >

                                                <div>

                                                  <p
                                                    className="
                                                      text-sm
                                                      text-gray-500
                                                    "
                                                  >
                                                    Technical Score
                                                  </p>

                                                  <p
                                                    className="
                                                      text-3xl
                                                      font-bold
                                                      text-violet-700
                                                    "
                                                  >
                                                    {score}
                                                    {" / "}
                                                    {totalQuestions}
                                                  </p>

                                                </div>

                                                <div
                                                  className="
                                                    text-right
                                                  "
                                                >

                                                  <p
                                                    className="
                                                      text-xs
                                                      text-gray-500
                                                    "
                                                  >
                                                    Percentage
                                                  </p>

                                                  <p
                                                    className="
                                                      text-xl
                                                      font-bold
                                                      text-emerald-600
                                                    "
                                                  >
                                                    {percentage}%
                                                  </p>

                                                </div>

                                              </div>


                                              {/* SCORE BAR */}

                                              <div
                                                className="
                                                  mt-3
                                                  h-3
                                                  rounded-full
                                                  bg-gray-100
                                                  overflow-hidden
                                                "
                                              >

                                                <div
                                                  className="
                                                    h-full
                                                    rounded-full
                                                    bg-gradient-to-r
                                                    from-violet-600
                                                    to-cyan-500
                                                    transition-all
                                                    duration-500
                                                  "
                                                  style={{
                                                    width:
                                                      `${Math.min(
                                                        Number(
                                                          percentage
                                                        ),
                                                        100
                                                      )}%`,
                                                  }}
                                                />

                                              </div>

                                              <p
                                                className="
                                                  mt-2
                                                  text-xs
                                                  text-gray-500
                                                "
                                              >
                                                Submitted on{" "}
                                                {assessment.submittedAt
                                                  ? new Date(
                                                      assessment.submittedAt
                                                    ).toLocaleString()
                                                  : "N/A"}
                                              </p>

                                            </div>

                                          )}

                                        </div>

                                      );

                                    })()

                                  )}

                                </div>


                                {/* =================================================
                                    SKILL RECOVERY
                                ================================================= */}

                                <div
                                  className="
                                    bg-white
                                    rounded-2xl
                                    p-5
                                    border
                                    border-violet-100
                                    shadow-sm
                                  "
                                >

                                  <h4
                                    className="
                                      font-semibold
                                      text-violet-600
                                      mb-3
                                    "
                                  >
                                    Skill Recovery Progress
                                  </h4>

                                  {!jobId ? (

                                    <p
                                      className="
                                        text-sm
                                        text-gray-500
                                      "
                                    >
                                      No job linked to this
                                      candidate.
                                    </p>

                                  ) : recovery ===
                                    undefined ? (

                                    <p
                                      className="
                                        text-sm
                                        text-gray-500
                                      "
                                    >
                                      Loading...
                                    </p>

                                  ) : !recovery ? (

                                    <div>

                                      <span
                                        className="
                                          inline-block
                                          px-3
                                          py-1
                                          rounded-lg
                                          text-xs
                                          font-semibold
                                          bg-gray-100
                                          text-gray-600
                                        "
                                      >
                                        NOT STARTED
                                      </span>

                                      <p
                                        className="
                                          mt-2
                                          text-sm
                                          text-gray-500
                                        "
                                      >
                                        Skill recovery has not
                                        been started.
                                      </p>

                                    </div>

                                  ) : (

                                    (() => {

                                      const progress =
                                        Number(
                                          recovery.progress ??
                                          0
                                        );

                                      const completedTopics =
                                        Number(
                                          recovery.completedTopics ??
                                          0
                                        );

                                      const totalTopics =
                                        Number(
                                          recovery.totalTopics ??
                                          0
                                        );

                                      const recoveryCompleted =
                                        recovery.status ===
                                          "Completed" ||
                                        progress >= 100 ||
                                        (
                                          totalTopics >
                                            0 &&
                                          completedTopics >=
                                            totalTopics
                                        );

                                      return (

                                        <div>

                                          {/* STATUS */}

                                          <div
                                            className="
                                              flex
                                              items-center
                                              justify-between
                                            "
                                          >

                                            <span
                                              className={`
                                                inline-flex
                                                items-center
                                                gap-2
                                                px-3
                                                py-2
                                                rounded-lg
                                                text-xs
                                                font-semibold
                                                ${
                                                  recoveryCompleted
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : progress > 0
                                                      ? "bg-amber-100 text-amber-700"
                                                      : "bg-gray-100 text-gray-600"
                                                }
                                              `}
                                            >

                                              {recoveryCompleted && (

                                                <CheckCircle2
                                                  size={14}
                                                />

                                              )}

                                              {recoveryCompleted
                                                ? "COMPLETED"
                                                : recovery.status ||
                                                  "NOT STARTED"}

                                            </span>

                                            <span
                                              className="
                                                text-sm
                                                font-semibold
                                                text-violet-700
                                              "
                                            >
                                              {Math.min(
                                                progress,
                                                100
                                              )}
                                              %
                                            </span>

                                          </div>


                                          {/* PROGRESS BAR */}

                                          <div
                                            className="
                                              mt-3
                                              h-2
                                              rounded-full
                                              bg-violet-100
                                              overflow-hidden
                                            "
                                          >

                                            <div
                                              className={`
                                                h-2
                                                rounded-full
                                                transition-all
                                                duration-500
                                                ${
                                                  recoveryCompleted
                                                    ? "bg-emerald-500"
                                                    : "bg-gradient-to-r from-violet-600 to-cyan-500"
                                                }
                                              `}
                                              style={{
                                                width:
                                                  `${Math.min(
                                                    progress,
                                                    100
                                                  )}%`,
                                              }}
                                            />

                                          </div>


                                          {/* TOPIC COUNT */}

                                          <p
                                            className="
                                              mt-2
                                              text-xs
                                              text-gray-500
                                            "
                                          >
                                            {completedTopics}
                                            {" of "}
                                            {totalTopics}
                                            {" topics completed"}
                                          </p>


                                          {/* COMPLETED MESSAGE */}

                                          {recoveryCompleted && (

                                            <div
                                              className="
                                                mt-3
                                                flex
                                                items-center
                                                gap-2
                                                rounded-xl
                                                bg-emerald-50
                                                border
                                                border-emerald-200
                                                px-3
                                                py-2
                                              "
                                            >

                                              <CheckCircle2
                                                size={16}
                                                className="
                                                  text-emerald-600
                                                "
                                              />

                                              <span
                                                className="
                                                  text-sm
                                                  font-medium
                                                  text-emerald-700
                                                "
                                              >
                                                Skill recovery program
                                                completed
                                              </span>

                                            </div>

                                          )}

                                        </div>

                                      );

                                    })()

                                  )}

                                </div>


                                {/* =================================================
                                    HIRING DECISION
                                ================================================= */}

                                <div
                                  className="
                                    bg-white
                                    rounded-2xl
                                    p-5
                                    border
                                    border-violet-100
                                    shadow-sm
                                    md:col-span-2
                                  "
                                >

                                  {/* HEADER */}

                                  <div
                                    className="
                                      flex
                                      items-center
                                      justify-between
                                      mb-4
                                    "
                                  >

                                    <div>

                                      <h4
                                        className="
                                          font-semibold
                                          text-violet-600
                                        "
                                      >
                                        Hiring Decision
                                      </h4>

                                      <p
                                        className="
                                          mt-1
                                          text-xs
                                          text-gray-500
                                        "
                                      >
                                        Final recruitment decision
                                        based on interview evaluation
                                      </p>

                                    </div>


                                    {/* HEADER ACTIONS */}

                                    <div
                                      className="
                                        flex
                                        items-center
                                        gap-3
                                      "
                                    >

                                      {/* GENERATE REPORT */}

                                      <button
                                        type="button"
                                        disabled={
                                          hiringDecisionLoadingId ===
                                            candidateId ||
                                          reportGeneratingId ===
                                            candidateId
                                        }
                                        onClick={() =>
                                          generateHiringDecisionReport(
                                            candidate,
                                            hiringDecision
                                          )
                                        }
                                        className="
                                          inline-flex
                                          items-center
                                          gap-2
                                          rounded-xl
                                          bg-gradient-to-r
                                          from-violet-600
                                          to-cyan-500
                                          px-4
                                          py-2
                                          text-xs
                                          font-semibold
                                          text-white
                                          shadow-sm
                                          transition-all
                                          duration-300
                                          hover:-translate-y-0.5
                                          hover:shadow-lg
                                          disabled:cursor-not-allowed
                                          disabled:opacity-50
                                        "
                                      >

                                        <FileDown
                                          size={15}
                                        />

                                        {reportGeneratingId ===
                                        candidateId
                                          ? "Generating..."
                                          : "Generate Report PDF"}

                                      </button>


                                      {/* REFRESH */}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          loadHiringDecision(
                                            candidateId
                                          )
                                        }
                                        className="
                                          inline-flex
                                          items-center
                                          gap-1
                                          text-xs
                                          text-violet-600
                                          hover:text-violet-800
                                          underline
                                        "
                                      >

                                        <RefreshCw
                                          size={13}
                                        />

                                        Refresh

                                      </button>

                                    </div>

                                  </div>


                                  {/* LOADING */}

                                  {hiringDecisionLoadingId ===
                                  candidateId ? (

                                    <div
                                      className="
                                        flex
                                        items-center
                                        gap-2
                                        text-sm
                                        text-gray-500
                                      "
                                    >

                                      <RefreshCw
                                        size={16}
                                        className="
                                          animate-spin
                                        "
                                      />

                                      Loading hiring decision...

                                    </div>

                                  ) : hiringDecision ===
                                    undefined ? (

                                    <p
                                      className="
                                        text-sm
                                        text-gray-500
                                      "
                                    >
                                      Loading hiring decision...
                                    </p>

                                  ) : hiringDecision ===
                                    null ? (

                                    <div
                                      className="
                                        rounded-xl
                                        border
                                        border-red-200
                                        bg-red-50
                                        px-4
                                        py-3
                                        text-sm
                                        text-red-600
                                      "
                                    >
                                      Unable to load hiring
                                      decision.
                                    </div>

                                  ) : (

                                    (() => {

                                      const decision =
                                        hiringDecision.decision ||
                                        "PENDING";

                                      const decisionStyle =
                                        getDecisionStyle(
                                          decision
                                        );

                                      return (

                                        <div>

                                          {/* DECISION HEADER */}

                                          <div
                                            className={`
                                              rounded-2xl
                                              border
                                              p-5
                                              ${decisionStyle.container}
                                            `}
                                          >

                                            <div
                                              className="
                                                flex
                                                flex-col
                                                md:flex-row
                                                md:items-center
                                                md:justify-between
                                                gap-4
                                              "
                                            >

                                              <div>

                                                <p
                                                  className="
                                                    text-xs
                                                    font-semibold
                                                    uppercase
                                                    tracking-wide
                                                    text-gray-500
                                                  "
                                                >
                                                  Final Decision
                                                </p>

                                                <div
                                                  className="
                                                    mt-2
                                                    flex
                                                    items-center
                                                    gap-3
                                                  "
                                                >

                                                  <div
                                                    className={`
                                                      flex
                                                      h-10
                                                      w-10
                                                      items-center
                                                      justify-center
                                                      rounded-xl
                                                      ${decisionStyle.badge}
                                                    `}
                                                  >
                                                    {
                                                      decisionStyle.icon
                                                    }
                                                  </div>

                                                  <span
                                                    className={`
                                                      text-2xl
                                                      font-bold
                                                      ${decisionStyle.text}
                                                    `}
                                                  >
                                                    {String(
                                                      decision
                                                    ).replace(
                                                      /_/g,
                                                      " "
                                                    )}
                                                  </span>

                                                </div>

                                              </div>


                                              <div
                                                className="
                                                  text-left
                                                  md:text-right
                                                "
                                              >

                                                <p
                                                  className="
                                                    text-xs
                                                    text-gray-500
                                                  "
                                                >
                                                  HR Percentage
                                                </p>

                                                <p
                                                  className="
                                                    text-2xl
                                                    font-bold
                                                    text-violet-700
                                                  "
                                                >
                                                  {hiringDecision.hrPercentage ??
                                                    "N/A"}

                                                  {hiringDecision.hrPercentage !==
                                                    null &&
                                                  hiringDecision.hrPercentage !==
                                                    undefined
                                                    ? "%"
                                                    : ""}
                                                </p>

                                              </div>

                                            </div>


                                            {/* DECISION REASON */}

                                            <div
                                              className="
                                                mt-4
                                              "
                                            >

                                              <p
                                                className="
                                                  text-xs
                                                  font-semibold
                                                  text-gray-500
                                                  uppercase
                                                  tracking-wide
                                                "
                                              >
                                                Decision Reason
                                              </p>

                                              <p
                                                className="
                                                  mt-1
                                                  text-sm
                                                  text-gray-700
                                                "
                                              >
                                                {hiringDecision.decisionReason ||
                                                  "No decision reason available."}
                                              </p>

                                            </div>

                                          </div>


                                          {/* INTERVIEW DETAILS */}

                                          <div
                                            className="
                                              mt-4
                                              grid
                                              grid-cols-1
                                              md:grid-cols-4
                                              gap-4
                                            "
                                          >

                                            {/* INTERVIEW STATUS */}

                                            <div
                                              className="
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-gray-50
                                                p-4
                                              "
                                            >

                                              <p
                                                className="
                                                  text-xs
                                                  text-gray-500
                                                "
                                              >
                                                Interview Status
                                              </p>

                                              <p
                                                className="
                                                  mt-1
                                                  font-semibold
                                                  text-gray-700
                                                "
                                              >
                                                {hiringDecision.interviewStatus ||
                                                  "N/A"}
                                              </p>

                                            </div>


                                            {/* ROUND */}

                                            <div
                                              className="
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-gray-50
                                                p-4
                                              "
                                            >

                                              <p
                                                className="
                                                  text-xs
                                                  text-gray-500
                                                "
                                              >
                                                Round
                                              </p>

                                              <p
                                                className="
                                                  mt-1
                                                  font-semibold
                                                  text-gray-700
                                                "
                                              >
                                                {hiringDecision.roundName ||
                                                  "N/A"}
                                              </p>

                                            </div>


                                            {/* INTERVIEWER */}

                                            <div
                                              className="
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-gray-50
                                                p-4
                                              "
                                            >

                                              <p
                                                className="
                                                  text-xs
                                                  text-gray-500
                                                "
                                              >
                                                Interviewer
                                              </p>

                                              <p
                                                className="
                                                  mt-1
                                                  font-semibold
                                                  text-gray-700
                                                "
                                              >
                                                {hiringDecision.interviewerName ||
                                                  "N/A"}
                                              </p>

                                            </div>


                                            {/* HR OVERALL */}

                                            <div
                                              className="
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-gray-50
                                                p-4
                                              "
                                            >

                                              <p
                                                className="
                                                  text-xs
                                                  text-gray-500
                                                "
                                              >
                                                HR Overall Score
                                              </p>

                                              <p
                                                className="
                                                  mt-1
                                                  font-semibold
                                                  text-gray-700
                                                "
                                              >
                                                {hiringDecision.hrOverallScore ??
                                                  "N/A"}
                                              </p>

                                            </div>

                                          </div>


                                          {/* HR CRITERIA */}

                                          {hiringDecision.interviewStatus ===
                                            "COMPLETED" && (

                                            <div
                                              className="
                                                mt-4
                                                grid
                                                grid-cols-2
                                                md:grid-cols-4
                                                gap-4
                                              "
                                            >

                                              <div
                                                className="
                                                  rounded-xl
                                                  bg-violet-50
                                                  border
                                                  border-violet-100
                                                  p-4
                                                "
                                              >

                                                <p
                                                  className="
                                                    text-xs
                                                    text-gray-500
                                                  "
                                                >
                                                  Technical Knowledge
                                                </p>

                                                <p
                                                  className="
                                                    mt-1
                                                    text-lg
                                                    font-bold
                                                    text-violet-700
                                                  "
                                                >
                                                  {hiringDecision.technicalKnowledge ??
                                                    "N/A"}
                                                </p>

                                              </div>


                                              <div
                                                className="
                                                  rounded-xl
                                                  bg-violet-50
                                                  border
                                                  border-violet-100
                                                  p-4
                                                "
                                              >

                                                <p
                                                  className="
                                                    text-xs
                                                    text-gray-500
                                                  "
                                                >
                                                  Problem Solving
                                                </p>

                                                <p
                                                  className="
                                                    mt-1
                                                    text-lg
                                                    font-bold
                                                    text-violet-700
                                                  "
                                                >
                                                  {hiringDecision.problemSolving ??
                                                    "N/A"}
                                                </p>

                                              </div>


                                              <div
                                                className="
                                                  rounded-xl
                                                  bg-violet-50
                                                  border
                                                  border-violet-100
                                                  p-4
                                                "
                                              >

                                                <p
                                                  className="
                                                    text-xs
                                                    text-gray-500
                                                  "
                                                >
                                                  Communication
                                                </p>

                                                <p
                                                  className="
                                                    mt-1
                                                    text-lg
                                                    font-bold
                                                    text-violet-700
                                                  "
                                                >
                                                  {hiringDecision.communication ??
                                                    "N/A"}
                                                </p>

                                              </div>


                                              <div
                                                className="
                                                  rounded-xl
                                                  bg-violet-50
                                                  border
                                                  border-violet-100
                                                  p-4
                                                "
                                              >

                                                <p
                                                  className="
                                                    text-xs
                                                    text-gray-500
                                                  "
                                                >
                                                  Role Knowledge
                                                </p>

                                                <p
                                                  className="
                                                    mt-1
                                                    text-lg
                                                    font-bold
                                                    text-violet-700
                                                  "
                                                >
                                                  {hiringDecision.roleKnowledge ??
                                                    "N/A"}
                                                </p>

                                              </div>

                                            </div>

                                          )}


                                          {/* RECOMMENDATION */}

                                          <div
                                            className="
                                              mt-4
                                              flex
                                              flex-wrap
                                              gap-3
                                              items-center
                                            "
                                          >

                                            <span
                                              className="
                                                text-sm
                                                font-semibold
                                                text-gray-600
                                              "
                                            >
                                              HR Recommendation:
                                            </span>

                                            <span
                                              className="
                                                inline-flex
                                                items-center
                                                px-3
                                                py-1
                                                rounded-lg
                                                bg-violet-100
                                                text-violet-700
                                                text-sm
                                                font-semibold
                                              "
                                            >
                                              {hiringDecision.recommendation ||
                                                "N/A"}
                                            </span>

                                          </div>


                                          {/* FEEDBACK */}

                                          {hiringDecision.feedback && (

                                            <div
                                              className="
                                                mt-4
                                                rounded-xl
                                                border
                                                border-gray-200
                                                bg-gray-50
                                                p-4
                                              "
                                            >

                                              <p
                                                className="
                                                  text-xs
                                                  text-gray-500
                                                  font-semibold
                                                "
                                              >
                                                Interviewer Feedback
                                              </p>

                                              <p
                                                className="
                                                  mt-1
                                                  text-sm
                                                  text-gray-700
                                                "
                                              >
                                                {hiringDecision.feedback}
                                              </p>

                                            </div>

                                          )}

                                        </div>

                                      );

                                    })()

                                  )}

                                </div>


                                {/* =================================================
                                    RESUME
                                ================================================= */}

                                <div
                                  className="
                                    bg-white
                                    rounded-2xl
                                    p-5
                                    border
                                    border-violet-100
                                    shadow-sm
                                  "
                                >

                                  <h4
                                    className="
                                      font-semibold
                                      text-violet-600
                                      mb-3
                                    "
                                  >
                                    Resume
                                  </h4>

                                  <button
                                    onClick={() =>
                                      viewResume(
                                        candidate.resumeUrl
                                      )
                                    }
                                    className="
                                      inline-flex
                                      items-center
                                      gap-2
                                      bg-gradient-to-r
                                      from-violet-600
                                      to-cyan-500
                                      hover:from-violet-700
                                      hover:to-cyan-600
                                      text-white
                                      px-4
                                      py-2
                                      rounded-xl
                                      transition-all
                                      duration-300
                                    "
                                  >

                                    <Eye
                                      size={16}
                                    />

                                    View Resume

                                  </button>

                                </div>


                                {/* =================================================
                                    ACTIONS
                                ================================================= */}

                                <div
                                  className="
                                    bg-white
                                    rounded-2xl
                                    p-5
                                    border
                                    border-violet-100
                                    shadow-sm
                                    md:col-span-2
                                  "
                                >

                                  <h4
                                    className="
                                      font-semibold
                                      text-violet-600
                                      mb-3
                                    "
                                  >
                                    Recruitment Actions
                                  </h4>

                                  <div
                                    className="
                                      flex
                                      gap-3
                                      flex-wrap
                                    "
                                  >

                                    {/* SHORTLIST */}

                                    {candidate.currentStage !==
                                      "Shortlisted" &&
                                      candidate.currentStage !==
                                        "Selected" && (

                                      <button
                                        onClick={() =>
                                          shortlistCandidate(
                                            candidateId
                                          )
                                        }
                                        className="
                                          inline-flex
                                          items-center
                                          gap-2
                                          bg-gradient-to-r
                                          from-violet-600
                                          to-cyan-500
                                          hover:from-violet-700
                                          hover:to-cyan-600
                                          text-white
                                          px-4
                                          py-2
                                          rounded-xl
                                          text-sm
                                          transition-all
                                          duration-300
                                        "
                                      >

                                        <UserCheck
                                          size={16}
                                        />

                                        Shortlist Candidate

                                      </button>

                                    )}


                                    {/* SELECT */}

                                    {candidate.currentStage ===
                                      "Shortlisted" && (

                                      <button
                                        onClick={() =>
                                          selectCandidate(
                                            candidateId
                                          )
                                        }
                                        className="
                                          inline-flex
                                          items-center
                                          gap-2
                                          bg-violet-100
                                          hover:bg-violet-200
                                          text-violet-700
                                          px-4
                                          py-2
                                          rounded-xl
                                          text-sm
                                          transition-all
                                          duration-300
                                        "
                                      >

                                        <CheckCircle2
                                          size={16}
                                        />

                                        Select Candidate

                                      </button>

                                    )}


                                    {/* RECRUITMENT COMPLETED */}

                                    {candidate.currentStage ===
                                      "Selected" && (

                                      <span
                                        className="
                                          inline-flex
                                          items-center
                                          gap-2
                                          bg-gradient-to-r
                                          from-violet-600
                                          to-cyan-500
                                          text-white
                                          px-4
                                          py-2
                                          rounded-xl
                                          text-sm
                                        "
                                      >

                                        <CheckCircle2
                                          size={16}
                                        />

                                        Recruitment Completed

                                      </span>

                                    )}


                                    {/* GENERATE REPORT ALSO AVAILABLE
                                        IN RECRUITMENT ACTIONS */}

                                    <button
                                      type="button"
                                      disabled={
                                        hiringDecisionLoadingId ===
                                          candidateId ||
                                        reportGeneratingId ===
                                          candidateId
                                      }
                                      onClick={() =>
                                        generateHiringDecisionReport(
                                          candidate,
                                          hiringDecision
                                        )
                                      }
                                      className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        bg-slate-800
                                        hover:bg-slate-900
                                        text-white
                                        px-4
                                        py-2
                                        rounded-xl
                                        text-sm
                                        transition-all
                                        duration-300
                                        disabled:opacity-50
                                        disabled:cursor-not-allowed
                                      "
                                    >

                                      <FileDown
                                        size={16}
                                      />

                                      {reportGeneratingId ===
                                      candidateId
                                        ? "Generating PDF..."
                                        : "Generate Report PDF"}

                                    </button>

                                  </div>

                                </div>

                              </div>

                            </td>

                          </tr>

                        )}

                      </React.Fragment>

                    );

                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="
                      text-center
                      py-10
                      text-gray-500
                    "
                  >
                    No Candidates Found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

  );

}


// =========================================================
// DEFAULT EXPORT
// =========================================================

export default CandidatePage;
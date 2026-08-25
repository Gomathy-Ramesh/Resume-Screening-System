// src/pages/SkillGapPage.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Brain,
  Target,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  User,
  Sparkles,
  GraduationCap,
  ArrowRight,
  Trophy,
  CalendarPlus,
} from "lucide-react";

// =========================================================
// API URL
// =========================================================

const API_URL = "http://localhost:8080";

// =========================================================
// COMPONENT
// =========================================================

function SkillGapPage() {
  const navigate = useNavigate();

  // =========================================================
  // STATES
  // =========================================================

  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedCandidate, setSelectedCandidate] = useState("");
  const [selectedJob, setSelectedJob] = useState("");

  const [analysis, setAnalysis] = useState(null);

  const [loading, setLoading] = useState(false);

  // =========================================================
  // FETCH CANDIDATES
  // =========================================================

  const fetchCandidates = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/candidates`
      );

      console.log(
        "Candidates response:",
        response.data
      );

      if (Array.isArray(response.data)) {
        setCandidates(response.data);
      } else {
        setCandidates([]);

        console.warn(
          "Expected candidates array but received:",
          response.data
        );
      }
    } catch (error) {
      console.error(
        "Error fetching candidates:",
        error
      );

      setCandidates([]);
    }
  };

  // =========================================================
  // FETCH JOBS
  // =========================================================

  const fetchJobs = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/jobs`
      );

      console.log(
        "Jobs response:",
        response.data
      );

      if (Array.isArray(response.data)) {
        setJobs(response.data);
      } else {
        setJobs([]);

        console.warn(
          "Expected jobs array but received:",
          response.data
        );
      }
    } catch (error) {
      console.error(
        "Error fetching jobs:",
        error
      );

      setJobs([]);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  }, []);

  // =========================================================
  // NORMALIZE SKILL
  // =========================================================

  const normalizeSkill = (skill) => {
    if (!skill) {
      return "";
    }

    return String(skill)
      .trim()
      .toLowerCase()
      .replace(/[-_\s]/g, "");
  };

  // =========================================================
  // CHECK WHETHER SKILL WAS RECOVERED
  // =========================================================

  const isRecoveredSkill = (
    skill,
    completedRecoverySkills
  ) => {
    if (
      !skill ||
      !Array.isArray(completedRecoverySkills)
    ) {
      return false;
    }

    const normalizedSkill =
      normalizeSkill(skill);

    if (!normalizedSkill) {
      return false;
    }

    return completedRecoverySkills.some(
      (completedSkill) =>
        normalizeSkill(completedSkill) ===
        normalizedSkill
    );
  };

  // =========================================================
  // GET COMPLETED RECOVERY SKILLS
  // =========================================================

  const getCompletedRecoverySkills = (
    recoveryData
  ) => {
    if (!recoveryData) {
      return [];
    }

    const recoveryItems = Array.isArray(
      recoveryData.recoveryItems
    )
      ? recoveryData.recoveryItems
      : [];

    const completedSkills =
      recoveryItems
        .filter((item) => {
          if (!item || !item.skill) {
            return false;
          }

          // Backend completed flag
          if (item.completed === true) {
            return true;
          }

          // Progress >= 100
          const progress =
            Number(item.progress ?? 0);

          if (progress >= 100) {
            return true;
          }

          // All topics completed
          const topics = Array.isArray(
            item.topics
          )
            ? item.topics.filter(Boolean)
            : [];

          const completedTopics =
            Array.isArray(
              item.completedTopics
            )
              ? item.completedTopics.filter(Boolean)
              : [];

          return (
            topics.length > 0 &&
            completedTopics.length >=
              topics.length
          );
        })
        .map((item) => item.skill)
        .filter(Boolean);

    return [
      ...new Set(completedSkills),
    ];
  };

  // =========================================================
  // GET ERROR MESSAGE
  // =========================================================

  const getApiErrorMessage = (error) => {
    const status =
      error?.response?.status;

    const responseData =
      error?.response?.data;

    if (
      typeof responseData === "string" &&
      responseData.trim()
    ) {
      return responseData;
    }

    if (responseData?.message) {
      return responseData.message;
    }

    if (responseData?.error) {
      return responseData.error;
    }

    if (status === 404) {
      return (
        "Skill gap endpoint was not found. " +
        "Please check the Spring Boot controller mapping."
      );
    }

    if (status === 400) {
      return (
        "The backend rejected the candidate or job ID."
      );
    }

    if (status === 500) {
      return (
        "The Skill Gap backend returned HTTP 500. " +
        "Check the Spring Boot console for the actual exception."
      );
    }

    if (error?.message) {
      return error.message;
    }

    return "Unable to analyze skill gap.";
  };

  // =========================================================
  // ANALYZE SKILL GAP
  // =========================================================

  const analyzeSkillGap = async () => {
    // -------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------

    if (!selectedCandidate) {
      alert("Please select a candidate.");
      return;
    }

    if (!selectedJob) {
      alert("Please select a job.");
      return;
    }

    const candidateId =
      String(selectedCandidate).trim();

    const jobId =
      String(selectedJob).trim();

    if (!candidateId || !jobId) {
      alert(
        "Invalid candidate or job selection."
      );
      return;
    }

    setLoading(true);
    setAnalysis(null);

    // -------------------------------------------------------
    // SKILL GAP URL
    // -------------------------------------------------------

    const skillGapUrl =
      `${API_URL}/candidates/` +
      `${encodeURIComponent(candidateId)}` +
      `/skill-gap/` +
      `${encodeURIComponent(jobId)}`;

    console.log(
      "================================================="
    );

    console.log(
      "SKILL GAP ANALYSIS"
    );

    console.log(
      "Candidate ID:",
      candidateId
    );

    console.log(
      "Job ID:",
      jobId
    );

    console.log(
      "Request URL:",
      skillGapUrl
    );

    console.log(
      "================================================="
    );

    try {
      // =====================================================
      // 1. ORIGINAL SKILL GAP
      // =====================================================

      const skillGapResponse =
        await axios.get(
          skillGapUrl,
          {
            timeout: 15000,
          }
        );

      console.log(
        "Skill gap HTTP status:",
        skillGapResponse.status
      );

      console.log(
        "Skill gap response:",
        skillGapResponse.data
      );

      const skillGap =
        skillGapResponse.data || {};

      // =====================================================
      // VALIDATE RESPONSE
      // =====================================================

      if (
        typeof skillGap !== "object" ||
        Array.isArray(skillGap)
      ) {
        throw new Error(
          "Backend returned an invalid skill gap response."
        );
      }

      // =====================================================
      // 2. LOAD RECOVERY PROGRAM
      // =====================================================

      let completedRecoverySkills =
        Array.isArray(
          skillGap.completedRecoverySkills
        )
          ? skillGap.completedRecoverySkills
          : [];

      const recoveryUrl =
        `${API_URL}/candidates/` +
        `${encodeURIComponent(candidateId)}` +
        `/skill-recovery/` +
        `${encodeURIComponent(jobId)}`;

      console.log(
        "Recovery URL:",
        recoveryUrl
      );

      try {
        const recoveryResponse =
          await axios.get(
            recoveryUrl,
            {
              timeout: 15000,
            }
          );

        console.log(
          "Recovery response:",
          recoveryResponse.data
        );

        const recoveredFromProgram =
          getCompletedRecoverySkills(
            recoveryResponse.data
          );

        completedRecoverySkills = [
          ...new Set([
            ...completedRecoverySkills,
            ...recoveredFromProgram,
          ]),
        ];
      } catch (recoveryError) {
        console.warn(
          "Could not load recovery progress.",
          recoveryError
        );

        console.warn(
          "Recovery status:",
          recoveryError?.response?.status
        );

        console.warn(
          "Recovery response:",
          recoveryError?.response?.data
        );
      }

      // =====================================================
      // 3. ORIGINAL MATCHED SKILLS
      // =====================================================

      const originalMatchedSkills = [
        ...new Set(
          Array.isArray(
            skillGap.matchedSkills
          )
            ? skillGap.matchedSkills.filter(Boolean)
            : []
        ),
      ];

      // =====================================================
      // 4. ORIGINAL MISSING SKILLS
      // =====================================================

      const originalMissingSkills = [
        ...new Set(
          Array.isArray(
            skillGap.missingSkills
          )
            ? skillGap.missingSkills.filter(Boolean)
            : []
        ),
      ];

      console.log(
        "Original matched skills:",
        originalMatchedSkills
      );

      console.log(
        "Original missing skills:",
        originalMissingSkills
      );

      console.log(
        "Completed recovery skills:",
        completedRecoverySkills
      );

      // =====================================================
      // 5. REMOVE RECOVERED SKILLS FROM MISSING
      // =====================================================

      const effectiveMissingSkills =
        originalMissingSkills.filter(
          (skill) =>
            !isRecoveredSkill(
              skill,
              completedRecoverySkills
            )
        );

      // =====================================================
      // 6. ADD RECOVERED SKILLS TO MATCHED
      // =====================================================

      const recoveredMissingSkills =
        completedRecoverySkills.filter(
          (recoveredSkill) =>
            originalMissingSkills.some(
              (missingSkill) =>
                normalizeSkill(
                  missingSkill
                ) ===
                normalizeSkill(
                  recoveredSkill
                )
            )
        );

      const effectiveMatchedSkills = [
        ...new Set([
          ...originalMatchedSkills,
          ...recoveredMissingSkills,
        ]),
      ];

      // =====================================================
      // 7. CALCULATE EFFECTIVE MATCH %
      // =====================================================

      const totalRequiredSkills =
        effectiveMatchedSkills.length +
        effectiveMissingSkills.length;

      let effectiveMatchPercentage = 0;

      if (totalRequiredSkills > 0) {
        effectiveMatchPercentage =
          (
            effectiveMatchedSkills.length /
            totalRequiredSkills
          ) * 100;
      } else {
        effectiveMatchPercentage =
          Number(
            skillGap.matchPercentage ??
              skillGap.score ??
              0
          );
      }

      effectiveMatchPercentage =
        Math.min(
          100,
          Math.max(
            0,
            Math.round(
              effectiveMatchPercentage * 100
            ) / 100
          )
        );

      // =====================================================
      // 8. FINAL ANALYSIS
      // =====================================================

      const finalAnalysis = {
        ...skillGap,

        candidateId:
          skillGap.candidateId ||
          candidateId,

        jobId:
          skillGap.jobId ||
          jobId,

        candidateName:
          skillGap.candidateName ||
          candidates.find(
            (candidate) =>
              String(
                candidate.candidateId
              ) === candidateId
          )?.name ||
          "Candidate",

        jobTitle:
          skillGap.jobTitle ||
          jobs.find(
            (job) =>
              String(job.jobId) === jobId
          )?.jobTitle ||
          "Job",

        matchPercentage:
          effectiveMatchPercentage,

        matchedSkills:
          effectiveMatchedSkills,

        missingSkills:
          effectiveMissingSkills,

        completedRecoverySkills:
          completedRecoverySkills,
      };

      console.log(
        "FINAL SKILL GAP ANALYSIS:",
        finalAnalysis
      );

      setAnalysis(
        finalAnalysis
      );
    } catch (error) {
      console.error(
        "================================================="
      );

      console.error(
        "SKILL GAP ANALYSIS FAILED"
      );

      console.error(
        "Candidate ID:",
        candidateId
      );

      console.error(
        "Job ID:",
        jobId
      );

      console.error(
        "Request URL:",
        skillGapUrl
      );

      console.error(
        "HTTP Status:",
        error?.response?.status
      );

      console.error(
        "Backend Response:",
        error?.response?.data
      );

      console.error(
        "Axios Error:",
        error
      );

      console.error(
        "================================================="
      );

      const message =
        getApiErrorMessage(error);

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // START / VIEW SKILL RECOVERY
  // =========================================================

  const startSkillRecovery = () => {
    if (!selectedCandidate) {
      alert("Please select a candidate.");
      return;
    }

    if (!selectedJob) {
      alert("Please select a job.");
      return;
    }

    navigate(
      `/skill-recovery/${selectedCandidate}/${selectedJob}`
    );
  };

  // =========================================================
  // SCHEDULE INTERVIEW
  //
  // This is used when:
  //
  // 1. Candidate originally has no missing skills
  // OR
  // 2. Candidate completed Skill Recovery
  //
  // The candidate ID and job ID are passed to the
  // Interviews page through React Router state.
  // =========================================================

  const scheduleInterview = () => {
    if (!selectedCandidate) {
      alert("Please select a candidate.");
      return;
    }

    if (!selectedJob) {
      alert("Please select a job.");
      return;
    }

    if (!analysis) {
      alert(
        "Please analyze the skill gap before scheduling the interview."
      );
      return;
    }

    // -------------------------------------------------------
    // Safety check
    // -------------------------------------------------------

    if (missingSkills.length > 0) {
      alert(
        "The candidate still has missing skills. " +
        "Please complete the Skill Recovery program first."
      );

      return;
    }

    const candidate =
      candidates.find(
        (item) =>
          String(item.candidateId) ===
          String(selectedCandidate)
      );

    const job =
      jobs.find(
        (item) =>
          String(item.jobId) ===
          String(selectedJob)
      );

    console.log(
      "================================================="
    );

    console.log(
      "OPENING INTERVIEW SCHEDULING"
    );

    console.log(
      "Candidate ID:",
      selectedCandidate
    );

    console.log(
      "Candidate Name:",
      candidate?.name
    );

    console.log(
      "Job ID:",
      selectedJob
    );

    console.log(
      "Job Title:",
      job?.jobTitle
    );

    console.log(
      "================================================="
    );

    // -------------------------------------------------------
    // Navigate to Interviews page.
    //
    // The state contains the selected candidate and job
    // so the Interviews page can automatically open the
    // scheduling workflow for this candidate.
    // -------------------------------------------------------

    navigate("/interviews", {
      state: {
        scheduleInterview: true,

        candidateId:
          Number(selectedCandidate),

        jobId:
          Number(selectedJob),

        candidateName:
          analysis.candidateName ||
          candidate?.name ||
          "Candidate",

        jobTitle:
          analysis.jobTitle ||
          job?.jobTitle ||
          "Job",

        matchPercentage:
          analysis.matchPercentage ?? 0,
      },
    });
  };

  // =========================================================
  // DERIVED VALUES
  // =========================================================

  const matchedSkills =
    Array.isArray(
      analysis?.matchedSkills
    )
      ? analysis.matchedSkills
      : [];

  const missingSkills =
    Array.isArray(
      analysis?.missingSkills
    )
      ? analysis.missingSkills
      : [];

  const completedRecoverySkills =
    Array.isArray(
      analysis?.completedRecoverySkills
    )
      ? analysis.completedRecoverySkills
      : [];

  // =========================================================
  // RECOVERY / INTERVIEW ELIGIBILITY
  // =========================================================
  //
  // If there are no remaining missing skills,
  // the candidate is ready for the interview.
  //
  // This covers BOTH:
  //
  // A. Candidate originally had 0 missing skills
  //
  // B. Candidate had missing skills but completed
  //    the Skill Recovery program.
  //
  // =========================================================

  const recoveryCompleted =
    missingSkills.length === 0;

  const interviewReady =
    analysis !== null &&
    recoveryCompleted;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      className="
        h-full
        overflow-y-auto
        bg-[#FAFAFF]
        px-6
        pb-8
        pt-2
      "
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-6">
        <div className="flex items-center gap-3">

          <div
            className="
              flex h-12 w-12
              items-center justify-center
              rounded-2xl
              bg-gradient-to-r
              from-violet-600
              to-cyan-500
              shadow-lg
            "
          >
            <Brain
              size={25}
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
              Skill Gap Analysis
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Identify missing skills by comparing
              candidate expertise with job requirements
            </p>

          </div>

        </div>
      </div>

      {/* =====================================================
          SELECTION CARD
      ===================================================== */}

      <div
        className="
          mb-6
          rounded-3xl
          border border-slate-200
          bg-white
          p-6
          shadow-sm
        "
      >

        <div className="mb-5 flex items-center gap-2">

          <Sparkles
            size={20}
            className="text-violet-600"
          />

          <h2
            className="
              text-xl
              font-bold
              text-slate-800
            "
          >
            Select Candidate & Job
          </h2>

        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-5
            md:grid-cols-2
          "
        >

          {/* =================================================
              CANDIDATE
          ================================================= */}

          <div>

            <label
              className="
                mb-2
                flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-slate-700
              "
            >

              <User
                size={16}
                className="text-violet-600"
              />

              Candidate

            </label>

            <select
              value={selectedCandidate}
              onChange={(e) => {
                setSelectedCandidate(
                  e.target.value
                );

                setAnalysis(null);
              }}
              className="
                w-full
                rounded-xl
                border border-violet-200
                bg-white
                px-4
                py-3
                text-sm
                text-slate-700
                outline-none
                focus:border-violet-500
                focus:ring-2
                focus:ring-violet-100
              "
            >

              <option value="">
                Select Candidate
              </option>

              {candidates.map(
                (candidate) => (
                  <option
                    key={
                      candidate.candidateId
                    }
                    value={
                      candidate.candidateId
                    }
                  >
                    {candidate.name}
                    {" - "}
                    {candidate.appliedPosition}
                  </option>
                )
              )}

            </select>

          </div>

          {/* =================================================
              JOB
          ================================================= */}

          <div>

            <label
              className="
                mb-2
                flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-slate-700
              "
            >

              <Briefcase
                size={16}
                className="text-violet-600"
              />

              Job Position

            </label>

            <select
              value={selectedJob}
              onChange={(e) => {
                setSelectedJob(
                  e.target.value
                );

                setAnalysis(null);
              }}
              className="
                w-full
                rounded-xl
                border border-violet-200
                bg-white
                px-4
                py-3
                text-sm
                text-slate-700
                outline-none
                focus:border-violet-500
                focus:ring-2
                focus:ring-violet-100
              "
            >

              <option value="">
                Select Job
              </option>

              {jobs.map((job) => (
                <option
                  key={job.jobId}
                  value={job.jobId}
                >
                  {job.jobTitle}
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* =================================================
            ANALYZE BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={analyzeSkillGap}
          disabled={
            loading ||
            !selectedCandidate ||
            !selectedJob
          }
          className="
            mt-6
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-gradient-to-r
            from-violet-600
            to-cyan-500
            px-6
            py-3
            text-sm
            font-semibold
            text-white
            shadow-lg
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-xl
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >

          <Brain size={18} />

          {loading
            ? "Analyzing..."
            : "Analyze Skill Gap"}

        </button>

      </div>

      {/* =====================================================
          ANALYSIS
      ===================================================== */}

      {analysis && (
        <div className="space-y-6">

          {/* =================================================
              INTERVIEW READY BANNER
          ================================================= */}

          {interviewReady && (
            <div
              className="
                rounded-3xl
                border border-emerald-200
                bg-gradient-to-r
                from-emerald-50
                to-green-50
                p-5
                shadow-sm
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-5
                  md:flex-row
                  md:items-center
                  md:justify-between
                "
              >

                <div className="flex items-center gap-4">

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-emerald-100
                    "
                  >

                    <CheckCircle2
                      size={27}
                      className="text-emerald-600"
                    />

                  </div>

                  <div>

                    <h3
                      className="
                        text-lg
                        font-bold
                        text-emerald-800
                      "
                    >
                      Candidate Ready for Interview
                    </h3>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-emerald-700
                      "
                    >
                      No remaining skill gaps were
                      identified. The recruiter can now
                      schedule the candidate's interview.
                    </p>

                  </div>

                </div>

                {/* =================================================
                    SCHEDULE INTERVIEW BUTTON
                ================================================= */}

                <button
                  type="button"
                  onClick={scheduleInterview}
                  className="
                    inline-flex
                    shrink-0
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-emerald-600
                    to-green-500
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-xl
                  "
                >

                  <CalendarPlus size={19} />

                  Schedule Interview

                  <ArrowRight size={18} />

                </button>

              </div>

            </div>
          )}

          {/* =================================================
              RECOVERY COMPLETION BANNER
          ================================================= */}

          {recoveryCompleted &&
            completedRecoverySkills.length > 0 && (
              <div
                className="
                  rounded-3xl
                  border border-emerald-200
                  bg-gradient-to-r
                  from-emerald-50
                  to-green-50
                  p-5
                  shadow-sm
                "
              >

                <div className="flex items-center gap-4">

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-2xl
                      bg-emerald-100
                    "
                  >

                    <Trophy
                      size={26}
                      className="text-emerald-600"
                    />

                  </div>

                  <div>

                    <h3
                      className="
                        text-lg
                        font-bold
                        text-emerald-800
                      "
                    >
                      Skill Recovery Completed
                    </h3>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-emerald-700
                      "
                    >
                      The candidate has completed the
                      required skill recovery topics.
                      Recovered skills are now included
                      in the job match.
                    </p>

                  </div>

                </div>

              </div>
            )}

          {/* =================================================
              SUMMARY
          ================================================= */}

          <div
            className="
              rounded-3xl
              bg-gradient-to-r
              from-violet-600
              to-cyan-500
              p-6
              text-white
              shadow-lg
            "
          >

            <div className="flex items-center gap-3">

              <Target size={26} />

              <div>

                <h2
                  className="
                    text-xl
                    font-bold
                  "
                >
                  {analysis.candidateName}
                </h2>

                <p
                  className="
                    text-sm
                    text-violet-100
                  "
                >
                  {analysis.jobTitle}
                </p>

              </div>

            </div>

            <div
              className="
                mt-6
                grid
                grid-cols-1
                gap-4
                md:grid-cols-3
              "
            >

              {/* MATCH */}

              <div
                className="
                  rounded-2xl
                  bg-white/15
                  p-4
                "
              >

                <p
                  className="
                    text-sm
                    text-violet-100
                  "
                >
                  Match Percentage
                </p>

                <p
                  className="
                    mt-1
                    text-3xl
                    font-bold
                  "
                >
                  {analysis.matchPercentage ?? 0}%
                </p>

                {completedRecoverySkills.length >
                  0 && (
                  <p
                    className="
                      mt-1
                      text-xs
                      text-emerald-100
                    "
                  >
                    Includes recovered skills
                  </p>
                )}

              </div>

              {/* MATCHED */}

              <div
                className="
                  rounded-2xl
                  bg-white/15
                  p-4
                "
              >

                <p
                  className="
                    text-sm
                    text-violet-100
                  "
                >
                  Matched Skills
                </p>

                <p
                  className="
                    mt-1
                    text-3xl
                    font-bold
                  "
                >
                  {matchedSkills.length}
                </p>

              </div>

              {/* MISSING */}

              <div
                className="
                  rounded-2xl
                  bg-white/15
                  p-4
                "
              >

                <p
                  className="
                    text-sm
                    text-violet-100
                  "
                >
                  Missing Skills
                </p>

                <p
                  className="
                    mt-1
                    text-3xl
                    font-bold
                  "
                >
                  {missingSkills.length}
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              SKILL DETAILS
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              gap-6
              md:grid-cols-2
            "
          >

            {/* =================================================
                MATCHED SKILLS
            ================================================= */}

            <div
              className="
                rounded-3xl
                border border-emerald-100
                bg-white
                p-6
                shadow-sm
              "
            >

              <div
                className="
                  mb-5
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
                    bg-emerald-100
                  "
                >

                  <CheckCircle2
                    size={22}
                    className="text-emerald-600"
                  />

                </div>

                <div>

                  <h3
                    className="
                      text-lg
                      font-bold
                      text-slate-800
                    "
                  >
                    Matched Skills
                  </h3>

                  <p
                    className="
                      text-sm
                      text-slate-500
                    "
                  >
                    Skills already available or
                    successfully recovered
                  </p>

                </div>

              </div>

              <div
                className="
                  flex
                  flex-wrap
                  gap-3
                "
              >

                {matchedSkills.length > 0 ? (
                  matchedSkills.map(
                    (skill, index) => {

                      const recovered =
                        isRecoveredSkill(
                          skill,
                          completedRecoverySkills
                        );

                      return (
                        <span
                          key={`${skill}-${index}`}
                          className={`
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            ${
                              recovered
                                ? "border border-emerald-300 bg-emerald-100 text-emerald-800"
                                : "bg-emerald-50 text-emerald-700"
                            }
                          `}
                        >

                          <CheckCircle2
                            size={16}
                          />

                          {skill}

                          {recovered && (
                            <span
                              className="
                                rounded-full
                                bg-emerald-200
                                px-2
                                py-0.5
                                text-xs
                                font-bold
                              "
                            >
                              RECOVERED
                            </span>
                          )}

                        </span>
                      );
                    }
                  )
                ) : (
                  <p
                    className="
                      text-sm
                      text-slate-400
                    "
                  >
                    No matched skills
                  </p>
                )}

              </div>

            </div>

            {/* =================================================
                MISSING SKILLS
            ================================================= */}

            <div
              className="
                rounded-3xl
                border border-amber-100
                bg-white
                p-6
                shadow-sm
              "
            >

              <div
                className="
                  mb-5
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
                    bg-amber-100
                  "
                >

                  <AlertCircle
                    size={22}
                    className="text-amber-600"
                  />

                </div>

                <div>

                  <h3
                    className="
                      text-lg
                      font-bold
                      text-slate-800
                    "
                  >
                    Missing Skills
                  </h3>

                  <p
                    className="
                      text-sm
                      text-slate-500
                    "
                  >
                    Skills still recommended for recovery
                  </p>

                </div>

              </div>

              <div
                className="
                  flex
                  flex-wrap
                  gap-3
                "
              >

                {missingSkills.length > 0 ? (
                  missingSkills.map(
                    (skill, index) => {

                      const recovered =
                        isRecoveredSkill(
                          skill,
                          completedRecoverySkills
                        );

                      if (recovered) {
                        return (
                          <span
                            key={`${skill}-${index}`}
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-full
                              border
                              border-emerald-300
                              bg-emerald-100
                              px-4
                              py-2
                              text-sm
                              font-semibold
                              text-emerald-800
                            "
                          >

                            <CheckCircle2
                              size={16}
                            />

                            {skill}

                            <span
                              className="
                                rounded-full
                                bg-emerald-200
                                px-2
                                py-0.5
                                text-xs
                                font-bold
                              "
                            >
                              COMPLETED
                            </span>

                          </span>
                        );
                      }

                      return (
                        <span
                          key={`${skill}-${index}`}
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            bg-amber-50
                            px-4
                            py-2
                            text-sm
                            font-semibold
                            text-amber-700
                          "
                        >

                          <AlertCircle
                            size={15}
                          />

                          {skill}

                        </span>
                      );
                    }
                  )
                ) : (
                  <div
                    className="
                      flex
                      w-full
                      items-center
                      gap-3
                      rounded-2xl
                      border
                      border-emerald-200
                      bg-emerald-50
                      p-4
                    "
                  >

                    <CheckCircle2
                      size={22}
                      className="
                        shrink-0
                        text-emerald-600
                      "
                    />

                    <div>

                      <p
                        className="
                          font-semibold
                          text-emerald-800
                        "
                      >
                        No Remaining Skill Gaps
                      </p>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-emerald-700
                        "
                      >
                        All required skills are
                        available or have been
                        successfully recovered.
                      </p>

                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

          {/* =================================================
              COMPLETED RECOVERY SKILLS
          ================================================= */}

          {completedRecoverySkills.length > 0 && (
            <div
              className="
                rounded-3xl
                border border-emerald-200
                bg-emerald-50
                p-6
                shadow-sm
              "
            >

              <div
                className="
                  mb-5
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
                    rounded-xl
                    bg-emerald-100
                  "
                >

                  <GraduationCap
                    size={24}
                    className="text-emerald-600"
                  />

                </div>

                <div>

                  <h3
                    className="
                      text-lg
                      font-bold
                      text-emerald-800
                    "
                  >
                    Skills Completed Through Recovery
                  </h3>

                  <p
                    className="
                      text-sm
                      text-emerald-700
                    "
                  >
                    These skills were completed through
                    the Skill Recovery Program.
                  </p>

                </div>

              </div>

              <div
                className="
                  flex
                  flex-wrap
                  gap-3
                "
              >

                {completedRecoverySkills.map(
                  (skill, index) => (
                    <span
                      key={`${skill}-${index}`}
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-emerald-300
                        bg-white
                        px-4
                        py-2
                        text-sm
                        font-bold
                        text-emerald-800
                        shadow-sm
                      "
                    >

                      <CheckCircle2
                        size={17}
                        className="text-emerald-600"
                      />

                      {skill}

                      <span
                        className="
                          rounded-full
                          bg-emerald-100
                          px-2
                          py-0.5
                          text-xs
                          font-bold
                          text-emerald-700
                        "
                      >
                        COMPLETED
                      </span>

                    </span>
                  )
                )}

              </div>

            </div>
          )}

          {/* =================================================
              RECOVERY PROGRAM
          ================================================= */}

          {missingSkills.length > 0 && (
            <div
              className="
                rounded-3xl
                border border-violet-100
                bg-white
                p-6
                shadow-sm
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-5
                  md:flex-row
                  md:items-center
                  md:justify-between
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-4
                  "
                >

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-2xl
                      bg-gradient-to-r
                      from-violet-600
                      to-cyan-500
                      shadow-lg
                    "
                  >

                    <GraduationCap
                      size={25}
                      className="text-white"
                    />

                  </div>

                  <div>

                    <h3
                      className="
                        text-lg
                        font-bold
                        text-slate-800
                      "
                    >
                      Skill Recovery Program
                    </h3>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-slate-500
                      "
                    >
                      Build a personalized learning
                      program for the candidate's
                      missing skills.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={startSkillRecovery}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-violet-600
                    to-cyan-500
                    px-6
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    hover:shadow-xl
                  "
                >

                  <GraduationCap
                    size={18}
                  />

                  View Recovery Program

                  <ArrowRight
                    size={18}
                  />

                </button>

              </div>

            </div>
          )}

          {/* =================================================
              RECOVERY COMPLETED
          ================================================= */}

          {recoveryCompleted &&
            completedRecoverySkills.length > 0 && (
              <div
                className="
                  rounded-3xl
                  border border-emerald-200
                  bg-white
                  p-6
                  shadow-sm
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    gap-4
                    md:flex-row
                    md:items-center
                    md:justify-between
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >

                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        rounded-2xl
                        bg-emerald-100
                      "
                    >

                      <Trophy
                        size={25}
                        className="text-emerald-600"
                      />

                    </div>

                    <div>

                      <h3
                        className="
                          text-lg
                          font-bold
                          text-slate-800
                        "
                      >
                        Recovery Successfully Completed
                      </h3>

                      <p
                        className="
                          mt-1
                          text-sm
                          text-slate-500
                        "
                      >
                        The candidate has completed
                        the required skill recovery
                        program and the recovered
                        skills are now included in
                        the match percentage.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={startSkillRecovery}
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-emerald-200
                      bg-emerald-50
                      px-5
                      py-3
                      text-sm
                      font-semibold
                      text-emerald-700
                      transition
                      hover:bg-emerald-100
                    "
                  >

                    View Recovery Status

                    <ArrowRight
                      size={17}
                    />

                  </button>

                </div>

              </div>
            )}

        </div>
      )}

    </div>
  );
}

export default SkillGapPage;
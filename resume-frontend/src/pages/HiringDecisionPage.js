import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  UserRound,
  Mail,
  Briefcase,
  FileText,
  Calendar,
  Star,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

const API_URL = "http://localhost:8080";

function HiringDecisionPage() {
  const [candidateId, setCandidateId] = useState("");
  const [decision, setDecision] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // GET CANDIDATE ID
  // ======================================================

  useEffect(() => {
    const storedCandidateId =
      localStorage.getItem("candidateId");

    if (storedCandidateId) {
      setCandidateId(storedCandidateId);
    }
  }, []);

  // ======================================================
  // FETCH HIRING DECISION
  // ======================================================

  const fetchHiringDecision = async (id = candidateId) => {
    if (!id) {
      setError(
        "Candidate ID is not available."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/api/hiring-decisions/${id}`
      );

      setDecision(response.data);
    } catch (err) {
      console.error(
        "Hiring decision error:",
        err
      );

      setDecision(null);

      setError(
        err.response?.data?.message ||
        "Unable to fetch hiring decision."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD DECISION
  // ======================================================

  useEffect(() => {
    if (candidateId) {
      fetchHiringDecision(candidateId);
    }
  }, [candidateId]);

  // ======================================================
  // DECISION STYLE
  // ======================================================

  const getDecisionStyle = (value) => {
    switch (value?.toUpperCase()) {
      case "SELECTED":
        return {
          icon: <CheckCircle size={42} />,
          title: "Selected",
          className:
            "bg-green-50 border-green-200 text-green-700",
        };

      case "REJECTED":
        return {
          icon: <XCircle size={42} />,
          title: "Rejected",
          className:
            "bg-red-50 border-red-200 text-red-700",
        };

      case "ON_HOLD":
        return {
          icon: <Clock size={42} />,
          title: "On Hold",
          className:
            "bg-yellow-50 border-yellow-200 text-yellow-700",
        };

      case "PENDING_INTERVIEW":
        return {
          icon: <Calendar size={42} />,
          title: "Pending Interview",
          className:
            "bg-blue-50 border-blue-200 text-blue-700",
        };

      case "PENDING_EVALUATION":
        return {
          icon: <Clock size={42} />,
          title: "Pending Evaluation",
          className:
            "bg-purple-50 border-purple-200 text-purple-700",
        };

      default:
        return {
          icon: <AlertCircle size={42} />,
          title: value || "Unknown",
          className:
            "bg-slate-50 border-slate-200 text-slate-700",
        };
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">

          <RefreshCw
            size={40}
            className="mx-auto mb-4 animate-spin text-blue-600"
          />

          <p className="text-slate-600 font-medium">
            Loading hiring decision...
          </p>

        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR
  // ======================================================

  if (error) {
    return (
      <div className="min-h-full flex items-center justify-center">

        <div className="max-w-md w-full rounded-2xl border border-red-200 bg-red-50 p-8 text-center">

          <AlertCircle
            size={42}
            className="mx-auto mb-4 text-red-500"
          />

          <h2 className="text-xl font-bold text-red-700">
            Unable to Load Hiring Decision
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              fetchHiringDecision()
            }
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
          >
            <RefreshCw size={17} />
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ======================================================
  // NO DATA
  // ======================================================

  if (!decision) {
    return (
      <div className="min-h-full flex items-center justify-center">

        <div className="text-center">

          <FileText
            size={45}
            className="mx-auto mb-4 text-slate-400"
          />

          <h2 className="text-xl font-bold text-slate-700">
            No Hiring Decision Available
          </h2>

          <p className="mt-2 text-slate-500">
            There is currently no hiring decision for this candidate.
          </p>

        </div>

      </div>
    );
  }

  const decisionStyle =
    getDecisionStyle(decision.decision);

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="space-y-6 pb-10">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Hiring Decision
        </h1>

        <p className="mt-1 text-slate-500">
          Final recruitment decision and interview evaluation
        </p>
      </div>


      {/* ==================================================
          DECISION CARD
      ================================================== */}

      <div
        className={`rounded-3xl border p-8 ${decisionStyle.className}`}
      >

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div className="flex items-center gap-5">

            <div>
              {decisionStyle.icon}
            </div>

            <div>

              <p className="text-sm font-semibold uppercase tracking-wide opacity-70">
                Final Hiring Decision
              </p>

              <h2 className="mt-1 text-4xl font-black">
                {decisionStyle.title}
              </h2>

            </div>

          </div>

          <button
            onClick={() =>
              fetchHiringDecision()
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-current px-5 py-3 font-semibold hover:bg-white/50"
          >
            <RefreshCw size={17} />
            Refresh
          </button>

        </div>

        <div className="mt-6 rounded-2xl bg-white/60 p-5">

          <p className="text-sm font-semibold">
            Decision Reason
          </p>

          <p className="mt-2 leading-relaxed">
            {decision.decisionReason ||
              "No decision reason available."}
          </p>

        </div>

      </div>


      {/* ==================================================
          CANDIDATE INFORMATION
      ================================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <UserRound size={22} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Candidate Information
            </h2>

            <p className="text-sm text-slate-500">
              Application details
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <InfoItem
            icon={<UserRound size={18} />}
            label="Candidate Name"
            value={decision.candidateName}
          />

          <InfoItem
            icon={<Mail size={18} />}
            label="Email"
            value={decision.email}
          />

          <InfoItem
            icon={<Briefcase size={18} />}
            label="Applied Position"
            value={decision.appliedPosition}
          />

          <InfoItem
            icon={<FileText size={18} />}
            label="Resume Score"
            value={
              decision.resumeScore !== null &&
              decision.resumeScore !== undefined
                ? `${decision.resumeScore}%`
                : "N/A"
            }
          />

          <InfoItem
            icon={<Star size={18} />}
            label="Required Threshold"
            value={
              decision.thresholdPercentage !== null &&
              decision.thresholdPercentage !== undefined
                ? `${decision.thresholdPercentage}%`
                : "N/A"
            }
          />

        </div>

      </div>


      {/* ==================================================
          INTERVIEW INFORMATION
      ================================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
            <Calendar size={22} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Interview Information
            </h2>

            <p className="text-sm text-slate-500">
              Interview status and interviewer details
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <InfoItem
            label="Interview ID"
            value={
              decision.interviewId ??
              "No interview"
            }
          />

          <InfoItem
            label="Interview Status"
            value={
              decision.interviewStatus ??
              "No interview"
            }
          />

          <InfoItem
            label="Round"
            value={
              decision.roundName ??
              "N/A"
            }
          />

          <InfoItem
            label="Interviewer"
            value={
              decision.interviewerName ??
              "N/A"
            }
          />

          <InfoItem
            label="Recommendation"
            value={
              decision.recommendation ??
              "N/A"
            }
          />

        </div>

      </div>


      {/* ==================================================
          HR EVALUATION
      ================================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-cyan-50 p-3 text-cyan-600">
            <Star size={22} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              HR Evaluation
            </h2>

            <p className="text-sm text-slate-500">
              Interview evaluation scores
            </p>
          </div>

        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">

          <ScoreCard
            label="Technical Knowledge"
            value={decision.technicalKnowledge}
          />

          <ScoreCard
            label="Problem Solving"
            value={decision.problemSolving}
          />

          <ScoreCard
            label="Communication"
            value={decision.communication}
          />

          <ScoreCard
            label="Role Knowledge"
            value={decision.roleKnowledge}
          />

        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">

          <div className="rounded-2xl bg-slate-50 p-5">

            <p className="text-sm text-slate-500">
              HR Overall Score
            </p>

            <p className="mt-2 text-3xl font-black text-slate-800">
              {decision.hrOverallScore !== null &&
              decision.hrOverallScore !== undefined
                ? decision.hrOverallScore
                : "N/A"}
            </p>

          </div>

          <div className="rounded-2xl bg-slate-50 p-5">

            <p className="text-sm text-slate-500">
              HR Percentage
            </p>

            <p className="mt-2 text-3xl font-black text-blue-600">
              {decision.hrPercentage !== null &&
              decision.hrPercentage !== undefined
                ? `${decision.hrPercentage}%`
                : "N/A"}
            </p>

          </div>

        </div>

      </div>


      {/* ==================================================
          RECOMMENDATION / FEEDBACK
      ================================================== */}

      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

        <div className="mb-6 flex items-center gap-3">

          <div className="rounded-xl bg-green-50 p-3 text-green-600">
            <MessageSquare size={22} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Interview Feedback
            </h2>

            <p className="text-sm text-slate-500">
              HR recommendation and comments
            </p>
          </div>

        </div>

        <div className="space-y-5">

          <div>

            <p className="mb-2 text-sm font-semibold text-slate-600">
              Recommendation
            </p>

            <div className="rounded-xl bg-slate-50 px-4 py-3 font-semibold text-slate-800">
              {decision.recommendation ||
                "No recommendation available."}
            </div>

          </div>

          <div>

            <p className="mb-2 text-sm font-semibold text-slate-600">
              Feedback
            </p>

            <div className="min-h-[100px] rounded-xl bg-slate-50 px-4 py-3 text-slate-700">
              {decision.feedback ||
                "No feedback provided."}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


// ======================================================
// INFO ITEM
// ======================================================

function InfoItem({
  icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">

      <div className="flex items-center gap-2 text-slate-500">

        {icon}

        <span className="text-sm">
          {label}
        </span>

      </div>

      <p className="mt-2 font-semibold text-slate-800 break-words">
        {value ?? "N/A"}
      </p>

    </div>
  );
}


// ======================================================
// SCORE CARD
// ======================================================

function ScoreCard({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-center">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-black text-slate-800">
        {value !== null &&
        value !== undefined
          ? value
          : "N/A"}
      </p>

      {value !== null &&
        value !== undefined && (
          <p className="mt-1 text-xs text-slate-400">
            / 10
          </p>
        )}

    </div>
  );
}

export default HiringDecisionPage;
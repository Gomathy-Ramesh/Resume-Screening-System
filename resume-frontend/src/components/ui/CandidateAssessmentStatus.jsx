import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  Clock,
  Circle,
  Loader2,
  Trophy,
} from "lucide-react";

const API_URL = "http://localhost:8080";

export default function CandidateAssessmentStatus({
  candidateId,
  jobId,
}) {
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAssessment = async () => {
    if (!candidateId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/technical-assessments/candidate/${candidateId}`
      );

      const assessments = Array.isArray(response.data)
        ? response.data
        : [];

      let selectedAssessment = null;

      // Prefer the selected job.
      if (jobId) {
        selectedAssessment = assessments.find(
          (item) => Number(item.jobId) === Number(jobId)
        );
      }

      // Fallback to the first assessment.
      if (!selectedAssessment) {
        selectedAssessment = assessments[0] || null;
      }

      setAssessment(selectedAssessment);
    } catch (error) {
      console.error(
        "Assessment status error:",
        error
      );

      setAssessment(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessment();
  }, [candidateId, jobId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Loader2
          size={15}
          className="animate-spin"
        />
        Loading assessment...
      </div>
    );
  }

  // =====================================================
  // NO ASSESSMENT
  // =====================================================

  if (!assessment) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
        <Circle size={14} />
        Assessment Not Started
      </div>
    );
  }

  const status = String(
    assessment.status || ""
  ).toUpperCase();

  const totalQuestions = Number(
    assessment.totalQuestions || 0
  );

  const rawScore = Number(
    assessment.score || 0
  );

  const percentage =
    totalQuestions > 0
      ? Math.round(
          (rawScore / totalQuestions) * 100
        )
      : 0;

  // =====================================================
  // COMPLETED
  // =====================================================

  if (status === "SUBMITTED") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={20}
              className="text-emerald-600"
            />

            <div>
              <p className="text-sm font-bold text-emerald-700">
                Assessment Completed
              </p>

              <p className="text-xs text-emerald-600">
                Technical assessment submitted
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
            <Trophy
              size={17}
              className="text-amber-500"
            />

            <div>
              <p className="text-xs text-slate-400">
                Score
              </p>

              <p className="text-sm font-bold text-slate-800">
                {rawScore} / {totalQuestions}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Percentage
          </span>

          <span className="font-bold text-emerald-600">
            {percentage}%
          </span>
        </div>

        {assessment.submittedAt && (
          <div className="mt-2 text-xs text-slate-500">
            Submitted:{" "}
            {new Date(
              assessment.submittedAt
            ).toLocaleString()}
          </div>
        )}
      </div>
    );
  }

  // =====================================================
  // IN PROGRESS
  // =====================================================

  if (status === "IN_PROGRESS") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700">
        <Clock size={14} />
        Assessment In Progress
      </div>
    );
  }

  // =====================================================
  // NOT STARTED
  // =====================================================

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
      <Circle size={14} />
      Assessment Not Started
    </div>
  );
}
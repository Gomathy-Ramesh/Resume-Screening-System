import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  ArrowLeft,
  Trophy,
  AlertCircle,
} from "lucide-react";

const API_URL = "http://localhost:8080";

const ASSESSMENT_DURATION_SECONDS = 20 * 60;

export default function TechnicalAssessmentPage() {
  const { candidateId, jobId } = useParams();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [timeLeft, setTimeLeft] = useState(
    ASSESSMENT_DURATION_SECONDS
  );

  /*
   * Prevent multiple automatic submissions when the timer
   * reaches zero.
   */
  const autoSubmitTriggered = useRef(false);

  // =========================================================
  // LOAD / GENERATE ASSESSMENT
  // =========================================================

  useEffect(() => {
    loadAssessment();
  }, [candidateId, jobId]);

  const loadAssessment = async () => {
    setLoading(true);
    setError("");

    try {
      // -----------------------------------------------------
      // FIRST TRY TO GET EXISTING ASSESSMENT
      // -----------------------------------------------------

      try {
        const response = await axios.get(
          `${API_URL}/technical-assessments/${candidateId}/${jobId}`
        );

        if (response.data) {
          const existingAssessment = response.data;

          setAssessment(existingAssessment);

          // -------------------------------------------------
          // ALREADY SUBMITTED
          // -------------------------------------------------

          if (
            existingAssessment.status?.toUpperCase() ===
            "SUBMITTED"
          ) {
            await loadResult(existingAssessment.id);
            return;
          }

          // -------------------------------------------------
          // EXISTING IN-PROGRESS ASSESSMENT
          // -------------------------------------------------

          if (
            existingAssessment.status?.toUpperCase() ===
            "IN_PROGRESS"
          ) {
            await syncRemainingTime(
              existingAssessment.id
            );
          }

          return;
        }
      } catch (existingError) {
        // ---------------------------------------------------
        // 404 MEANS ASSESSMENT DOES NOT EXIST
        // ---------------------------------------------------

        if (existingError.response?.status !== 404) {
          throw existingError;
        }
      }

      // -----------------------------------------------------
      // GENERATE NEW ASSESSMENT
      // -----------------------------------------------------

      const generateResponse = await axios.post(
        `${API_URL}/technical-assessments/generate/${candidateId}/${jobId}`
      );

      setAssessment(generateResponse.data);
    } catch (err) {
      console.error(
        "Assessment loading error:",
        err
      );

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to load the technical assessment."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // GET SERVER-SIDE REMAINING TIME
  // =========================================================

  const syncRemainingTime = async (assessmentId) => {
    try {
      const response = await axios.get(
        `${API_URL}/technical-assessments/${assessmentId}/time`
      );

      const remainingSeconds =
        Number(
          response.data?.remainingSeconds
        ) || 0;

      const expired =
        response.data?.expired === true ||
        remainingSeconds <= 0;

      if (expired) {
        setTimeLeft(0);

        /*
         * Reload the assessment. The backend will automatically
         * submit an expired assessment.
         */
        await reloadAfterExpiration(
          assessmentId
        );

        return;
      }

      setTimeLeft(remainingSeconds);

      autoSubmitTriggered.current = false;
    } catch (err) {
      console.error(
        "Remaining time error:",
        err
      );

      /*
       * If the time endpoint cannot be reached, don't
       * incorrectly reset the timer to 30 minutes.
       *
       * Fall back to calculating it from startedAt.
       */
      if (assessment?.startedAt) {
        calculateTimeFromStartedAt(
          assessment.startedAt
        );
      }
    }
  };

  // =========================================================
  // CALCULATE TIME FROM BACKEND startedAt
  // =========================================================

  const calculateTimeFromStartedAt = (
    startedAt
  ) => {
    if (!startedAt) {
      return;
    }

    const startedTime =
      new Date(startedAt).getTime();

    const now =
      Date.now();

    const elapsedSeconds =
      Math.floor(
        (now - startedTime) / 1000
      );

    const remainingSeconds =
      Math.max(
        0,
        ASSESSMENT_DURATION_SECONDS -
          elapsedSeconds
      );

    setTimeLeft(
      remainingSeconds
    );

    if (remainingSeconds <= 0) {
      handleAutomaticSubmit();
    }
  };

  // =========================================================
  // RELOAD AFTER EXPIRATION
  // =========================================================

  const reloadAfterExpiration = async (
    assessmentId
  ) => {
    try {
      const response = await axios.get(
        `${API_URL}/technical-assessments/${candidateId}/${jobId}`
      );

      const updatedAssessment =
        response.data;

      setAssessment(
        updatedAssessment
      );

      if (
        updatedAssessment.status?.toUpperCase() ===
        "SUBMITTED"
      ) {
        await loadResult(
          updatedAssessment.id
        );
      }
    } catch (err) {
      console.error(
        "Expired assessment reload error:",
        err
      );

      /*
       * Even if the result cannot immediately be
       * loaded, tell the user what happened.
       */
      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Your assessment time has expired."
      );
    }
  };

  // =========================================================
  // START ASSESSMENT
  // =========================================================

  const startAssessment = async () => {
    if (!assessment?.id) {
      setError(
        "Assessment ID is missing."
      );
      return;
    }

    setStarting(true);
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/technical-assessments/${assessment.id}/start`
      );

      const startedAssessment =
        response.data;

      setAssessment(
        startedAssessment
      );

      /*
       * IMPORTANT:
       *
       * Do NOT simply reset the timer to 30 minutes.
       *
       * The backend has assigned startedAt.
       */
      await syncRemainingTime(
        startedAssessment.id
      );
    } catch (err) {
      console.error(
        "Assessment start error:",
        err
      );

      const message =
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to start the assessment.";

      setError(message);

      /*
       * The backend may have automatically submitted
       * the assessment because the time expired.
       */
      if (
        err.response?.status === 400
      ) {
        try {
          await loadResult(
            assessment.id
          );
        } catch (resultError) {
          console.error(
            "Unable to load expired result:",
            resultError
          );
        }
      }
    } finally {
      setStarting(false);
    }
  };

  // =========================================================
  // TIMER
  // =========================================================

  useEffect(() => {
    if (
      !assessment ||
      assessment.status?.toUpperCase() !==
        "IN_PROGRESS" ||
      result
    ) {
      return;
    }

    /*
     * Calculate from startedAt immediately.
     *
     * This prevents a browser refresh from resetting
     * the timer.
     */
    if (assessment.startedAt) {
      calculateTimeFromStartedAt(
        assessment.startedAt
      );
    }

    const timer = setInterval(() => {
      if (!assessment.startedAt) {
        return;
      }

      const startedTime =
        new Date(
          assessment.startedAt
        ).getTime();

      const elapsedSeconds =
        Math.floor(
          (Date.now() - startedTime) /
            1000
        );

      const remainingSeconds =
        Math.max(
          0,
          ASSESSMENT_DURATION_SECONDS -
            elapsedSeconds
        );

      setTimeLeft(
        remainingSeconds
      );

      if (
        remainingSeconds <= 0 &&
        !autoSubmitTriggered.current
      ) {
        autoSubmitTriggered.current = true;

        clearInterval(timer);

        handleAutomaticSubmit();
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [
    assessment?.id,
    assessment?.startedAt,
    assessment?.status,
    result,
  ]);

  // =========================================================
  // PERIODIC SERVER TIME SYNC
  // =========================================================
  //
  // Every 60 seconds we ask the backend for the authoritative
  // remaining time.
  //
  // =========================================================

  useEffect(() => {
    if (
      !assessment ||
      assessment.status?.toUpperCase() !==
        "IN_PROGRESS" ||
      result
    ) {
      return;
    }

    const syncTimer =
      setInterval(() => {
        syncRemainingTime(
          assessment.id
        );
      }, 60 * 1000);

    return () => {
      clearInterval(syncTimer);
    };
  }, [
    assessment?.id,
    assessment?.status,
    result,
  ]);

  // =========================================================
  // FORMAT TIMER
  // =========================================================

  const formatTime = (seconds) => {
    const safeSeconds =
      Math.max(
        0,
        Number(seconds) || 0
      );

    const minutes =
      Math.floor(
        safeSeconds / 60
      );

    const remainingSeconds =
      safeSeconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // =========================================================
  // SELECT ANSWER
  // =========================================================

  const handleAnswer = (
    questionId,
    answer
  ) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: answer,
    }));
  };

  // =========================================================
  // NEXT QUESTION
  // =========================================================

  const nextQuestion = () => {
    if (!assessment?.questions) {
      return;
    }

    if (
      currentQuestion <
      assessment.questions.length - 1
    ) {
      setCurrentQuestion(
        (previous) =>
          previous + 1
      );
    }
  };

  // =========================================================
  // PREVIOUS QUESTION
  // =========================================================

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (previous) =>
          previous - 1
      );
    }
  };

  // =========================================================
  // AUTOMATIC SUBMISSION
  // =========================================================

  const handleAutomaticSubmit =
    async () => {
      if (
        !assessment?.id ||
        submitting ||
        result
      ) {
        return;
      }

      setTimeLeft(0);

      setSubmitting(true);

      setError("");

      try {
        /*
         * The backend checks the real server time.
         *
         * If the request arrives after the deadline,
         * the backend accepts it as the automatic
         * timeout submission.
         */
        const response =
          await axios.post(
            `${API_URL}/technical-assessments/${assessment.id}/submit`,
            answers,
            {
              headers: {
                "Content-Type":
                  "application/json",
              },
            }
          );

        setResult(
          response.data
        );

        setAssessment(
          (previous) => ({
            ...previous,
            status: "SUBMITTED",
            submittedAt:
              response.data
                ?.submittedAt ||
              previous.submittedAt,
          })
        );
      } catch (err) {
        console.error(
          "Automatic assessment submission error:",
          err
        );

        /*
         * If the backend already submitted it because
         * the timeout occurred, retrieve the result.
         */
        try {
          await loadResult(
            assessment.id
          );
        } catch (resultError) {
          console.error(
            "Result loading error:",
            resultError
          );

          setError(
            typeof err.response?.data === "string"
              ? err.response.data
              : "Your assessment time has expired, but the result could not be loaded."
          );
        }
      } finally {
        setSubmitting(false);
      }
    };

  // =========================================================
  // SUBMIT ASSESSMENT
  // =========================================================

  const handleSubmit = async (
    automatic = false
  ) => {
    if (
      !assessment?.id ||
      submitting
    ) {
      return;
    }

    // -------------------------------------------------------
    // AUTOMATIC SUBMISSION
    // -------------------------------------------------------

    if (automatic) {
      await handleAutomaticSubmit();
      return;
    }

    // -------------------------------------------------------
    // CLIENT-SIDE CHECK
    // -------------------------------------------------------

    /*
     * This is only a UX check.
     *
     * The backend remains the final authority.
     */
    if (timeLeft <= 0) {
      await handleAutomaticSubmit();
      return;
    }

    // -------------------------------------------------------
    // CHECK UNANSWERED QUESTIONS
    // -------------------------------------------------------

    const unanswered =
      (
        assessment.questions ||
        []
      ).filter(
        (question) =>
          !answers[question.id] ||
          String(
            answers[question.id]
          ).trim() === ""
      );

    if (
      unanswered.length > 0
    ) {
      const confirmed =
        window.confirm(
          `You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`
        );

      if (!confirmed) {
        return;
      }
    } else {
      const confirmed =
        window.confirm(
          "Are you sure you want to submit your assessment?"
        );

      if (!confirmed) {
        return;
      }
    }

    // -------------------------------------------------------
    // SUBMIT
    // -------------------------------------------------------

    setSubmitting(true);
    setError("");

    try {
      const response =
        await axios.post(
          `${API_URL}/technical-assessments/${assessment.id}/submit`,
          answers,
          {
            headers: {
              "Content-Type":
                "application/json",
            },
          }
        );

      setResult(
        response.data
      );

      setAssessment(
        (previous) => ({
          ...previous,
          status: "SUBMITTED",
          submittedAt:
            response.data
              ?.submittedAt ||
            previous.submittedAt,
        })
      );
    } catch (err) {
      console.error(
        "Assessment submission error:",
        err
      );

      /*
       * If the backend says the assessment has
       * expired, retrieve the final result.
       */
      if (
        err.response?.status === 400
      ) {
        try {
          await loadResult(
            assessment.id
          );
          return;
        } catch (resultError) {
          console.error(
            "Expired result loading error:",
            resultError
          );
        }
      }

      setError(
        typeof err.response?.data === "string"
          ? err.response.data
          : "Unable to submit the assessment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================================
  // LOAD RESULT
  // =========================================================

  const loadResult = async (
    assessmentId
  ) => {
    try {
      const response =
        await axios.get(
          `${API_URL}/technical-assessments/${assessmentId}/result`
        );

      setResult(
        response.data
      );

      setAssessment(
        (previous) => ({
          ...previous,
          status: "SUBMITTED",
        })
      );
    } catch (err) {
      console.error(
        "Result loading error:",
        err
      );

      throw err;
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <div className="rounded-3xl bg-white p-10 shadow-2xl text-center">
          <Loader2
            size={45}
            className="mx-auto mb-5 animate-spin text-violet-600"
          />

          <h2 className="text-2xl font-bold text-slate-800">
            Preparing Your Assessment
          </h2>

          <p className="mt-2 text-slate-500">
            Please wait while we prepare your technical questions.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (
    error &&
    !assessment
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 px-6">
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-2xl text-center">
          <AlertCircle
            size={50}
            className="mx-auto mb-5 text-red-500"
          />

          <h2 className="text-2xl font-bold text-slate-800">
            Assessment Error
          </h2>

          <p className="mt-3 text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              navigate(-1)
            }
            className="mt-7 flex items-center justify-center gap-2 mx-auto rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 py-3 font-semibold text-white"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // RESULT PAGE
  // =========================================================

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl bg-white p-10 shadow-2xl">

            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <Trophy
                  size={42}
                  className="text-emerald-600"
                />
              </div>

              <h1 className="mt-6 text-4xl font-bold text-slate-800">
                Assessment Completed
              </h1>

              <p className="mt-2 text-slate-500">
                Your technical assessment has been submitted successfully.
              </p>
            </div>

            {/* RESULT CARDS */}

            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">

              <div className="rounded-2xl bg-violet-50 p-6 text-center">
                <p className="text-sm text-slate-500">
                  Score
                </p>

                <p className="mt-2 text-4xl font-bold text-violet-600">
                  {result.score ?? 0}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-6 text-center">
                <p className="text-sm text-slate-500">
                  Percentage
                </p>

                <p className="mt-2 text-4xl font-bold text-emerald-600">
                  {result.percentage ?? 0}%
                </p>
              </div>

              <div className="rounded-2xl bg-blue-50 p-6 text-center">
                <p className="text-sm text-slate-500">
                  Questions
                </p>

                <p className="mt-2 text-4xl font-bold text-blue-600">
                  {result.totalQuestions ?? 0}
                </p>
              </div>

            </div>

            {/* CORRECT / WRONG */}

            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">

              <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-5">
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className="text-emerald-600"
                    size={25}
                  />

                  <span className="font-semibold text-slate-700">
                    Correct Answers
                  </span>
                </div>

                <span className="text-2xl font-bold text-emerald-600">
                  {result.correctAnswers ?? 0}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-6 py-5">
                <div className="flex items-center gap-3">
                  <XCircle
                    className="text-red-600"
                    size={25}
                  />

                  <span className="font-semibold text-slate-700">
                    Wrong Answers
                  </span>
                </div>

                <span className="text-2xl font-bold text-red-600">
                  {result.wrongAnswers ?? 0}
                </span>
              </div>

            </div>

            {/* STATUS */}

            <div className="mt-8 rounded-2xl bg-slate-50 p-5">

              <div className="flex justify-between">
                <span className="text-slate-500">
                  Status
                </span>

                <span className="font-bold text-emerald-600">
                  {result.status}
                </span>
              </div>

              <div className="mt-3 flex justify-between">
                <span className="text-slate-500">
                  Submitted At
                </span>

                <span className="font-medium text-slate-700">
                  {result.submittedAt
                    ? new Date(
                        result.submittedAt
                      ).toLocaleString()
                    : "-"}
                </span>
              </div>

            </div>

            <button
              onClick={() =>
                navigate(
                  `/candidate/skill-recovery/${candidateId}/${jobId}`
                )
              }
              className="mt-8 h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 font-semibold text-white transition hover:-translate-y-1 hover:shadow-lg"
            >
              Continue to Skill Recovery
            </button>

          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ASSESSMENT NOT FOUND
  // =========================================================

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No assessment available.</p>
      </div>
    );
  }

  // =========================================================
  // NOT STARTED
  // =========================================================

  if (
    assessment.status?.toUpperCase() ===
    "NOT_STARTED"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 px-6">

        <div className="w-full max-w-2xl rounded-3xl bg-white p-10 shadow-2xl">

          <div className="text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">
              <Trophy
                size={40}
                className="text-violet-600"
              />
            </div>

            <h1 className="mt-6 text-4xl font-bold text-slate-800">
              Technical Assessment
            </h1>

            <p className="mt-3 text-slate-500">
              Test your technical knowledge based on the position you applied for.
            </p>

          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">

            <div className="rounded-2xl bg-violet-50 p-5 text-center">
              <p className="text-sm text-slate-500">
                Questions
              </p>

              <p className="mt-1 text-2xl font-bold text-violet-600">
                {assessment.totalQuestions}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 p-5 text-center">
              <p className="text-sm text-slate-500">
                Duration
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-600">
                30 min
              </p>
            </div>

            <div className="rounded-2xl bg-cyan-50 p-5 text-center">
              <p className="text-sm text-slate-500">
                Assessment
              </p>

              <p className="mt-1 text-2xl font-bold text-cyan-600">
                Technical
              </p>
            </div>

          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
              {error}
            </div>
          )}

          <button
            onClick={startAssessment}
            disabled={starting}
            className="mt-8 h-14 w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 font-semibold text-white transition hover:-translate-y-1 hover:shadow-lg disabled:opacity-60"
          >
            {starting ? (
              <span className="flex items-center justify-center gap-2">

                <Loader2
                  size={20}
                  className="animate-spin"
                />

                Starting Assessment...

              </span>
            ) : (
              "Start Technical Assessment"
            )}
          </button>

        </div>
      </div>
    );
  }

  // =========================================================
  // IN PROGRESS
  // =========================================================

  const questions =
    assessment.questions || [];

  const question =
    questions[currentQuestion];

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>No questions available.</p>
      </div>
    );
  }

  const selectedAnswer =
    answers[question.id];

  const progress =
    questions.length > 0
      ? ((currentQuestion + 1) /
          questions.length) *
        100
      : 0;

  /*
   * Make the timer visually urgent when five minutes
   * or less remain.
   */
  const timerWarning =
    timeLeft <= 5 * 60;

  return (
    <div className="min-h-screen bg-[#F7F8FC]">

      {/* HEADER */}

      <div className="sticky top-0 z-20 border-b bg-white shadow-sm">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

          <div>

            <h1 className="text-xl font-bold text-slate-800">
              Technical Assessment
            </h1>

            <p className="text-sm text-slate-500">
              Question {currentQuestion + 1} of{" "}
              {questions.length}
            </p>

          </div>

          <div
            className={`flex items-center gap-2 rounded-xl px-4 py-2 font-bold ${
              timerWarning
                ? "bg-red-50 text-red-600"
                : "bg-slate-100 text-slate-700"
            }`}
          >

            <Clock size={20} />

            {formatTime(timeLeft)}

          </div>

        </div>

      </div>

      {/* PROGRESS */}

      <div className="h-2 bg-slate-200">

        <div
          className="h-full bg-gradient-to-r from-violet-600 to-cyan-500 transition-all"
          style={{
            width: `${progress}%`,
          }}
        />

      </div>

      {/* MAIN */}

      <div className="mx-auto max-w-5xl px-6 py-10">

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
            {error}
          </div>
        )}

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          {/* QUESTION */}

          <div>

            <span className="inline-flex rounded-lg bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">
              Question {question.questionNumber}
            </span>

            <h2 className="mt-6 text-2xl font-bold leading-relaxed text-slate-800">
              {question.questionText}
            </h2>

          </div>

          {/* OPTIONS */}

          <div className="mt-8 space-y-4">

            {[
              {
                key: "A",
                value: question.optionA,
              },
              {
                key: "B",
                value: question.optionB,
              },
              {
                key: "C",
                value: question.optionC,
              },
              {
                key: "D",
                value: question.optionD,
              },
            ]
              .filter(
                (option) =>
                  option.value
              )
              .map(
                (option) => {

                  const selected =
                    selectedAnswer ===
                    option.key;

                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() =>
                        handleAnswer(
                          question.id,
                          option.key
                        )
                      }
                      className={`flex w-full items-center gap-4 rounded-2xl border-2 p-5 text-left transition ${
                        selected
                          ? "border-violet-600 bg-violet-50"
                          : "border-slate-200 bg-white hover:border-violet-300 hover:bg-violet-50/50"
                      }`}
                    >

                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold ${
                          selected
                            ? "bg-violet-600 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {option.key}
                      </span>

                      <span className="text-base font-medium text-slate-700">
                        {option.value}
                      </span>

                    </button>
                  );
                }
              )}

          </div>

          {/* NAVIGATION */}

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-between">

            <button
              type="button"
              disabled={
                currentQuestion === 0
              }
              onClick={
                previousQuestion
              }
              className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            {currentQuestion <
            questions.length - 1 ? (

              <button
                type="button"
                onClick={
                  nextQuestion
                }
                className="rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-8 py-3 font-semibold text-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                Next Question
              </button>

            ) : (

              <button
                type="button"
                disabled={
                  submitting ||
                  timeLeft <= 0
                }
                onClick={() =>
                  handleSubmit(false)
                }
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-8 py-3 font-semibold text-white transition hover:-translate-y-1 hover:shadow-lg disabled:opacity-60"
              >

                {submitting ? (

                  <span className="flex items-center gap-2">

                    <Loader2
                      size={18}
                      className="animate-spin"
                    />

                    Submitting...

                  </span>

                ) : (
                  "Submit Assessment"
                )}

              </button>
            )}

          </div>

        </div>

        {/* QUESTION NAVIGATOR */}

        <div className="mt-6 rounded-2xl bg-white p-6 shadow-lg">

          <h3 className="font-bold text-slate-800">
            Questions
          </h3>

          <div className="mt-4 flex flex-wrap gap-3">

            {questions.map(
              (item, index) => {

                const answered =
                  answers[item.id] !==
                  undefined;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setCurrentQuestion(
                        index
                      )
                    }
                    className={`h-10 w-10 rounded-lg font-semibold ${
                      index ===
                      currentQuestion
                        ? "bg-violet-600 text-white"
                        : answered
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              }
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
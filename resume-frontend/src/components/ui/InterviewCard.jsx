import React, { useState } from "react";

import {
    CalendarDays,
    Clock,
    User,
    Mail,
    Video,
    MapPin,
    CheckCircle2,
    Circle,
    Play,
    ClipboardCheck,
} from "lucide-react";

import {
    submitInterviewEvaluation,
} from "../../services/interviewService";


// ======================================================
// INTERVIEW CARD
// ======================================================

const InterviewCard = ({
    interview,
    onComplete,
    completingId,
}) => {

    // ======================================================
    // HOOKS
    // ======================================================

    const [showEvaluation, setShowEvaluation] =
        useState(false);

    const [technicalKnowledge, setTechnicalKnowledge] =
        useState("");

    const [problemSolving, setProblemSolving] =
        useState("");

    const [communication, setCommunication] =
        useState("");

    const [roleKnowledge, setRoleKnowledge] =
        useState("");

    const [recommendation, setRecommendation] =
        useState("");

    const [feedback, setFeedback] =
        useState("");

    const [submittingEvaluation, setSubmittingEvaluation] =
        useState(false);

    const [evaluationError, setEvaluationError] =
        useState("");


    // ======================================================
    // NULL CHECK
    // ======================================================

    if (!interview) {
        return null;
    }


    // ======================================================
    // INTERVIEW DATA
    // ======================================================

    const {
        interviewId,
        candidate,
        roundName,
        interviewType,
        interviewerName,
        interviewerEmail,
        interviewDate,
        durationMinutes,
        interviewMode,
        meetingLink,
        location,
        status,
        notes,

        technicalKnowledge: savedTechnicalKnowledge,
        problemSolving: savedProblemSolving,
        communication: savedCommunication,
        roleKnowledge: savedRoleKnowledge,

        overallScore,

        recommendation: savedRecommendation,
        feedback: savedFeedback,
    } = interview;


    // ======================================================
    // NORMALIZED STATUS
    // ======================================================

    const normalizedStatus =
        String(status || "").toUpperCase();


    const isCompleted =
        normalizedStatus === "COMPLETED";


    const isScheduled =
        normalizedStatus === "SCHEDULED" ||
        normalizedStatus === "RESCHEDULED";


    const isCancelled =
        normalizedStatus === "CANCELLED";


    // ======================================================
    // DATE FORMATTING
    // ======================================================

    const formattedDate = interviewDate
        ? new Date(interviewDate).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        )
        : "Not scheduled";


    const formattedTime = interviewDate
        ? new Date(interviewDate).toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        )
        : "Not specified";


    // ======================================================
    // STATUS STYLE
    // ======================================================

    let statusClass =
        "bg-gray-100 text-gray-700 border-gray-200";


    if (isCompleted) {

        statusClass =
            "bg-green-50 text-green-700 border-green-200";

    } else if (isScheduled) {

        statusClass =
            "bg-blue-50 text-blue-700 border-blue-200";

    } else if (isCancelled) {

        statusClass =
            "bg-red-50 text-red-700 border-red-200";
    }


    // ======================================================
    // COMPLETE INTERVIEW
    // ======================================================

    const handleComplete = () => {

        if (
            completingId === interviewId ||
            isCompleted ||
            isCancelled
        ) {
            return;
        }


        if (typeof onComplete === "function") {

            onComplete(interviewId);

        }
    };


    // ======================================================
    // OPEN EVALUATION
    // ======================================================

    const handleOpenEvaluation = () => {

        setEvaluationError("");


        setTechnicalKnowledge(
            savedTechnicalKnowledge !== null &&
            savedTechnicalKnowledge !== undefined
                ? String(savedTechnicalKnowledge)
                : ""
        );


        setProblemSolving(
            savedProblemSolving !== null &&
            savedProblemSolving !== undefined
                ? String(savedProblemSolving)
                : ""
        );


        setCommunication(
            savedCommunication !== null &&
            savedCommunication !== undefined
                ? String(savedCommunication)
                : ""
        );


        setRoleKnowledge(
            savedRoleKnowledge !== null &&
            savedRoleKnowledge !== undefined
                ? String(savedRoleKnowledge)
                : ""
        );


        setRecommendation(
            savedRecommendation || ""
        );


        setFeedback(
            savedFeedback || ""
        );


        setShowEvaluation(true);
    };


    // ======================================================
    // SUBMIT EVALUATION
    // ======================================================

    const handleSubmitEvaluation = async (event) => {

        event.preventDefault();

        setEvaluationError("");


        // --------------------------------------------------
        // VALIDATE REQUIRED SCORES
        // --------------------------------------------------

        if (
            technicalKnowledge === "" ||
            problemSolving === "" ||
            communication === "" ||
            roleKnowledge === ""
        ) {

            setEvaluationError(
                "Please provide all four evaluation scores."
            );

            return;
        }


        // --------------------------------------------------
        // CONVERT TO NUMBERS
        // --------------------------------------------------

        const technical =
            Number(technicalKnowledge);

        const problem =
            Number(problemSolving);

        const communicationScore =
            Number(communication);

        const role =
            Number(roleKnowledge);


        // --------------------------------------------------
        // VALIDATE NUMERIC VALUES
        // --------------------------------------------------

        if (
            !Number.isFinite(technical) ||
            !Number.isFinite(problem) ||
            !Number.isFinite(communicationScore) ||
            !Number.isFinite(role)
        ) {

            setEvaluationError(
                "Please enter valid numeric scores."
            );

            return;
        }


        // --------------------------------------------------
        // VALIDATE SCORE RANGE
        // --------------------------------------------------

        if (
            technical < 0 ||
            technical > 5 ||
            problem < 0 ||
            problem > 5 ||
            communicationScore < 0 ||
            communicationScore > 5 ||
            role < 0 ||
            role > 5
        ) {

            setEvaluationError(
                "All scores must be between 0 and 5."
            );

            return;
        }


        try {

            setSubmittingEvaluation(true);


            // --------------------------------------------------
            // EVALUATION REQUEST DATA
            // --------------------------------------------------

            const evaluationData = {

                technicalKnowledge:
                    technical,

                problemSolving:
                    problem,

                communication:
                    communicationScore,

                roleKnowledge:
                    role,

                recommendation:
                    recommendation || null,

                feedback:
                    feedback || null,
            };


            console.log(
                "Submitting interview evaluation:",
                {
                    interviewId,
                    evaluationData,
                }
            );


            // --------------------------------------------------
            // CALL NAMED SERVICE FUNCTION
            // --------------------------------------------------

            const updatedInterview =
                await submitInterviewEvaluation(
                    interviewId,
                    evaluationData
                );


            console.log(
                "Evaluation submitted successfully:",
                updatedInterview
            );


            // --------------------------------------------------
            // CLOSE FORM
            // --------------------------------------------------

            setShowEvaluation(false);


            // --------------------------------------------------
            // RELOAD PAGE
            // --------------------------------------------------

            window.location.reload();


        } catch (error) {

            console.error(
                "Failed to submit interview evaluation:",
                error
            );


            setEvaluationError(
                error?.response?.data?.message ||
                error?.response?.data?.error ||
                error?.message ||
                "Failed to submit interview evaluation."
            );


        } finally {

            setSubmittingEvaluation(false);

        }
    };


    // ======================================================
    // RENDER
    // ======================================================

    return (

        <div
            className="
                bg-white
                border
                border-gray-200
                rounded-2xl
                shadow-sm
                overflow-hidden
            "
        >

            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

            <div
                className="
                    px-6
                    py-5
                    border-b
                    border-gray-100
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        lg:flex-row
                        lg:items-center
                        lg:justify-between
                        gap-4
                    "
                >

                    {/* ------------------------------------------ */}
                    {/* TITLE */}
                    {/* ------------------------------------------ */}

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
                                    h-11
                                    w-11
                                    rounded-xl
                                    bg-indigo-50
                                    flex
                                    items-center
                                    justify-center
                                "
                            >

                                <Video
                                    size={22}
                                    className="text-indigo-600"
                                />

                            </div>


                            <div>

                                <h2
                                    className="
                                        text-lg
                                        font-bold
                                        text-gray-900
                                    "
                                >
                                    {roundName || "Interview"}
                                </h2>


                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                    "
                                >
                                    Interview ID: #{interviewId}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ------------------------------------------ */}
                    {/* STATUS */}
                    {/* ------------------------------------------ */}

                    <div
                        className={`
                            inline-flex
                            items-center
                            gap-2
                            px-3
                            py-1.5
                            rounded-full
                            border
                            text-xs
                            font-semibold
                            ${statusClass}
                        `}
                    >

                        {isCompleted ? (

                            <CheckCircle2 size={14} />

                        ) : (

                            <Circle size={14} />

                        )}

                        {status || "UNKNOWN"}

                    </div>

                </div>

            </div>


            {/* ================================================== */}
            {/* CONTENT */}
            {/* ================================================== */}

            <div className="p-6">

                <div
                    className="
                        grid
                        grid-cols-1
                        lg:grid-cols-2
                        gap-6
                    "
                >

                    {/* ================================================== */}
                    {/* CANDIDATE */}
                    {/* ================================================== */}

                    <div
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            p-5
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                mb-4
                            "
                        >

                            <User
                                size={18}
                                className="text-indigo-600"
                            />

                            <h3
                                className="
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                Candidate
                            </h3>

                        </div>


                        <div className="space-y-3">

                            <div>

                                <p className="text-xs text-gray-500">
                                    Name
                                </p>

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-gray-900
                                    "
                                >
                                    {candidate?.name || "N/A"}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs text-gray-500">
                                    Email
                                </p>

                                <p
                                    className="
                                        text-sm
                                        text-gray-700
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <Mail size={14} />

                                    {candidate?.email || "N/A"}

                                </p>

                            </div>


                            <div>

                                <p className="text-xs text-gray-500">
                                    Position
                                </p>

                                <p
                                    className="
                                        text-sm
                                        font-medium
                                        text-gray-800
                                    "
                                >
                                    {candidate?.appliedPosition || "N/A"}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ================================================== */}
                    {/* INTERVIEW DETAILS */}
                    {/* ================================================== */}

                    <div
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            p-5
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                mb-4
                            "
                        >

                            <CalendarDays
                                size={18}
                                className="text-indigo-600"
                            />

                            <h3
                                className="
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                Interview Details
                            </h3>

                        </div>


                        <div className="space-y-3">

                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <span className="text-xs text-gray-500">
                                    Date
                                </span>

                                <span
                                    className="
                                        text-sm
                                        font-medium
                                        text-gray-800
                                    "
                                >
                                    {formattedDate}
                                </span>

                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <span className="text-xs text-gray-500">
                                    Time
                                </span>

                                <span
                                    className="
                                        text-sm
                                        font-medium
                                        text-gray-800
                                    "
                                >
                                    {formattedTime}
                                </span>

                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <span className="text-xs text-gray-500">
                                    Duration
                                </span>

                                <span
                                    className="
                                        text-sm
                                        font-medium
                                        text-gray-800
                                        flex
                                        items-center
                                        gap-1
                                    "
                                >

                                    <Clock size={14} />

                                    {durationMinutes
                                        ? `${durationMinutes} minutes`
                                        : "N/A"}

                                </span>

                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <span className="text-xs text-gray-500">
                                    Type
                                </span>

                                <span
                                    className="
                                        text-sm
                                        font-medium
                                        text-gray-800
                                    "
                                >
                                    {interviewType || "N/A"}
                                </span>

                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                "
                            >

                                <span className="text-xs text-gray-500">
                                    Mode
                                </span>

                                <span
                                    className="
                                        text-sm
                                        font-medium
                                        text-gray-800
                                    "
                                >
                                    {interviewMode || "N/A"}
                                </span>

                            </div>

                        </div>

                    </div>


                    {/* ================================================== */}
                    {/* INTERVIEWER */}
                    {/* ================================================== */}

                    <div
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            p-5
                        "
                    >

                        <h3
                            className="
                                font-semibold
                                text-gray-900
                                mb-4
                            "
                        >
                            Interviewer
                        </h3>


                        <div className="space-y-3">

                            <div>

                                <p className="text-xs text-gray-500">
                                    Name
                                </p>

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-gray-900
                                    "
                                >
                                    {interviewerName || "N/A"}
                                </p>

                            </div>


                            <div>

                                <p className="text-xs text-gray-500">
                                    Email
                                </p>

                                <p
                                    className="
                                        text-sm
                                        text-gray-700
                                    "
                                >
                                    {interviewerEmail || "N/A"}
                                </p>

                            </div>

                        </div>

                    </div>


                    {/* ================================================== */}
                    {/* INTERVIEW ACCESS */}
                    {/* ================================================== */}

                    <div
                        className="
                            rounded-xl
                            border
                            border-gray-200
                            p-5
                        "
                    >

                        <h3
                            className="
                                font-semibold
                                text-gray-900
                                mb-4
                            "
                        >
                            Interview Access
                        </h3>


                        {meetingLink ? (

                            <a
                                href={meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2
                                    rounded-lg
                                    bg-indigo-600
                                    text-white
                                    text-sm
                                    font-medium
                                    hover:bg-indigo-700
                                    transition
                                "
                            >

                                <Video size={16} />

                                Join Meeting

                            </a>

                        ) : (

                            <div
                                className="
                                    flex
                                    items-start
                                    gap-2
                                    text-sm
                                    text-gray-600
                                "
                            >

                                <MapPin
                                    size={18}
                                    className="mt-0.5"
                                />

                                <span>
                                    {location || "No location specified"}
                                </span>

                            </div>

                        )}

                    </div>

                </div>


                {/* ================================================== */}
                {/* NOTES */}
                {/* ================================================== */}

                {notes && (

                    <div
                        className="
                            mt-6
                            rounded-xl
                            bg-gray-50
                            border
                            border-gray-200
                            p-5
                        "
                    >

                        <h3
                            className="
                                font-semibold
                                text-gray-900
                                mb-2
                            "
                        >
                            Interview Notes
                        </h3>


                        <p
                            className="
                                text-sm
                                text-gray-600
                                leading-relaxed
                            "
                        >
                            {notes}
                        </p>

                    </div>

                )}


                {/* ================================================== */}
                {/* COMPLETED RESULT */}
                {/* ================================================== */}

                {isCompleted && (

                    <div
                        className="
                            mt-6
                            rounded-xl
                            border
                            border-green-200
                            bg-green-50
                            p-5
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                mb-4
                            "
                        >

                            <CheckCircle2
                                size={20}
                                className="text-green-600"
                            />

                            <h3
                                className="
                                    font-semibold
                                    text-green-800
                                "
                            >
                                Interview Evaluation
                            </h3>

                        </div>


                        <div
                            className="
                                grid
                                grid-cols-2
                                md:grid-cols-5
                                gap-4
                            "
                        >

                            <ScoreItem
                                label="Technical Knowledge"
                                value={savedTechnicalKnowledge}
                            />

                            <ScoreItem
                                label="Problem Solving"
                                value={savedProblemSolving}
                            />

                            <ScoreItem
                                label="Communication"
                                value={savedCommunication}
                            />

                            <ScoreItem
                                label="Role Knowledge"
                                value={savedRoleKnowledge}
                            />

                            <ScoreItem
                                label="Overall Score"
                                value={overallScore}
                            />

                        </div>


                        {savedRecommendation && (

                            <div className="mt-4">

                                <p className="text-xs text-gray-500">
                                    Recommendation
                                </p>

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-gray-900
                                    "
                                >
                                    {savedRecommendation}
                                </p>

                            </div>

                        )}


                        {savedFeedback && (

                            <div className="mt-4">

                                <p className="text-xs text-gray-500">
                                    Feedback
                                </p>

                                <p
                                    className="
                                        text-sm
                                        text-gray-700
                                    "
                                >
                                    {savedFeedback}
                                </p>

                            </div>

                        )}

                    </div>

                )}


                {/* ================================================== */}
                {/* ACTIONS */}
                {/* ================================================== */}

                <div
                    className="
                        mt-6
                        flex
                        flex-wrap
                        items-center
                        gap-3
                    "
                >

                    {/* ------------------------------------------ */}
                    {/* COMPLETE */}
                    {/* ------------------------------------------ */}

                    {!isCompleted && !isCancelled && (

                        <button
                            type="button"
                            onClick={handleComplete}
                            disabled={
                                completingId === interviewId
                            }
                            className="
                                inline-flex
                                items-center
                                gap-2
                                px-4
                                py-2.5
                                rounded-lg
                                bg-green-600
                                text-white
                                text-sm
                                font-semibold
                                hover:bg-green-700
                                disabled:opacity-60
                                disabled:cursor-not-allowed
                                transition
                            "
                        >

                            {completingId === interviewId ? (

                                <>

                                    <span
                                        className="
                                            animate-spin
                                        "
                                    >
                                        ⟳
                                    </span>

                                    Completing...

                                </>

                            ) : (

                                <>

                                    <CheckCircle2 size={16} />

                                    Mark as Completed

                                </>

                            )}

                        </button>

                    )}


                    {/* ------------------------------------------ */}
                    {/* EVALUATION */}
                    {/* ------------------------------------------ */}

                    {isCompleted && (

                        <button
                            type="button"
                            onClick={handleOpenEvaluation}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                px-4
                                py-2.5
                                rounded-lg
                                bg-indigo-600
                                text-white
                                text-sm
                                font-semibold
                                hover:bg-indigo-700
                                transition
                            "
                        >

                            <ClipboardCheck size={16} />

                            {savedTechnicalKnowledge !== null &&
                            savedTechnicalKnowledge !== undefined
                                ? "Edit Evaluation"
                                : "Add Evaluation"}

                        </button>

                    )}


                    {/* ------------------------------------------ */}
                    {/* JOIN INTERVIEW */}
                    {/* ------------------------------------------ */}

                    {isScheduled && meetingLink && (

                        <a
                            href={meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                                inline-flex
                                items-center
                                gap-2
                                px-4
                                py-2.5
                                rounded-lg
                                border
                                border-indigo-200
                                bg-indigo-50
                                text-indigo-700
                                text-sm
                                font-semibold
                                hover:bg-indigo-100
                                transition
                            "
                        >

                            <Play size={16} />

                            Join Interview

                        </a>

                    )}

                </div>


                {/* ================================================== */}
                {/* EVALUATION FORM */}
                {/* ================================================== */}

                {showEvaluation && (

                    <div
                        className="
                            mt-6
                            rounded-2xl
                            border
                            border-indigo-200
                            bg-indigo-50
                            p-6
                        "
                    >

                        {/* ------------------------------------------ */}
                        {/* FORM HEADER */}
                        {/* ------------------------------------------ */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                mb-5
                            "
                        >

                            <div>

                                <h3
                                    className="
                                        text-lg
                                        font-bold
                                        text-gray-900
                                    "
                                >
                                    Interview Evaluation
                                </h3>


                                <p
                                    className="
                                        text-sm
                                        text-gray-500
                                        mt-1
                                    "
                                >
                                    Rate each category from 0 to 5.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    setShowEvaluation(false)
                                }
                                className="
                                    text-sm
                                    text-gray-500
                                    hover:text-gray-800
                                "
                            >
                                Close
                            </button>

                        </div>


                        {/* ------------------------------------------ */}
                        {/* ERROR */}
                        {/* ------------------------------------------ */}

                        {evaluationError && (

                            <div
                                className="
                                    mb-5
                                    rounded-lg
                                    border
                                    border-red-200
                                    bg-red-50
                                    px-4
                                    py-3
                                    text-sm
                                    text-red-700
                                "
                            >
                                {evaluationError}
                            </div>

                        )}


                        {/* ------------------------------------------ */}
                        {/* FORM */}
                        {/* ------------------------------------------ */}

                        <form
                            onSubmit={
                                handleSubmitEvaluation
                            }
                        >

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-2
                                    gap-5
                                "
                            >

                                <ScoreInput
                                    label="Technical Knowledge"
                                    value={technicalKnowledge}
                                    onChange={
                                        setTechnicalKnowledge
                                    }
                                />


                                <ScoreInput
                                    label="Problem Solving"
                                    value={problemSolving}
                                    onChange={
                                        setProblemSolving
                                    }
                                />


                                <ScoreInput
                                    label="Communication"
                                    value={communication}
                                    onChange={
                                        setCommunication
                                    }
                                />


                                <ScoreInput
                                    label="Role Knowledge"
                                    value={roleKnowledge}
                                    onChange={
                                        setRoleKnowledge
                                    }
                                />

                            </div>


                            {/* ------------------------------------------ */}
                            {/* RECOMMENDATION */}
                            {/* ------------------------------------------ */}

                            <div className="mt-5">

                                <label
                                    className="
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                        mb-2
                                    "
                                >
                                    Recommendation
                                </label>


                                <select
                                    value={recommendation}
                                    onChange={(event) =>
                                        setRecommendation(
                                            event.target.value
                                        )
                                    }
                                    className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-300
                                        bg-white
                                        px-3
                                        py-2.5
                                        text-sm
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-indigo-500
                                    "
                                >

                                    <option value="">
                                        Select recommendation
                                    </option>

                                    <option value="SELECTED">
                                        Selected
                                    </option>

                                    <option value="REJECTED">
                                        Rejected
                                    </option>

                                    <option value="ON_HOLD">
                                        On Hold
                                    </option>

                                </select>

                            </div>


                            {/* ------------------------------------------ */}
                            {/* FEEDBACK */}
                            {/* ------------------------------------------ */}

                            <div className="mt-5">

                                <label
                                    className="
                                        block
                                        text-sm
                                        font-medium
                                        text-gray-700
                                        mb-2
                                    "
                                >
                                    Feedback
                                </label>


                                <textarea
                                    value={feedback}
                                    onChange={(event) =>
                                        setFeedback(
                                            event.target.value
                                        )
                                    }
                                    rows={4}
                                    placeholder="Enter interviewer feedback..."
                                    className="
                                        w-full
                                        rounded-lg
                                        border
                                        border-gray-300
                                        bg-white
                                        px-3
                                        py-2.5
                                        text-sm
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-indigo-500
                                    "
                                />

                            </div>


                            {/* ------------------------------------------ */}
                            {/* FORM BUTTONS */}
                            {/* ------------------------------------------ */}

                            <div
                                className="
                                    mt-6
                                    flex
                                    gap-3
                                "
                            >

                                <button
                                    type="submit"
                                    disabled={
                                        submittingEvaluation
                                    }
                                    className="
                                        px-5
                                        py-2.5
                                        rounded-lg
                                        bg-indigo-600
                                        text-white
                                        text-sm
                                        font-semibold
                                        hover:bg-indigo-700
                                        disabled:opacity-60
                                        disabled:cursor-not-allowed
                                    "
                                >

                                    {submittingEvaluation
                                        ? "Submitting..."
                                        : "Submit Evaluation"}

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowEvaluation(false)
                                    }
                                    className="
                                        px-5
                                        py-2.5
                                        rounded-lg
                                        border
                                        border-gray-300
                                        bg-white
                                        text-gray-700
                                        text-sm
                                        font-semibold
                                        hover:bg-gray-50
                                    "
                                >
                                    Cancel
                                </button>

                            </div>

                        </form>

                    </div>

                )}

            </div>

        </div>
    );
};


// ======================================================
// SCORE DISPLAY
// ======================================================

const ScoreItem = ({
    label,
    value,
}) => {

    return (

        <div
            className="
                bg-white
                rounded-lg
                border
                border-green-100
                p-3
            "
        >

            <p className="text-xs text-gray-500">
                {label}
            </p>


            <p
                className="
                    text-lg
                    font-bold
                    text-gray-900
                    mt-1
                "
            >

                {value !== null &&
                value !== undefined
                    ? value
                    : "—"}

            </p>

        </div>
    );
};


// ======================================================
// SCORE INPUT
// ======================================================

const ScoreInput = ({
    label,
    value,
    onChange,
}) => {

    return (

        <div>

            <label
                className="
                    block
                    text-sm
                    font-medium
                    text-gray-700
                    mb-2
                "
            >
                {label}
            </label>


            <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder="0 - 5"
                className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    focus:outline-none
                    focus:ring-2
                    focus:ring-indigo-500
                "
            />

        </div>
    );
};


export default InterviewCard;
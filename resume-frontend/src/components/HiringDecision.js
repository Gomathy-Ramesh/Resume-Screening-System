import React, { useEffect, useState } from "react";

import {
    getHiringDecision
} from "../services/candidateService";


// ======================================================
// HIRING DECISION COMPONENT
// ======================================================

function HiringDecision({ candidateId }) {

    const [decision, setDecision] = useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    // ======================================================
    // LOAD HIRING DECISION
    // ======================================================

    useEffect(() => {

        const loadHiringDecision = async () => {

            try {

                setLoading(true);

                setError("");

                const data =
                    await getHiringDecision(
                        candidateId
                    );

                setDecision(data);

            } catch (err) {

                console.error(
                    "Hiring decision error:",
                    err
                );

                setError(
                    err.message ||
                    "Failed to load hiring decision."
                );

            } finally {

                setLoading(false);

            }
        };


        if (candidateId) {

            loadHiringDecision();

        }

    }, [candidateId]);


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="p-8">

                <div
                    className="
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        p-8
                        text-center
                        shadow-sm
                    "
                >

                    <p className="text-slate-500">
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

            <div className="p-8">

                <div
                    className="
                        bg-white
                        rounded-2xl
                        border
                        border-red-200
                        p-8
                        text-center
                        shadow-sm
                    "
                >

                    <p
                        className="
                            text-red-600
                            font-semibold
                        "
                    >
                        {error}
                    </p>

                </div>

            </div>

        );
    }


    // ======================================================
    // NO DATA
    // ======================================================

    if (!decision) {

        return (

            <div className="p-8">

                <div
                    className="
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        p-8
                        text-center
                    "
                >

                    <p className="text-slate-500">
                        No hiring decision available.
                    </p>

                </div>

            </div>

        );
    }


    // ======================================================
    // DECISION STATUS STYLE
    // ======================================================

    const getDecisionStyle = () => {

        switch (
            decision.decision?.toUpperCase()
        ) {

            case "SELECTED":

                return `
                    bg-green-100
                    text-green-700
                    border-green-200
                `;

            case "REJECTED":

                return `
                    bg-red-100
                    text-red-700
                    border-red-200
                `;

            case "ON_HOLD":

                return `
                    bg-yellow-100
                    text-yellow-700
                    border-yellow-200
                `;

            case "PENDING_INTERVIEW":
            case "PENDING_EVALUATION":

                return `
                    bg-blue-100
                    text-blue-700
                    border-blue-200
                `;

            default:

                return `
                    bg-slate-100
                    text-slate-700
                    border-slate-200
                `;
        }
    };


    // ======================================================
    // PAGE
    // ======================================================

    return (

        <div
            className="
                min-h-screen
                bg-slate-50
                p-8
            "
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-8">

                <h1
                    className="
                        text-3xl
                        font-black
                        text-slate-800
                    "
                >
                    Hiring Decision
                </h1>

                <p
                    className="
                        mt-2
                        text-slate-500
                    "
                >
                    Final hiring evaluation for the candidate
                </p>

            </div>


            {/* ==================================================
                CANDIDATE INFORMATION
            ================================================== */}

            <div
                className="
                    bg-white
                    rounded-2xl
                    border
                    border-slate-200
                    shadow-sm
                    p-6
                    mb-6
                "
            >

                <h2
                    className="
                        text-xl
                        font-bold
                        text-slate-800
                        mb-5
                    "
                >
                    Candidate Information
                </h2>


                <div
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        lg:grid-cols-3
                        gap-5
                    "
                >

                    <div>

                        <p className="text-sm text-slate-400">
                            Candidate Name
                        </p>

                        <p
                            className="
                                mt-1
                                font-semibold
                                text-slate-800
                            "
                        >
                            {decision.candidateName}
                        </p>

                    </div>


                    <div>

                        <p className="text-sm text-slate-400">
                            Email
                        </p>

                        <p
                            className="
                                mt-1
                                font-semibold
                                text-slate-800
                            "
                        >
                            {decision.email}
                        </p>

                    </div>


                    <div>

                        <p className="text-sm text-slate-400">
                            Applied Position
                        </p>

                        <p
                            className="
                                mt-1
                                font-semibold
                                text-slate-800
                            "
                        >
                            {decision.appliedPosition}
                        </p>

                    </div>

                </div>

            </div>


            {/* ==================================================
                SCORE INFORMATION
            ================================================== */}

            <div
                className="
                    grid
                    grid-cols-1
                    md:grid-cols-3
                    gap-6
                    mb-6
                "
            >

                {/* Resume Score */}

                <div
                    className="
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        shadow-sm
                        p-6
                    "
                >

                    <p
                        className="
                            text-sm
                            text-slate-500
                        "
                    >
                        Resume Score
                    </p>

                    <p
                        className="
                            mt-2
                            text-3xl
                            font-black
                            text-blue-600
                        "
                    >
                        {decision.resumeScore}%
                    </p>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-400
                        "
                    >
                        Required:{" "}
                        {decision.thresholdPercentage}%
                    </p>

                </div>


                {/* HR Score */}

                <div
                    className="
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        shadow-sm
                        p-6
                    "
                >

                    <p
                        className="
                            text-sm
                            text-slate-500
                        "
                    >
                        HR Overall Score
                    </p>

                    <p
                        className="
                            mt-2
                            text-3xl
                            font-black
                            text-cyan-600
                        "
                    >
                        {decision.hrOverallScore ??
                            "N/A"}
                    </p>

                    <p
                        className="
                            mt-1
                            text-xs
                            text-slate-400
                        "
                    >
                        Out of 10
                    </p>

                </div>


                {/* HR Percentage */}

                <div
                    className="
                        bg-white
                        rounded-2xl
                        border
                        border-slate-200
                        shadow-sm
                        p-6
                    "
                >

                    <p
                        className="
                            text-sm
                            text-slate-500
                        "
                    >
                        HR Percentage
                    </p>

                    <p
                        className="
                            mt-2
                            text-3xl
                            font-black
                            text-purple-600
                        "
                    >
                        {decision.hrPercentage != null
                            ? `${decision.hrPercentage}%`
                            : "N/A"}
                    </p>

                </div>

            </div>


            {/* ==================================================
                INTERVIEW INFORMATION
            ================================================== */}

            <div
                className="
                    bg-white
                    rounded-2xl
                    border
                    border-slate-200
                    shadow-sm
                    p-6
                    mb-6
                "
            >

                <h2
                    className="
                        text-xl
                        font-bold
                        text-slate-800
                        mb-5
                    "
                >
                    Interview Evaluation
                </h2>


                <div
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        lg:grid-cols-4
                        gap-5
                    "
                >

                    <div>

                        <p className="text-sm text-slate-400">
                            Interview ID
                        </p>

                        <p
                            className="
                                mt-1
                                font-semibold
                            "
                        >
                            {decision.interviewId ??
                                "N/A"}
                        </p>

                    </div>


                    <div>

                        <p className="text-sm text-slate-400">
                            Status
                        </p>

                        <p
                            className="
                                mt-1
                                font-semibold
                            "
                        >
                            {decision.interviewStatus ??
                                "N/A"}
                        </p>

                    </div>


                    <div>

                        <p className="text-sm text-slate-400">
                            Round
                        </p>

                        <p
                            className="
                                mt-1
                                font-semibold
                            "
                        >
                            {decision.roundName ??
                                "N/A"}
                        </p>

                    </div>


                    <div>

                        <p className="text-sm text-slate-400">
                            Interviewer
                        </p>

                        <p
                            className="
                                mt-1
                                font-semibold
                            "
                        >
                            {decision.interviewerName ??
                                "N/A"}
                        </p>

                    </div>

                </div>


                {/* Interview Scores */}

                <div
                    className="
                        grid
                        grid-cols-2
                        md:grid-cols-4
                        gap-4
                        mt-6
                    "
                >

                    <ScoreCard
                        title="Technical Knowledge"
                        value={
                            decision.technicalKnowledge
                        }
                    />

                    <ScoreCard
                        title="Problem Solving"
                        value={
                            decision.problemSolving
                        }
                    />

                    <ScoreCard
                        title="Communication"
                        value={
                            decision.communication
                        }
                    />

                    <ScoreCard
                        title="Role Knowledge"
                        value={
                            decision.roleKnowledge
                        }
                    />

                </div>

            </div>


            {/* ==================================================
                HR RECOMMENDATION
            ================================================== */}

            <div
                className="
                    bg-white
                    rounded-2xl
                    border
                    border-slate-200
                    shadow-sm
                    p-6
                    mb-6
                "
            >

                <h2
                    className="
                        text-xl
                        font-bold
                        text-slate-800
                        mb-5
                    "
                >
                    HR Recommendation
                </h2>


                <div
                    className="
                        flex
                        flex-wrap
                        gap-4
                        items-center
                    "
                >

                    <div>

                        <p className="text-sm text-slate-400">
                            Recommendation
                        </p>

                        <span
                            className="
                                inline-block
                                mt-2
                                px-4
                                py-2
                                rounded-full
                                bg-blue-100
                                text-blue-700
                                font-bold
                            "
                        >
                            {decision.recommendation ??
                                "N/A"}
                        </span>

                    </div>


                    <div>

                        <p className="text-sm text-slate-400">
                            Feedback
                        </p>

                        <p
                            className="
                                mt-2
                                text-slate-700
                            "
                        >
                            {decision.feedback ||
                                "No feedback provided."}
                        </p>

                    </div>

                </div>

            </div>


            {/* ==================================================
                FINAL DECISION
            ================================================== */}

            <div
                className="
                    bg-white
                    rounded-2xl
                    border
                    border-slate-200
                    shadow-sm
                    p-8
                "
            >

                <div className="text-center">

                    <p
                        className="
                            text-sm
                            text-slate-500
                            font-semibold
                            uppercase
                            tracking-wider
                        "
                    >
                        Final Hiring Decision
                    </p>


                    <div
                        className={`
                            inline-block
                            mt-4
                            px-8
                            py-4
                            rounded-2xl
                            border
                            text-2xl
                            font-black
                            ${getDecisionStyle()}
                        `}
                    >
                        {decision.decision}
                    </div>


                    <p
                        className="
                            mt-5
                            text-slate-600
                            max-w-2xl
                            mx-auto
                        "
                    >
                        {decision.decisionReason}
                    </p>

                </div>

            </div>

        </div>
    );
}


// ======================================================
// SCORE CARD
// ======================================================

function ScoreCard({
    title,
    value
}) {

    return (

        <div
            className="
                rounded-xl
                bg-slate-50
                border
                border-slate-200
                p-4
            "
        >

            <p
                className="
                    text-xs
                    text-slate-500
                "
            >
                {title}
            </p>

            <p
                className="
                    mt-2
                    text-xl
                    font-bold
                    text-slate-800
                "
            >
                {value ?? "N/A"}
            </p>

        </div>
    );
}


export default HiringDecision;
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    CheckCircle,
    AlertCircle,
    CalendarDays,
    Loader2,
    Sparkles,
    ArrowRight,
} from "lucide-react";

import { getSkillGap } from "../services/candidateService";


// ======================================================
// SKILL GAP ANALYSIS
// ======================================================

const SkillGap = ({ candidateId, jobId }) => {

    const navigate = useNavigate();


    // ======================================================
    // STATE
    // ======================================================

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // ======================================================
    // LOAD SKILL GAP
    // ======================================================

    useEffect(() => {

        const loadSkillGap = async () => {

            try {

                setLoading(true);

                setError("");


                const result =
                    await getSkillGap(
                        candidateId,
                        jobId
                    );


                console.log(
                    "Skill Gap Response:",
                    result
                );


                setData(result);

            } catch (err) {

                console.error(
                    "Unable to load skill gap:",
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    "Unable to load skill gap"
                );

            } finally {

                setLoading(false);

            }
        };


        if (candidateId && jobId) {

            loadSkillGap();

        } else {

            setLoading(false);

            setError(
                "Candidate and Job information are required."
            );

        }

    }, [candidateId, jobId]);


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div
                className="
                    min-h-[300px]
                    flex
                    items-center
                    justify-center
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        items-center
                        gap-3
                    "
                >

                    <Loader2
                        size={32}
                        className="
                            animate-spin
                            text-indigo-600
                        "
                    />

                    <p
                        className="
                            text-sm
                            text-gray-500
                        "
                    >
                        Loading skill gap...
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

            <div
                className="
                    m-6
                    p-4
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    text-red-700
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <AlertCircle
                        size={20}
                    />

                    <p
                        className="
                            font-medium
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

    if (!data) {

        return null;

    }


    // ======================================================
    // SAFE ARRAYS
    // ======================================================

    const matchedSkills =
        Array.isArray(data.matchedSkills)
            ? data.matchedSkills
            : [];


    const missingSkills =
        Array.isArray(data.missingSkills)
            ? data.missingSkills
            : [];


    // ======================================================
    // NO MISSING SKILLS
    // ======================================================

    const noMissingSkills =
        missingSkills.length === 0;


    // ======================================================
    // HANDLE SCHEDULE INTERVIEW
    // ======================================================

    const handleScheduleInterview = () => {

        console.log(
            "Opening interview scheduler:",
            {
                candidateId,
                jobId,
                candidateName: data.candidateName,
                jobTitle: data.jobTitle,
            }
        );


        /*
         * Pass candidate and job information
         * to the Interview Scheduling page.
         *
         * The scheduling page can use this
         * information to automatically select
         * the candidate and job.
         */

        navigate(
            "/interviews/schedule",
            {
                state: {
                    candidateId: candidateId,
                    jobId: jobId,
                    candidateName:
                        data.candidateName,
                    jobTitle:
                        data.jobTitle,
                },
            }
        );

    };


    // ======================================================
    // PAGE
    // ======================================================

    return (

        <div
            className="
                min-h-screen
                bg-gray-50
                p-6
            "
        >

            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

            <div
                className="
                    max-w-7xl
                    mx-auto
                "
            >

                <div
                    className="
                        mb-6
                    "
                >

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
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-xl
                                bg-gradient-to-r
                                from-indigo-600
                                to-cyan-500
                                text-white
                                shadow-md
                            "
                        >

                            <Sparkles
                                size={24}
                            />

                        </div>


                        <div>

                            <h1
                                className="
                                    text-2xl
                                    font-bold
                                    text-gray-900
                                "
                            >
                                Skill Gap Analysis
                            </h1>


                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-gray-500
                                "
                            >
                                Identify missing skills by comparing
                                candidate expertise with job requirements
                            </p>

                        </div>

                    </div>

                </div>


                {/* ================================================== */}
                {/* CANDIDATE / JOB */}
                {/* ================================================== */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        p-6
                        shadow-sm
                        mb-6
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

                        {/* ------------------------------------------ */}
                        {/* CANDIDATE */}
                        {/* ------------------------------------------ */}

                        <div>

                            <p
                                className="
                                    text-xs
                                    font-medium
                                    uppercase
                                    tracking-wide
                                    text-gray-500
                                "
                            >
                                Candidate
                            </p>


                            <p
                                className="
                                    mt-1
                                    text-lg
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                {data.candidateName}
                            </p>

                        </div>


                        {/* ------------------------------------------ */}
                        {/* JOB */}
                        {/* ------------------------------------------ */}

                        <div>

                            <p
                                className="
                                    text-xs
                                    font-medium
                                    uppercase
                                    tracking-wide
                                    text-gray-500
                                "
                            >
                                Job Position
                            </p>


                            <p
                                className="
                                    mt-1
                                    text-lg
                                    font-semibold
                                    text-gray-900
                                "
                            >
                                {data.jobTitle}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ================================================== */}
                {/* RESULT SUMMARY */}
                {/* ================================================== */}

                <div
                    className="
                        rounded-2xl
                        bg-gradient-to-r
                        from-violet-600
                        via-indigo-600
                        to-cyan-500
                        p-6
                        text-white
                        shadow-lg
                        mb-6
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            md:flex-row
                            md:items-center
                            md:justify-between
                            gap-6
                        "
                    >

                        {/* ------------------------------------------ */}
                        {/* CANDIDATE */}
                        {/* ------------------------------------------ */}

                        <div>

                            <h2
                                className="
                                    text-xl
                                    font-bold
                                "
                            >
                                {data.candidateName}
                            </h2>


                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-white/80
                                "
                            >
                                {data.jobTitle}
                            </p>

                        </div>


                        {/* ------------------------------------------ */}
                        {/* SCORE */}
                        {/* ------------------------------------------ */}

                        <div
                            className="
                                flex
                                items-center
                                gap-8
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-xs
                                        text-white/70
                                    "
                                >
                                    Match Percentage
                                </p>


                                <p
                                    className="
                                        mt-1
                                        text-4xl
                                        font-bold
                                    "
                                >
                                    {data.matchPercentage}%
                                </p>

                            </div>


                            <div>

                                <p
                                    className="
                                        text-xs
                                        text-white/70
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


                            <div>

                                <p
                                    className="
                                        text-xs
                                        text-white/70
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

                </div>


                {/* ================================================== */}
                {/* INTERVIEW ELIGIBILITY */}
                {/* ================================================== */}

                {noMissingSkills && (

                    <div
                        className="
                            mb-6
                            rounded-2xl
                            border
                            border-emerald-200
                            bg-emerald-50
                            p-6
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                lg:flex-row
                                lg:items-center
                                lg:justify-between
                                gap-5
                            "
                        >

                            {/* -------------------------------------- */}
                            {/* MESSAGE */}
                            {/* -------------------------------------- */}

                            <div
                                className="
                                    flex
                                    items-start
                                    gap-4
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-11
                                        w-11
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-emerald-100
                                    "
                                >

                                    <CheckCircle
                                        size={24}
                                        className="
                                            text-emerald-600
                                        "
                                    />

                                </div>


                                <div>

                                    <h2
                                        className="
                                            text-lg
                                            font-bold
                                            text-emerald-800
                                        "
                                    >
                                        Candidate is Ready for Interview
                                    </h2>


                                    <p
                                        className="
                                            mt-1
                                            text-sm
                                            text-emerald-700
                                        "
                                    >
                                        No skill gaps were identified for
                                        this candidate. The recruiter can
                                        proceed with interview scheduling.
                                    </p>

                                </div>

                            </div>


                            {/* -------------------------------------- */}
                            {/* SCHEDULE BUTTON */}
                            {/* -------------------------------------- */}

                            <button
                                type="button"
                                onClick={
                                    handleScheduleInterview
                                }
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-gradient-to-r
                                    from-indigo-600
                                    to-cyan-500
                                    px-6
                                    py-3
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-md
                                    transition-all
                                    hover:scale-[1.02]
                                    hover:shadow-lg
                                    active:scale-[0.98]
                                "
                            >

                                <CalendarDays
                                    size={18}
                                />

                                Schedule Interview


                                <ArrowRight
                                    size={17}
                                />

                            </button>

                        </div>

                    </div>

                )}


                {/* ================================================== */}
                {/* MATCHED SKILLS */}
                {/* ================================================== */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-emerald-100
                        bg-white
                        p-6
                        shadow-sm
                        mb-6
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            mb-5
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

                            <CheckCircle
                                size={21}
                                className="
                                    text-emerald-600
                                "
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
                                Matched Skills
                            </h2>


                            <p
                                className="
                                    text-sm
                                    text-gray-500
                                "
                            >
                                Skills already available or successfully
                                recovered
                            </p>

                        </div>

                    </div>


                    {matchedSkills.length === 0 ? (

                        <p
                            className="
                                text-sm
                                text-gray-500
                            "
                        >
                            No matched skills found.
                        </p>

                    ) : (

                        <div
                            className="
                                flex
                                flex-wrap
                                gap-2
                            "
                        >

                            {matchedSkills.map(
                                (skill, index) => (

                                    <span
                                        key={index}
                                        className="
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            rounded-full
                                            bg-emerald-50
                                            px-4
                                            py-2
                                            text-sm
                                            font-medium
                                            text-emerald-700
                                            border
                                            border-emerald-100
                                        "
                                    >

                                        <CheckCircle
                                            size={15}
                                        />

                                        {skill}

                                    </span>

                                )
                            )}

                        </div>

                    )}

                </div>


                {/* ================================================== */}
                {/* MISSING SKILLS */}
                {/* ================================================== */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-amber-100
                        bg-white
                        p-6
                        shadow-sm
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                            mb-5
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
                                size={21}
                                className="
                                    text-amber-600
                                "
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
                                Missing Skills
                            </h2>


                            <p
                                className="
                                    text-sm
                                    text-gray-500
                                "
                            >
                                Skills still recommended for recovery
                            </p>

                        </div>

                    </div>


                    {missingSkills.length === 0 ? (

                        <div
                            className="
                                rounded-xl
                                bg-emerald-50
                                border
                                border-emerald-100
                                p-4
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                "
                            >

                                <CheckCircle
                                    size={18}
                                    className="
                                        text-emerald-600
                                    "
                                />


                                <p
                                    className="
                                        text-sm
                                        font-medium
                                        text-emerald-700
                                    "
                                >
                                    No missing skills. Candidate has
                                    completed the required skill matching.
                                </p>

                            </div>

                        </div>

                    ) : (

                        <div
                            className="
                                flex
                                flex-wrap
                                gap-2
                            "
                        >

                            {missingSkills.map(
                                (skill, index) => (

                                    <span
                                        key={index}
                                        className="
                                            inline-flex
                                            items-center
                                            gap-1.5
                                            rounded-full
                                            bg-amber-50
                                            px-4
                                            py-2
                                            text-sm
                                            font-medium
                                            text-amber-700
                                            border
                                            border-amber-100
                                        "
                                    >

                                        <AlertCircle
                                            size={15}
                                        />

                                        {skill}

                                    </span>

                                )
                            )}

                        </div>

                    )}

                </div>

            </div>

        </div>

    );

};


export default SkillGap;
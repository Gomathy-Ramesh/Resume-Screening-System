import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getSkillRecovery,
    getSkillRecoveryParticipation,
    startSkillRecovery,
    updateTopicCompletion,
    getTechnicalAssessment,
    generateTechnicalAssessment,
    regenerateTechnicalAssessment,
} from "../../services/candidateService";

import {
    Brain,
    BookOpen,
    CheckCircle2,
    Circle,
    Play,
    Target,
    TrendingUp,
    Award,
    AlertCircle,
    Loader2,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    ClipboardCheck,
    RefreshCw,
} from "lucide-react";


// ======================================================
// LEARNING RESOURCE GENERATOR
// ======================================================

const getLearningResources = (skill, topic) => {
    const encodedTopic = encodeURIComponent(topic);
    const encodedSkill = encodeURIComponent(skill);

    return [
        {
            type: "ARTICLE",
            title: `Learn ${topic}`,
            description:
                `Study the fundamentals of ${topic} and understand how it is used in ${skill}.`,
            url:
                `https://www.google.com/search?q=${encodedTopic}+tutorial`,
        },

        {
            type: "VIDEO",
            title: `${topic} Video Lessons`,
            description:
                `Watch video lessons explaining ${topic} with practical examples.`,
            url:
                `https://www.youtube.com/results?search_query=${encodedSkill}+${encodedTopic}+tutorial`,
        },

        {
            type: "PRACTICE",
            title: `${topic} Practice`,
            description:
                `Practice questions and examples related to ${topic}.`,
            url:
                `https://www.google.com/search?q=${encodedTopic}+practice+questions`,
        },
    ];
};


// ======================================================
// COMPONENT
// ======================================================

const CandidateSkillRecovery = ({
    candidateId,
    jobId,
}) => {

    const navigate = useNavigate();

    // ==================================================
    // RECOVERY STATES
    // ==================================================

    const [data, setData] = useState(null);

    const [participation, setParticipation] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [starting, setStarting] =
        useState(false);

    const [updatingTopic, setUpdatingTopic] =
        useState("");

    const [expandedTopic, setExpandedTopic] =
        useState("");

    const [error, setError] =
        useState("");


    // ==================================================
    // TECHNICAL ASSESSMENT STATES
    // ==================================================

    const [technicalAssessment, setTechnicalAssessment] =
        useState(null);

    const [assessmentLoading, setAssessmentLoading] =
        useState(false);

    const [assessmentError, setAssessmentError] =
        useState("");

    const [generatingAssessment, setGeneratingAssessment] =
        useState(false);


    // ==================================================
    // LOAD TECHNICAL ASSESSMENT
    // ==================================================

    const loadTechnicalAssessment = async () => {

        if (!candidateId || !jobId) {
            return;
        }

        try {

            setAssessmentLoading(true);
            setAssessmentError("");

            const assessment =
                await getTechnicalAssessment(
                    candidateId,
                    jobId
                );

            console.log(
                "Technical Assessment:",
                assessment
            );

            setTechnicalAssessment(assessment);

        } catch (err) {

            console.error(
                "Technical Assessment Load Error:",
                err
            );

            /*
             * If an assessment does not exist yet,
             * we don't want to display a major error.
             *
             * The candidate can generate one.
             */

            const message =
                err?.message ||
                "";

            if (
                message.toLowerCase().includes("404") ||
                message.toLowerCase().includes("not found") ||
                message.toLowerCase().includes("failed to fetch")
            ) {

                setTechnicalAssessment(null);

            } else {

                setAssessmentError(
                    message ||
                    "Unable to load technical assessment"
                );

            }

        } finally {

            setAssessmentLoading(false);

        }
    };


    // ==================================================
    // GENERATE TECHNICAL ASSESSMENT
    // ==================================================

    const handleGenerateTechnicalAssessment =
        async () => {

            /*
             * If an assessment already exists (in any state),
             * this is a destructive regenerate that wipes the
             * previous attempt and score. Confirm first.
             */

            const isRegenerate =
                Boolean(technicalAssessment);

            if (isRegenerate) {

                const confirmed = window.confirm(
                    "This will delete the current assessment " +
                    "(including any score) and generate a brand " +
                    "new one. Continue?"
                );

                if (!confirmed) {
                    return;
                }
            }

            try {

                setGeneratingAssessment(true);
                setAssessmentError("");

                const generatedAssessment =
                    isRegenerate
                        ? await regenerateTechnicalAssessment(
                            candidateId,
                            jobId
                        )
                        : await generateTechnicalAssessment(
                            candidateId,
                            jobId
                        );

                console.log(
                    "Generated Technical Assessment:",
                    generatedAssessment
                );

                setTechnicalAssessment(
                    generatedAssessment
                );

            } catch (err) {

                console.error(
                    "Technical Assessment Generation Error:",
                    err
                );

                setAssessmentError(
                    err?.message ||
                    "Unable to generate technical assessment"
                );

            } finally {

                setGeneratingAssessment(false);

            }
        };


    // ==================================================
    // LOAD RECOVERY
    // ==================================================

    const loadRecovery = async () => {

        try {

            setLoading(true);
            setError("");

            const [
                recoveryData,
                participationData,
            ] = await Promise.all([

                getSkillRecovery(
                    candidateId,
                    jobId
                ),

                getSkillRecoveryParticipation(
                    candidateId,
                    jobId
                ),

            ]);

            console.log(
                "Candidate Skill Recovery:",
                recoveryData
            );

            console.log(
                "Candidate Participation:",
                participationData
            );

            setData(recoveryData);

            setParticipation(
                participationData
            );

        } catch (err) {

            console.error(
                "Candidate Recovery Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to load recovery program"
            );

        } finally {

            setLoading(false);

        }
    };


    // ==================================================
    // INITIAL LOAD
    // ==================================================

    useEffect(() => {

        if (!candidateId || !jobId) {

            setError(
                "Candidate ID and Job ID are required"
            );

            setLoading(false);

            return;
        }


        const initializeRecovery = async () => {

            try {

                setLoading(true);
                setError("");


                // ==========================================
                // REGISTER RECOVERY PARTICIPATION
                // ==========================================

                await startSkillRecovery(
                    candidateId,
                    jobId
                );


                // ==========================================
                // LOAD RECOVERY DATA
                // ==========================================

                await loadRecovery();


                // ==========================================
                // LOAD EXISTING TECHNICAL ASSESSMENT
                // ==========================================

                await loadTechnicalAssessment();

            } catch (err) {

                console.error(
                    "Recovery Initialization Error:",
                    err
                );


                // Even if start endpoint has an issue,
                // still try loading existing recovery data.

                try {

                    await loadRecovery();

                    await loadTechnicalAssessment();

                } catch (loadError) {

                    console.error(
                        "Recovery Load Error:",
                        loadError
                    );

                    setError(
                        loadError?.message ||
                        "Unable to load skill recovery program"
                    );

                }

            } finally {

                setLoading(false);

            }

        };


        initializeRecovery();

    }, [
        candidateId,
        jobId
    ]);


    // ==================================================
    // START RECOVERY
    // ==================================================

    const handleStartRecovery = async () => {

        try {

            setStarting(true);
            setError("");

            await startSkillRecovery(
                candidateId,
                jobId
            );

            await loadRecovery();

        } catch (err) {

            console.error(
                "Start Recovery Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to start recovery program"
            );

        } finally {

            setStarting(false);

        }
    };


    // ==================================================
    // COMPLETE / UNDO TOPIC
    // ==================================================

    const handleTopicCompletion = async (
        skill,
        topic,
        completed
    ) => {

        const topicKey =
            `${skill}-${topic}`;


        try {

            setUpdatingTopic(topicKey);
            setError("");

            await updateTopicCompletion(
                candidateId,
                jobId,
                skill,
                topic,
                completed
            );

            await loadRecovery();

        } catch (err) {

            console.error(
                "Topic Completion Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Unable to update topic"
            );

        } finally {

            setUpdatingTopic("");

        }
    };


    // ==================================================
    // RECOVERY ITEMS
    // ==================================================

    const recoveryItems =
        data?.recoveryItems || [];


    // ==================================================
    // ALL TOPICS
    // ==================================================

    const allTopics = useMemo(() => {

        return [
            ...new Set(
                recoveryItems.flatMap(
                    (item) =>
                        item.topics || []
                )
            ),
        ];

    }, [recoveryItems]);


    // ==================================================
    // COMPLETED TOPICS
    // ==================================================

    const completedTopics = useMemo(() => {

        return [
            ...new Set(
                recoveryItems.flatMap(
                    (item) =>
                        item.completedTopics || []
                )
            ),
        ];

    }, [recoveryItems]);


    // ==================================================
    // REMAINING TOPICS
    // ==================================================

    const remainingTopics =
        allTopics.filter(
            (topic) =>
                !completedTopics.includes(topic)
        );


    // ==================================================
    // PROGRESS
    // ==================================================

    const calculatedProgress =
        allTopics.length > 0
            ? Math.round(
                (
                    completedTopics.length /
                    allTopics.length
                ) * 100
            )
            : 0;


    const backendProgress = Number(
        participation?.progress ?? 0
    );


    const progress =
        participation &&
        participation.progress !== undefined &&
        participation.progress !== null
            ? Math.max(
                0,
                Math.min(
                    backendProgress,
                    100
                )
            )
            : calculatedProgress;


    // ==================================================
    // PARTICIPATION STATUS
    // ==================================================

    const status = useMemo(() => {

        const backendStatus =
            String(
                participation?.status || ""
            )
                .trim()
                .toLowerCase()
                .replace(/_/g, " ");


        const startedAt =
            participation?.startedAt;


        const lastActivityAt =
            participation?.lastActivityAt;


        const participationProgress =
            Number(
                participation?.progress ?? 0
            );


        // ==========================================
        // COMPLETED
        // ==========================================

        if (
            participationProgress >= 100 ||
            calculatedProgress >= 100 ||
            backendStatus === "completed"
        ) {

            return "Completed";

        }


        // ==========================================
        // IN PROGRESS
        // ==========================================

        if (
            startedAt ||
            lastActivityAt ||
            completedTopics.length > 0 ||
            backendStatus === "in progress"
        ) {

            return "In Progress";

        }


        // ==========================================
        // NOT STARTED
        // ==========================================

        return "Not Started";

    }, [
        participation,
        completedTopics,
        calculatedProgress,
    ]);


    // ==================================================
    // DISPLAY DATES
    // ==================================================

    const startedAt =
        participation?.startedAt ||
        "Not started";


    const lastActivity =
        participation?.lastActivityAt ||
        "No activity recorded";


    // ==================================================
    // STATUS HELPERS
    // ==================================================

    const isCompleted =
        status === "Completed";


    const isInProgress =
        status === "In Progress";


    const isNotStarted =
        status === "Not Started";


    // ==================================================
    // TECHNICAL ASSESSMENT DATA HELPERS
    // ==================================================

    /*
     * Different backend DTOs may use different names.
     * These fallbacks make the UI more tolerant.
     */

    const assessmentQuestions =
        technicalAssessment?.questions ||
        technicalAssessment?.assessmentQuestions ||
        technicalAssessment?.items ||
        [];


    const assessmentTitle =
        technicalAssessment?.title ||
        technicalAssessment?.assessmentTitle ||
        "Technical Assessment";


    const assessmentDescription =
        technicalAssessment?.description ||
        technicalAssessment?.assessmentDescription ||
        "Test your technical knowledge based on the skills required for this position.";


    const assessmentStatus =
        (
            technicalAssessment?.status ||
            "NOT_STARTED"
        ).toUpperCase();


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <div
                className="
                    min-h-screen
                    overflow-y-auto
                    flex
                    items-center
                    justify-center
                    bg-[#FAFAFF]
                "
            >

                <div className="text-center">

                    <Loader2
                        size={42}
                        className="
                            mx-auto
                            mb-4
                            animate-spin
                            text-violet-600
                        "
                    />

                    <p
                        className="
                            text-lg
                            font-semibold
                            text-slate-600
                        "
                    >
                        Loading your recovery program...
                    </p>

                </div>

            </div>

        );
    }


    // ==================================================
    // ERROR WITH NO DATA
    // ==================================================

    if (error && !data) {

        return (

            <div
                className="
                    min-h-screen
                    bg-[#FAFAFF]
                    p-8
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        rounded-2xl
                        border
                        border-red-200
                        bg-red-50
                        p-5
                        text-red-600
                    "
                >

                    <AlertCircle size={22} />

                    <span>
                        {error}
                    </span>

                </div>

            </div>

        );
    }


    // ==================================================
    // MAIN UI
    // ==================================================

    return (

        <div
            className="
                min-h-screen
                overflow-y-auto
                bg-[#FAFAFF]
                px-6
                pb-12
                pt-6
            "
        >

            <div
                className="
                    mx-auto
                    max-w-6xl
                "
            >


                {/* ==================================================
                    HEADER
                ================================================== */}

                <div
                    className="
                        mb-6
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
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-2xl
                                bg-gradient-to-r
                                from-violet-600
                                to-cyan-500
                                shadow-lg
                            "
                        >

                            <Brain
                                size={28}
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
                                My Skill Recovery
                            </h1>

                            <p
                                className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Build the skills you need
                                for your target role.
                            </p>

                        </div>

                    </div>


                    {/* START RECOVERY */}

                    {isNotStarted && (

                        <button
                            type="button"
                            onClick={
                                handleStartRecovery
                            }
                            disabled={starting}
                            className="
                                flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-gradient-to-r
                                from-violet-600
                                to-cyan-500
                                px-6
                                py-3
                                font-semibold
                                text-white
                                shadow-md
                                transition
                                hover:scale-[1.02]
                                hover:shadow-lg
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >

                            {starting ? (

                                <>

                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />

                                    Starting...

                                </>

                            ) : (

                                <>

                                    <Play size={18} />

                                    Start Recovery

                                </>

                            )}

                        </button>

                    )}

                </div>


                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div
                        className="
                            mb-6
                            flex
                            items-center
                            gap-3
                            rounded-2xl
                            border
                            border-red-200
                            bg-red-50
                            p-4
                            text-red-600
                        "
                    >

                        <AlertCircle size={20} />

                        <span>
                            {error}
                        </span>

                    </div>

                )}


                {/* ==================================================
                    CANDIDATE / JOB INFORMATION
                ================================================== */}

                <div
                    className="
                        mb-6
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        p-6
                        shadow-sm
                    "
                >

                    <div
                        className="
                            grid
                            gap-6
                            md:grid-cols-2
                        "
                    >

                        <div>

                            <p
                                className="
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Candidate
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-xl
                                    font-bold
                                    text-slate-800
                                "
                            >
                                {data?.candidateName ||
                                    localStorage.getItem(
                                        "candidateName"
                                    ) ||
                                    "Candidate"}
                            </p>

                        </div>


                        <div>

                            <p
                                className="
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Target Position
                            </p>

                            <p
                                className="
                                    mt-1
                                    text-xl
                                    font-bold
                                    text-slate-800
                                "
                            >
                                {data?.jobTitle ||
                                    localStorage.getItem(
                                        "candidatePosition"
                                    ) ||
                                    "Target Job"}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    RECOVERY STATUS
                ================================================== */}

                <div
                    className="
                        mb-6
                        rounded-3xl
                        border
                        border-violet-100
                        bg-white
                        p-6
                        shadow-sm
                    "
                >

                    <div
                        className="
                            grid
                            gap-6
                            md:grid-cols-3
                        "
                    >

                        <div>

                            <p
                                className="
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Recovery Status
                            </p>


                            <span
                                className={`
                                    mt-2
                                    inline-flex
                                    rounded-full
                                    px-4
                                    py-2
                                    text-sm
                                    font-semibold

                                    ${
                                        isCompleted
                                            ? "bg-emerald-100 text-emerald-700"
                                            : isInProgress
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-slate-100 text-slate-600"
                                    }
                                `}
                            >

                                {status}

                            </span>

                        </div>


                        <div>

                            <p
                                className="
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Started At
                            </p>

                            <p
                                className="
                                    mt-2
                                    font-semibold
                                    text-slate-800
                                "
                            >
                                {startedAt}
                            </p>

                        </div>


                        <div>

                            <p
                                className="
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Last Activity
                            </p>

                            <p
                                className="
                                    mt-2
                                    font-semibold
                                    text-slate-800
                                "
                            >
                                {lastActivity}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    PROGRESS
                ================================================== */}

                <div
                    className="
                        mb-8
                        rounded-3xl
                        bg-gradient-to-r
                        from-violet-600
                        to-cyan-500
                        p-6
                        text-white
                        shadow-lg
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <TrendingUp size={24} />

                        <div>

                            <h2
                                className="
                                    text-xl
                                    font-bold
                                "
                            >
                                Your Recovery Progress
                            </h2>

                            <p
                                className="
                                    text-sm
                                    text-violet-100
                                "
                            >
                                Keep learning and complete
                                your remaining topics.
                            </p>

                        </div>

                    </div>


                    <div
                        className="
                            mt-6
                            flex
                            items-center
                            justify-between
                        "
                    >

                        <span
                            className="
                                text-sm
                                text-violet-100
                            "
                        >
                            Overall Progress
                        </span>

                        <span
                            className="
                                text-3xl
                                font-bold
                            "
                        >
                            {progress}%
                        </span>

                    </div>


                    <div
                        className="
                            mt-3
                            h-4
                            overflow-hidden
                            rounded-full
                            bg-white/20
                        "
                    >

                        <div
                            className="
                                h-full
                                rounded-full
                                bg-white
                                transition-all
                                duration-700
                            "
                            style={{
                                width:
                                    `${Math.min(
                                        Math.max(
                                            progress,
                                            0
                                        ),
                                        100
                                    )}%`,
                            }}
                        />

                    </div>


                    <div
                        className="
                            mt-6
                            grid
                            gap-4
                            md:grid-cols-2
                        "
                    >

                        <div
                            className="
                                rounded-2xl
                                bg-white/15
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

                                <CheckCircle2
                                    size={19}
                                />

                                Completed

                            </div>

                            <p
                                className="
                                    mt-2
                                    text-3xl
                                    font-bold
                                "
                            >
                                {completedTopics.length}
                            </p>

                        </div>


                        <div
                            className="
                                rounded-2xl
                                bg-white/15
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

                                <Target
                                    size={19}
                                />

                                Remaining

                            </div>

                            <p
                                className="
                                    mt-2
                                    text-3xl
                                    font-bold
                                "
                            >
                                {remainingTopics.length}
                            </p>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    LEARNING PROGRAM
                ================================================== */}

                <div className="mb-4">

                    <h2
                        className="
                            text-2xl
                            font-bold
                            text-slate-800
                        "
                    >
                        Your Learning Program
                    </h2>

                    <p
                        className="
                            mt-1
                            text-sm
                            text-slate-500
                        "
                    >
                        Study the recommended topics
                        and mark them complete when
                        you are ready.
                    </p>

                </div>


                {/* ==================================================
                    MODULES
                ================================================== */}

                <div className="space-y-5">

                    {recoveryItems.length > 0 ? (

                        recoveryItems.map(
                            (item, index) => {

                                const itemTopics =
                                    item.topics || [];

                                const itemCompleted =
                                    item.completedTopics || [];


                                return (

                                    <div
                                        key={index}
                                        className="
                                            rounded-3xl
                                            border
                                            border-slate-100
                                            bg-white
                                            p-6
                                            shadow-sm
                                        "
                                    >

                                        {/* MODULE HEADER */}

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
                                                    rounded-xl
                                                    bg-violet-100
                                                "
                                            >

                                                <BookOpen
                                                    size={22}
                                                    className="
                                                        text-violet-600
                                                    "
                                                />

                                            </div>


                                            <div>

                                                <h3
                                                    className="
                                                        text-xl
                                                        font-bold
                                                        text-slate-800
                                                    "
                                                >
                                                    {item.skill}
                                                </h3>

                                                <p
                                                    className="
                                                        text-sm
                                                        text-slate-500
                                                    "
                                                >
                                                    {item.description ||
                                                        "Recommended learning area"}
                                                </p>

                                            </div>

                                        </div>


                                        {/* TOPICS */}

                                        <div
                                            className="
                                                mt-6
                                                space-y-3
                                            "
                                        >

                                            {itemTopics.length > 0 ? (

                                                itemTopics.map(
                                                    (
                                                        topic,
                                                        topicIndex
                                                    ) => {

                                                        const isTopicCompleted =
                                                            itemCompleted.includes(
                                                                topic
                                                            );

                                                        const topicKey =
                                                            `${item.skill}-${topic}`;

                                                        const isUpdating =
                                                            updatingTopic ===
                                                            topicKey;

                                                        const isExpanded =
                                                            expandedTopic ===
                                                            topicKey;

                                                        const resources =
                                                            getLearningResources(
                                                                item.skill,
                                                                topic
                                                            );


                                                        return (

                                                            <div
                                                                key={topicIndex}
                                                                className={`
                                                                    rounded-2xl
                                                                    border

                                                                    ${
                                                                        isTopicCompleted
                                                                            ? "border-emerald-200 bg-emerald-50"
                                                                            : "border-slate-200 bg-white"
                                                                    }
                                                                `}
                                                            >

                                                                {/* TOPIC ROW */}

                                                                <div
                                                                    className="
                                                                        flex
                                                                        items-center
                                                                        justify-between
                                                                        gap-3
                                                                        p-4
                                                                    "
                                                                >

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            setExpandedTopic(
                                                                                isExpanded
                                                                                    ? ""
                                                                                    : topicKey
                                                                            )
                                                                        }
                                                                        className="
                                                                            flex
                                                                            flex-1
                                                                            items-center
                                                                            gap-3
                                                                            text-left
                                                                        "
                                                                    >

                                                                        {isTopicCompleted ? (

                                                                            <CheckCircle2
                                                                                size={21}
                                                                                className="
                                                                                    shrink-0
                                                                                    text-emerald-600
                                                                                "
                                                                            />

                                                                        ) : (

                                                                            <Circle
                                                                                size={21}
                                                                                className="
                                                                                    shrink-0
                                                                                    text-violet-500
                                                                                "
                                                                            />

                                                                        )}


                                                                        <span
                                                                            className={`
                                                                                text-sm
                                                                                font-semibold

                                                                                ${
                                                                                    isTopicCompleted
                                                                                        ? "text-emerald-700"
                                                                                        : "text-slate-700"
                                                                                }
                                                                            `}
                                                                        >
                                                                            {topic}
                                                                        </span>


                                                                        {isExpanded ? (

                                                                            <ChevronUp
                                                                                size={18}
                                                                                className="
                                                                                    ml-auto
                                                                                    text-slate-400
                                                                                "
                                                                            />

                                                                        ) : (

                                                                            <ChevronDown
                                                                                size={18}
                                                                                className="
                                                                                    ml-auto
                                                                                    text-slate-400
                                                                                "
                                                                            />

                                                                        )}

                                                                    </button>


                                                                    {/* COMPLETE BUTTON */}

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleTopicCompletion(
                                                                                item.skill,
                                                                                topic,
                                                                                !isTopicCompleted
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            isUpdating
                                                                        }
                                                                        className={`
                                                                            shrink-0
                                                                            rounded-lg
                                                                            px-3
                                                                            py-2
                                                                            text-xs
                                                                            font-semibold
                                                                            disabled:cursor-not-allowed
                                                                            disabled:opacity-60

                                                                            ${
                                                                                isTopicCompleted
                                                                                    ? "bg-white text-slate-600 hover:bg-slate-100"
                                                                                    : "bg-violet-600 text-white hover:bg-violet-700"
                                                                            }
                                                                        `}
                                                                    >

                                                                        {isUpdating ? (

                                                                            <Loader2
                                                                                size={15}
                                                                                className="
                                                                                    animate-spin
                                                                                "
                                                                            />

                                                                        ) : isTopicCompleted ? (

                                                                            "Completed"

                                                                        ) : (

                                                                            "Mark Complete"

                                                                        )}

                                                                    </button>

                                                                </div>


                                                                {/* LEARNING CONTENT */}

                                                                {isExpanded && (

                                                                    <div
                                                                        className="
                                                                            border-t
                                                                            border-slate-100
                                                                            p-5
                                                                        "
                                                                    >

                                                                        <div
                                                                            className="
                                                                                rounded-2xl
                                                                                bg-slate-50
                                                                                p-5
                                                                            "
                                                                        >

                                                                            <div
                                                                                className="
                                                                                    flex
                                                                                    items-center
                                                                                    gap-2
                                                                                "
                                                                            >

                                                                                <Award
                                                                                    size={20}
                                                                                    className="
                                                                                        text-violet-600
                                                                                    "
                                                                                />

                                                                                <h4
                                                                                    className="
                                                                                        font-bold
                                                                                        text-slate-800
                                                                                    "
                                                                                >
                                                                                    What you will learn
                                                                                </h4>

                                                                            </div>


                                                                            <p
                                                                                className="
                                                                                    mt-3
                                                                                    text-sm
                                                                                    leading-6
                                                                                    text-slate-600
                                                                                "
                                                                            >

                                                                                Build your
                                                                                understanding
                                                                                of{" "}

                                                                                <strong>
                                                                                    {topic}
                                                                                </strong>

                                                                                {" "}and learn
                                                                                how it is
                                                                                applied in{" "}

                                                                                <strong>
                                                                                    {item.skill}
                                                                                </strong>.

                                                                            </p>

                                                                        </div>


                                                                        {/* RESOURCES */}

                                                                        <div
                                                                            className="
                                                                                mt-5
                                                                            "
                                                                        >

                                                                            <h4
                                                                                className="
                                                                                    mb-3
                                                                                    font-bold
                                                                                    text-slate-800
                                                                                "
                                                                            >
                                                                                Learning Resources
                                                                            </h4>


                                                                            <div
                                                                                className="
                                                                                    grid
                                                                                    gap-3
                                                                                    md:grid-cols-3
                                                                                "
                                                                            >

                                                                                {resources.map(
                                                                                    (
                                                                                        resource,
                                                                                        resourceIndex
                                                                                    ) => (

                                                                                        <a
                                                                                            key={
                                                                                                resourceIndex
                                                                                            }
                                                                                            href={
                                                                                                resource.url
                                                                                            }
                                                                                            target="_blank"
                                                                                            rel="noreferrer"
                                                                                            className="
                                                                                                rounded-2xl
                                                                                                border
                                                                                                border-slate-200
                                                                                                bg-white
                                                                                                p-4
                                                                                                transition
                                                                                                hover:-translate-y-1
                                                                                                hover:border-violet-300
                                                                                                hover:shadow-md
                                                                                            "
                                                                                        >

                                                                                            <div
                                                                                                className="
                                                                                                    flex
                                                                                                    items-center
                                                                                                    justify-between
                                                                                                "
                                                                                            >

                                                                                                <span
                                                                                                    className="
                                                                                                        rounded-full
                                                                                                        bg-violet-100
                                                                                                        px-2
                                                                                                        py-1
                                                                                                        text-[10px]
                                                                                                        font-bold
                                                                                                        text-violet-700
                                                                                                    "
                                                                                                >
                                                                                                    {
                                                                                                        resource.type
                                                                                                    }
                                                                                                </span>


                                                                                                <ExternalLink
                                                                                                    size={15}
                                                                                                    className="
                                                                                                        text-slate-400
                                                                                                    "
                                                                                                />

                                                                                            </div>


                                                                                            <h5
                                                                                                className="
                                                                                                    mt-3
                                                                                                    font-semibold
                                                                                                    text-slate-800
                                                                                                "
                                                                                            >
                                                                                                {
                                                                                                    resource.title
                                                                                                }
                                                                                            </h5>


                                                                                            <p
                                                                                                className="
                                                                                                    mt-2
                                                                                                    text-xs
                                                                                                    leading-5
                                                                                                    text-slate-500
                                                                                                "
                                                                                            >
                                                                                                {
                                                                                                    resource.description
                                                                                                }
                                                                                            </p>

                                                                                        </a>

                                                                                    )
                                                                                )}

                                                                            </div>

                                                                        </div>


                                                                        {/* COMPLETED MESSAGE */}

                                                                        {isTopicCompleted && (

                                                                            <div
                                                                                className="
                                                                                    mt-5
                                                                                    flex
                                                                                    items-center
                                                                                    gap-2
                                                                                    rounded-xl
                                                                                    bg-emerald-50
                                                                                    p-4
                                                                                    text-sm
                                                                                    font-semibold
                                                                                    text-emerald-700
                                                                                "
                                                                            >

                                                                                <CheckCircle2
                                                                                    size={18}
                                                                                />

                                                                                You have completed
                                                                                this topic.

                                                                            </div>

                                                                        )}

                                                                    </div>

                                                                )}

                                                            </div>

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
                                                    No learning topics available.
                                                </p>

                                            )}

                                        </div>

                                    </div>

                                );

                            }
                        )

                    ) : (

                        <div
                            className="
                                rounded-2xl
                                bg-white
                                p-8
                                text-center
                                shadow-sm
                            "
                        >

                            <p
                                className="
                                    text-slate-500
                                "
                            >
                                No recovery modules available.
                            </p>

                        </div>

                    )}

                </div>


                {/* ==================================================
                    ALL COMPLETE
                ================================================== */}

                {allTopics.length > 0 &&
                    remainingTopics.length === 0 && (

                        <div
                            className="
                                mt-8
                                rounded-3xl
                                border
                                border-emerald-200
                                bg-emerald-50
                                p-8
                                text-center
                            "
                        >

                            <CheckCircle2
                                size={45}
                                className="
                                    mx-auto
                                    text-emerald-600
                                "
                            />

                            <h2
                                className="
                                    mt-4
                                    text-2xl
                                    font-bold
                                    text-emerald-800
                                "
                            >
                                Recovery Program Completed!
                            </h2>

                            <p
                                className="
                                    mt-2
                                    text-sm
                                    text-emerald-700
                                "
                            >
                                Great work. You have completed
                                all recommended recovery topics.
                            </p>

                        </div>

                    )}


                {/* ==================================================
                    TECHNICAL ASSESSMENT
                ================================================== */}

                <div
                    className="
                        mt-10
                        rounded-3xl
                        border
                        border-cyan-100
                        bg-white
                        p-6
                        shadow-sm
                    "
                >

                    {/* ASSESSMENT HEADER */}

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
                                    bg-cyan-100
                                "
                            >

                                <ClipboardCheck
                                    size={24}
                                    className="
                                        text-cyan-600
                                    "
                                />

                            </div>


                            <div>

                                <h2
                                    className="
                                        text-2xl
                                        font-bold
                                        text-slate-800
                                    "
                                >
                                    Technical Assessment
                                </h2>

                                <p
                                    className="
                                        mt-1
                                        text-sm
                                        text-slate-500
                                    "
                                >
                                    Test your technical knowledge
                                    based on your target position.
                                </p>

                            </div>

                        </div>


                        {/* GENERATE / REFRESH */}

                        <button
                            type="button"
                            onClick={
                                handleGenerateTechnicalAssessment
                            }
                            disabled={
                                generatingAssessment ||
                                assessmentLoading
                            }
                            className="
                                flex
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-gradient-to-r
                                from-cyan-500
                                to-violet-600
                                px-5
                                py-3
                                font-semibold
                                text-white
                                shadow-md
                                transition
                                hover:shadow-lg
                                disabled:cursor-not-allowed
                                disabled:opacity-60
                            "
                        >

                            {generatingAssessment ? (

                                <>

                                    <Loader2
                                        size={18}
                                        className="
                                            animate-spin
                                        "
                                    />

                                    Generating...

                                </>

                            ) : (

                                <>

                                    {technicalAssessment ? (
                                        <RefreshCw size={18} />
                                    ) : (
                                        <Brain size={18} />
                                    )}

                                    {technicalAssessment
                                        ? "Regenerate Assessment"
                                        : "Generate Assessment"}

                                </>

                            )}

                        </button>

                    </div>


                    {/* ASSESSMENT ERROR */}

                    {assessmentError && (

                        <div
                            className="
                                mt-5
                                flex
                                items-center
                                gap-3
                                rounded-2xl
                                border
                                border-red-200
                                bg-red-50
                                p-4
                                text-red-600
                            "
                        >

                            <AlertCircle
                                size={20}
                            />

                            <span>
                                {assessmentError}
                            </span>

                        </div>

                    )}


                    {/* ASSESSMENT LOADING */}

                    {assessmentLoading && (

                        <div
                            className="
                                mt-6
                                flex
                                items-center
                                justify-center
                                rounded-2xl
                                bg-slate-50
                                p-8
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                    text-slate-500
                                "
                            >

                                <Loader2
                                    size={22}
                                    className="
                                        animate-spin
                                        text-cyan-600
                                    "
                                />

                                Loading technical assessment...

                            </div>

                        </div>

                    )}


                    {/* NO ASSESSMENT */}

                    {!assessmentLoading &&
                        !technicalAssessment &&
                        !assessmentError && (

                            <div
                                className="
                                    mt-6
                                    rounded-2xl
                                    border
                                    border-dashed
                                    border-slate-300
                                    bg-slate-50
                                    p-8
                                    text-center
                                "
                            >

                                <ClipboardCheck
                                    size={40}
                                    className="
                                        mx-auto
                                        text-slate-400
                                    "
                                />

                                <h3
                                    className="
                                        mt-4
                                        text-lg
                                        font-bold
                                        text-slate-700
                                    "
                                >
                                    No Technical Assessment Yet
                                </h3>

                                <p
                                    className="
                                        mx-auto
                                        mt-2
                                        max-w-xl
                                        text-sm
                                        leading-6
                                        text-slate-500
                                    "
                                >
                                    Generate a technical assessment
                                    based on the candidate's target
                                    position and required skills.
                                </p>

                            </div>

                        )}


                    {/* ASSESSMENT CONTENT */}

                    {!assessmentLoading &&
                        technicalAssessment && (

                            <div className="mt-6">

                                <div
                                    className="
                                        rounded-2xl
                                        bg-gradient-to-r
                                        from-cyan-50
                                        to-violet-50
                                        p-5
                                    "
                                >

                                    <h3
                                        className="
                                            text-xl
                                            font-bold
                                            text-slate-800
                                        "
                                    >
                                        {assessmentTitle}
                                    </h3>

                                    <p
                                        className="
                                            mt-2
                                            text-sm
                                            leading-6
                                            text-slate-600
                                        "
                                    >
                                        {assessmentDescription}
                                    </p>

                                </div>


                                {/* ASSESSMENT INFO + ACTION */}

                                <div
                                    className="
                                        mt-6
                                        flex
                                        flex-col
                                        gap-4
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-white
                                        p-5
                                        md:flex-row
                                        md:items-center
                                        md:justify-between
                                    "
                                >

                                    <div
                                        className="
                                            grid
                                            grid-cols-2
                                            gap-4
                                            sm:grid-cols-3
                                        "
                                    >

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Questions
                                            </p>
                                            <p className="mt-1 font-semibold text-slate-800">
                                                {assessmentQuestions.length ||
                                                    technicalAssessment?.totalQuestions ||
                                                    "10"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Duration
                                            </p>
                                            <p className="mt-1 font-semibold text-slate-800">
                                                20 minutes
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-500">
                                                Status
                                            </p>
                                            <p
                                                className={`
                                                    mt-1
                                                    font-semibold
                                                    ${
                                                        assessmentStatus === "SUBMITTED"
                                                            ? "text-emerald-600"
                                                            : assessmentStatus === "IN_PROGRESS"
                                                            ? "text-amber-600"
                                                            : "text-slate-600"
                                                    }
                                                `}
                                            >
                                                {assessmentStatus === "SUBMITTED"
                                                    ? "Completed"
                                                    : assessmentStatus === "IN_PROGRESS"
                                                    ? "In Progress"
                                                    : "Not Started"}
                                            </p>
                                        </div>

                                        {assessmentStatus === "SUBMITTED" && (

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Score
                                                </p>
                                                <p className="mt-1 font-semibold text-violet-700">
                                                    {technicalAssessment?.score ?? 0}
                                                    {" / "}
                                                    {technicalAssessment?.totalQuestions ?? 0}
                                                </p>
                                            </div>

                                        )}

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                `/candidate/technical-assessment/${candidateId}/${jobId}`
                                            )
                                        }
                                        className="
                                            flex
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-xl
                                            bg-gradient-to-r
                                            from-violet-600
                                            to-cyan-500
                                            px-6
                                            py-3
                                            font-semibold
                                            text-white
                                            shadow-md
                                            transition
                                            hover:shadow-lg
                                            hover:-translate-y-0.5
                                        "
                                    >

                                        <ClipboardCheck size={18} />

                                        {assessmentStatus === "SUBMITTED"
                                            ? "View Result"
                                            : assessmentStatus === "IN_PROGRESS"
                                            ? "Continue Assessment"
                                            : "Start Assessment"}

                                    </button>

                                </div>

                            </div>

                        )}

                </div>


            </div>

        </div>

    );

};


export default CandidateSkillRecovery;
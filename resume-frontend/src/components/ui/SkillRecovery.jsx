import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getSkillRecovery,
    getSkillRecoveryParticipation,
    startSkillRecovery,
} from "../../services/candidateService";

import {
    Brain,
    Clock,
    CheckCircle2,
    Circle,
    BookOpen,
    Target,
    TrendingUp,
    Award,
    AlertCircle,
    Play,
    Loader2,
} from "lucide-react";


const SkillRecovery = ({
    candidateId,
    jobId,
}) => {

    const [data, setData] = useState(null);

    const [participation, setParticipation] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [starting, setStarting] =
        useState(false);

    const [error, setError] =
        useState("");


    // ======================================================
    // LOAD RECOVERY PROGRAM
    // ======================================================

    const loadRecovery = async () => {

        try {

            const result =
                await getSkillRecovery(
                    candidateId,
                    jobId
                );

            console.log(
                "Skill Recovery Response:",
                result
            );

            setData(result);

        } catch (err) {

            console.error(
                "Skill Recovery Error:",
                err
            );

            setError(
                err.message ||
                "Unable to load skill recovery program"
            );
        }
    };


    // ======================================================
    // LOAD PARTICIPATION
    // ======================================================

    const loadParticipation = async () => {

        try {

            const result =
                await getSkillRecoveryParticipation(
                    candidateId,
                    jobId
                );

            console.log(
                "Skill Recovery Participation:",
                result
            );

            setParticipation(result);

        } catch (err) {

            console.error(
                "Participation Error:",
                err
            );

            setParticipation(null);
        }
    };


    // ======================================================
    // LOAD EVERYTHING
    // ======================================================

    const loadAllData = async () => {

        try {

            setLoading(true);
            setError("");

            await Promise.all([
                loadRecovery(),
                loadParticipation(),
            ]);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);
        }
    };


    // ======================================================
    // START RECOVERY
    // ======================================================

    const handleStartRecovery = async () => {

        try {

            setStarting(true);
            setError("");

            console.log(
                "Starting recovery:",
                {
                    candidateId,
                    jobId,
                }
            );


            const result =
                await startSkillRecovery(
                    candidateId,
                    jobId
                );


            console.log(
                "Start Recovery Response:",
                result
            );


            // --------------------------------------------------
            // IMPORTANT
            //
            // The POST should create/update the permanent
            // skill_recovery_progress record.
            //
            // Then reload both endpoints.
            // --------------------------------------------------

            await loadAllData();

        } catch (err) {

            console.error(
                "Start Recovery Error:",
                err
            );

            setError(
                err.message ||
                "Unable to start skill recovery"
            );

        } finally {

            setStarting(false);
        }
    };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        if (!candidateId || !jobId) {

            setError(
                "Candidate ID and Job ID are required"
            );

            setLoading(false);

            return;
        }

        loadAllData();

    }, [
        candidateId,
        jobId,
    ]);


    // ======================================================
    // RECOVERY ITEMS
    // ======================================================

    const recoveryItems =
        data?.recoveryItems || [];


    // ======================================================
    // ALL TOPICS
    // ======================================================

    const allTopics = useMemo(() => {

        return recoveryItems.flatMap(
            (item) => item.topics || []
        );

    }, [recoveryItems]);


    // ======================================================
    // UNIQUE TOPICS
    // ======================================================

    const uniqueTopics = useMemo(() => {

        return [
            ...new Set(allTopics),
        ];

    }, [allTopics]);


    // ======================================================
    // COMPLETED TOPICS
    // ======================================================

    const completedTopics = useMemo(() => {

        if (!participation) {
            return [];
        }


        // --------------------------------------------------
        // CASE 1
        // --------------------------------------------------

        if (
            Array.isArray(
                participation.completedTopics
            )
        ) {

            return [
                ...new Set(
                    participation.completedTopics
                ),
            ];
        }


        // --------------------------------------------------
        // CASE 2
        // --------------------------------------------------

        if (
            Array.isArray(
                participation.progress
            )
        ) {

            return [
                ...new Set(
                    participation.progress
                        .filter(
                            (item) =>
                                item.completed === true
                        )
                        .map(
                            (item) =>
                                item.topic
                        )
                        .filter(Boolean)
                ),
            ];
        }


        // --------------------------------------------------
        // CASE 3
        // --------------------------------------------------

        if (
            Array.isArray(
                participation.records
            )
        ) {

            return [
                ...new Set(
                    participation.records
                        .filter(
                            (item) =>
                                item.completed === true
                        )
                        .map(
                            (item) =>
                                item.topic
                        )
                        .filter(Boolean)
                ),
            ];
        }


        return [];

    }, [participation]);


    // ======================================================
    // REMAINING TOPICS
    // ======================================================

    const remainingTopics = useMemo(() => {

        return uniqueTopics.filter(
            (topic) =>
                !completedTopics.includes(topic)
        );

    }, [
        uniqueTopics,
        completedTopics,
    ]);


    // ======================================================
    // PROGRESS
    // ======================================================

    const progress = useMemo(() => {

        if (
            participation &&
            typeof participation.progressPercentage ===
                "number"
        ) {

            return Math.min(
                Math.max(
                    Math.round(
                        participation.progressPercentage
                    ),
                    0
                ),
                100
            );
        }


        if (
            participation &&
            typeof participation.progress ===
                "number"
        ) {

            return Math.min(
                Math.max(
                    Math.round(
                        participation.progress
                    ),
                    0
                ),
                100
            );
        }


        if (
            uniqueTopics.length === 0
        ) {
            return 0;
        }


        return Math.round(
            (
                completedTopics.length /
                uniqueTopics.length
            ) * 100
        );

    }, [
        participation,
        uniqueTopics,
        completedTopics,
    ]);


    // ======================================================
    // PARTICIPATION STATUS
    // ======================================================

    const participationStatus = useMemo(() => {

        if (
            participation?.status
        ) {

            return participation.status;
        }


        if (
            participation?.participationStatus
        ) {

            return participation.participationStatus;
        }


        if (
            participation?.recoveryStatus
        ) {

            return participation.recoveryStatus;
        }


        if (
            completedTopics.length > 0
        ) {

            if (progress >= 100) {
                return "Completed";
            }

            return "In Progress";
        }


        return "Not Started";

    }, [
        participation,
        completedTopics,
        progress,
    ]);


    // ======================================================
    // CHECK WHETHER RECOVERY HAS STARTED
    // ======================================================

    const isStarted = useMemo(() => {

        const status =
            String(
                participationStatus || ""
            ).toLowerCase();

        return (
            status === "in progress" ||
            status === "in_progress" ||
            status === "completed"
        );

    }, [participationStatus]);


    // ======================================================
    // STARTED AT
    // ======================================================

    const startedAt =
        participation?.startedAt ||
        data?.startedAt ||
        "Not started";


    // ======================================================
    // LAST ACTIVITY
    // ======================================================

    const lastActivityAt =
        participation?.lastActivityAt ||
        data?.lastActivityAt ||
        null;


    // ======================================================
    // RECOMMENDED DURATION
    // ======================================================

    const recommendedDuration =
        data?.recommendedDuration ||
        "Not specified";


    // ======================================================
    // FORMAT DATE
    // ======================================================

    const formatDateTime = (value) => {

        if (!value) {
            return "No activity recorded";
        }


        try {

            const date =
                new Date(value);


            if (
                Number.isNaN(
                    date.getTime()
                )
            ) {

                return value;
            }


            return date.toLocaleString(
                "en-GB",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }
            );

        } catch (err) {

            return value;
        }
    };


    // ======================================================
    // STATUS COLOR
    // ======================================================

    const statusClass = useMemo(() => {

        const status =
            String(
                participationStatus || ""
            ).toLowerCase();


        if (
            status === "completed"
        ) {

            return (
                "bg-emerald-100 text-emerald-700"
            );
        }


        if (
            status === "in progress" ||
            status === "in_progress"
        ) {

            return (
                "bg-blue-100 text-blue-700"
            );
        }


        return (
            "bg-slate-100 text-slate-600"
        );

    }, [participationStatus]);


    // ======================================================
    // LOADING
    // ======================================================

    if (loading) {

        return (

            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-center">

                    <div
                        className="
                            mx-auto
                            mb-4
                            h-10
                            w-10
                            animate-spin
                            rounded-full
                            border-4
                            border-violet-200
                            border-t-violet-600
                        "
                    />

                    <p className="text-lg font-medium text-slate-600">

                        Loading recovery program...

                    </p>

                </div>

            </div>
        );
    }


    // ======================================================
    // MAIN
    // ======================================================

    return (

        <div
            className="
                h-full
                overflow-y-auto
                bg-[#FAFAFF]
                px-6
                pb-10
                pt-4
            "
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="mb-6">

                <div className="flex items-center justify-between gap-4">

                    <div className="flex items-center gap-3">

                        <div
                            className="
                                flex
                                h-12
                                w-12
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
                                size={25}
                                className="text-white"
                            />

                        </div>


                        <div>

                            <h1
                                className="
                                    bg-gradient-to-r
                                    from-violet-600
                                    to-cyan-500
                                    bg-clip-text
                                    text-3xl
                                    font-bold
                                    text-transparent
                                "
                            >
                                Skill Recovery Program
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">

                                Build the skills you need for your
                                target role.

                            </p>

                        </div>

                    </div>


                    {/* ==================================================
                        START BUTTON
                    ================================================== */}

                    {!isStarted && (

                        <button
                            type="button"
                            onClick={
                                handleStartRecovery
                            }
                            disabled={starting}
                            className="
                                inline-flex
                                items-center
                                gap-2
                                rounded-xl
                                bg-gradient-to-r
                                from-violet-600
                                to-cyan-500
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                shadow-lg
                                transition-all
                                hover:-translate-y-0.5
                                hover:shadow-xl
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
                                    <Play
                                        size={18}
                                    />

                                    Start Recovery
                                </>

                            )}

                        </button>

                    )}

                </div>

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

                    {error}

                </div>
            )}


            {/* ==================================================
                CANDIDATE + JOB
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

                <div className="grid gap-6 md:grid-cols-2">

                    <div>

                        <p className="text-sm text-slate-500">
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
                                "Unknown Candidate"}
                        </p>

                    </div>


                    <div>

                        <p className="text-sm text-slate-500">
                            Target Job
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
                                "Unknown Job"}
                        </p>

                    </div>

                </div>

            </div>


            {/* ==================================================
                PARTICIPATION STATUS
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

                        <p className="text-sm text-slate-500">
                            Recovery Status
                        </p>

                        <div className="mt-2">

                            <span
                                className={`
                                    inline-flex
                                    rounded-full
                                    px-4
                                    py-2
                                    text-sm
                                    font-semibold
                                    ${statusClass}
                                `}
                            >
                                {participationStatus}
                            </span>

                        </div>

                    </div>


                    <div>

                        <p className="text-sm text-slate-500">
                            Started At
                        </p>

                        <p
                            className="
                                mt-2
                                font-semibold
                                text-slate-700
                            "
                        >
                            {startedAt !== "Not started"
                                ? formatDateTime(startedAt)
                                : "Not started"}
                        </p>

                    </div>


                    <div>

                        <p className="text-sm text-slate-500">
                            Last Activity
                        </p>

                        <p
                            className="
                                mt-2
                                font-semibold
                                text-slate-700
                            "
                        >
                            {formatDateTime(
                                lastActivityAt
                            )}
                        </p>

                    </div>

                </div>

            </div>


            {/* ==================================================
                PROGRESS
            ================================================== */}

            <div
                className="
                    mb-6
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

                    <TrendingUp size={23} />

                    <div>

                        <h2 className="text-xl font-bold">
                            Your Recovery Progress
                        </h2>

                        <p className="text-sm text-violet-100">
                            Keep learning and complete your
                            remaining topics.
                        </p>

                    </div>

                </div>


                <div className="mt-6 flex items-center justify-between">

                    <span className="text-sm text-violet-100">
                        Overall Progress
                    </span>

                    <span className="text-2xl font-bold">
                        {progress}%
                    </span>

                </div>


                <div
                    className="
                        mt-3
                        h-4
                        w-full
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
                            width: `${Math.min(
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
                        grid-cols-1
                        gap-4
                        md:grid-cols-3
                    "
                >

                    <div
                        className="
                            rounded-2xl
                            bg-white/15
                            p-4
                        "
                    >

                        <div className="flex items-center gap-2">

                            <CheckCircle2 size={19} />

                            <span className="text-sm">
                                Completed
                            </span>

                        </div>

                        <p className="mt-2 text-3xl font-bold">
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

                        <div className="flex items-center gap-2">

                            <Target size={19} />

                            <span className="text-sm">
                                Remaining
                            </span>

                        </div>

                        <p className="mt-2 text-3xl font-bold">
                            {remainingTopics.length}
                        </p>

                    </div>


                    <div
                        className="
                            rounded-2xl
                            bg-white/15
                            p-4
                        "
                    >

                        <div className="flex items-center gap-2">

                            <Clock size={19} />

                            <span className="text-sm">
                                Duration
                            </span>

                        </div>

                        <p className="mt-2 text-xl font-bold">
                            {recommendedDuration}
                        </p>

                    </div>

                </div>

            </div>


            {/* ==================================================
                LEARNING PROGRAM
            ================================================== */}

            <div className="mb-4">

                <div className="flex items-center gap-3">

                    <BookOpen
                        size={24}
                        className="text-violet-600"
                    />

                    <div>

                        <h2
                            className="
                                text-2xl
                                font-bold
                                text-slate-800
                            "
                        >
                            Your Learning Program
                        </h2>

                        <p className="text-sm text-slate-500">

                            Study the recommended topics and
                            complete them when you are ready.

                        </p>

                    </div>

                </div>

            </div>


            {/* ==================================================
                NO MODULES
            ================================================== */}

            {recoveryItems.length === 0 ? (

                <div
                    className="
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        p-10
                        text-center
                        shadow-sm
                    "
                >

                    {!isStarted ? (

                        <>

                            <div
                                className="
                                    mx-auto
                                    mb-4
                                    flex
                                    h-16
                                    w-16
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-violet-100
                                "
                            >

                                <BookOpen
                                    size={30}
                                    className="text-violet-600"
                                />

                            </div>

                            <h3
                                className="
                                    text-xl
                                    font-bold
                                    text-slate-800
                                "
                            >
                                Your recovery program is ready
                            </h3>

                            <p
                                className="
                                    mx-auto
                                    mt-2
                                    max-w-lg
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Start your recovery program to
                                activate your recommended learning
                                modules.
                            </p>

                            <button
                                type="button"
                                onClick={
                                    handleStartRecovery
                                }
                                disabled={starting}
                                className="
                                    mt-6
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-gradient-to-r
                                    from-violet-600
                                    to-cyan-500
                                    px-6
                                    py-3
                                    font-semibold
                                    text-white
                                    shadow-lg
                                    disabled:opacity-60
                                "
                            >

                                {starting ? (

                                    <>
                                        <Loader2
                                            size={18}
                                            className="animate-spin"
                                        />

                                        Starting Recovery...
                                    </>

                                ) : (

                                    <>
                                        <Play size={18} />

                                        Start Recovery
                                    </>

                                )}

                            </button>

                        </>

                    ) : (

                        <>

                            <div
                                className="
                                    mx-auto
                                    mb-4
                                    flex
                                    h-16
                                    w-16
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-amber-100
                                "
                            >

                                <AlertCircle
                                    size={30}
                                    className="text-amber-600"
                                />

                            </div>

                            <h3
                                className="
                                    text-xl
                                    font-bold
                                    text-slate-800
                                "
                            >
                                Recovery modules are unavailable
                            </h3>

                            <p
                                className="
                                    mx-auto
                                    mt-2
                                    max-w-lg
                                    text-sm
                                    text-slate-500
                                "
                            >
                                The recovery participation has started,
                                but the backend did not return any
                                recovery modules.
                            </p>

                            <p
                                className="
                                    mx-auto
                                    mt-3
                                    max-w-lg
                                    text-xs
                                    text-slate-400
                                "
                            >
                                Check the browser console and the
                                skill-recovery API response.
                            </p>

                        </>

                    )}

                </div>

            ) : (

                <>
                    {/* ==================================================
                        COMPLETED TOPICS
                    ================================================== */}

                    <div
                        className="
                            mb-6
                            rounded-3xl
                            border
                            border-emerald-100
                            bg-white
                            p-6
                            shadow-sm
                        "
                    >

                        <div className="mb-5 flex items-center gap-3">

                            <CheckCircle2
                                size={22}
                                className="text-emerald-600"
                            />

                            <div>

                                <h2 className="text-lg font-bold text-slate-800">
                                    Completed Topics
                                </h2>

                                <p className="text-sm text-slate-500">
                                    Topics completed by you
                                </p>

                            </div>

                        </div>


                        {completedTopics.length > 0 ? (

                            <div className="flex flex-wrap gap-3">

                                {completedTopics.map(
                                    (topic, index) => (

                                        <span
                                            key={`${topic}-${index}`}
                                            className="
                                                flex
                                                items-center
                                                gap-2
                                                rounded-full
                                                bg-emerald-50
                                                px-4
                                                py-2
                                                text-sm
                                                font-semibold
                                                text-emerald-700
                                            "
                                        >

                                            <CheckCircle2 size={16} />

                                            {topic}

                                        </span>

                                    )
                                )}

                            </div>

                        ) : (

                            <div
                                className="
                                    rounded-xl
                                    bg-slate-50
                                    p-4
                                    text-sm
                                    text-slate-500
                                "
                            >
                                No topics have been completed yet.
                            </div>

                        )}

                    </div>


                    {/* ==================================================
                        RECOVERY MODULES
                    ================================================== */}

                    <div className="grid gap-5">

                        {recoveryItems.map(
                            (item, index) => {

                                const itemTopics =
                                    item.topics || [];


                                const itemCompletedTopics =
                                    itemTopics.filter(
                                        (topic) =>
                                            completedTopics.includes(
                                                topic
                                            )
                                    );


                                const itemRemainingTopics =
                                    itemTopics.filter(
                                        (topic) =>
                                            !completedTopics.includes(
                                                topic
                                            )
                                    );


                                return (

                                    <div
                                        key={`${item.skill}-${index}`}
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
                                                flex-col
                                                gap-4
                                                md:flex-row
                                                md:items-center
                                                md:justify-between
                                            "
                                        >

                                            <div className="flex items-center gap-3">

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
                                                        className="text-violet-600"
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

                                                    <p className="text-sm text-slate-500">
                                                        Recommended learning area
                                                    </p>

                                                </div>

                                            </div>


                                            <span
                                                className="
                                                    w-fit
                                                    rounded-full
                                                    bg-violet-100
                                                    px-4
                                                    py-2
                                                    text-sm
                                                    font-semibold
                                                    text-violet-700
                                                "
                                            >
                                                {item.level ||
                                                    "Recommended"}
                                            </span>

                                        </div>


                                        {/* DESCRIPTION */}

                                        <div
                                            className="
                                                mt-5
                                                rounded-2xl
                                                bg-slate-50
                                                p-4
                                            "
                                        >

                                            <p className="leading-relaxed text-slate-600">

                                                {item.description ||
                                                    "Recommended learning content for this skill."}

                                            </p>

                                        </div>


                                        {/* TOPICS */}

                                        <div
                                            className="
                                                mt-6
                                                grid
                                                grid-cols-1
                                                gap-5
                                                md:grid-cols-2
                                            "
                                        >

                                            {/* COMPLETED */}

                                            <div>

                                                <div className="mb-3 flex items-center gap-2">

                                                    <CheckCircle2
                                                        size={18}
                                                        className="text-emerald-600"
                                                    />

                                                    <h4 className="font-semibold text-slate-800">
                                                        Completed Topics
                                                    </h4>

                                                </div>


                                                {itemCompletedTopics.length >
                                                0 ? (

                                                    <div className="space-y-2">

                                                        {itemCompletedTopics.map(
                                                            (
                                                                topic,
                                                                topicIndex
                                                            ) => (

                                                                <div
                                                                    key={`${topic}-${topicIndex}`}
                                                                    className="
                                                                        flex
                                                                        items-center
                                                                        gap-2
                                                                        rounded-xl
                                                                        bg-emerald-50
                                                                        px-3
                                                                        py-2
                                                                        text-sm
                                                                        text-emerald-700
                                                                    "
                                                                >

                                                                    <CheckCircle2
                                                                        size={16}
                                                                    />

                                                                    {topic}

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                ) : (

                                                    <p
                                                        className="
                                                            rounded-xl
                                                            bg-slate-50
                                                            p-3
                                                            text-sm
                                                            text-slate-400
                                                        "
                                                    >
                                                        No completed topics yet.
                                                    </p>

                                                )}

                                            </div>


                                            {/* REMAINING */}

                                            <div>

                                                <div className="mb-3 flex items-center gap-2">

                                                    <Target
                                                        size={18}
                                                        className="text-amber-600"
                                                    />

                                                    <h4 className="font-semibold text-slate-800">
                                                        Remaining Topics
                                                    </h4>

                                                </div>


                                                {itemRemainingTopics.length >
                                                0 ? (

                                                    <div className="space-y-2">

                                                        {itemRemainingTopics.map(
                                                            (
                                                                topic,
                                                                topicIndex
                                                            ) => (

                                                                <div
                                                                    key={`${topic}-${topicIndex}`}
                                                                    className="
                                                                        flex
                                                                        items-center
                                                                        gap-2
                                                                        rounded-xl
                                                                        bg-amber-50
                                                                        px-3
                                                                        py-2
                                                                        text-sm
                                                                        text-amber-700
                                                                    "
                                                                >

                                                                    <Circle
                                                                        size={16}
                                                                    />

                                                                    {topic}

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                ) : (

                                                    <div
                                                        className="
                                                            rounded-xl
                                                            bg-emerald-50
                                                            p-3
                                                            text-sm
                                                            font-medium
                                                            text-emerald-700
                                                        "
                                                    >
                                                        All topics completed ✓
                                                    </div>

                                                )}

                                            </div>

                                        </div>


                                        {/* ALL TOPICS */}

                                        <div className="mt-6">

                                            <div className="mb-3 flex items-center gap-2">

                                                <Award
                                                    size={18}
                                                    className="text-violet-600"
                                                />

                                                <h4 className="font-semibold text-slate-800">
                                                    All Learning Topics
                                                </h4>

                                            </div>


                                            <div
                                                className="
                                                    grid
                                                    grid-cols-1
                                                    gap-3
                                                    md:grid-cols-2
                                                "
                                            >

                                                {itemTopics.map(
                                                    (
                                                        topic,
                                                        topicIndex
                                                    ) => {

                                                        const isCompleted =
                                                            completedTopics.includes(
                                                                topic
                                                            );


                                                        return (

                                                            <div
                                                                key={`${topic}-${topicIndex}`}
                                                                className={`
                                                                    flex
                                                                    items-center
                                                                    gap-3
                                                                    rounded-xl
                                                                    border
                                                                    p-3
                                                                    ${
                                                                        isCompleted
                                                                            ? "border-emerald-100 bg-emerald-50"
                                                                            : "border-slate-100 bg-white"
                                                                    }
                                                                `}
                                                            >

                                                                <div
                                                                    className={`
                                                                        flex
                                                                        h-7
                                                                        w-7
                                                                        shrink-0
                                                                        items-center
                                                                        justify-center
                                                                        rounded-full
                                                                        text-xs
                                                                        font-bold
                                                                        ${
                                                                            isCompleted
                                                                                ? "bg-emerald-100 text-emerald-700"
                                                                                : "bg-violet-100 text-violet-700"
                                                                        }
                                                                    `}
                                                                >

                                                                    {isCompleted ? (

                                                                        <CheckCircle2
                                                                            size={16}
                                                                        />

                                                                    ) : (

                                                                        topicIndex + 1

                                                                    )}

                                                                </div>


                                                                <span
                                                                    className={`
                                                                        text-sm
                                                                        ${
                                                                            isCompleted
                                                                                ? "font-medium text-emerald-700 line-through"
                                                                                : "text-slate-700"
                                                                        }
                                                                    `}
                                                                >
                                                                    {topic}
                                                                </span>

                                                            </div>

                                                        );

                                                    }
                                                )}

                                            </div>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                </>

            )}

        </div>
    );
};


export default SkillRecovery;
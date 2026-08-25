import React, {
    useEffect,
    useState,
} from "react";

import {
    CalendarDays,
    RefreshCw,
    AlertCircle,
    Loader2,
    Video,
    User,
    Briefcase,
    Clock,
    MapPin,
    Mail,
    FileText,
    ArrowLeft,
    CheckCircle2,
} from "lucide-react";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    getAllInterviews,
    completeInterview,
    scheduleInterview,
} from "../../services/interviewService";

import InterviewCard from "./InterviewCard";


// ======================================================
// INTERVIEWS PAGE
// ======================================================

const Interviews = () => {

    const location = useLocation();

    const navigate = useNavigate();


    // ======================================================
    // INTERVIEW LIST
    // ======================================================

    const [interviews, setInterviews] =
        useState([]);


    const [loading, setLoading] =
        useState(true);


    const [error, setError] =
        useState("");


    const [completingId, setCompletingId] =
        useState(null);


    // ======================================================
    // SCHEDULING MODE
    // ======================================================

    const [showScheduleForm, setShowScheduleForm] =
        useState(
            location.state?.scheduleInterview === true
        );


    // ======================================================
    // CANDIDATE / JOB RECEIVED FROM SKILL GAP PAGE
    // ======================================================

    const [selectedCandidateId, setSelectedCandidateId] =
        useState(
            location.state?.candidateId || ""
        );


    const [selectedJobId, setSelectedJobId] =
        useState(
            location.state?.jobId || ""
        );


    const [selectedCandidateName, setSelectedCandidateName] =
        useState(
            location.state?.candidateName || ""
        );


    const [selectedJobTitle, setSelectedJobTitle] =
        useState(
            location.state?.jobTitle || ""
        );


    // ======================================================
    // SCHEDULING LOADING
    // ======================================================

    const [scheduling, setScheduling] =
        useState(false);


    // ======================================================
    // FORM
    // ======================================================

    const [form, setForm] = useState({

        roundName: "HR Interview",

        interviewType: "HR",

        interviewerName: "",

        interviewerEmail: "",

        interviewDate: "",

        durationMinutes: 45,

        interviewMode: "ONLINE",

        meetingLink: "",

        location: "",

        notes: "",

    });


    // ======================================================
    // LOAD ALL INTERVIEWS
    // ======================================================

    const loadInterviews = async () => {

        try {

            setLoading(true);

            setError("");


            const data =
                await getAllInterviews();


            console.log(
                "Interview API response:",
                data
            );


            if (Array.isArray(data)) {

                setInterviews(data);

            }

            else if (
                data &&
                Array.isArray(data.content)
            ) {

                setInterviews(
                    data.content
                );

            }

            else if (data) {

                setInterviews([data]);

            }

            else {

                setInterviews([]);

            }

        }

        catch (err) {

            console.error(
                "Failed to load interviews:",
                err
            );


            setError(
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Failed to load interviews"
            );


            setInterviews([]);

        }

        finally {

            setLoading(false);

        }
    };


    // ======================================================
    // INITIAL LOAD
    // ======================================================

    useEffect(() => {

        loadInterviews();

    }, []);


    // ======================================================
    // READ NAVIGATION STATE
    // ======================================================

    useEffect(() => {

        const state =
            location.state;


        if (
            state?.scheduleInterview
        ) {

            setShowScheduleForm(true);


            setSelectedCandidateId(
                state.candidateId || ""
            );


            setSelectedJobId(
                state.jobId || ""
            );


            setSelectedCandidateName(
                state.candidateName || ""
            );


            setSelectedJobTitle(
                state.jobTitle || ""
            );

        }

    }, [location.state]);


    // ======================================================
    // FORM CHANGE
    // ======================================================

    const handleFormChange = (
        event
    ) => {

        const {
            name,
            value,
        } = event.target;


        setForm(
            previous => ({
                ...previous,
                [name]: value,
            })
        );

    };


    // ======================================================
    // OPEN SCHEDULE FORM
    // ======================================================

    const openScheduleForm = () => {

        setError("");

        setShowScheduleForm(true);

    };


    // ======================================================
    // CLOSE SCHEDULE FORM
    // ======================================================

    const closeScheduleForm = () => {

        setShowScheduleForm(false);

        setError("");

        navigate(
            "/interviews",
            {
                replace: true,
                state: {},
            }
        );

    };


    // ======================================================
    // SCHEDULE INTERVIEW
    // ======================================================

    const handleScheduleInterview =
        async (
            event
        ) => {

            event.preventDefault();


            // ------------------------------------------------
            // VALIDATION
            // ------------------------------------------------

            if (
                !selectedCandidateId
            ) {

                setError(
                    "Candidate information is missing."
                );

                return;

            }


            if (
                !selectedJobId
            ) {

                setError(
                    "Job information is missing."
                );

                return;

            }


            if (
                !form.interviewerName.trim()
            ) {

                setError(
                    "Interviewer name is required."
                );

                return;

            }


            if (
                !form.interviewerEmail.trim()
            ) {

                setError(
                    "Interviewer email is required."
                );

                return;

            }


            if (
                !form.interviewDate
            ) {

                setError(
                    "Interview date and time are required."
                );

                return;

            }


            // ------------------------------------------------
            // CHECK DATE
            // ------------------------------------------------

            const selectedDate =
                new Date(
                    form.interviewDate
                );


            if (
                Number.isNaN(
                    selectedDate.getTime()
                )
            ) {

                setError(
                    "Please select a valid interview date and time."
                );

                return;

            }


            if (
                selectedDate <= new Date()
            ) {

                setError(
                    "Interview date and time must be in the future."
                );

                return;

            }


            try {

                setScheduling(true);

                setError("");


                // ==================================================
                // API PAYLOAD
                // ==================================================

                const payload = {

                    candidateId:
                        Number(
                            selectedCandidateId
                        ),

                    jobId:
                        Number(
                            selectedJobId
                        ),

                    roundName:
                        form.roundName,

                    interviewType:
                        form.interviewType,

                    interviewerName:
                        form.interviewerName,

                    interviewerEmail:
                        form.interviewerEmail,

                    interviewDate:
                        form.interviewDate,

                    durationMinutes:
                        Number(
                            form.durationMinutes
                        ),

                    interviewMode:
                        form.interviewMode,

                    meetingLink:
                        form.meetingLink,

                    location:
                        form.location,

                    notes:
                        form.notes,

                };


                console.log(
                    "Scheduling interview:",
                    payload
                );


                // ==================================================
                // SAVE INTERVIEW
                // ==================================================

                const newInterview =
                    await scheduleInterview(
                        payload
                    );


                console.log(
                    "Interview scheduled:",
                    newInterview
                );


                // ==================================================
                // CLOSE FORM
                // ==================================================

                setShowScheduleForm(false);


                // ==================================================
                // CLEAR NAVIGATION STATE
                // ==================================================

                navigate(
                    "/interviews",
                    {
                        replace: true,
                        state: {},
                    }
                );


                // ==================================================
                // RELOAD INTERVIEWS
                // ==================================================

                await loadInterviews();


                // ==================================================
                // SUCCESS MESSAGE
                // ==================================================

                setError("");


                alert(
                    "Interview scheduled successfully."
                );

            }

            catch (err) {

                console.error(
                    "Failed to schedule interview:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.response?.data ||
                    err?.message ||
                    "Failed to schedule interview."
                );

            }

            finally {

                setScheduling(false);

            }

        };


    // ======================================================
    // COMPLETE INTERVIEW
    // ======================================================

    const handleComplete = async (
        interviewId
    ) => {

        try {

            setCompletingId(
                interviewId
            );

            setError("");


            const updatedInterview =
                await completeInterview(
                    interviewId
                );


            setInterviews(
                previousInterviews =>
                    previousInterviews.map(
                        interview => {

                            if (
                                interview.interviewId ===
                                interviewId
                            ) {

                                return updatedInterview;

                            }

                            return interview;

                        }
                    )
            );

        }

        catch (err) {

            console.error(
                "Failed to complete interview:",
                err
            );


            setError(
                err?.response?.data?.message ||
                err?.response?.data ||
                err?.message ||
                "Failed to complete interview"
            );

        }

        finally {

            setCompletingId(null);

        }

    };


    // ======================================================
    // LOADING SCREEN
    // ======================================================

    if (loading) {

        return (

            <div
                className="
                    min-h-screen
                    bg-gray-50
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
                        Loading interviews...
                    </p>

                </div>

            </div>

        );

    }


    // ======================================================
    // STATUS COUNTS
    // ======================================================

    const scheduledCount =
        interviews.filter(
            interview =>
                interview?.status?.toUpperCase() ===
                "SCHEDULED"
        ).length;


    const completedCount =
        interviews.filter(
            interview =>
                interview?.status?.toUpperCase() ===
                "COMPLETED"
        ).length;


    const selectedCount =
        interviews.filter(
            interview =>
                interview?.status?.toUpperCase() ===
                "SELECTED"
        ).length;


    const cancelledCount =
        interviews.filter(
            interview =>
                interview?.status?.toUpperCase() ===
                "CANCELLED"
        ).length;


    // ======================================================
    // PAGE
    // ======================================================

    return (

        <div
            className="
                min-h-screen
                bg-gray-50
            "
        >

            {/* ==================================================
                HEADER
            ================================================== */}

            <div
                className="
                    bg-white
                    border-b
                    border-gray-200
                "
            >

                <div
                    className="
                        max-w-7xl
                        mx-auto
                        px-6
                        py-6
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-4
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
                                        p-3
                                        rounded-xl
                                        bg-indigo-50
                                    "
                                >

                                    <Video
                                        size={24}
                                        className="
                                            text-indigo-600
                                        "
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
                                        Interviews
                                    </h1>


                                    <p
                                        className="
                                            text-sm
                                            text-gray-500
                                            mt-1
                                        "
                                    >
                                        Manage candidate interviews
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <button
                                type="button"
                                onClick={
                                    openScheduleForm
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2.5
                                    rounded-lg
                                    bg-indigo-600
                                    text-white
                                    text-sm
                                    font-medium
                                    hover:bg-indigo-700
                                    transition
                                "
                            >

                                <CalendarDays
                                    size={16}
                                />

                                Schedule Interview

                            </button>


                            <button
                                type="button"
                                onClick={
                                    loadInterviews
                                }
                                disabled={
                                    loading
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2.5
                                    border
                                    border-gray-300
                                    bg-white
                                    rounded-lg
                                    text-sm
                                    font-medium
                                    text-gray-700
                                    hover:bg-gray-50
                                    transition-colors
                                    disabled:opacity-50
                                    disabled:cursor-not-allowed
                                "
                            >

                                <RefreshCw
                                    size={16}
                                />

                                Refresh

                            </button>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==================================================
                MAIN
            ================================================== */}

            <main
                className="
                    max-w-7xl
                    mx-auto
                    px-6
                    py-8
                "
            >

                {/* ==================================================
                    ERROR
                ================================================== */}

                {error && (

                    <div
                        className="
                            mb-6
                            flex
                            items-start
                            gap-3
                            p-4
                            rounded-xl
                            bg-red-50
                            border
                            border-red-200
                            text-red-700
                        "
                    >

                        <AlertCircle
                            size={20}
                            className="mt-0.5"
                        />

                        <div>

                            <p
                                className="
                                    font-semibold
                                    text-sm
                                "
                            >
                                Something went wrong
                            </p>


                            <p
                                className="
                                    text-sm
                                    mt-1
                                "
                            >
                                {error}
                            </p>

                        </div>

                    </div>

                )}


                {/* ==================================================
                    SCHEDULE FORM
                ================================================== */}

                {showScheduleForm && (

                    <div
                        className="
                            mb-8
                            rounded-3xl
                            border
                            border-indigo-100
                            bg-white
                            p-6
                            shadow-sm
                        "
                    >

                        {/* FORM HEADER */}

                        <div
                            className="
                                mb-6
                                flex
                                items-center
                                justify-between
                                gap-4
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
                                        h-11
                                        w-11
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-indigo-50
                                    "
                                >

                                    <CalendarDays
                                        size={23}
                                        className="
                                            text-indigo-600
                                        "
                                    />

                                </div>


                                <div>

                                    <h2
                                        className="
                                            text-xl
                                            font-bold
                                            text-gray-900
                                        "
                                    >
                                        Schedule Interview
                                    </h2>


                                    <p
                                        className="
                                            text-sm
                                            text-gray-500
                                            mt-1
                                        "
                                    >
                                        Schedule the interview
                                        for the selected candidate.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeScheduleForm
                                }
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    rounded-lg
                                    border
                                    border-gray-300
                                    px-3
                                    py-2
                                    text-sm
                                    text-gray-600
                                    hover:bg-gray-50
                                "
                            >

                                <ArrowLeft
                                    size={16}
                                />

                                Back

                            </button>

                        </div>


                        {/* ==================================================
                            SELECTED CANDIDATE
                        ================================================== */}

                        <div
                            className="
                                mb-6
                                grid
                                grid-cols-1
                                gap-4
                                md:grid-cols-2
                            "
                        >

                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-indigo-100
                                    bg-indigo-50
                                    p-5
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        text-sm
                                        font-semibold
                                        text-indigo-700
                                    "
                                >

                                    <User
                                        size={17}
                                    />

                                    Candidate

                                </div>


                                <p
                                    className="
                                        mt-2
                                        text-lg
                                        font-bold
                                        text-gray-900
                                    "
                                >
                                    {
                                        selectedCandidateName ||
                                        `Candidate #${selectedCandidateId}`
                                    }
                                </p>

                            </div>


                            <div
                                className="
                                    rounded-2xl
                                    border
                                    border-indigo-100
                                    bg-indigo-50
                                    p-5
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        text-sm
                                        font-semibold
                                        text-indigo-700
                                    "
                                >

                                    <Briefcase
                                        size={17}
                                    />

                                    Job Position

                                </div>


                                <p
                                    className="
                                        mt-2
                                        text-lg
                                        font-bold
                                        text-gray-900
                                    "
                                >
                                    {
                                        selectedJobTitle ||
                                        `Job #${selectedJobId}`
                                    }
                                </p>

                            </div>

                        </div>


                        {/* ==================================================
                            FORM
                        ================================================== */}

                        <form
                            onSubmit={
                                handleScheduleInterview
                            }
                        >

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-5
                                    md:grid-cols-2
                                "
                            >

                                {/* ROUND */}

                                <div>

                                    <label
                                        className="
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        "
                                    >
                                        Interview Round
                                    </label>


                                    <select
                                        name="roundName"
                                        value={
                                            form.roundName
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-gray-300
                                            bg-white
                                            px-4
                                            py-3
                                            text-sm
                                            outline-none
                                            focus:border-indigo-500
                                            focus:ring-2
                                            focus:ring-indigo-100
                                        "
                                    >

                                        <option>
                                            HR Interview
                                        </option>

                                        <option>
                                            Technical Interview
                                        </option>

                                        <option>
                                            Managerial Interview
                                        </option>

                                        <option>
                                            Final Interview
                                        </option>

                                    </select>

                                </div>


                                {/* TYPE */}

                                <div>

                                    <label
                                        className="
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        "
                                    >
                                        Interview Type
                                    </label>


                                    <select
                                        name="interviewType"
                                        value={
                                            form.interviewType
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-gray-300
                                            bg-white
                                            px-4
                                            py-3
                                            text-sm
                                            outline-none
                                            focus:border-indigo-500
                                            focus:ring-2
                                            focus:ring-indigo-100
                                        "
                                    >

                                        <option value="HR">
                                            HR
                                        </option>

                                        <option value="TECHNICAL">
                                            Technical
                                        </option>

                                        <option value="MANAGERIAL">
                                            Managerial
                                        </option>

                                        <option value="FINAL">
                                            Final
                                        </option>

                                    </select>

                                </div>


                                {/* INTERVIEWER NAME */}

                                <div>

                                    <label
                                        className="
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        "
                                    >
                                        Interviewer Name
                                    </label>


                                    <div
                                        className="
                                            relative
                                        "
                                    >

                                        <User
                                            size={17}
                                            className="
                                                absolute
                                                left-3
                                                top-3.5
                                                text-gray-400
                                            "
                                        />


                                        <input
                                            type="text"
                                            name="interviewerName"
                                            value={
                                                form.interviewerName
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Enter interviewer name"
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-gray-300
                                                bg-white
                                                py-3
                                                pl-10
                                                pr-4
                                                text-sm
                                                outline-none
                                                focus:border-indigo-500
                                                focus:ring-2
                                                focus:ring-indigo-100
                                            "
                                        />

                                    </div>

                                </div>


                                {/* INTERVIEWER EMAIL */}

                                <div>

                                    <label
                                        className="
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        "
                                    >
                                        Interviewer Email
                                    </label>


                                    <div
                                        className="
                                            relative
                                        "
                                    >

                                        <Mail
                                            size={17}
                                            className="
                                                absolute
                                                left-3
                                                top-3.5
                                                text-gray-400
                                            "
                                        />


                                        <input
                                            type="email"
                                            name="interviewerEmail"
                                            value={
                                                form.interviewerEmail
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="interviewer@example.com"
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-gray-300
                                                bg-white
                                                py-3
                                                pl-10
                                                pr-4
                                                text-sm
                                                outline-none
                                                focus:border-indigo-500
                                                focus:ring-2
                                                focus:ring-indigo-100
                                            "
                                        />

                                    </div>

                                </div>


                                {/* DATE */}

                                <div>

                                    <label
                                        className="
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        "
                                    >
                                        Interview Date & Time
                                    </label>


                                    <div
                                        className="
                                            relative
                                        "
                                    >

                                        <CalendarDays
                                            size={17}
                                            className="
                                                absolute
                                                left-3
                                                top-3.5
                                                text-gray-400
                                            "
                                        />


                                        <input
                                            type="datetime-local"
                                            name="interviewDate"
                                            value={
                                                form.interviewDate
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-gray-300
                                                bg-white
                                                py-3
                                                pl-10
                                                pr-4
                                                text-sm
                                                outline-none
                                                focus:border-indigo-500
                                                focus:ring-2
                                                focus:ring-indigo-100
                                            "
                                        />

                                    </div>

                                </div>


                                {/* DURATION */}

                                <div>

                                    <label
                                        className="
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        "
                                    >
                                        Duration
                                    </label>


                                    <div
                                        className="
                                            relative
                                        "
                                    >

                                        <Clock
                                            size={17}
                                            className="
                                                absolute
                                                left-3
                                                top-3.5
                                                text-gray-400
                                            "
                                        />


                                        <select
                                            name="durationMinutes"
                                            value={
                                                form.durationMinutes
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-gray-300
                                                bg-white
                                                py-3
                                                pl-10
                                                pr-4
                                                text-sm
                                                outline-none
                                                focus:border-indigo-500
                                                focus:ring-2
                                                focus:ring-indigo-100
                                            "
                                        >

                                            <option value="30">
                                                30 minutes
                                            </option>

                                            <option value="45">
                                                45 minutes
                                            </option>

                                            <option value="60">
                                                60 minutes
                                            </option>

                                            <option value="90">
                                                90 minutes
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                {/* MODE */}

                                <div>

                                    <label
                                        className="
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        "
                                    >
                                        Interview Mode
                                    </label>


                                    <select
                                        name="interviewMode"
                                        value={
                                            form.interviewMode
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-gray-300
                                            bg-white
                                            px-4
                                            py-3
                                            text-sm
                                            outline-none
                                            focus:border-indigo-500
                                            focus:ring-2
                                            focus:ring-indigo-100
                                        "
                                    >

                                        <option value="ONLINE">
                                            Online
                                        </option>

                                        <option value="OFFLINE">
                                            Offline
                                        </option>

                                        <option value="HYBRID">
                                            Hybrid
                                        </option>

                                    </select>

                                </div>


                                {/* MEETING LINK */}

                                <div>

                                    <label
                                        className="
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        "
                                    >
                                        Meeting Link
                                    </label>


                                    <div
                                        className="
                                            relative
                                        "
                                    >

                                        <Video
                                            size={17}
                                            className="
                                                absolute
                                                left-3
                                                top-3.5
                                                text-gray-400
                                            "
                                        />


                                        <input
                                            type="text"
                                            name="meetingLink"
                                            value={
                                                form.meetingLink
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="https://meet.google.com/..."
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-gray-300
                                                bg-white
                                                py-3
                                                pl-10
                                                pr-4
                                                text-sm
                                                outline-none
                                                focus:border-indigo-500
                                                focus:ring-2
                                                focus:ring-indigo-100
                                            "
                                        />

                                    </div>

                                </div>


                                {/* LOCATION */}

                                <div
                                    className="
                                        md:col-span-2
                                    "
                                >

                                    <label
                                        className="
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        "
                                    >
                                        Location
                                    </label>


                                    <div
                                        className="
                                            relative
                                        "
                                    >

                                        <MapPin
                                            size={17}
                                            className="
                                                absolute
                                                left-3
                                                top-3.5
                                                text-gray-400
                                            "
                                        />


                                        <input
                                            type="text"
                                            name="location"
                                            value={
                                                form.location
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            placeholder="Office location / meeting room"
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-gray-300
                                                bg-white
                                                py-3
                                                pl-10
                                                pr-4
                                                text-sm
                                                outline-none
                                                focus:border-indigo-500
                                                focus:ring-2
                                                focus:ring-indigo-100
                                            "
                                        />

                                    </div>

                                </div>


                                {/* NOTES */}

                                <div
                                    className="
                                        md:col-span-2
                                    "
                                >

                                    <label
                                        className="
                                            mb-2
                                            block
                                            text-sm
                                            font-semibold
                                            text-gray-700
                                        "
                                    >
                                        Notes
                                    </label>


                                    <div
                                        className="
                                            relative
                                        "
                                    >

                                        <FileText
                                            size={17}
                                            className="
                                                absolute
                                                left-3
                                                top-3.5
                                                text-gray-400
                                            "
                                        />


                                        <textarea
                                            name="notes"
                                            value={
                                                form.notes
                                            }
                                            onChange={
                                                handleFormChange
                                            }
                                            rows={4}
                                            placeholder="Additional interview notes..."
                                            className="
                                                w-full
                                                rounded-xl
                                                border
                                                border-gray-300
                                                bg-white
                                                py-3
                                                pl-10
                                                pr-4
                                                text-sm
                                                outline-none
                                                resize-none
                                                focus:border-indigo-500
                                                focus:ring-2
                                                focus:ring-indigo-100
                                            "
                                        />

                                    </div>

                                </div>

                            </div>


                            {/* ==================================================
                                BUTTONS
                            ================================================== */}

                            <div
                                className="
                                    mt-6
                                    flex
                                    justify-end
                                    gap-3
                                "
                            >

                                <button
                                    type="button"
                                    onClick={
                                        closeScheduleForm
                                    }
                                    disabled={
                                        scheduling
                                    }
                                    className="
                                        rounded-xl
                                        border
                                        border-gray-300
                                        bg-white
                                        px-5
                                        py-3
                                        text-sm
                                        font-semibold
                                        text-gray-700
                                        hover:bg-gray-50
                                        disabled:opacity-50
                                    "
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        scheduling
                                    }
                                    className="
                                        inline-flex
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-gradient-to-r
                                        from-indigo-600
                                        to-violet-600
                                        px-6
                                        py-3
                                        text-sm
                                        font-semibold
                                        text-white
                                        shadow-lg
                                        hover:-translate-y-0.5
                                        hover:shadow-xl
                                        transition
                                        disabled:cursor-not-allowed
                                        disabled:opacity-60
                                    "
                                >

                                    {scheduling ? (

                                        <>
                                            <Loader2
                                                size={18}
                                                className="
                                                    animate-spin
                                                "
                                            />

                                            Scheduling...

                                        </>

                                    ) : (

                                        <>
                                            <CalendarDays
                                                size={18}
                                            />

                                            Schedule Interview

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                )}


                {/* ==================================================
                    SUMMARY CARDS
                ================================================== */}

                <div
                    className="
                        grid
                        grid-cols-1
                        sm:grid-cols-2
                        lg:grid-cols-5
                        gap-4
                        mb-8
                    "
                >

                    <div
                        className="
                            bg-white
                            border
                            border-gray-200
                            rounded-xl
                            p-5
                        "
                    >

                        <p
                            className="
                                text-xs
                                text-gray-500
                            "
                        >
                            Total Interviews
                        </p>


                        <p
                            className="
                                text-2xl
                                font-bold
                                text-gray-900
                                mt-1
                            "
                        >
                            {interviews.length}
                        </p>

                    </div>


                    <div
                        className="
                            bg-white
                            border
                            border-gray-200
                            rounded-xl
                            p-5
                        "
                    >

                        <p
                            className="
                                text-xs
                                text-gray-500
                            "
                        >
                            Scheduled
                        </p>


                        <p
                            className="
                                text-2xl
                                font-bold
                                text-blue-600
                                mt-1
                            "
                        >
                            {scheduledCount}
                        </p>

                    </div>


                    <div
                        className="
                            bg-white
                            border
                            border-gray-200
                            rounded-xl
                            p-5
                        "
                    >

                        <p
                            className="
                                text-xs
                                text-gray-500
                            "
                        >
                            Completed
                        </p>


                        <p
                            className="
                                text-2xl
                                font-bold
                                text-green-600
                                mt-1
                            "
                        >
                            {completedCount}
                        </p>

                    </div>


                    <div
                        className="
                            bg-white
                            border
                            border-gray-200
                            rounded-xl
                            p-5
                        "
                    >

                        <p
                            className="
                                text-xs
                                text-gray-500
                            "
                        >
                            Selected
                        </p>


                        <p
                            className="
                                text-2xl
                                font-bold
                                text-emerald-600
                                mt-1
                            "
                        >
                            {selectedCount}
                        </p>

                    </div>


                    <div
                        className="
                            bg-white
                            border
                            border-gray-200
                            rounded-xl
                            p-5
                        "
                    >

                        <p
                            className="
                                text-xs
                                text-gray-500
                            "
                        >
                            Cancelled
                        </p>


                        <p
                            className="
                                text-2xl
                                font-bold
                                text-red-600
                                mt-1
                            "
                        >
                            {cancelledCount}
                        </p>

                    </div>

                </div>


                {/* ==================================================
                    NO INTERVIEWS
                ================================================== */}

                {interviews.length === 0 ? (

                    <div
                        className="
                            bg-white
                            border
                            border-gray-200
                            rounded-2xl
                            p-12
                            text-center
                        "
                    >

                        <CalendarDays
                            size={40}
                            className="
                                mx-auto
                                text-gray-400
                            "
                        />


                        <h2
                            className="
                                text-lg
                                font-semibold
                                text-gray-900
                                mt-4
                            "
                        >
                            No interviews found
                        </h2>


                        <p
                            className="
                                text-sm
                                text-gray-500
                                mt-2
                            "
                        >
                            There are currently no
                            interviews scheduled.
                        </p>

                    </div>

                ) : (

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-6
                        "
                    >

                        {interviews.map(
                            interview => (

                                <InterviewCard
                                    key={
                                        interview.interviewId
                                    }

                                    interview={
                                        interview
                                    }

                                    onComplete={
                                        handleComplete
                                    }

                                    completingId={
                                        completingId
                                    }
                                />

                            )
                        )}

                    </div>

                )}

            </main>

        </div>

    );

};


export default Interviews;
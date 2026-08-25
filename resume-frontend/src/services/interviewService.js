// ============================================================
// INTERVIEW SERVICE
// ============================================================

const API_URL = "http://localhost:8080/api/interviews";



// ============================================================
// HANDLE API RESPONSE
// ============================================================

const handleResponse = async (response) => {

    const contentType =
        response.headers.get("content-type") || "";

    let data = null;

    try {

        if (contentType.includes("application/json")) {

            data = await response.json();

        } else {

            data = await response.text();

        }

    } catch (error) {

        console.error(
            "Error reading API response:",
            error
        );

        data = null;
    }


    // ========================================================
    // HANDLE ERROR RESPONSE
    // ========================================================

    if (!response.ok) {

        let message =
            `Request failed with status ${response.status}.`;

        if (
            typeof data === "string" &&
            data.trim()
        ) {

            message = data;

        } else if (
            data &&
            typeof data === "object" &&
            data.message
        ) {

            message = data.message;

        } else if (
            data &&
            typeof data === "object" &&
            data.error
        ) {

            message = data.error;
        }

        throw new Error(message);
    }


    return data;
};



// ============================================================
// GET ALL INTERVIEWS
// ============================================================

export const getAllInterviews = async () => {

    try {

        console.log(
            "GET ALL INTERVIEWS:",
            API_URL
        );

        const response =
            await fetch(API_URL);

        return await handleResponse(
            response
        );

    } catch (error) {

        console.error(
            "Error fetching interviews:",
            error
        );

        throw error;
    }
};



// ============================================================
// GET INTERVIEW BY ID
// ============================================================

export const getInterview = async (
    interviewId
) => {

    try {

        if (!interviewId) {

            throw new Error(
                "Interview ID is required."
            );
        }

        const response =
            await fetch(
                `${API_URL}/${interviewId}`
            );

        return await handleResponse(
            response
        );

    } catch (error) {

        console.error(
            "Error fetching interview:",
            error
        );

        throw error;
    }
};



// ============================================================
// GET CANDIDATE INTERVIEWS
// ============================================================

export const getCandidateInterviews = async (
    candidateId
) => {

    try {

        if (!candidateId) {

            throw new Error(
                "Candidate ID is required."
            );
        }

        const response =
            await fetch(
                `${API_URL}/candidate/${candidateId}`
            );

        return await handleResponse(
            response
        );

    } catch (error) {

        console.error(
            "Error fetching candidate interviews:",
            error
        );

        throw error;
    }
};



// ============================================================
// GET INTERVIEWS BY STATUS
// ============================================================

export const getInterviewsByStatus = async (
    status
) => {

    try {

        if (!status) {

            throw new Error(
                "Interview status is required."
            );
        }

        const response =
            await fetch(
                `${API_URL}/status/${encodeURIComponent(status)}`
            );

        return await handleResponse(
            response
        );

    } catch (error) {

        console.error(
            "Error fetching interviews by status:",
            error
        );

        throw error;
    }
};



// ============================================================
// GET UPCOMING INTERVIEWS
// ============================================================

export const getUpcomingInterviews = async () => {

    try {

        const response =
            await fetch(
                `${API_URL}/upcoming`
            );

        return await handleResponse(
            response
        );

    } catch (error) {

        console.error(
            "Error fetching upcoming interviews:",
            error
        );

        throw error;
    }
};



// ============================================================
// CHECK INTERVIEW ELIGIBILITY
// ============================================================

export const checkInterviewEligibility = async (
    candidateId,
    jobId
) => {

    try {

        if (!candidateId) {

            throw new Error(
                "Candidate ID is required."
            );
        }

        let url =
            `${API_URL}/eligibility/${candidateId}`;

        if (
            jobId !== null &&
            jobId !== undefined
        ) {

            url +=
                `?jobId=${encodeURIComponent(jobId)}`;
        }

        console.log(
            "CHECK INTERVIEW ELIGIBILITY:",
            url
        );

        const response =
            await fetch(url);

        return await handleResponse(
            response
        );

    } catch (error) {

        console.error(
            "Error checking interview eligibility:",
            error
        );

        throw error;
    }
};



// ============================================================
// GET EFFECTIVE SCORE
// ============================================================

export const getEffectiveScore = async (
    candidateId,
    jobId
) => {

    try {

        if (!candidateId) {

            throw new Error(
                "Candidate ID is required."
            );
        }

        let url =
            `${API_URL}/effective-score/${candidateId}`;

        if (
            jobId !== null &&
            jobId !== undefined
        ) {

            url +=
                `?jobId=${encodeURIComponent(jobId)}`;
        }

        console.log(
            "GET EFFECTIVE SCORE:",
            url
        );

        const response =
            await fetch(url);

        return await handleResponse(
            response
        );

    } catch (error) {

        console.error(
            "Error fetching effective score:",
            error
        );

        throw error;
    }
};



// ============================================================
// SCHEDULE INTERVIEW
// ============================================================
//
// IMPORTANT:
// Backend endpoint:
//
// POST /api/interviews/schedule
//
// NOT:
//
// POST /api/interviews
//
// ============================================================

export const scheduleInterview = async (
    interviewData
) => {

    try {

        if (!interviewData) {

            throw new Error(
                "Interview data is required."
            );
        }

        // ====================================================
        // SCHEDULE ENDPOINT
        // ====================================================

        const scheduleURL =
            `${API_URL}/schedule`;

        console.log(
            "SCHEDULE INTERVIEW URL:",
            scheduleURL
        );

        console.log(
            "SCHEDULE INTERVIEW DATA:",
            interviewData
        );


        // ====================================================
        // SEND POST REQUEST
        // ====================================================

        const response =
            await fetch(
                scheduleURL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify(
                            interviewData
                        ),
                }
            );


        console.log(
            "SCHEDULE INTERVIEW STATUS:",
            response.status
        );


        return await handleResponse(
            response
        );

    } catch (error) {

        console.error(
            "Error scheduling interview:",
            error
        );

        throw error;
    }
};



// ============================================================
// RESCHEDULE INTERVIEW
// ============================================================

export const rescheduleInterview = async (
    interviewId,
    newInterviewDate
) => {

    try {

        if (!interviewId) {

            throw new Error(
                "Interview ID is required."
            );
        }

        if (!newInterviewDate) {

            throw new Error(
                "New interview date is required."
            );
        }

        const response =
            await fetch(
                `${API_URL}/${interviewId}/reschedule`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify({
                            newInterviewDate,
                        }),
                }
            );

        return await handleResponse(
            response
        );

    } catch (error) {

        console.error(
            "Error rescheduling interview:",
            error
        );

        throw error;
    }
};



// ============================================================
// CANCEL INTERVIEW
// ============================================================

export const cancelInterview = async (
    interviewId
) => {

    try {

        if (!interviewId) {

            throw new Error(
                "Interview ID is required."
            );
        }

        const response =
            await fetch(
                `${API_URL}/${interviewId}/cancel`,
                {
                    method: "PUT",
                }
            );

        return await handleResponse(
            response
        );

    } catch (error) {

        console.error(
            "Error cancelling interview:",
            error
        );

        throw error;
    }
};



// ============================================================
// COMPLETE INTERVIEW
// ============================================================

export const completeInterview = async (
    interviewId
) => {

    try {

        if (!interviewId) {

            throw new Error(
                "Interview ID is required."
            );
        }

        console.log(
            "Completing interview:",
            interviewId
        );

        const response =
            await fetch(
                `${API_URL}/${interviewId}/complete`,
                {
                    method: "PUT",
                }
            );

        return await handleResponse(
            response
        );

    } catch (error) {

        console.error(
            "Error completing interview:",
            error
        );

        throw error;
    }
};



// ============================================================
// SUBMIT INTERVIEW EVALUATION
// ============================================================

export const submitInterviewEvaluation = async (
    interviewId,
    evaluationData
) => {

    try {

        if (!interviewId) {

            throw new Error(
                "Interview ID is required."
            );
        }

        if (!evaluationData) {

            throw new Error(
                "Evaluation data is required."
            );
        }

        console.log(
            "Submitting evaluation:",
            interviewId,
            evaluationData
        );

        const response =
            await fetch(
                `${API_URL}/${interviewId}/evaluation`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body:
                        JSON.stringify(
                            evaluationData
                        ),
                }
            );

        return await handleResponse(
            response
        );

    } catch (error) {

        console.error(
            "Error submitting interview evaluation:",
            error
        );

        throw error;
    }
};
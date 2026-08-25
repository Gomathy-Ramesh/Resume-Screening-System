const API_URL = "http://localhost:8080/candidates";

// ======================================================
// GET SKILL GAP
// ======================================================

export const getSkillGap = async (candidateId, jobId) => {
    const response = await fetch(
        `${API_URL}/${candidateId}/skill-gap/${jobId}`
    );

    if (!response.ok) {
        let message = "Failed to fetch skill gap";

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                message = errorData.message;
            }
        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return await response.json();
};


// ======================================================
// GET SKILL RECOVERY
// ======================================================

export const getSkillRecovery = async (
    candidateId,
    jobId
) => {
    const response = await fetch(
        `${API_URL}/${candidateId}/skill-recovery/${jobId}`
    );

    if (!response.ok) {
        let message = "Failed to fetch skill recovery";

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                message = errorData.message;
            }
        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return await response.json();
};


// ======================================================
// GET PERMANENT SKILL RECOVERY PARTICIPATION
// ======================================================

export const getSkillRecoveryParticipation = async (
    candidateId,
    jobId
) => {
    const response = await fetch(
        `${API_URL}/${candidateId}/skill-recovery/${jobId}/participation`
    );

    if (!response.ok) {
        let message =
            "Failed to fetch skill recovery participation";

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                message = errorData.message;
            }
        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return await response.json();
};


// ======================================================
// START SKILL RECOVERY
// ======================================================

export const startSkillRecovery = async (
    candidateId,
    jobId
) => {
    const response = await fetch(
        `${API_URL}/${candidateId}/skill-recovery/${jobId}/start`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        let message =
            "Failed to start skill recovery";

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                message = errorData.message;
            }
        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return await response.json();
};


// ======================================================
// UPDATE TOPIC COMPLETION
// ======================================================

export const updateTopicCompletion = async (
    candidateId,
    jobId,
    skill,
    topic,
    completed
) => {
    const response = await fetch(
        `${API_URL}/${candidateId}/skill-recovery/${jobId}/topic`,
        {
            method: "PUT",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                skill,
                topic,
                completed,
            }),
        }
    );

    if (!response.ok) {
        let message =
            "Failed to update topic completion";

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                message = errorData.message;
            }
        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return await response.json();
};
// ======================================================
// TECHNICAL ASSESSMENT
// ======================================================

// GET EXISTING TECHNICAL ASSESSMENT
export const getTechnicalAssessment = async (
    candidateId,
    jobId
) => {
    const response = await fetch(
        `http://localhost:8080/technical-assessments/${candidateId}/${jobId}`
    );

    if (!response.ok) {
        let message = "Failed to fetch technical assessment";

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                message = errorData.message;
            }
        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return await response.json();
};


// ======================================================
// GENERATE TECHNICAL ASSESSMENT
// ======================================================

export const generateTechnicalAssessment = async (
    candidateId,
    jobId
) => {
    const response = await fetch(
        `http://localhost:8080/technical-assessments/generate/${candidateId}/${jobId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        let message =
            "Failed to generate technical assessment";

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                message = errorData.message;
            }
        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return await response.json();
};


// ======================================================
// START TECHNICAL ASSESSMENT
// ======================================================

export const startTechnicalAssessment = async (
    assessmentId
) => {
    const response = await fetch(
        `http://localhost:8080/technical-assessments/${assessmentId}/start`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        let message =
            "Failed to start technical assessment";

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                message = errorData.message;
            }
        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return await response.json();
};


// ======================================================
// SUBMIT TECHNICAL ASSESSMENT
// ======================================================

export const submitTechnicalAssessment = async (
    assessmentId,
    answers
) => {
    const response = await fetch(
        `http://localhost:8080/technical-assessments/${assessmentId}/submit`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(answers),
        }
    );

    if (!response.ok) {
        let message =
            "Failed to submit technical assessment";

        try {
            const errorData = await response.json();

            if (typeof errorData === "string") {
                message = errorData;
            } else if (errorData?.message) {
                message = errorData.message;
            }
        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return await response.json();
};


// ======================================================
// GET TECHNICAL ASSESSMENT RESULT
// ======================================================

export const getTechnicalAssessmentResult = async (
    assessmentId
) => {
    const response = await fetch(
        `http://localhost:8080/technical-assessments/${assessmentId}/result`
    );

    if (!response.ok) {
        let message =
            "Failed to fetch technical assessment result";

        try {
            const errorData = await response.json();

            if (typeof errorData === "string") {
                message = errorData;
            } else if (errorData?.message) {
                message = errorData.message;
            }
        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return await response.json();
};

// ======================================================
// REGENERATE TECHNICAL ASSESSMENT
// ======================================================
//
// Deletes any existing assessment (submitted, in-progress,
// or not-started) and creates a brand new one.
// ======================================================

export const regenerateTechnicalAssessment = async (
    candidateId,
    jobId
) => {
    const response = await fetch(
        `http://localhost:8080/technical-assessments/regenerate/${candidateId}/${jobId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        let message =
            "Failed to regenerate technical assessment";

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                message = errorData.message;
            }
        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return await response.json();
};

// ======================================================
// GET REMAINING ASSESSMENT TIME
// ======================================================

export const getAssessmentTime = async (
    assessmentId
) => {
    const response = await fetch(
        `http://localhost:8080/technical-assessments/${assessmentId}/time`
    );

    if (!response.ok) {
        throw new Error(
            "Failed to fetch assessment time"
        );
    }

    return await response.json();
};
// ======================================================
// HIRING DECISION
// ======================================================

const HIRING_DECISION_API_URL =
    "http://localhost:8080/api/hiring-decisions";

// ======================================================
// GET HIRING DECISION
// ======================================================

export const getHiringDecision = async (candidateId) => {

    const response = await fetch(
        `${HIRING_DECISION_API_URL}/${candidateId}`
    );

    if (!response.ok) {

        let message =
            "Failed to fetch hiring decision";

        try {

            const errorData =
                await response.json();

            if (errorData?.message) {
                message = errorData.message;
            }

        } catch (e) {
            // Ignore JSON parsing error
        }

        throw new Error(message);
    }

    return await response.json();
};

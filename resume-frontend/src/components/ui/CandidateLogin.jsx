import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CandidateLogin = () => {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [appliedPosition, setAppliedPosition] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");


    // ======================================================
    // LOGIN
    // ======================================================

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");

        if (!name.trim()) {

            setError(
                "Please enter your name."
            );

            return;
        }


        if (!appliedPosition.trim()) {

            setError(
                "Please enter your applied position."
            );

            return;
        }


        try {

            setLoading(true);


            const response =
                await axios.post(
                    "http://localhost:8080/auth/candidate-login",
                    {
                        name: name.trim(),
                        appliedPosition:
                            appliedPosition.trim()
                    }
                );


            // =========================================
            // STORE CANDIDATE SESSION
            // =========================================

            localStorage.setItem(
                "candidateToken",
                response.data.token
            );

            localStorage.setItem(
                "candidateId",
                response.data.candidateId
            );

            localStorage.setItem(
                "candidateName",
                response.data.candidateName
            );

            localStorage.setItem(
                "candidateJobId",
                response.data.jobId
            );

            localStorage.setItem(
                "candidateAppliedPosition",
                response.data.appliedPosition
            );


            // =========================================
            // GO DIRECTLY TO RECOVERY
            // =========================================

            navigate(
                `/candidate/recovery/${response.data.candidateId}/${response.data.jobId}`
            );


        } catch (err) {

            console.error(
                "Candidate login error:",
                err
            );


            setError(
                err.response?.data ||
                "Unable to login. Please check your details."
            );


        } finally {

            setLoading(false);
        }
    };


    return (

        <div
            className="
                min-h-screen
                flex
                items-center
                justify-center
                bg-gradient-to-br
                from-blue-900
                via-indigo-900
                to-purple-900
                px-6
            "
        >

            <div
                className="
                    w-full
                    max-w-md
                    rounded-3xl
                    bg-white
                    p-8
                    shadow-2xl
                "
            >

                {/* =====================================
                    HEADER
                ====================================== */}

                <div className="text-center mb-8">

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
                            bg-gradient-to-r
                            from-violet-600
                            to-cyan-500
                        "
                    >

                        <span
                            className="
                                text-3xl
                                font-bold
                                text-white
                            "
                        >
                            T
                        </span>

                    </div>


                    <h1
                        className="
                            text-3xl
                            font-bold
                            text-slate-800
                        "
                    >
                        Candidate Portal
                    </h1>


                    <p
                        className="
                            mt-2
                            text-slate-500
                        "
                    >
                        Access your Skill Recovery Program
                    </p>

                </div>


                {/* =====================================
                    FORM
                ====================================== */}

                <form
                    onSubmit={handleLogin}
                >

                    {/* NAME */}

                    <div className="mb-5">

                        <label
                            className="
                                mb-2
                                block
                                text-sm
                                font-semibold
                                text-slate-700
                            "
                        >
                            Full Name
                        </label>


                        <input
                            type="text"
                            value={name}
                            onChange={(e) =>
                                setName(
                                    e.target.value
                                )
                            }
                            placeholder="Enter your full name"
                            className="
                                h-12
                                w-full
                                rounded-xl
                                border
                                border-violet-200
                                px-4
                                outline-none
                                focus:border-violet-500
                                focus:ring-4
                                focus:ring-violet-100
                            "
                        />

                    </div>


                    {/* APPLIED POSITION */}

                    <div className="mb-5">

                        <label
                            className="
                                mb-2
                                block
                                text-sm
                                font-semibold
                                text-slate-700
                            "
                        >
                            Applied Position
                        </label>


                        <input
                            type="text"
                            value={appliedPosition}
                            onChange={(e) =>
                                setAppliedPosition(
                                    e.target.value
                                )
                            }
                            placeholder="Example: Java Developer"
                            className="
                                h-12
                                w-full
                                rounded-xl
                                border
                                border-violet-200
                                px-4
                                outline-none
                                focus:border-violet-500
                                focus:ring-4
                                focus:ring-violet-100
                            "
                        />

                    </div>


                    {/* ERROR */}

                    {error && (

                        <div
                            className="
                                mb-5
                                rounded-xl
                                bg-red-50
                                border
                                border-red-200
                                p-3
                                text-sm
                                text-red-600
                            "
                        >
                            {error}
                        </div>

                    )}


                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            h-12
                            w-full
                            rounded-xl
                            bg-gradient-to-r
                            from-violet-600
                            to-cyan-500
                            font-semibold
                            text-white
                            transition
                            hover:shadow-xl
                            disabled:opacity-60
                        "
                    >

                        {loading
                            ? "Checking..."
                            : "Continue to Skill Recovery"
                        }

                    </button>

                </form>

            </div>

        </div>
    );
};

export default CandidateLogin;
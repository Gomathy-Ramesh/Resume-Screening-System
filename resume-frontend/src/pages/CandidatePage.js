// src/pages/CandidatePage.js

import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Eye,
  CheckCircle2,
  UserCheck,
  Briefcase,
} from "lucide-react";

const API_URL =
  "https://resume-screening-backend-biq3.onrender.com/";

function CandidatePage() {

  // =========================
  // STATES
  // =========================

  const [candidates, setCandidates] =
    useState([]);

  const [expandedCandidateId, setExpandedCandidateId] =
    useState(null);

  // =========================
  // FETCH CANDIDATES
  // =========================

  const fetchCandidates = async () => {

    try {

      const response =
        await axios.get(
          `${API_URL}/candidates`
        );

      setCandidates(response.data);

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {

    fetchCandidates();

  }, []);

  // =========================
  // VIEW RESUME
  // =========================

  const viewResume = (resumeUrl) => {

    if (!resumeUrl) {

      alert("Resume not found");

      return;
    }

    window.open(
      resumeUrl,
      "_blank"
    );
  };

  // =========================
  // SHORTLIST
  // =========================

  const shortlistCandidate = async (
    id
  ) => {

    try {

      await axios.put(

        `${API_URL}/candidates/shortlist/${id}`

      );

      alert(
        "Candidate Shortlisted"
      );

      fetchCandidates();

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // SELECT
  // =========================

  const selectCandidate = async (
    id
  ) => {

    try {

      await axios.put(

        `${API_URL}/candidates/select/${id}`

      );

      alert(
        "Candidate Selected"
      );

      fetchCandidates();

    } catch (error) {

      console.error(error);
    }
  };

  return (

    <div className="h-full bg-[#FAFAFF] px-6 pb-2 pt-1 overflow-hidden">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="mb-2 flex items-center justify-between">

        <div>

          <h1
  className="
    text-3xl
    font-bold
    bg-gradient-to-r
    from-violet-600
    to-fuchsia-500
    bg-clip-text
    text-transparent
  "
>

            Candidate Management

          </h1>

          <p className="mt-1 text-sm text-slate-500">

            Manage shortlisted and selected candidates

          </p>

        </div>

        {/* TOTAL COUNT */}

        <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-violet-100">

          <p className="text-sm text-gray-500">

            Total Candidates

          </p>

          <h2 className="text-2xl font-bold text-violet-600">

            {candidates.length}

          </h2>

        </div>

      </div>

      {/* =========================
          CANDIDATE TABLE
      ========================= */}

      <div className="h-[78vh] bg-white rounded-3xl shadow-sm border border-violet-100 overflow-hidden">

        <div className="h-full overflow-y-auto overflow-x-auto">

          <table className="w-full">

            {/* TABLE HEADER */}

            <thead
  className="
    bg-gradient-to-r
    from-violet-600
    to-fuchsia-600
    text-white
  "
>

              <tr>

                <th className="px-6 py-4 text-left text-sm font-semibold">

                  ID

                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">

                  Candidate

                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">

                  Position

                </th>


                <th className="px-6 py-4 text-left text-sm font-semibold">

                  Match %

                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">

                  Status

                </th>

                <th className="px-6 py-4 text-center text-sm font-semibold">

                  Details

                </th>

              </tr>

            </thead>

            {/* TABLE BODY */}

            <tbody>

  {candidates.length > 0 ? (

    candidates.map((candidate) => (

      <React.Fragment
        key={candidate.candidateId}
      >

        {/* MAIN ROW */}

        <tr className="border-b border-gray-100 hover:bg-violet-50 transition-all duration-200">

          {/* ID */}

          <td className="px-6 py-5 font-medium text-gray-700">

            {candidate.candidateId}

          </td>

          {/* CANDIDATE */}

          <td className="px-6 py-5">

            <div>

              <h3 className="font-semibold text-gray-800">

                {candidate.name}

              </h3>

              <p className="text-sm text-gray-500">

                {candidate.email}

              </p>

            </div>

          </td>

          {/* POSITION */}

          <td className="px-6 py-5">

            <div className="flex items-center gap-2">

              <Briefcase
                size={16}
                className="text-violet-500"
              />

              <span className="text-gray-700">

                {candidate.appliedPosition}

              </span>

            </div>

          </td>

          {/* MATCH */}

          <td className="px-6 py-5">

            <div className="w-32">

  <div className="text-sm font-semibold text-violet-700 mb-1">

    {candidate.score}%

  </div>

  <div className="h-2 rounded-full bg-violet-100">

    <div
      className="h-2 rounded-full bg-violet-600"
      style={{
        width: `${candidate.score}%`
      }}
    />

  </div>

</div>

          </td>

          {/* STATUS */}

          <td className="px-6 py-5">

            <span
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                candidate.currentStage === "Selected"
                  ? "bg-violet-600 text-white"
                  : candidate.currentStage === "Shortlisted"
                  ? "bg-violet-100 text-violet-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >

              {candidate.currentStage || "Pending"}

            </span>

          </td>

          {/* DETAILS BUTTON */}

          <td className="px-6 py-5 text-center">

            <button
              onClick={() =>
                setExpandedCandidateId(
                  expandedCandidateId ===
                  candidate.candidateId
                    ? null
                    : candidate.candidateId
                )
              }
              className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm"
            >

              {expandedCandidateId ===
              candidate.candidateId
                ? "Hide"
                : "Details"}

            </button>

          </td>

        </tr>

        {/* EXPANDABLE DETAILS ROW */}

        {expandedCandidateId ===
          candidate.candidateId && (

          <tr>

            <td
              colSpan="6"
              className="bg-violet-50 p-6"
            >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* EXPERIENCE */}

                <div>

                  <h4 className="font-semibold text-violet-600 mb-2">

                    Experience

                  </h4>

                  <p className="text-gray-700">

                    {candidate.experience} Years

                  </p>

                </div>

                {/* SKILLS */}

                <div>

                  <h4 className="font-semibold text-violet-600 mb-2">

                    Skills

                  </h4>

                  <p className="text-gray-700">

                    {candidate.skills}

                  </p>

                </div>

                {/* RESUME */}

                <div>

                  <h4 className="font-semibold text-violet-600 mb-2">

                    Resume

                  </h4>

                  <button
                    onClick={() =>
                      viewResume(
                        candidate.resumeUrl
                      )
                    }
                    className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl"
                  >

                    <Eye size={16} />

                    View Resume

                  </button>

                </div>

                {/* ACTIONS */}

                <div>

                  <h4 className="font-semibold text-violet-600 mb-2">

                    Actions

                  </h4>

                  <div className="flex gap-3 flex-wrap">

                    {candidate.currentStage !==
                      "Shortlisted" &&
                      candidate.currentStage !==
                        "Selected" && (

                      <button
                        onClick={() =>
                          shortlistCandidate(
                            candidate.candidateId
                          )
                        }
                        className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm"
                      >

                        <UserCheck size={16} />

                        Shortlist

                      </button>
                    )}

                    {candidate.currentStage ===
                      "Shortlisted" && (

                      <button
                        onClick={() =>
                          selectCandidate(
                            candidate.candidateId
                          )
                        }
                        className="inline-flex items-center gap-2 bg-violet-100 hover:bg-violet-200 text-violet-700 px-4 py-2 rounded-xl text-sm"
                      >

                        <CheckCircle2 size={16} />

                        Select

                      </button>
                    )}

                    {candidate.currentStage ===
                      "Selected" && (

                      <span className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-xl text-sm">

                        <CheckCircle2 size={16} />

                        Completed

                      </span>
                    )}

                  </div>

                </div>

              </div>

            </td>

          </tr>
        )}

      </React.Fragment>

    ))

  ) : (

    <tr>

      <td
        colSpan="6"
        className="text-center py-10 text-gray-500"
      >

        No Candidates Found

      </td>

    </tr>

  )}

</tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default CandidatePage;
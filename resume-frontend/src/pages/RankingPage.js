// src/pages/RankingPage.js

import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Trophy,
  Medal,
  Briefcase,
  Star,
  Brain,
  Target,
  TrendingUp,
} from "lucide-react";

function RankingPage() {

  // =========================
  // STATES
  // =========================

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FETCH RANKINGS
  // =========================

  const fetchRankings = async () => {

    try {

      const response = await axios.get(
        "http://localhost:8080/candidates/ranking"
      );

      setCandidates(response.data);

    } catch (error) {

      console.error(
        "Error fetching candidate rankings:",
        error
      );

    } finally {

      setLoading(false);

    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {

    fetchRankings();

  }, []);

  // =========================
  // RANK STYLE
  // =========================

  const getRankStyle = (rank) => {

    if (rank === 0) {
      return "bg-yellow-100 text-yellow-700";
    }

    if (rank === 1) {
      return "bg-slate-200 text-slate-700";
    }

    if (rank === 2) {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-violet-100 text-violet-700";
  };

  // =========================
  // TOP CANDIDATES
  // =========================

  const topCandidates =
    candidates.slice(0, 3);

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div
        className="
          min-h-full
          flex
          items-center
          justify-center
          bg-[#FAFAFF]
        "
      >

        <div className="text-center">

          <div
            className="
              h-12
              w-12
              mx-auto
              rounded-full
              border-4
              border-violet-200
              border-t-violet-600
              animate-spin
            "
          />

          <p className="mt-4 text-slate-500">

            Loading TalentIQ Rankings...

          </p>

        </div>

      </div>

    );
  }

  return (

    <div className="h-full bg-[#FAFAFF] px-6 pb-4 pt-2 overflow-y-auto">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="mb-5">

        <div className="flex items-center gap-3">

          <div
            className="
              p-3
              rounded-2xl
              bg-gradient-to-r
              from-violet-600
              to-cyan-500
              shadow-lg
            "
          >

            <TrendingUp
              size={25}
              className="text-white"
            />

          </div>

          <div>

            <h1
              className="
                text-3xl
                font-bold
                bg-gradient-to-r
                from-violet-700
                to-cyan-600
                bg-clip-text
                text-transparent
              "
            >

              Candidate Ranking

            </h1>

            <p className="mt-1 text-sm text-slate-500">

              AI-assisted ranking based on
              resume and job relevance

            </p>

          </div>

        </div>

      </div>


      {/* =========================
          INTELLIGENCE BANNER
      ========================= */}

      <div
        className="
          mb-5
          rounded-3xl
          p-5
          bg-gradient-to-r
          from-violet-600
          to-cyan-500
          text-white
          shadow-[0_10px_35px_rgba(124,58,237,0.20)]
        "
      >

        <div className="flex items-center gap-4">

          <div
            className="
              p-3
              rounded-2xl
              bg-white/15
              backdrop-blur-md
            "
          >

            <Brain size={25} />

          </div>

          <div>

            <h2 className="text-xl font-bold">

              TalentIQ Recruitment Intelligence

            </h2>

            <p className="text-sm text-violet-100 mt-1">

              Candidates are ranked according to
              their job-relevant resume match,
              helping recruiters identify suitable
              candidates efficiently.

            </p>

          </div>

        </div>

      </div>


      {/* =========================
          TOP 3 CANDIDATES
      ========================= */}

      <div className="mb-6">

        <div className="flex items-center gap-2 mb-4">

          <Trophy
            size={22}
            className="text-violet-600"
          />

          <h2 className="text-xl font-bold text-slate-800">

            Top Ranked Candidates

          </h2>

        </div>


        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-3
            gap-4
          "
        >

          {topCandidates.length > 0 ? (

            topCandidates.map(
              (candidate, index) => (

                <div
                  key={candidate.candidateId}
                  className="
                    relative
                    overflow-hidden
                    rounded-3xl
                    bg-white
                    p-5
                    border
                    border-slate-200
                    shadow-sm
                    transition-all
                    duration-300
                    hover:shadow-xl
                    hover:border-violet-300
                    hover:-translate-y-1
                  "
                >

                  {/* TOP GRADIENT */}

                  <div
                    className="
                      absolute
                      top-0
                      left-0
                      h-1
                      w-full
                      bg-gradient-to-r
                      from-violet-600
                      to-cyan-500
                    "
                  />


                  {/* RANK + ICON */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      mb-4
                    "
                  >

                    <div
                      className={`
                        px-3
                        py-1.5
                        rounded-full
                        font-semibold
                        text-xs
                        shadow-sm
                        ${getRankStyle(index)}
                      `}
                    >

                      #{index + 1}

                    </div>

                    <Trophy
                      className="text-violet-500"
                      size={26}
                    />

                  </div>


                  {/* NAME */}

                  <h2 className="text-lg font-bold text-slate-800">

                    {candidate.name}

                  </h2>


                  {/* POSITION */}

                  <div className="flex items-center gap-2 mt-1">

                    <Briefcase
                      size={15}
                      className="text-violet-500"
                    />

                    <p className="text-slate-500 text-sm">

                      {candidate.appliedPosition ||
                        "Position Not Available"}

                    </p>

                  </div>


                  {/* SCORE */}

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      mt-4
                    "
                  >

                    <div className="flex items-center gap-2">

                      <Star
                        size={18}
                        className="text-violet-500"
                      />

                      <span
                        className="
                          bg-gradient-to-r
                          from-violet-600
                          to-cyan-500
                          text-white
                          px-3
                          py-1
                          rounded-full
                          text-xs
                          font-semibold
                          shadow-md
                        "
                      >

                        {candidate.score || 0}%

                      </span>

                    </div>

                    <span className="text-xs text-slate-500">

                      Match Score

                    </span>

                  </div>

                </div>

              )

            )

          ) : (

            <div
              className="
                md:col-span-3
                rounded-3xl
                border
                border-dashed
                border-slate-300
                bg-white
                p-10
                text-center
                text-slate-500
              "
            >

              No ranking data available.

            </div>

          )}

        </div>

      </div>


      {/* =========================
          RANKING SUMMARY
      ========================= */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
          mb-6
        "
      >

        {/* TOTAL RANKED */}

        <div
          className="
            bg-white
            rounded-3xl
            p-5
            border
            border-slate-200
            shadow-sm
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                p-3
                rounded-2xl
                bg-violet-100
              "
            >

              <TrendingUp
                size={22}
                className="text-violet-600"
              />

            </div>

            <div>

              <p className="text-sm text-slate-500">

                Ranked Candidates

              </p>

              <h3 className="text-2xl font-bold text-slate-800">

                {candidates.length}

              </h3>

            </div>

          </div>

        </div>


        {/* TOP SCORE */}

        <div
          className="
            bg-white
            rounded-3xl
            p-5
            border
            border-slate-200
            shadow-sm
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                p-3
                rounded-2xl
                bg-cyan-100
              "
            >

              <Target
                size={22}
                className="text-cyan-600"
              />

            </div>

            <div>

              <p className="text-sm text-slate-500">

                Highest Match

              </p>

              <h3 className="text-2xl font-bold text-slate-800">

                {candidates.length > 0
                  ? `${Math.max(
                      ...candidates.map(
                        (candidate) =>
                          Number(candidate.score) || 0
                      )
                    )}%`
                  : "0%"}

              </h3>

            </div>

          </div>

        </div>


        {/* RANKING MODULE */}

        <div
          className="
            bg-white
            rounded-3xl
            p-5
            border
            border-slate-200
            shadow-sm
          "
        >

          <div className="flex items-center gap-3">

            <div
              className="
                p-3
                rounded-2xl
                bg-violet-100
              "
            >

              <Brain
                size={22}
                className="text-violet-600"
              />

            </div>

            <div>

              <p className="text-sm text-slate-500">

                TalentIQ Module

              </p>

              <h3 className="text-lg font-bold text-slate-800">

                Candidate Ranking

              </h3>

            </div>

          </div>

        </div>

      </div>


      {/* =========================
          RANKING TABLE
      ========================= */}

      <div
        className="
          rounded-3xl
          bg-white
          border
          border-slate-200
          shadow-sm
          overflow-hidden
        "
      >

        {/* TABLE HEADER */}

        <div
          className="
            px-6
            py-5
            border-b
            border-slate-100
          "
        >

          <h2 className="text-xl font-bold text-slate-800">

            Complete Candidate Ranking

          </h2>

          <p className="text-sm text-slate-500 mt-1">

            Candidates ordered according to their
            resume-job match score

          </p>

        </div>


        <div className="max-h-[52vh] overflow-y-auto overflow-x-auto">

          <table className="w-full">

            <thead
              className="
                bg-gradient-to-r
                from-violet-600
                to-cyan-500
                text-white
                sticky
                top-0
                z-10
              "
            >

              <tr>

                <th className="px-6 py-4 text-left text-sm font-semibold">

                  Rank

                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">

                  Candidate

                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">

                  Position

                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">

                  Match Score

                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold">

                  Ranking Status

                </th>

              </tr>

            </thead>


            <tbody>

              {candidates.length > 0 ? (

                candidates.map(
                  (candidate, index) => (

                    <tr
                      key={candidate.candidateId}
                      className="
                        border-b
                        border-slate-100
                        hover:bg-violet-50
                        transition-all
                        duration-200
                      "
                    >

                      {/* RANK */}

                      <td className="px-6 py-5">

                        <div
                          className={`
                            inline-flex
                            items-center
                            gap-1.5
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-semibold
                            shadow-sm
                            ${getRankStyle(index)}
                          `}
                        >

                          <Medal size={16} />

                          #{index + 1}

                        </div>

                      </td>


                      {/* CANDIDATE */}

                      <td className="px-6 py-5">

                        <div>

                          <h3 className="font-semibold text-slate-800">

                            {candidate.name}

                          </h3>

                          <p className="text-sm text-slate-500">

                            Candidate ID :{" "}
                            {candidate.candidateId}

                          </p>

                        </div>

                      </td>


                      {/* POSITION */}

                      <td className="px-6 py-5">

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                            text-slate-700
                          "
                        >

                          <Briefcase
                            size={16}
                            className="text-violet-500"
                          />

                          {candidate.appliedPosition ||
                            "Position Not Available"}

                        </div>

                      </td>


                      {/* SCORE */}

                      <td className="px-6 py-5">

                        <div className="w-36">

                          <div
                            className="
                              flex
                              items-center
                              justify-between
                              mb-1
                            "
                          >

                            <span
                              className="
                                text-sm
                                font-bold
                                text-violet-700
                              "
                            >

                              {candidate.score || 0}%

                            </span>

                          </div>

                          <div
                            className="
                              h-2
                              rounded-full
                              bg-violet-100
                              overflow-hidden
                            "
                          >

                            <div
                              className="
                                h-2
                                rounded-full
                                bg-gradient-to-r
                                from-violet-600
                                to-cyan-500
                              "
                              style={{
                                width: `${Math.min(
                                  Number(candidate.score) || 0,
                                  100
                                )}%`,
                              }}
                            />

                          </div>

                        </div>

                      </td>


                      {/* STATUS */}

                      <td className="px-6 py-5">

                        <span
                          className={`
                            inline-flex
                            items-center
                            rounded-full
                            px-3
                            py-1.5
                            text-xs
                            font-semibold

                            ${
                              index === 0
                                ? "bg-yellow-100 text-yellow-700"
                                : index === 1
                                ? "bg-slate-200 text-slate-700"
                                : index === 2
                                ? "bg-orange-100 text-orange-700"
                                : "bg-violet-100 text-violet-700"
                            }
                          `}
                        >

                          {index === 0
                            ? "Top Candidate"
                            : index === 1
                            ? "2nd Rank"
                            : index === 2
                            ? "3rd Rank"
                            : "Ranked"}

                        </span>

                      </td>

                    </tr>

                  )

                )

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="
                      text-center
                      py-12
                      text-slate-500
                    "
                  >

                    No Candidate Ranking Data Available

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

export default RankingPage;
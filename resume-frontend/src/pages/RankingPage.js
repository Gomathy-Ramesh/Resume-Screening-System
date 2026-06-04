// src/pages/RankingPage.js

import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  Trophy,
  Medal,
  Briefcase,
  Star,
} from "lucide-react";

function RankingPage() {

  // =========================
  // STATES
  // =========================

  const [candidates, setCandidates] =
    useState([]);

  // =========================
  // FETCH RANKINGS
  // =========================

  const fetchRankings = async () => {

    try {

      const response =
        await axios.get(
          "https://resume-screening-backend-biq3.onrender.com/candidates/ranking"
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

    fetchRankings();

  }, []);

  // =========================
  // RANK BADGE COLOR
  // =========================

  const getRankStyle = (rank) => {

    if (rank === 0) {

      return "bg-yellow-100 text-yellow-700";
    }

    if (rank === 1) {

      return "bg-gray-200 text-gray-700";
    }

    if (rank === 2) {

      return "bg-orange-100 text-orange-700";
    }

    return "bg-violet-100 text-violet-700";
  };

  return (

    <div className="h-full bg-[#FAFAFF] px-6 pb-2 pt-1 overflow-hidden">

      {/* =========================
          PAGE HEADER
      ========================= */}

      <div className="mb-2">

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

            Candidate Ranking

          </h1>

        </div>

      </div>

      {/* =========================
          TOP 3 CARDS
      ========================= */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">

        {candidates.slice(0, 3).map(
          (
            candidate,
            index
          ) => (

            <div
              key={candidate.candidateId}
              className="
relative
overflow-hidden
rounded-[28px]
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
before:absolute
before:top-0
before:left-0
before:h-1
before:w-full
before:bg-gradient-to-r
before:from-violet-500
before:to-fuchsia-500
"
           >

              <div className="flex items-center justify-between mb-4">

                <div
                  className={`px-3 py-1.5 rounded-full font-semibold text-xs shadow-sm ${getRankStyle(index)}`}
                >

                  #{index + 1}

                </div>

                <Trophy
                  className="text-violet-500"
                  size={26}
                />

              </div>

              <h2 className="text-lg font-bold text-gray-800">

                {candidate.name}

              </h2>

              <p className="text-gray-500 text-sm mb-2">

                {
                  candidate.appliedPosition
                }

              </p>

              <div className="flex items-center justify-between mt-2">

                <div className="flex items-center gap-2">

                  <Star
                    size={18}
                    className="text-violet-500"
                  />

                  <span className="
bg-gradient-to-r
from-violet-600
to-fuchsia-500
text-white
px-3
py-1
rounded-full
text-xs
font-semibold
shadow-md
">
  {candidate.score}%
</span>

                </div>

                <span className="text-sm text-gray-500">

                  Match Score

                </span>

              </div>

            </div>
          )
        )}

      </div>

      {/* =========================
          RANKING TABLE
      ========================= */}

      <div className="
h-[52vh]
overflow-y-auto
rounded-[28px]
bg-white
border
border-slate-200
shadow-sm
">

        <div className="overflow-x-auto">

          <table className="w-full">

            {/* TABLE HEADER */}

            <thead className="bg-slate-100 text-slate-700">

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

                  Match %

                </th>

              </tr>

            </thead>

            {/* TABLE BODY */}

            <tbody>

              {candidates.length > 0 ? (

                candidates.map(
                  (
                    candidate,
                    index
                  ) => (

                    <tr
                      key={
                        candidate.candidateId
                      }
                      className="
border-b
border-slate-100
hover:bg-slate-50
transition-all
duration-200
"
                    >

                      {/* RANK */}

                      <td className="px-6 py-5">

                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getRankStyle(index)}`}
                        >

                          <Medal size={16} />

                          #{index + 1}

                        </div>

                      </td>

                      {/* NAME */}

                      <td className="px-6 py-5">

                        <div>

                          <h3 className="font-semibold text-gray-800">

                            {candidate.name}

                          </h3>

                          <p className="text-sm text-gray-500">

                            Candidate ID :
                            {" "}
                            {
                              candidate.candidateId
                            }

                          </p>

                        </div>

                      </td>

                      {/* POSITION */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-2 text-gray-700">

                          <Briefcase
                            size={16}
                            className="text-violet-500"
                          />

                          {
                            candidate.appliedPosition
                          }

                        </div>

                      </td>


                      {/* SCORE */}

                      <td className="px-6 py-5">

                        <span
className="
inline-flex
items-center
rounded-full
bg-gradient-to-r
from-violet-600
to-fuchsia-500
px-3
py-1.5
text-xs
font-semibold
text-white
shadow-md
"
>
  {candidate.score}%
</span>

                      </td>

                    </tr>
                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="text-center py-10 text-gray-500"
                  >

                    No Ranking Data Available

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
// src/pages/DashboardHome.js

import React, {
  useEffect,
  useState,
} from "react";

import axios from "axios";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Users,
  UserCheck,
  Trophy,
  Percent,
} from "lucide-react";

function DashboardHome() {

  // =========================
  // STATES
  // =========================

  const [candidates, setCandidates] =
    useState([]);

  // =========================
  // FETCH CANDIDATES
  // =========================

  const fetchCandidates = async () => {

    try {

      const response =
        await axios.get(
          "http://localhost:8080/candidates"
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
  // DASHBOARD STATS
  // =========================

  const totalCandidates =
    candidates.length;

  const shortlistedCandidates =
    candidates.filter(
      (candidate) =>
        candidate.currentStage ===
        "Shortlisted"
    ).length;

  const selectedCandidates =
    candidates.filter(
      (candidate) =>
        candidate.currentStage ===
        "Selected"
    ).length;

  const highestScore =
    candidates.length > 0

      ? Math.max(
          ...candidates.map(
            (candidate) =>
              candidate.score || 0
          )
        )

      : 0;

  // =========================
  // CHART DATA
  // =========================

  const barChartData = [

  {
    name: "Applied",
    value: totalCandidates,
  },

  {
    name: "Shortlisted",
    value: shortlistedCandidates,
  },

  {
    name: "Selected",
    value: selectedCandidates,
  },
];

const jobWiseData = Object.values(

  candidates.reduce((acc, candidate) => {

    const position =
      candidate.appliedPosition ||
      "Unknown";

    if (!acc[position]) {

      acc[position] = {
        name: position,
        value: 0,
      };
    }

    acc[position].value += 1;

    return acc;

  }, {})

);

  const COLORS = [
  "#8B5CF6",
  "#A855F7",
  "#C084FC",
  "#D946EF",
  "#7C3AED",
  ];

  return (

    <div className="bg-[#FAFAFF] p-4">
      
      {/* =========================
          STATS CARDS
      ========================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6 mt-1">

        {/* TOTAL */}

        <div
          className="
relative
overflow-hidden
bg-gradient-to-br
from-white
to-violet-50
rounded-3xl
p-5
border
border-slate-200/70
shadow-[0_2px_12px_rgba(15,23,42,0.04)]
transition-all
duration-300
hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]
hover:border-violet-300
hover:-translate-y-1
cursor-pointer

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

            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-3 rounded-2xl shadow-lg">

              <Users className="text-white" size={26} />

            </div>

          </div>

          <p className="text-gray-500 text-sm mb-2">

            Total Candidates

          </p>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">

            {totalCandidates}

          </h2>

        </div>

        {/* SHORTLISTED */}

        <div
          className="
relative
overflow-hidden
bg-gradient-to-br
from-white
to-violet-50
rounded-3xl
p-5
border
border-slate-200/70
shadow-[0_2px_12px_rgba(15,23,42,0.04)]
transition-all
duration-300
hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]
hover:border-violet-300
hover:-translate-y-1
cursor-pointer

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

            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-3 rounded-2xl shadow-lg">

              <UserCheck className="text-white" size={26} />

            </div>

          </div>

          <p className="text-gray-500 text-sm mb-2">

            Shortlisted

          </p>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">

            {shortlistedCandidates}

          </h2>

        </div>

        {/* SELECTED */}

        <div
          className="
relative
overflow-hidden
bg-gradient-to-br
from-white
to-violet-50
rounded-3xl
p-5
border
border-slate-200/70
shadow-[0_2px_12px_rgba(15,23,42,0.04)]
transition-all
duration-300
hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]
hover:border-violet-300
hover:-translate-y-1
cursor-pointer

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

            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-3 rounded-2xl shadow-lg">

              <Trophy className="text-white" size={26} />

            </div>

          </div>

          <p className="text-gray-500 text-sm mb-2">

            Selected

          </p>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">

            {selectedCandidates}

          </h2>

        </div>

        {/* HIGHEST MATCH */}

        <div
          className="
relative
overflow-hidden
bg-gradient-to-br
from-white
to-violet-50
rounded-3xl
p-5
border
border-slate-200/70
shadow-[0_2px_12px_rgba(15,23,42,0.04)]
transition-all
duration-300
hover:shadow-[0_0_40px_rgba(139,92,246,0.25)]
hover:border-violet-300
hover:-translate-y-1
cursor-pointer

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

            <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 p-3 rounded-2xl shadow-lg">

              <Percent className="text-white" size={26} />

            </div>

          </div>

          <p className="text-gray-500 text-sm mb-2">

            Highest Match %

          </p>

          <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">

            {highestScore}%

          </h2>

        </div>

      </div>

      {/* =========================
          CHART SECTION
      ========================= */}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* BAR CHART */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-violet-100">

  <h3 className="text-xl font-semibold text-gray-800 mb-6">
    Recruitment Funnel
  </h3>

  <ResponsiveContainer
    width="100%"
    height={250}
  >

    <BarChart data={barChartData}>

      <CartesianGrid
        strokeDasharray="3 3"
        stroke="#E9D5FF"
      />

      <XAxis
        dataKey="name"
        tick={{
          fill: "#6B7280",
          fontSize: 13,
        }}
      />

      <YAxis
        tick={{
          fill: "#6B7280",
          fontSize: 13,
        }}
      />

      <Tooltip />

      <Bar
        dataKey="value"
        radius={[12, 12, 0, 0]}
      >
        {barChartData.map(
          (entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                COLORS[
                  index %
                    COLORS.length
                ]
              }
            />
          )
        )}
      </Bar>

    </BarChart>

  </ResponsiveContainer>

</div>

        {/* PIE CHART */}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-violet-100">

          <h3 className="text-xl font-semibold text-gray-800 mb-6">

            Job-wise Applications

          </h3>

          <ResponsiveContainer
            width="100%"
            height={250}
          >

            <PieChart>

              <Pie
                data={jobWiseData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >

                {jobWiseData.map(
                  (
                    entry,
                    index
                  ) => (

                    <Cell
                      key={index}
                      fill={
                        COLORS[
                          index %
                            COLORS.length
                        ]
                      }
                    />
                  )
                )}

              </Pie>

              <Tooltip />

            </PieChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}

export default DashboardHome;
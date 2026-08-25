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
  FileText,
  UserCheck,
  Trophy,
  Target,
  Brain,
  Sparkles,
  TrendingUp,
} from "lucide-react";

function DashboardHome() {

  // =========================
  // STATES
  // =========================

  const [candidates, setCandidates] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

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

      console.error(
        "Error fetching candidates:",
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

    fetchCandidates();

  }, []);

  // =========================
  // DASHBOARD STATISTICS
  // =========================

  const totalResumes =
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
              Number(candidate.score) || 0
          )
        )
      : 0;

  // =========================
  // SCREENING STATUS DATA
  // =========================

  const screeningStatusData = [

    {
      name: "Screened",
      value: totalResumes,
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

  // =========================
  // POSITION-WISE DATA
  // =========================

  const positionWiseData =
    Object.values(

      candidates.reduce(
        (acc, candidate) => {

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

        },
        {}
      )

    );

  // =========================
  // TALENTIQ COLORS
  // =========================

  const COLORS = [

    "#7C3AED",
    "#8B5CF6",
    "#06B6D4",
    "#22D3EE",
    "#6366F1",

  ];

  // =========================
  // STAT CARD
  // =========================

  const StatCard = ({
    icon,
    title,
    value,
    description,
  }) => {

    return (

      <div
        className="
          relative
          overflow-hidden
          bg-white
          rounded-3xl
          p-5
          border
          border-slate-200/70
          shadow-[0_2px_12px_rgba(15,23,42,0.04)]
          transition-all
          duration-300
          hover:shadow-[0_0_40px_rgba(124,58,237,0.18)]
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

        <div className="flex items-center justify-between mb-4">

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

            {icon}

          </div>

        </div>

        <p className="text-slate-500 text-sm mb-2">

          {title}

        </p>

        <h2
          className="
            text-4xl
            font-bold
            bg-gradient-to-r
            from-violet-600
            to-cyan-500
            bg-clip-text
            text-transparent
          "
        >

          {value}

        </h2>

        <p className="text-xs text-slate-400 mt-2">

          {description}

        </p>

      </div>

    );

  };

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

            Loading TalentIQ Dashboard...

          </p>

        </div>

      </div>

    );

  }

  return (

    <div className="bg-[#FAFAFF] p-4">

      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-6">

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

            <Brain
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
              TalentIQ Dashboard
            </h1>

            <p className="text-slate-500 mt-1">

              AI-powered recruitment intelligence
              and skill recovery insights

            </p>

          </div>

        </div>

      </div>

      {/* =========================
          QUICK INSIGHT
      ========================= */}

      <div
        className="
          mb-6
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

            <Sparkles size={25} />

          </div>

          <div>

            <h2 className="text-xl font-bold">

              Recruitment Intelligence

            </h2>

            <p className="text-sm text-violet-100 mt-1">

              TalentIQ analyzes resumes, extracts
              skills, ranks candidates and identifies
              skill gaps for targeted skill recovery.

            </p>

          </div>

        </div>

      </div>

      {/* =========================
          STATS CARDS
      ========================= */}

      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-2
          xl:grid-cols-4
          gap-4
          mb-6
        "
      >

        {/* TOTAL RESUMES */}

        <StatCard
          icon={
            <FileText
              size={26}
              className="text-white"
            />
          }
          title="Total Resumes"
          value={totalResumes}
          description="Resumes processed by TalentIQ"
        />

        {/* SHORTLISTED */}

        <StatCard
          icon={
            <UserCheck
              size={26}
              className="text-white"
            />
          }
          title="Shortlisted Candidates"
          value={shortlistedCandidates}
          description="Candidates matching job requirements"
        />

        {/* SELECTED */}

        <StatCard
          icon={
            <Trophy
              size={26}
              className="text-white"
            />
          }
          title="Selected Candidates"
          value={selectedCandidates}
          description="Candidates selected for recruitment"
        />

        {/* HIGHEST SCORE */}

        <StatCard
          icon={
            <Target
              size={26}
              className="text-white"
            />
          }
          title="Highest Match Score"
          value={`${highestScore}%`}
          description="Best resume-job relevance score"
        />

      </div>

      {/* =========================
          TALENTIQ MODULES
      ========================= */}

      <div className="mb-6">

        <h2 className="text-xl font-bold text-slate-800 mb-4">

          TalentIQ Intelligence Modules

        </h2>

        <div
          className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-4
            gap-4
          "
        >

          {/* RESUME SCREENING */}

          <div
            className="
              bg-white
              rounded-3xl
              p-5
              border
              border-slate-200
              hover:border-violet-300
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-lg
            "
          >

            <FileText
              size={24}
              className="text-violet-600 mb-3"
            />

            <h3 className="font-bold text-slate-800">

              Resume Screening

            </h3>

            <p className="text-sm text-slate-500 mt-2">

              Automated resume processing,
              parsing and candidate screening.

            </p>

          </div>

          {/* SKILL EXTRACTION */}

          <div
            className="
              bg-white
              rounded-3xl
              p-5
              border
              border-slate-200
              hover:border-cyan-300
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-lg
            "
          >

            <Brain
              size={24}
              className="text-cyan-600 mb-3"
            />

            <h3 className="font-bold text-slate-800">

              Skill Extraction

            </h3>

            <p className="text-sm text-slate-500 mt-2">

              Extracts technical and professional
              skills from candidate resumes.

            </p>

          </div>

          {/* CANDIDATE RANKING */}

          <div
            className="
              bg-white
              rounded-3xl
              p-5
              border
              border-slate-200
              hover:border-violet-300
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-lg
            "
          >

            <TrendingUp
              size={24}
              className="text-violet-600 mb-3"
            />

            <h3 className="font-bold text-slate-800">

              Candidate Ranking

            </h3>

            <p className="text-sm text-slate-500 mt-2">

              Ranks candidates based on
              job-relevant skills and resume match.

            </p>

          </div>

          {/* SKILL GAP */}

          <div
            className="
              bg-white
              rounded-3xl
              p-5
              border
              border-slate-200
              hover:border-cyan-300
              transition-all
              duration-300
              hover:-translate-y-1
              hover:shadow-lg
            "
          >

            <Target
              size={24}
              className="text-cyan-600 mb-3"
            />

            <h3 className="font-bold text-slate-800">

              Skill Gap Analysis

            </h3>

            <p className="text-sm text-slate-500 mt-2">

              Identifies missing skills and
              supports targeted skill recovery.

            </p>

          </div>

        </div>

      </div>

      {/* =========================
          CHART SECTION
      ========================= */}

      <div
        className="
          grid
          grid-cols-1
          xl:grid-cols-2
          gap-4
        "
      >

        {/* =========================
            SCREENING STATUS
        ========================= */}

        <div
          className="
            bg-white
            rounded-3xl
            p-6
            shadow-sm
            border
            border-violet-100
          "
        >

          <div className="mb-5">

            <h3
              className="
                text-xl
                font-semibold
                text-slate-800
              "
            >

              Recruitment Screening Status

            </h3>

            <p className="text-sm text-slate-500 mt-1">

              Candidate progression through
              the recruitment process

            </p>

          </div>

          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <BarChart
              data={screeningStatusData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E2E8F0"
              />

              <XAxis
                dataKey="name"
                tick={{
                  fill: "#64748B",
                  fontSize: 13,
                }}
              />

              <YAxis
                tick={{
                  fill: "#64748B",
                  fontSize: 13,
                }}
              />

              <Tooltip />

              <Bar
                dataKey="value"
                radius={[
                  12,
                  12,
                  0,
                  0,
                ]}
              >

                {screeningStatusData.map(
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

        {/* =========================
            POSITION-WISE
        ========================= */}

        <div
          className="
            bg-white
            rounded-3xl
            p-6
            shadow-sm
            border
            border-cyan-100
          "
        >

          <div className="mb-5">

            <h3
              className="
                text-xl
                font-semibold
                text-slate-800
              "
            >

              Applications by Position

            </h3>

            <p className="text-sm text-slate-500 mt-1">

              Candidate distribution across
              job positions

            </p>

          </div>

          {positionWiseData.length > 0 ? (

            <ResponsiveContainer
              width="100%"
              height={280}
            >

              <PieChart>

                <Pie
                  data={positionWiseData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >

                  {positionWiseData.map(
                    (
                      entry,
                      index
                    ) => (

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

                </Pie>

                <Tooltip />

              </PieChart>

            </ResponsiveContainer>

          ) : (

            <div
              className="
                h-[280px]
                flex
                items-center
                justify-center
                text-slate-400
              "
            >

              No position data available

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default DashboardHome;
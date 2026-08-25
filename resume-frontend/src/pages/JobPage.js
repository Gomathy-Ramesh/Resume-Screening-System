// src/pages/JobPage.js

import React, { useEffect, useState } from "react";
import axios from "axios";

import { Button } from "../components/ui/button";

import {
  ChevronDown,
  Briefcase,
  Users,
  Target,
  Trash2,
} from "lucide-react";


// =========================
// API URL
// =========================

const API_URL = "http://localhost:8080";


// =========================
// JOB PAGE
// =========================

function JobPage() {

  // =========================
  // STATES
  // =========================

  const [jobs, setJobs] = useState([]);

  const [jobTitle, setJobTitle] = useState("");

  const [jobDescription, setJobDescription] =
    useState("");

  const [thresholdPercentage, setThresholdPercentage] =
    useState("");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [expandedJobId, setExpandedJobId] =
    useState(null);

  const [selectedStatus, setSelectedStatus] =
    useState("All");


  // =========================
  // FETCH JOBS
  // =========================

  const fetchJobs = async () => {

    try {

      const response = await axios.get(
        `${API_URL}/jobs`
      );

      setJobs(response.data);

    } catch (error) {

      console.error(
        "Error fetching jobs:",
        error
      );

    }

  };


  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {

    fetchJobs();

  }, []);


  // =========================
  // ADD JOB
  // =========================

  const addJob = async (e) => {

    e.preventDefault();

    try {

      await axios.post(
        `${API_URL}/jobs`,
        {
          jobTitle,
          jobDescription,
          thresholdPercentage,
        }
      );

      // Clear form

      setJobTitle("");

      setJobDescription("");

      setThresholdPercentage("");

      // Refresh jobs

      fetchJobs();

    } catch (error) {

      console.error(
        "Error adding job:",
        error
      );

    }

  };


  // =========================
  // DELETE JOB
  // =========================

  const deleteJob = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this job requirement?"
      );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `${API_URL}/jobs/${id}`
      );

      fetchJobs();

    } catch (error) {

      console.error(
        "Error deleting job:",
        error
      );

    }

  };


  // =========================
  // UPDATE JOB STATUS
  // =========================

  const updateJobStatus = async (
    jobId,
    status
  ) => {

    try {

      await axios.put(
        `${API_URL}/jobs/${jobId}/status`,
        {
          status: status,
        }
      );

      fetchJobs();

    } catch (error) {

      console.error(
        "Error updating job status:",
        error
      );

    }

  };


  // =========================
  // FILTER JOBS
  // =========================

  const filteredJobs = jobs.filter(
    (job) => {

      const matchesSearch =
        (job.jobTitle || "")
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      const matchesStatus =
        selectedStatus === "All"
          ? true
          : (job.status || "ACTIVE") ===
            selectedStatus;

      return (
        matchesSearch &&
        matchesStatus
      );

    }
  );


  // =========================
  // RETURN
  // =========================

  return (

    <div
      className="
        h-full
        bg-[#FAFAFF]
        px-6
        pb-2
        pt-1
        overflow-hidden
      "
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          mb-3
          flex
          flex-col
          gap-3
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        {/* LEFT */}

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
            Job & Requirement Management
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Define job requirements for AI-powered
            candidate screening and skill matching
          </p>

        </div>


        {/* SEARCH */}

        <div>

          <input
            type="text"
            placeholder="Search job requirements..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            className="
              w-full
              rounded-2xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              shadow-sm
              outline-none
              transition-all
              duration-300
              focus:border-violet-400
              focus:ring-4
              focus:ring-violet-100
              sm:w-[280px]
            "
          />

        </div>

      </div>


      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div
        className="
          grid
          h-[78vh]
          grid-cols-1
          gap-6
          lg:grid-cols-5
          items-start
        "
      >


        {/* =================================================
            LEFT SIDE - CREATE JOB
        ================================================= */}

        <div className="lg:col-span-2">

          <div
            className="
              h-[78vh]
              rounded-[32px]
              bg-white
              p-6
              border
              border-slate-200
              shadow-sm
              flex
              flex-col
            "
          >

            {/* TITLE */}

            <div
              className="
                mb-6
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
                  rounded-2xl
                  bg-gradient-to-r
                  from-violet-600
                  to-fuchsia-500
                  shadow-lg
                "
              >

                <Briefcase
                  size={22}
                  className="text-white"
                />

              </div>

              <div>

                <h2
                  className="
                    text-2xl
                    font-bold
                    text-violet-600
                  "
                >
                  Create Job Requirement
                </h2>

                <p
                  className="
                    text-xs
                    text-slate-500
                    mt-1
                  "
                >
                  Add requirements for candidate matching
                </p>

              </div>

            </div>


            {/* FORM */}

            <form
              onSubmit={addJob}
              className="
                flex
                h-full
                flex-col
                justify-between
              "
            >

              <div className="space-y-5">


                {/* JOB TITLE */}

                <div>

                  <label
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Job Title
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. Java Full Stack Developer"
                    value={jobTitle}
                    onChange={(e) =>
                      setJobTitle(
                        e.target.value
                      )
                    }
                    required
                    className="
                      w-full
                      rounded-xl
                      border
                      border-violet-200
                      px-4
                      py-3
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-100
                    "
                  />

                </div>


                {/* THRESHOLD */}

                <div>

                  <label
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Minimum Match Threshold %
                  </label>

                  <div className="relative">

                    <Target
                      size={18}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-violet-500
                      "
                    />

                    <input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="e.g. 70"
                      value={
                        thresholdPercentage
                      }
                      onChange={(e) =>
                        setThresholdPercentage(
                          e.target.value
                        )
                      }
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-violet-200
                        px-4
                        py-3
                        pl-10
                        outline-none
                        transition
                        focus:border-violet-500
                        focus:ring-4
                        focus:ring-violet-100
                      "
                    />

                  </div>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-400
                    "
                  >
                    Used as the minimum candidate
                    matching threshold.
                  </p>

                </div>


                {/* JOB DESCRIPTION */}

                <div>

                  <label
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    Job Requirements & Description
                  </label>

                  <textarea
                    rows="6"
                    placeholder="
Example:
Java, Spring Boot, React, PostgreSQL,
Docker, AWS, REST APIs...
                    "
                    value={jobDescription}
                    onChange={(e) =>
                      setJobDescription(
                        e.target.value
                      )
                    }
                    required
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-violet-200
                      px-4
                      py-3
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-100
                    "
                  />

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-400
                    "
                  >
                    Enter the technical skills,
                    qualifications and requirements
                    for this position.
                  </p>

                </div>

              </div>


              {/* ADD BUTTON */}

              <Button
                type="submit"
                className="
                  mt-5
                  w-full
                  rounded-xl
                  bg-gradient-to-r
                  from-violet-600
                  to-fuchsia-500
                  py-3
                  text-base
                  font-semibold
                  text-white
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-lg
                "
              >
                + Create Job Requirement
              </Button>

            </form>

          </div>

        </div>


        {/* =================================================
            RIGHT SIDE - JOBS
        ================================================= */}

        <div className="lg:col-span-3">

          <div
            className="
              h-[78vh]
              overflow-y-auto
              rounded-[32px]
              bg-white
              p-6
              border
              border-slate-200
              shadow-sm
            "
          >

            {/* TOP BAR */}

            <div
              className="
                mb-6
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <h2
                  className="
                    text-2xl
                    font-bold
                    text-violet-600
                  "
                >
                  Job Requirements
                </h2>

                <div
                  className="
                    rounded-lg
                    bg-violet-600
                    px-3
                    py-1
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  {jobs.length}
                </div>

              </div>


              {/* STATUS FILTER */}

              <div className="relative">

                <select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(
                      e.target.value
                    )
                  }
                  className="
                    appearance-none
                    rounded-xl
                    border
                    border-violet-200
                    bg-violet-50
                    px-5
                    py-2.5
                    pr-10
                    text-sm
                    font-semibold
                    text-violet-700
                    shadow-sm
                    transition
                    hover:border-violet-400
                    focus:border-violet-500
                    focus:ring-2
                    focus:ring-violet-200
                    outline-none
                    cursor-pointer
                  "
                >

                  <option value="All">
                    All Jobs
                  </option>

                  <option value="ACTIVE">
                    Active
                  </option>

                  <option value="ON_HOLD">
                    On Hold
                  </option>

                  <option value="CLOSED">
                    Closed
                  </option>

                </select>

                <ChevronDown
                  size={16}
                  className="
                    pointer-events-none
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-violet-600
                  "
                />

              </div>

            </div>


            {/* JOB CARDS */}

            <div className="space-y-5">

              {filteredJobs.length > 0 ? (

                filteredJobs.map(
                  (job) => (

                    <div
                      key={job.jobId}
                      className="
                        rounded-3xl
                        border
                        border-slate-200
                        bg-white
                        p-6
                        shadow-sm
                        transition-all
                        duration-300
                        hover:shadow-xl
                        hover:-translate-y-1
                        hover:border-violet-200
                      "
                    >

                      {/* TOP */}

                      <div
                        className="
                          mb-4
                          flex
                          flex-col
                          gap-4
                          md:flex-row
                          md:items-center
                          md:justify-between
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

                            <Briefcase
                              size={20}
                              className="
                                text-violet-600
                              "
                            />

                            <h3
                              className="
                                text-xl
                                font-bold
                                text-slate-800
                              "
                            >
                              {job.jobTitle}
                            </h3>

                          </div>


                          {/* STATUS */}

                          <span
                            className={`
                              mt-2
                              inline-flex
                              items-center
                              rounded-full
                              px-3
                              py-1
                              text-[11px]
                              font-medium
                              border

                              ${
                                (
                                  job.status ||
                                  "ACTIVE"
                                ) === "ACTIVE"

                                  ? `
                                    bg-emerald-500
                                    text-white
                                    border-emerald-400
                                  `

                                  : (
                                    job.status ||
                                    "ACTIVE"
                                  ) === "ON_HOLD"

                                  ? `
                                    bg-amber-500
                                    text-white
                                    border-amber-400
                                  `

                                  : `
                                    bg-rose-500
                                    text-white
                                    border-rose-400
                                  `
                              }
                            `}
                          >

                            {job.status ||
                              "ACTIVE"}

                          </span>

                        </div>


                        {/* THRESHOLD */}

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <span
                            className="
                              rounded-full
                              bg-violet-600
                              px-4
                              py-2
                              text-sm
                              font-semibold
                              text-white
                            "
                          >

                            Match ≥{" "}
                            {
                              job.thresholdPercentage
                            }%

                          </span>

                        </div>

                      </div>


                      {/* STATUS UPDATE */}

                      <div
                        className="
                          mb-4
                          flex
                          flex-wrap
                          items-center
                          gap-3
                        "
                      >

                        <span
                          className="
                            text-xs
                            font-semibold
                            text-slate-500
                          "
                        >
                          Job Status:
                        </span>

                        <select
                          className="
                            rounded-xl
                            border
                            border-violet-200
                            px-3
                            py-2
                            text-sm
                            outline-none
                            focus:border-violet-500
                          "
                          value={
                            job.status ||
                            "ACTIVE"
                          }
                          onChange={(e) =>
                            updateJobStatus(
                              job.jobId,
                              e.target.value
                            )
                          }
                        >

                          <option value="ACTIVE">
                            Active
                          </option>

                          <option value="ON_HOLD">
                            On Hold
                          </option>

                          <option value="CLOSED">
                            Closed
                          </option>

                        </select>

                      </div>


                      {/* CANDIDATE COUNT */}

                      <div className="mb-4">

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-violet-100
                            px-3
                            py-2
                            text-sm
                            font-semibold
                            text-violet-700
                          "
                        >

                          <Users size={16} />

                          Candidates Matched:

                          {" "}

                          {
                            job.candidateCount ||
                            0
                          }

                        </span>

                      </div>


                      {/* DESCRIPTION */}

                      <p
                        className="
                          mb-5
                          text-sm
                          leading-7
                          text-slate-600
                        "
                      >

                        {
                          job.jobDescription
                            ?.substring(
                              0,
                              160
                            )
                        }

                        {job.jobDescription
                          ?.length > 160 &&
                          "..."}
                      </p>


                      {/* BUTTONS */}

                      <div
                        className="
                          flex
                          flex-wrap
                          gap-3
                        "
                      >

                        {/* VIEW */}

                        <Button
                          onClick={() =>
                            setExpandedJobId(

                              expandedJobId ===
                              job.jobId

                                ? null

                                : job.jobId
                            )
                          }
                          className="
                            rounded-xl
                            bg-violet-600
                            text-white
                            hover:bg-violet-700
                          "
                        >

                          {
                            expandedJobId ===
                            job.jobId

                              ? "Hide Requirements"

                              : "View Requirements"
                          }

                        </Button>


                        {/* DELETE */}

                        <Button
                          variant="outline"
                          onClick={() =>
                            deleteJob(
                              job.jobId
                            )
                          }
                          className="
                            rounded-xl
                            border-violet-300
                            text-violet-700
                            hover:bg-violet-100
                          "
                        >

                          <Trash2
                            size={16}
                            className="mr-2"
                          />

                          Delete Job

                        </Button>

                      </div>


                      {/* EXPANDED SECTION */}

                      {
                        expandedJobId ===
                        job.jobId && (

                          <div
                            className="
                              mt-5
                              rounded-2xl
                              border
                              border-violet-100
                              bg-violet-50
                              p-5
                            "
                          >

                            <h4
                              className="
                                mb-3
                                text-lg
                                font-bold
                                text-violet-600
                              "
                            >
                              Full Job Requirements
                            </h4>

                            <p
                              className="
                                text-sm
                                leading-8
                                text-slate-600
                              "
                            >
                              {
                                job.jobDescription
                              }
                            </p>

                          </div>

                        )
                      }

                    </div>

                  )
                )

              ) : (

                <div
                  className="
                    rounded-2xl
                    border
                    border-dashed
                    border-slate-300
                    p-10
                    text-center
                    text-slate-500
                  "
                >

                  No Job Requirements Found

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default JobPage;
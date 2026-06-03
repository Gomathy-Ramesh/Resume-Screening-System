import React, { useEffect, useState } from "react";
import axios from "axios";

import { Button } from "../components/ui/button";
import { ChevronDown } from "lucide-react";

function JobPage() {

  // =========================
  // STATES
  // =========================

  const [jobs, setJobs] = useState([]);

  const [jobTitle, setJobTitle] =
    useState("");

  const [
    jobDescription,
    setJobDescription,
  ] = useState("");

  const [
    thresholdPercentage,
    setThresholdPercentage,
  ] = useState("");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    expandedJobId,
    setExpandedJobId,
  ] = useState(null);

  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState("All");
  // =========================
  // FETCH JOBS
  // =========================

  const fetchJobs = async () => {

    try {

      const response =
        await axios.get(
          "http://localhost:8080/jobs"
        );

      setJobs(response.data);

    } catch (error) {

      console.error(error);
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
        "http://localhost:8080/jobs",
        {
          jobTitle,
          jobDescription,
          thresholdPercentage,
        }
      );

      setJobTitle("");

      setJobDescription("");

      setThresholdPercentage("");

      fetchJobs();

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // DELETE JOB
  // =========================

  const deleteJob = async (id) => {

    try {

      await axios.delete(
        `http://localhost:8080/jobs/${id}`
      );

      fetchJobs();

    } catch (error) {

      console.error(error);
    }
  };

  // =========================
  // FILTER JOBS
  // =========================

  const filteredJobs =
  jobs.filter((job) => {

    const matchesSearch =
      job.jobTitle
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
  });

  return (

    <div className="h-full bg-slate-50 px-6 pb-2 pt-1 overflow-hidden">

      {/* =========================
          HEADER
      ========================= */}

      <div className="mb-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">

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
            Job Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and track active job roles
          </p>

        </div>

        {/* RIGHT */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search jobs..."
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
sm:w-[250px]
"
          />

        </div>

      </div>

      {/* =========================
          MAIN GRID
      ========================= */}

      <div className="grid h-[78vh] grid-cols-1 gap-6 lg:grid-cols-5 items-start">

        {/* =========================
            LEFT SIDE
        ========================= */}

        <div className="lg:col-span-2">

          {/* SAME HEIGHT */}

          <div className="
h-[78vh]
rounded-[32px]
bg-white
p-6
border
border-slate-200
shadow-sm
flex
flex-col
">

            <h2 className="mb-6 text-2xl font-bold text-violet-600">
              Add New Job
            </h2>

            <form
              onSubmit={addJob}
              className="flex h-full flex-col justify-between"
            >
              <div className="space-y-4"></div>

              {/* JOB TITLE */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Job Title
                </label>

                <input
                  type="text"
                  placeholder="Enter job title"
                  value={jobTitle}
                  onChange={(e) =>
                    setJobTitle(
                      e.target.value
                    )
                  }
                  required
                  className="w-full rounded-xl border border-violet-200 px-4 py-3 outline-none transition focus:border-violet-500"
                />

              </div>

              {/* THRESHOLD */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Match Threshold %
                </label>

                <input
                  type="number"
                  placeholder="Enter threshold"
                  value={
                    thresholdPercentage
                  }
                  onChange={(e) =>
                    setThresholdPercentage(
                      e.target.value
                    )
                  }
                  required
                  className="w-full rounded-xl border border-violet-200 px-4 py-3 outline-none transition focus:border-violet-500"
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Job Description
                </label>

                <textarea
                  rows="2"
                  placeholder="Enter job description..."
                  value={jobDescription}
                  onChange={(e) =>
                    setJobDescription(
                      e.target.value
                    )
                  }
                  required
                  className="w-full resize-none rounded-xl border border-violet-200 px-4 py-3 outline-none transition focus:border-violet-500"
                />

              </div>

              {/* BUTTON */}

              <Button
                type="submit"
                className="w-full rounded-xl bg-violet-600 py-3 text-base font-semibold text-white hover:bg-violet-700"
              >
                + Add Job
              </Button>

            </form>

          </div>

        </div>

        {/* =========================
            RIGHT SIDE
        ========================= */}

        <div className="lg:col-span-3">

          {/* SAME HEIGHT AS LEFT */}

          <div className="
h-[78vh]
overflow-y-auto
rounded-[32px]
bg-white
p-6
border
border-slate-200
shadow-sm
">

            {/* TOP BAR */}

            <div className="mb-6 flex items-center justify-between">

              <div className="flex items-center gap-3">

                 <h2 className="text-2xl font-bold text-violet-600">
                    Available Jobs
                 </h2>

                 <div className="rounded-lg bg-violet-600 px-3 py-1 text-sm font-bold text-white">
                    {jobs.length}
                 </div>

              </div>

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

                filteredJobs.map((job) => (

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

                    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                      <div>

                        <h3 className="mb-2 text-xl font-bold text-slate-800">
                          {job.jobTitle}
                        </h3>

                        <span
  className={`
    inline-flex
    items-center
    rounded-full
    px-3
    py-1
    text-[11px]
    font-medium
    border
    shadow-sm
    transition-all
    duration-300

    ${
      (job.status || "ACTIVE") === "ACTIVE"

        ? `
          bg-gradient-to-r
          from-emerald-500
          to-green-600
          text-white
          border-green-400/30
          shadow-[0_8px_20px_rgba(34,197,94,0.25)]
        `

        : (job.status || "ACTIVE") === "ON_HOLD"

        ? `
          bg-gradient-to-r
          from-amber-400
          to-orange-500
          text-white
          border-orange-300/30
          shadow-[0_8px_20px_rgba(251,191,36,0.25)]
        `

        : `
          bg-gradient-to-r
          from-rose-500
          to-red-600
          text-white
          border-red-300/30
          shadow-[0_8px_20px_rgba(239,68,68,0.25)]
        `
    }
  `}
>
  {job.status || "ACTIVE"}
</span>

                      </div>

                      {/* THRESHOLD */}

                      <div className="w-fit rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white">

                        {
                          job.thresholdPercentage
                        }%

                      </div>

                      <select
                        className="rounded-xl border border-violet-200 px-3 py-2 text-sm"

                        value={
                            job.status || "ACTIVE"
                         }

                       onChange={async (e) => {

                       try {

                          await axios.put(
                         `http://localhost:8080/jobs/${job.jobId}/status`,
                          {
                              status:
                              e.target.value,
                          }
                        );

                          fetchJobs();

                         } catch (error) {

                           console.error(error);
                         }
                      }}
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

                      <span className="rounded-lg bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-700">

                        Candidates Applied :
                        {" "}
                        {
                          job.candidateCount || 0
                        }

                      </span>

                    </div>

                    {/* DESCRIPTION */}

                    <p className="mb-5 text-sm leading-7 text-slate-600">

                      {
                        job.jobDescription?.substring(
                          0,
                          120
                        )
                      }
                      ...

                    </p>

                    {/* BUTTONS */}

                    <div className="flex flex-wrap gap-3">

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
                        className="rounded-xl bg-violet-600 text-white hover:bg-violet-700"
                      >

                        {
                          expandedJobId ===
                          job.jobId

                            ? "Hide"

                            : "View More"
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
                        className="rounded-xl border-violet-300 text-violet-700 hover:bg-violet-100"
                      >
                        Delete
                      </Button>

                    </div>

                    {/* EXPANDED SECTION */}

                    {
                      expandedJobId ===
                      job.jobId && (

                        <div className="mt-5 rounded-2xl border border-violet-100 bg-white p-5">

                          <h4 className="mb-3 text-lg font-bold text-violet-600">
                            Full Job Description
                          </h4>

                          <p className="text-sm leading-8 text-slate-600">

                            {
                              job.jobDescription
                            }

                          </p>

                        </div>
                      )
                    }

                  </div>
                ))

              ) : (

                <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
                  No Jobs Found
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
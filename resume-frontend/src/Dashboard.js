import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

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
  Legend,
  ResponsiveContainer,
} from "recharts";

function Dashboard({ handleLogout }) {

  // =========================
  // STATES
  // =========================

  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    experience: "",
    education: "",
    appliedPosition: "",
    jobDescription: "",
  });

  const [resume, setResume] = useState(null);

  const [candidates, setCandidates] = useState([]);

  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");

  const [sortOrder, setSortOrder] = useState("high");

  const [darkMode, setDarkMode] = useState(false);

  // =========================
  // FETCH CANDIDATES
  // =========================

  const fetchCandidates = async () => {

    try {

      const response = await axios.get(
        "http://localhost:8080/candidates"
      );

      setCandidates(response.data);

    } catch (error) {

      console.error("Error fetching candidates:", error);
    }
  };

  // =========================
  // FETCH JOBS
  // =========================

  const fetchJobs = async () => {

    try {

      const response = await axios.get(
        "http://localhost:8080/jobs"
      );

      setJobs(response.data);

    } catch (error) {

      console.error("Error fetching jobs:", error);
    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {

    fetchCandidates();

    fetchJobs();

  }, []);

  // =========================
  // DASHBOARD STATS
  // =========================

  const totalCandidates = candidates.length;

  const highestScore =
    candidates.length > 0
      ? Math.max(...candidates.map((c) => c.score))
      : 0;

  const acceptedCandidates = candidates.filter(
    (candidate) => candidate.status === "Accepted"
  ).length;

  const rejectedCandidates = candidates.filter(
    (candidate) => candidate.status === "Not Selected"
  ).length;

  // =========================
  // CHART DATA
  // =========================

  const chartData = [
    {
      name: "Accepted",
      count: acceptedCandidates,
    },
    {
      name: "Rejected",
      count: rejectedCandidates,
    },
  ];

  const COLORS = ["#198754", "#dc3545"];

  // =========================
  // HANDLE INPUT
  // =========================

  const handleChange = (e) => {

    setCandidate({
      ...candidate,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // HANDLE POSITION CHANGE
  // =========================

  const handlePositionChange = (e) => {

    const selectedRole = e.target.value;

    const selectedJob = jobs.find(
      (job) => job.jobTitle === selectedRole
    );

    setCandidate({
      ...candidate,
      appliedPosition: selectedRole,
      jobDescription:
        selectedJob?.jobDescription || "",
    });
  };

  // =========================
  // HANDLE FILE
  // =========================

  const handleFileChange = (e) => {

    setResume(e.target.files[0]);
  };

  // =========================
  // UPLOAD CANDIDATE
  // =========================

  const handleSubmit = async (e) => {

    e.preventDefault();

    const formData = new FormData();

    formData.append("name", candidate.name);
    formData.append("email", candidate.email);
    formData.append("phoneNumber", candidate.phoneNumber);
    formData.append("experience", candidate.experience);
    formData.append("education", candidate.education);
    formData.append(
      "appliedPosition",
      candidate.appliedPosition
    );

    formData.append("resume", resume);

    try {

      await axios.post(
        "http://localhost:8080/candidates/upload",
        formData
      );

      alert("Candidate Uploaded Successfully");

      setCandidate({
        name: "",
        email: "",
        phoneNumber: "",
        experience: "",
        education: "",
        appliedPosition: "",
        jobDescription: "",
      });

      setResume(null);

      fetchCandidates();

    } catch (error) {

      console.error(error);

      alert("Upload Failed");
    }
  };

  // =========================
  // DELETE CANDIDATE
  // =========================

  const deleteCandidate = async (id) => {

    try {

      await axios.delete(
        `http://localhost:8080/candidates/${id}`
      );

      alert("Candidate Deleted");

      fetchCandidates();

    } catch (error) {

      console.error(error);
    }
  };

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
  // EXPORT TO EXCEL
  // =========================

  const exportToExcel = () => {

    const excelData = sortedCandidates.map(
      (candidate) => ({

        ID: candidate.candidateId,

        Name: candidate.name,

        Email: candidate.email,

        Position:
          candidate.appliedPosition,

        Experience:
          candidate.experience,

        Skills: candidate.skills,

        MatchPercentage:
          candidate.score,

        Rank: candidate.ranking,

        Status: candidate.status,
      })
    );

    const worksheet =
      XLSX.utils.json_to_sheet(
        excelData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Candidates"
    );

    const excelBuffer =
      XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

    const data = new Blob(
      [excelBuffer],
      {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      }
    );

    saveAs(
      data,
      "Candidates_Report.xlsx"
    );
  };

  // =========================
  // SEARCH FILTER
  // =========================

  const filteredCandidates = candidates.filter(
    (candidate) =>

      candidate.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||

      candidate.skills
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||

      candidate.appliedPosition
        ?.toLowerCase()
        .includes(search.toLowerCase())
  );

  // =========================
  // SORTING
  // =========================

  const sortedCandidates = [...filteredCandidates]
    .sort((a, b) => {

      if (sortOrder === "high") {

        return b.score - a.score;
      }

      return a.score - b.score;
    });

  return (

    <div
      className={
        darkMode
          ? "bg-dark text-white min-vh-100"
          : "bg-light text-dark min-vh-100"
      }
    >

      <div className="container py-5">

        {/* HEADER */}

        <div className="d-flex justify-content-between align-items-center mb-4">

          <h2 className="text-primary">
            AI Resume Screening System
          </h2>

          <div>

            <button
              className={
                darkMode
                  ? "btn btn-light me-2"
                  : "btn btn-dark me-2"
              }
              onClick={() =>
                setDarkMode(!darkMode)
              }
            >
              {darkMode
                ? "Light Mode ☀️"
                : "Dark Mode 🌙"}
            </button>

            <button
              className="btn btn-danger"
              onClick={handleLogout}
            >
              Logout
            </button>

          </div>

        </div>

        {/* DASHBOARD CARDS */}

        <div className="row mb-4">

          <div className="col-md-3">

            <div className="card bg-primary text-white shadow">

              <div className="card-body text-center">

                <h5>Total Candidates</h5>

                <h2>{totalCandidates}</h2>

              </div>

            </div>

          </div>

          <div className="col-md-3">

            <div className="card bg-success text-white shadow">

              <div className="card-body text-center">

                <h5>Highest Match %</h5>

                <h2>{highestScore}%</h2>

              </div>

            </div>

          </div>

          <div className="col-md-3">

            <div className="card bg-info text-white shadow">

              <div className="card-body text-center">

                <h5>Accepted</h5>

                <h2>{acceptedCandidates}</h2>

              </div>

            </div>

          </div>

          <div className="col-md-3">

            <div className="card bg-danger text-white shadow">

              <div className="card-body text-center">

                <h5>Rejected</h5>

                <h2>{rejectedCandidates}</h2>

              </div>

            </div>

          </div>

        </div>

        {/* CHARTS */}

        <div className="row mb-5">

          {/* BAR CHART */}

          <div className="col-md-6 mb-4">

            <div className="card shadow p-4 h-100">

              <h4 className="mb-4 text-center">
                Candidate Analytics
              </h4>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart data={chartData}>

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="name" />

                  <YAxis />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="count"
                    fill="#0d6efd"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* PIE CHART */}

          <div className="col-md-6 mb-4">

            <div className="card shadow p-4 h-100">

              <h4 className="mb-4 text-center">
                Selection Ratio
              </h4>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    label
                  >

                    {chartData.map(
                      (entry, index) => (

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

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </div>

        {/* FORM */}

        <div
          className={
            darkMode
              ? "card bg-secondary text-white shadow p-4"
              : "card shadow p-4"
          }
        >

          <h4 className="mb-4">
            Upload Candidate
          </h4>

          <form onSubmit={handleSubmit}>

            <div className="mb-3">

              <label>Name</label>

              <input
                type="text"
                name="name"
                value={candidate.name}
                className="form-control"
                onChange={handleChange}
                required
              />

            </div>

            <div className="mb-3">

              <label>Email</label>

              <input
                type="email"
                name="email"
                value={candidate.email}
                className="form-control"
                onChange={handleChange}
                required
              />

            </div>

            <div className="mb-3">

              <label>Phone Number</label>

              <input
                type="text"
                name="phoneNumber"
                value={candidate.phoneNumber}
                className="form-control"
                onChange={handleChange}
                required
              />

            </div>

            <div className="mb-3">

              <label>Experience</label>

              <input
                type="number"
                name="experience"
                value={candidate.experience}
                className="form-control"
                onChange={handleChange}
                required
              />

            </div>

            <div className="mb-3">

              <label>Education</label>

              <input
                type="text"
                name="education"
                value={candidate.education}
                className="form-control"
                onChange={handleChange}
                required
              />

            </div>

            <div className="mb-3">

              <label>Applied Position</label>

              <select
                className="form-select"
                value={candidate.appliedPosition}
                onChange={handlePositionChange}
                required
              >

                <option value="">
                  Select Position
                </option>

                {jobs.map((job) => (

                  <option
                    key={job.jobId}
                    value={job.jobTitle}
                  >
                    {job.jobTitle}
                  </option>

                ))}

              </select>

            </div>

            <div className="mb-3">

              <label>Job Description</label>

              <textarea
                rows="5"
                className="form-control"
                value={candidate.jobDescription}
                readOnly
              />

            </div>

            <div className="mb-3">

              <label>Upload Resume</label>

              <input
                type="file"
                className="form-control"
                onChange={handleFileChange}
                required
              />

            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
            >
              Upload Candidate
            </button>

          </form>

        </div>

        {/* SEARCH + SORT */}

        <div className="row mt-5 mb-3">

          <div className="col-md-5">

            <input
              type="text"
              placeholder="Search by Name / Skills / Position"
              className="form-control"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="col-md-4">

            <select
              className="form-select"
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value)
              }
            >

              <option value="high">
                Sort Match % High to Low
              </option>

              <option value="low">
                Sort Match % Low to High
              </option>

            </select>

          </div>

          <div className="col-md-3">

            <button
              className="btn btn-success w-100"
              onClick={exportToExcel}
            >
              Download Excel
            </button>

          </div>

        </div>

        {/* CANDIDATE TABLE */}

        <div className="mt-4">

          <h3 className="mb-3">
            Candidate List
          </h3>

          <div className="table-responsive">

            <table className="table table-bordered table-striped table-hover shadow">

              <thead className="table-dark">

                <tr>

                  <th>ID</th>
                  <th>Name</th>
                  <th>Position</th>
                  <th>Email</th>
                  <th>Experience</th>
                  <th>Skills</th>
                  <th>Match %</th>
                  <th>Rank</th>
                  <th>Status</th>
                  <th>Resume</th>
                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {sortedCandidates.map((candidate) => (

                  <tr key={candidate.candidateId}>

                    <td>{candidate.candidateId}</td>

                    <td>{candidate.name}</td>

                    <td>{candidate.appliedPosition}</td>

                    <td>{candidate.email}</td>

                    <td>
                      {candidate.experience} Years
                    </td>

                    <td>{candidate.skills}</td>

                    <td>

                      <span className="badge bg-success">
                        {candidate.score}%
                      </span>

                    </td>

                    <td>

                      <span className="badge bg-primary">
                        {candidate.ranking}
                      </span>

                    </td>

                    <td>

                      {candidate.status ===
                      "Accepted" ? (

                        <span className="badge bg-success">
                          Accepted
                        </span>

                      ) : (

                        <span className="badge bg-danger">
                          Not Selected
                        </span>

                      )}

                    </td>

                    <td>

                        <button
                           className="btn btn-info btn-sm"
                           onClick={() =>
                            viewResume(
                              candidate.resumeUrl
                            )
                          }
                        >
                          View Resume
                        </button>

                    </td>

                    <td>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          deleteCandidate(
                            candidate.candidateId
                          )
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;
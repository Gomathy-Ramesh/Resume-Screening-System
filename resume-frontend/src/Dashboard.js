import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

function Dashboard({ handleLogout }) {

  const [candidate, setCandidate] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    experience: "",
    education: "",
  });

  const [resume, setResume] = useState(null);

  const [candidates, setCandidates] = useState([]);

  // SEARCH
  const [search, setSearch] = useState("");

  // SORT
  const [sortOrder, setSortOrder] = useState("high");

  // DARK MODE
  const [darkMode, setDarkMode] = useState(false);

  // DASHBOARD STATS

  const totalCandidates = candidates.length;

  const highestScore =
    candidates.length > 0
      ? Math.max(...candidates.map(c => c.score))
      : 0;

  const javaDevelopers = candidates.filter(
    (candidate) =>
      candidate.skills &&
      candidate.skills.toLowerCase().includes("java")
  ).length;

  const pythonDevelopers = candidates.filter(
    (candidate) =>
      candidate.skills &&
      candidate.skills.toLowerCase().includes("python")
  ).length;

  // FETCH ALL CANDIDATES
  const fetchCandidates = async () => {

    try {

      const response = await axios.get(
        "http://localhost:8080/candidates"
      );

      setCandidates(response.data);

    } catch (error) {

      console.error(error);
    }
  };

  // LOAD DATA
  useEffect(() => {

    fetchCandidates();

  }, []);

  // HANDLE INPUT
  const handleChange = (e) => {

    setCandidate({
      ...candidate,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE FILE
  const handleFileChange = (e) => {

    setResume(e.target.files[0]);
  };

  // UPLOAD CANDIDATE
  const handleSubmit = async (e) => {

    e.preventDefault();

    const formData = new FormData();

    formData.append("name", candidate.name);
    formData.append("email", candidate.email);
    formData.append("phoneNumber", candidate.phoneNumber);
    formData.append("experience", candidate.experience);
    formData.append("education", candidate.education);
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
      });

      setResume(null);

      fetchCandidates();

    } catch (error) {

      console.error(error);

      alert("Upload Failed");
    }
  };

  // DELETE CANDIDATE
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

  // DOWNLOAD RESUME
  const downloadResume = (id) => {

    window.open(
      `http://localhost:8080/candidates/download/${id}`,
      "_blank"
    );
  };

  // FILTER SEARCH
  const filteredCandidates = candidates.filter((candidate) =>
    candidate.name.toLowerCase().includes(search.toLowerCase()) ||
    candidate.skills?.toLowerCase().includes(search.toLowerCase())
  );

  // SORT SCORE
  const sortedCandidates = [...filteredCandidates].sort((a, b) => {

    if (sortOrder === "high") {
      return b.score - a.score;
    } else {
      return a.score - b.score;
    }
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
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
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

                <h5>Highest Score</h5>

                <h2>{highestScore}</h2>

              </div>
            </div>

          </div>

          <div className="col-md-3">

            <div className="card bg-warning text-dark shadow">
              <div className="card-body text-center">

                <h5>Java Developers</h5>

                <h2>{javaDevelopers}</h2>

              </div>
            </div>

          </div>

          <div className="col-md-3">

            <div className="card bg-info text-white shadow">
              <div className="card-body text-center">

                <h5>Python Developers</h5>

                <h2>{pythonDevelopers}</h2>

              </div>
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

          <h4 className="mb-4">Upload Candidate</h4>

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

        {/* SEARCH */}

        <div className="row mt-5">

          <div className="col-md-6">

            <input
              type="text"
              placeholder="Search by Name or Skills"
              className="form-control"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

          <div className="col-md-6">

            <select
              className="form-select"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="high">
                Sort Score High to Low
              </option>

              <option value="low">
                Sort Score Low to High
              </option>

            </select>

          </div>

        </div>

        {/* TABLE */}

        <div className="mt-5">

          <h3 className="mb-3">
            Candidate List
          </h3>

          <table className="table table-bordered table-striped table-hover shadow">

            <thead className="table-dark">

              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Experience</th>
                <th>Education</th>
                <th>Skills</th>
                <th>Score</th>
                <th>Rank</th>
                <th>Resume</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {sortedCandidates.map((candidate) => (

                <tr key={candidate.candidateId}>

                  <td>{candidate.candidateId}</td>

                  <td>{candidate.name}</td>

                  <td>{candidate.email}</td>

                  <td>{candidate.experience} Years</td>

                  <td>{candidate.education}</td>

                  <td>{candidate.skills}</td>

                  <td>

                    <span className="badge bg-success">
                      {candidate.score}
                    </span>

                  </td>

                  <td>

                    <span className="badge bg-primary">
                      {candidate.ranking}
                    </span>

                  </td>

                  <td>

                    <button
                      className="btn btn-info btn-sm"
                      onClick={() =>
                        downloadResume(candidate.candidateId)
                      }
                    >
                      Download
                    </button>

                  </td>

                  <td>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        deleteCandidate(candidate.candidateId)
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
  );
}

export default Dashboard;
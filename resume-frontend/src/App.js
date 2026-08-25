import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Sparkles,
  Trophy,
  UserCheck,
  BarChart3,
  Eye,
  EyeOff,
  ShieldCheck,
  UserRound,
  ArrowLeft,
  Loader2,
} from "lucide-react";

import "./index.css";

import Navbar from "./components/Navbar";

import DashboardHome from "./pages/DashboardHome";
import CandidatePage from "./pages/CandidatePage";
import RankingPage from "./pages/RankingPage";
import JobPage from "./pages/JobPage";
import SkillPage from "./pages/SkillGapPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import TechnicalAssessmentPage from "./components/ui/TechnicalAssessmentPage";

import SkillRecovery from "./components/ui/SkillRecovery";
import CandidateSkillRecovery from "./components/ui/CandidateSkillRecovery";

// ======================================================
// INTERVIEWS
// ======================================================

import Interviews from "./components/ui/Interviews";

// ======================================================
// BACKEND URL
// ======================================================

const API_URL = "http://localhost:8080";

// ======================================================
// SHARED CANDIDATE LOGIN
// ======================================================

const CANDIDATE_USERNAME = "candidate";
const CANDIDATE_PASSWORD = "candidate123";

// ======================================================
// RESET PASSWORD / MAIN APP ROUTING
// ======================================================

function AppContent() {
  const location = useLocation();

  if (location.pathname === "/reset-password") {
    return <ResetPasswordPage />;
  }

  return <App />;
}

// ======================================================
// RECRUITER / ADMIN SKILL RECOVERY ROUTE
// ======================================================

function RecruiterSkillRecoveryRoute() {
  const { candidateId, jobId } = useParams();

  return (
    <SkillRecovery
      candidateId={candidateId}
      jobId={jobId}
    />
  );
}

// ======================================================
// CANDIDATE SKILL RECOVERY ROUTE
// ======================================================

function CandidateSkillRecoveryRoute() {
  const { candidateId, jobId } = useParams();

  return (
    <CandidateSkillRecovery
      candidateId={candidateId}
      jobId={jobId}
    />
  );
}

// ======================================================
// PORTAL SELECTION PAGE
// ======================================================

function PortalSelection({
  onSelectAdmin,
  onSelectCandidate,
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 px-6">

      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl" />

      <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-white/95 backdrop-blur-xl border border-white/20 p-10 shadow-[0_0_60px_rgba(139,92,246,0.3)]">

        <div className="text-center mb-8">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 shadow-xl">
            <span className="text-3xl font-bold text-white">
              T
            </span>
          </div>

          <h1 className="text-4xl font-bold text-slate-800">
            TalentIQ
          </h1>

          <p className="mt-2 text-slate-500">
            AI-Powered Recruitment Intelligence & Skill Recovery Platform
          </p>

          <p className="mt-6 text-lg font-semibold text-slate-700">
            Choose your portal
          </p>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <button
            type="button"
            onClick={onSelectAdmin}
            className="group rounded-2xl border border-violet-200 bg-violet-50 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-violet-400 hover:bg-violet-100 hover:shadow-xl"
          >

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg">
              <ShieldCheck size={28} />
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              Recruiter / Admin
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Access candidate screening, ranking, jobs, skill gaps and recruiter skill recovery.
            </p>

            <div className="mt-5 font-semibold text-violet-600">
              Continue to Admin Login →
            </div>

          </button>

          <button
            type="button"
            onClick={onSelectCandidate}
            className="group rounded-2xl border border-cyan-200 bg-cyan-50 p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400 hover:bg-cyan-100 hover:shadow-xl"
          >

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg">
              <UserRound size={28} />
            </div>

            <h2 className="text-xl font-bold text-slate-800">
              Candidate
            </h2>

            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Access your application and continue your personalized skill recovery program.
            </p>

            <div className="mt-5 font-semibold text-cyan-600">
              Continue to Candidate Login →
            </div>

          </button>

        </div>
      </div>
    </div>
  );
}

// ======================================================
// ADMIN LOGIN PAGE
// ======================================================

function AdminLogin({
  onLogin,
  onSwitchToCandidate,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          username,
          password,
        }
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      if (rememberMe) {
        localStorage.setItem(
          "rememberAdmin",
          "true"
        );
      } else {
        localStorage.removeItem("rememberAdmin");
      }

      onLogin();

    } catch (error) {
      alert(
        error.response?.data ||
        "Invalid Username or Password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const email = prompt(
      "Enter your registered email:"
    );

    if (!email) return;

    try {
      const response = await axios.post(
        `${API_URL}/auth/forgot-password`,
        {
          email,
        }
      );

      alert(response.data);

    } catch (error) {
      alert(
        error.response?.data ||
        "Unable to process request"
      );
    }
  };

  return (
    <div className="relative min-h-screen flex overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 gradient-animated">

      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl glow-orb" />

      <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl glow-orb" />

      <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl glow-orb" />

      <div className="hidden lg:flex w-3/5 flex-col justify-center px-20 text-white">

        <div>

          <h1 className="font-logo text-8xl font-black tracking-tighter mb-4 bg-gradient-to-r from-white via-violet-100 to-fuchsia-200 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,255,255,0.35)]">
            TalentIQ
          </h1>

          <p className="text-xl text-violet-100 mb-10 max-w-xl leading-relaxed">
            AI-Powered Recruitment Intelligence & Skill Recovery Platform
          </p>

          <div className="space-y-5">

            <div className="flex items-center gap-4 text-lg">
              <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
                <Sparkles size={20} className="text-violet-100" />
              </div>

              <span className="font-medium">
                Resume Screening
              </span>
            </div>

            <div className="flex items-center gap-4 text-lg">
              <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
                <Trophy size={20} className="text-violet-100" />
              </div>

              <span className="font-medium">
                Skill Extraction
              </span>
            </div>

            <div className="flex items-center gap-4 text-lg">
              <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
                <UserCheck size={20} className="text-violet-100" />
              </div>

              <span className="font-medium">
                Candidate Ranking
              </span>
            </div>

            <div className="flex items-center gap-4 text-lg">
              <div className="p-2 rounded-xl bg-white/15 backdrop-blur-md">
                <BarChart3 size={20} className="text-violet-100" />
              </div>

              <span className="font-medium">
                Skill Gap Analysis
              </span>
            </div>

          </div>
        </div>
      </div>

      <div className="w-full lg:w-2/5 flex items-center justify-center px-6">

        <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-xl border border-white/20 p-10 shadow-[0_0_60px_rgba(139,92,246,0.25)]">

          <div className="mb-8 text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 shadow-xl">
              <span className="text-3xl font-bold text-white">
                T
              </span>
            </div>

            <h1 className="text-3xl font-bold text-slate-800">
              TalentIQ
            </h1>

            <p className="mt-2 text-slate-500">
              Welcome to TalentIQ Admin Portal
            </p>

          </div>

          <form onSubmit={handleLogin}>

            <div className="mb-5">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
                placeholder="Enter username"
                className="h-12 w-full rounded-xl border border-violet-200 px-4 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />

            </div>

            <div className="mb-6">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                  placeholder="Enter password"
                  className="h-12 w-full rounded-xl border border-violet-200 px-4 pr-12 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>
            </div>

            <div className="mb-6 flex items-center justify-between">

              <label className="flex items-center gap-2 text-sm text-slate-600">

                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(
                      e.target.checked
                    )
                  }
                  className="accent-violet-600"
                />

                Remember Me

              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-violet-600"
              >
                Forgot Password?
              </button>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 font-semibold text-white disabled:opacity-60"
            >

              {loading ? (
                <span className="flex items-center justify-center gap-2">

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Signing In...

                </span>
              ) : (
                "Admin Sign In"
              )}

            </button>

          </form>

          <div className="mt-6">

            <div className="relative my-5">

              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>

              <div className="relative flex justify-center">

                <span className="bg-white px-3 text-xs text-slate-400">
                  OR
                </span>

              </div>

            </div>

            <button
              type="button"
              onClick={onSwitchToCandidate}
              className="h-12 w-full rounded-xl border border-violet-200 bg-violet-50 font-semibold text-violet-700"
            >

              <span className="flex items-center justify-center gap-2">

                <UserRound size={18} />

                Candidate Login

              </span>

            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

// ======================================================
// CANDIDATE LOGIN
// ======================================================

function CandidateLogin({
  onLogin,
  onBack,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const handleCandidateLogin = (e) => {
    e.preventDefault();

    setLoading(true);

    if (
      username.trim() === CANDIDATE_USERNAME &&
      password === CANDIDATE_PASSWORD
    ) {
      localStorage.setItem(
        "candidateLoggedIn",
        "true"
      );

      setTimeout(() => {
        setLoading(false);
        onLogin();
      }, 400);

      return;
    }

    setLoading(false);

    alert(
      "Invalid candidate username or password."
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 px-6">

      <div className="w-full max-w-md rounded-3xl bg-white/95 backdrop-blur-xl p-10 shadow-[0_0_60px_rgba(139,92,246,0.3)]">

        <div className="text-center mb-8">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 shadow-xl">

            <UserRound
              size={30}
              className="text-white"
            />

          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            Candidate Portal
          </h1>

          <p className="mt-2 text-slate-500">
            Welcome to TalentIQ
          </p>

        </div>

        <form onSubmit={handleCandidateLogin}>

          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Candidate Username
            </label>

            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value)
              }
              required
              placeholder="Enter candidate username"
              className="h-12 w-full rounded-xl border border-violet-200 px-4 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />

          </div>

          <div className="mb-6">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>

            <div className="relative">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                placeholder="Enter candidate password"
                className="h-12 w-full rounded-xl border border-violet-200 px-4 pr-12 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 font-semibold text-white disabled:opacity-60"
          >

            {loading ? (
              <span className="flex items-center justify-center gap-2">

                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Signing In...

              </span>
            ) : (
              "Candidate Sign In"
            )}

          </button>

        </form>

        <button
          type="button"
          onClick={onBack}
          className="mt-5 flex w-full items-center justify-center gap-2 text-sm text-slate-500"
        >

          <ArrowLeft size={16} />

          Back to Admin Login

        </button>

      </div>
    </div>
  );
}

// ======================================================
// CANDIDATE DETAILS
// ======================================================

function CandidateDetails() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [appliedPosition, setAppliedPosition] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = async (e) => {
    e.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!appliedPosition.trim()) {
      setError(
        "Please enter your applied position."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/candidates`
      );

      const candidates =
        Array.isArray(response.data)
          ? response.data
          : [];

      const normalizedName =
        name.trim().toLowerCase();

      const normalizedPosition =
        appliedPosition.trim().toLowerCase();

      const candidate =
        candidates.find((item) => {
          const candidateName =
            String(item.name || "")
              .trim()
              .toLowerCase();

          const candidatePosition =
            String(
              item.appliedPosition || ""
            )
              .trim()
              .toLowerCase();

          return (
            candidateName === normalizedName &&
            candidatePosition ===
              normalizedPosition
          );
        });

      if (!candidate) {
        setError(
          "Candidate not found. Please make sure your name and applied position exactly match your application."
        );

        return;
      }

      const candidateId =
        candidate.candidateId ||
        candidate.id;

      let jobId =
        candidate.job?.jobId ||
        candidate.job?.id ||
        candidate.jobId;

      if (!jobId) {
        try {
          const jobsResponse =
            await axios.get(
              `${API_URL}/jobs`
            );

          const jobs =
            Array.isArray(
              jobsResponse.data
            )
              ? jobsResponse.data
              : [];

          const job =
            jobs.find((item) => {
              const title =
                String(
                  item.title ||
                  item.jobTitle ||
                  item.position ||
                  item.name ||
                  ""
                )
                  .trim()
                  .toLowerCase();

              return (
                title ===
                normalizedPosition
              );
            });

          if (job) {
            jobId =
              job.jobId ||
              job.id;
          }
        } catch (jobError) {
          console.error(
            "Unable to fetch jobs:",
            jobError
          );
        }
      }

      if (!jobId) {
        setError(
          "Your candidate was found, but the job ID could not be determined."
        );

        return;
      }

      if (!candidateId) {
        setError(
          "Candidate ID could not be determined."
        );

        return;
      }

      localStorage.setItem(
        "candidateId",
        String(candidateId)
      );

      localStorage.setItem(
        "candidateName",
        candidate.name || name
      );

      localStorage.setItem(
        "candidatePosition",
        candidate.appliedPosition ||
        appliedPosition
      );

      localStorage.setItem(
        "candidateJobId",
        String(jobId)
      );

      navigate(
        `/candidate/skill-recovery/${candidateId}/${jobId}`
      );

    } catch (err) {
      console.error(
        "Candidate lookup error:",
        err
      );

      setError(
        err.response?.data?.message ||
        "Unable to find your application."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 px-6">

      <div className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-2xl">

        <div className="text-center mb-8">

          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500">

            <UserRound
              size={30}
              className="text-white"
            />

          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            Welcome to Skill Recovery
          </h1>

          <p className="mt-2 text-slate-500">
            Tell us about your application to continue.
          </p>

        </div>

        <form onSubmit={handleContinue}>

          <div className="mb-5">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              required
              placeholder="Enter your full name"
              className="h-12 w-full rounded-xl border border-violet-200 px-4 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />

          </div>

          <div className="mb-6">

            <label className="mb-2 block text-sm font-semibold text-slate-700">
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
              required
              placeholder="Example: Java Developer"
              className="h-12 w-full rounded-xl border border-violet-200 px-4 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />

          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 font-semibold text-white disabled:opacity-60"
          >

            {loading ? (
              <span className="flex items-center justify-center gap-2">

                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Finding Your Application...

              </span>
            ) : (
              "Start Skill Recovery"
            )}

          </button>

        </form>

      </div>
    </div>
  );
}

// ======================================================
// CANDIDATE PORTAL
// ======================================================

function CandidatePortal() {
  return (
    <Routes>

      <Route
        path="/candidate"
        element={
          <CandidateDetails />
        }
      />

      <Route
        path="/candidate/skill-recovery/:candidateId/:jobId"
        element={
          <CandidateSkillRecoveryRoute />
        }
      />

      {/* ==================================================
          NEW TECHNICAL ASSESSMENT ROUTE
      ================================================== */}

      <Route
        path="/candidate/technical-assessment/:candidateId/:jobId"
        element={
          <TechnicalAssessmentPage />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/candidate"
            replace
          />
        }
      />

    </Routes>
  );
}

// ======================================================
// MAIN APP
// ======================================================

function App() {
  const [loginType, setLoginType] =
    useState("selection");

  const [isAdminLoggedIn, setIsAdminLoggedIn] =
    useState(false);

  const [
    isCandidateLoggedIn,
    setIsCandidateLoggedIn,
  ] = useState(false);

  useEffect(() => {
    const token =
      localStorage.getItem("token");

    localStorage.removeItem(
      "candidateLoggedIn"
    );

    if (token) {
      setIsAdminLoggedIn(true);
      setIsCandidateLoggedIn(false);
      setLoginType("admin");
      return;
    }

    setIsAdminLoggedIn(false);
    setIsCandidateLoggedIn(false);
    setLoginType("selection");
  }, []);

  const handleAdminLogin = () => {
    localStorage.removeItem(
      "candidateLoggedIn"
    );

    setIsAdminLoggedIn(true);
    setIsCandidateLoggedIn(false);
    setLoginType("admin");
  };

  const handleCandidateLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem(
      "rememberAdmin"
    );

    localStorage.setItem(
      "candidateLoggedIn",
      "true"
    );

    setIsCandidateLoggedIn(true);
    setIsAdminLoggedIn(false);
    setLoginType("candidate");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("token");

    localStorage.removeItem(
      "rememberAdmin"
    );

    localStorage.removeItem(
      "candidateLoggedIn"
    );

    setIsAdminLoggedIn(false);
    setIsCandidateLoggedIn(false);
    setLoginType("selection");
  };

  const handleCandidateLogout = () => {
    localStorage.removeItem(
      "candidateLoggedIn"
    );

    localStorage.removeItem(
      "candidateId"
    );

    localStorage.removeItem(
      "candidateName"
    );

    localStorage.removeItem(
      "candidatePosition"
    );

    localStorage.removeItem(
      "candidateJobId"
    );

    setIsCandidateLoggedIn(false);
    setIsAdminLoggedIn(false);
    setLoginType("selection");
  };

  if (
    !isAdminLoggedIn &&
    !isCandidateLoggedIn &&
    loginType === "selection"
  ) {
    return (
      <PortalSelection
        onSelectAdmin={() =>
          setLoginType("admin")
        }
        onSelectCandidate={() =>
          setLoginType("candidate")
        }
      />
    );
  }

  if (
    !isCandidateLoggedIn &&
    !isAdminLoggedIn &&
    loginType === "candidate"
  ) {
    return (
      <CandidateLogin
        onLogin={handleCandidateLogin}
        onBack={() =>
          setLoginType("selection")
        }
      />
    );
  }

  if (
    isCandidateLoggedIn &&
    !isAdminLoggedIn &&
    loginType === "candidate"
  ) {
    return (
      <CandidatePortal
        onLogout={handleCandidateLogout}
      />
    );
  }

  if (
    !isAdminLoggedIn &&
    !isCandidateLoggedIn &&
    loginType === "admin"
  ) {
    return (
      <AdminLogin
        onLogin={handleAdminLogin}
        onSwitchToCandidate={() =>
          setLoginType("candidate")
        }
      />
    );
  }

  if (
    isAdminLoggedIn &&
    !isCandidateLoggedIn
  ) {
    return (
      <div className="flex h-screen overflow-hidden bg-[#FAFAFF]">

        <Navbar
          handleLogout={
            handleAdminLogout
          }
        />

        <main className="flex-1 overflow-hidden bg-[#FAFAFF]">

          <div className="h-full overflow-y-auto px-6 py-3">

            <Routes>

              <Route
                path="/"
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />

              <Route
                path="/dashboard"
                element={
                  <DashboardHome />
                }
              />

              <Route
                path="/candidates"
                element={
                  <CandidatePage />
                }
              />

              <Route
                path="/ranking"
                element={
                  <RankingPage />
                }
              />

              <Route
                path="/jobs"
                element={
                  <JobPage />
                }
              />

              <Route
                path="/skills"
                element={
                  <SkillPage />
                }
              />

              <Route
                path="/skill-recovery/:candidateId/:jobId"
                element={
                  <RecruiterSkillRecoveryRoute />
                }
              />

              {/* ==================================================
                  INTERVIEWS
              ================================================== */}

              <Route
                path="/interviews"
                element={
                  <Interviews />
                }
              />

              <Route
                path="*"
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />

            </Routes>

          </div>
        </main>
      </div>
    );
  }

  return (
    <PortalSelection
      onSelectAdmin={() =>
        setLoginType("admin")
      }
      onSelectCandidate={() =>
        setLoginType("candidate")
      }
    />
  );
}

// ======================================================
// ROOT APP
// ======================================================

export default function RootApp() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
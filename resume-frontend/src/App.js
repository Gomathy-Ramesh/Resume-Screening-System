import React, { useState, useEffect, } from "react";
import axios from "axios";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  Sparkles,
  Trophy,
  UserCheck,
  BarChart3,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";

import "./index.css";

import Navbar from "./components/Navbar";

import DashboardHome from "./pages/DashboardHome";

import CandidatePage from "./pages/CandidatePage";

import RankingPage from "./pages/RankingPage";

import JobPage from "./pages/JobPage";

import ResetPasswordPage from "./pages/ResetPasswordPage";
function AppContent() {

  const location = useLocation();

  if (
    location.pathname ===
    "/reset-password"
  ) {
    return (
      <ResetPasswordPage />
    );
  }

  return <App />;
}
function App() {

  // =========================
  // STATES
  // =========================

  const [username, setUsername] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);
  
  const [showPassword, setShowPassword] =
  useState(false);

  const [rememberMe, setRememberMe] =
  useState(false);

  useEffect(() => {

  const token =
    localStorage.getItem("token");

  if (token) {

    setIsLoggedIn(true);

  }

}, []);

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {

  e.preventDefault();

  try {

    const response =
      await axios.post(
        "https://resume-screening-backend-biq3.onrender.com/auth/login",
        {
          username,
          password,
        }
      );

    localStorage.setItem(
      "token",
      response.data.token
    );

    setIsLoggedIn(true);

  } catch (error) {

    alert(
      error.response?.data ||
      "Invalid Username or Password"
    );
  }
};

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {

  localStorage.removeItem("token");

  setIsLoggedIn(false);

  setUsername("");

  setPassword("");
};

  // =========================
// FORGOT PASSWORD
// =========================

const handleForgotPassword = async () => {

  const email = prompt(
    "Enter your registered email:"
  );

  if (!email) return;

  try {

    const response =
      await axios.post(
        "https://resume-screening-backend-biq3.onrender.com/auth/forgot-password",
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

  // =========================
  // LOGIN PAGE
  // =========================

  if (!isLoggedIn) {

  return (

    <div className="relative min-h-screen flex overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-fuchsia-700 gradient-animated">
      <div
  className="
    absolute
    inset-0
    opacity-10
    bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)]
    bg-[size:50px_50px]
  "
></div>
      <div className="absolute top-20 left-20 h-72 w-72 rounded-full bg-fuchsia-400/20 blur-3xl glow-orb"></div>

<div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl glow-orb"></div>

<div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/5 blur-3xl glow-orb"></div>
      {/* LEFT SIDE */}

      <div className="hidden lg:flex w-3/5 flex-col justify-center px-20 text-white">

        <div>

          <h1 className="
    font-logo
    text-8xl
    font-black
    tracking-tighter
    mb-4
    bg-gradient-to-r
    from-white
    via-violet-100
    to-fuchsia-200
    bg-clip-text
    text-transparent
    drop-shadow-[0_0_25px_rgba(255,255,255,0.35)]
">
            Selectra
          </h1>

          <p className="text-xl text-violet-100 mb-10 max-w-xl leading-relaxed">
  Smart recruitment platform for intelligent resume screening,
  candidate ranking and hiring analytics.
</p>

          <div className="space-y-5">

  <div
  className="
    flex
    items-center
    gap-4
    text-lg
    transition-all
    duration-300
    hover:translate-x-2
  "
>

    <div className="
    p-2
    rounded-xl
    bg-white/15
    backdrop-blur-md
    shadow-[0_0_20px_rgba(255,255,255,0.15)]
  ">

      <Sparkles
        size={20}
        className="text-violet-100"
      />

    </div>

    <span className="font-medium">
      Smart Resume Screening
    </span>

  </div>

  <div
  className="
    flex
    items-center
    gap-4
    text-lg
    transition-all
    duration-300
    hover:translate-x-2
  "
>

    <div className="
    p-2
    rounded-xl
    bg-white/15
    backdrop-blur-md
    shadow-[0_0_20px_rgba(255,255,255,0.15)]
  ">

      <Trophy
        size={20}
        className="text-violet-100"
      />

    </div>

    <span className="font-medium">
      AI Candidate Ranking
    </span>

  </div>

  <div
  className="
    flex
    items-center
    gap-4
    text-lg
    transition-all
    duration-300
    hover:translate-x-2
  "
>

    <div className="
    p-2
    rounded-xl
    bg-white/15
    backdrop-blur-md
    shadow-[0_0_20px_rgba(255,255,255,0.15)]
  ">

      <UserCheck
        size={20}
        className="text-violet-100"
      />

    </div>

    <span className="font-medium">
      Intelligent Shortlisting
    </span>

  </div>

  <div
  className="
    flex
    items-center
    gap-4
    text-lg
    transition-all
    duration-300
    hover:translate-x-2
  "
>

    <div className="
    p-2
    rounded-xl
    bg-white/15
    backdrop-blur-md
    shadow-[0_0_20px_rgba(255,255,255,0.15)]
  ">

      <BarChart3
        size={20}
        className="text-violet-100"
      />

    </div>

    <span className="font-medium">
      Recruitment Analytics
    </span>

  </div>

</div>

       <div className="grid grid-cols-3 gap-3 mt-8 max-w-xl">

  <div
  className="
rounded-xl
bg-white/5
p-3
    backdrop-blur-lg
    border
    border-white/10
    transition-all
    duration-300
    hover:bg-white/15
    hover:-translate-y-1
    hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]
  "
>

    <h3 className="text-lg font-bold">
      Resume Analysis
    </h3>

    <p className="text-xs text-violet-100 mt-1">
      Automated resume parsing and skill extraction
    </p>

  </div>

  <div
  className="
rounded-xl
bg-white/5
p-3
    backdrop-blur-lg
    border
    border-white/10
    transition-all
    duration-300
    hover:bg-white/15
    hover:-translate-y-1
    hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]
  "
>

    <h3 className="text-lg font-bold">
      Candidate Scoring
    </h3>

    <p className="text-xs text-violet-100 mt-1">
      AI-driven ranking based on job relevance
    </p>

  </div>

  <div
  className="
rounded-xl
bg-white/5
p-3
    backdrop-blur-lg
    border
    border-white/10
    transition-all
    duration-300
    hover:bg-white/15
    hover:-translate-y-1
    hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]
  "
>

    <h3 className="text-lg font-bold">
      Recruitment Analytics
    </h3>

    <p className="text-xs text-violet-100 mt-1">
      Visual insights for hiring decisions
    </p>

  </div>

</div>

        </div>

      </div>

      {/* RIGHT SIDE */}

      <div className="w-full lg:w-2/5 flex items-center justify-center px-6">

        <div
          className="
            w-full
            max-w-md animate-[float_6s_ease-in-out_infinite]
            rounded-3xl
            bg-white/95
            backdrop-blur-xl
            border
            border-white/20
            p-10
            shadow-[0_0_60px_rgba(139,92,246,0.25)]
hover:shadow-[0_0_80px_rgba(139,92,246,0.35)]
transition-all
duration-500
          "
        >

          {/* LOGO */}

          <div className="mb-8 text-center">

            <div
              className="
                mx-auto
                mb-5
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-gradient-to-r from-violet-600 to-fuchsia-500
                shadow-xl
              "
            >

              <span className="text-3xl font-bold text-white">
                S
              </span>

            </div>
            

            <h1 className="text-3xl font-bold text-slate-800">
              Selectra
            </h1>

            <p className="mt-2 text-slate-500">
  Welcome back! Please sign in to continue
</p>

<div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-600 font-medium">
  <ShieldCheck size={14} />
  Secure Admin Portal
</div>

          </div>

          {/* FORM */}

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
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-violet-200
                  px-4
                  outline-none
                  transition
                  focus:border-violet-500
                  focus:ring-4
                  focus:ring-violet-100
                "
              />

            </div>

            <div className="mb-6">

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Password
              </label>

              <div className="relative">

  <input
    type={showPassword ? "text" : "password"}
    value={password}
    onChange={(e) =>
      setPassword(e.target.value)
    }
    required
    placeholder="Enter password"
    className="
      h-12
      w-full
      rounded-xl
      border
      border-violet-200
      px-4
      pr-12
      outline-none
      transition
      focus:border-violet-500
      focus:ring-4
      focus:ring-violet-100
    "
  />

  <button
    type="button"
    onClick={() =>
      setShowPassword(!showPassword)
    }
    className="
      absolute
      right-3
      top-1/2
      -translate-y-1/2
      text-slate-500
      hover:text-violet-600
    "
  >
    {showPassword ? (
      <EyeOff size={18} />
    ) : (
      <Eye size={18} />
    )}
  </button>

</div>

            <div className="mb-6 flex items-center justify-between">

  <label className="flex items-center gap-2 text-sm text-slate-600">

    <input
      type="checkbox"
      checked={rememberMe}
      onChange={(e) =>
        setRememberMe(e.target.checked)
      }
      className="accent-violet-600"
    />

    Remember Me

  </label>

  <button
  type="button"
  onClick={handleForgotPassword}
  className="
    text-sm
    font-medium
    text-violet-600
    hover:text-violet-700
  "
>
  Forgot Password?
</button>

</div>

            </div>

            <button
              type="submit"
              className="
                h-12
                w-full
                rounded-xl
                bg-gradient-to-r from-violet-600 to-fuchsia-500
                font-semibold
                text-white
                transition-all
                duration-300
                hover:from-violet-700
                hover:to-fuchsia-600
                hover:-translate-y-1
                hover:shadow-[0_0_30px_rgba(139,92,246,0.6)]
              "
            >
              Sign In
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}
  // =========================
  // MAIN APP
  // =========================

  return (

  <div className="flex h-screen overflow-hidden bg-[#FAFAFF]">

    {/* SIDEBAR */}

    <Navbar
      handleLogout={handleLogout}
    />

    {/* MAIN CONTENT */}

    <main className="flex-1 overflow-hidden bg-[#FAFAFF]">

      <div className="h-full overflow-y-auto px-6 py-3">

        <Routes>

          <Route
            path="/"
            element={
              <Navigate to="/dashboard" />
            }
          />

          <Route
            path="/dashboard"
            element={<DashboardHome />}
          />

          <Route
            path="/candidates"
            element={<CandidatePage />}
          />

          <Route
            path="/ranking"
            element={<RankingPage />}
          />

          <Route
            path="/jobs"
            element={<JobPage />}
          />

        </Routes>

      </div>

    </main>

  </div>
);
}

export default function RootApp() {

  return (

    <BrowserRouter>

      <AppContent />

    </BrowserRouter>

  );
}
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState(""); // ✅ added

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleReset = async () => {
    try {
      const response = await axios.post(
        "https://resume-screening-backend-biq3.onrender.com/auth/reset-password",
        {
          token,
          newPassword: password,
          email: email // ✅ added
        }
      );

      alert(response.data);
    } catch (error) {
      alert(error.response?.data || "Reset Failed");
    }
  };

  return (
    <div className="p-10 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        Reset Password
      </h2>

      <input
        type="text"
        placeholder="Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="border p-2 mb-3 block w-full"
      />

      {/* ✅ EMAIL FIELD */}
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 mb-3 block w-full"
      />

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 mb-3 block w-full"
      />

      <button
        onClick={handleReset}
        className="bg-violet-600 text-white px-4 py-2 rounded w-full"
      >
        Reset Password
      </button>
    </div>
  );
}

export default ResetPasswordPage;
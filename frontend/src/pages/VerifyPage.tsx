import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

export function VerifyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // email passed from register page
  const email = location.state?.email || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Verification failed");
        return;
      }

      setSuccess("Email verified successfully!");

      // go to login page after short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form onSubmit={handleVerify} className="space-y-4 w-80">
        <h1 className="text-xl font-bold">Verify Email</h1>

        <p className="text-sm text-gray-500">
          Code sent to: <strong>{email}</strong>
        </p>

        <input
          type="text"
          placeholder="Enter verification code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>
    </div>
  );
}

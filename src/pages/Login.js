import React, { useState } from "react";
import { login } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsAuthenticating(true);

    try {
      // Calls your actual auth service
      await login(email, password);
      // On success, go directly to the cyber dashboard
      navigate("/dashboard");
    } catch (err) {
      // Instead of an alert(), show a sleek inline error
      setError(err.message || "Authentication failed. Invalid credentials.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#00d4ff]/30">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.05)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-50"></div>

      {/* Custom Scifi Styles */}
      <style>{`
        .glass-card {
          background: rgba(10, 14, 26, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 212, 255, 0.2);
          box-shadow: 0 0 40px rgba(0, 212, 255, 0.1);
        }
        .neon-text { text-shadow: 0 0 10px rgba(0, 212, 255, 0.8); }
        .cyber-input:focus {
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.3);
          border-color: #00d4ff;
        }
      `}</style>

      <div className="glass-card w-full max-w-md p-8 rounded-2xl relative z-10 animate-[fadeIn_0.5s_ease-out]">
        {/* Logo/Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full border-2 border-[#00d4ff] flex items-center justify-center shadow-[0_0_15px_#00d4ff] mb-4 bg-black/50">
            <svg
              className="w-8 h-8 text-[#00d4ff]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-widest text-white neon-text">
            SYSTEM<span className="text-[#00d4ff] font-light">_LOGIN</span>
          </h1>
          <p className="text-gray-400 text-sm tracking-wider mt-2 font-mono">
            SECURE ACCESS PROTOCOL
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-3 bg-[#ff3366]/10 border border-[#ff3366]/50 text-[#ff3366] text-xs font-mono rounded flex items-start gap-2">
            <svg
              className="w-4 h-4 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
            <span>[AUTH_ERROR]: {error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-mono text-[#00d4ff] mb-2 uppercase tracking-wider">
              Operator ID (Email)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cyber-input w-full bg-black/50 border border-white/10 text-white rounded px-4 py-3 focus:outline-none transition-all font-mono"
              placeholder="sysadmin@nexus.local"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#00d4ff] mb-2 uppercase tracking-wider">
              Passphrase
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cyber-input w-full bg-black/50 border border-white/10 text-white rounded px-4 py-3 focus:outline-none transition-all font-mono tracking-widest"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full bg-[#00d4ff]/10 hover:bg-[#00d4ff] text-[#00d4ff] hover:text-black border border-[#00d4ff]/50 font-bold tracking-widest uppercase py-4 rounded transition-all duration-300 hover:shadow-[0_0_20px_#00d4ff] flex justify-center items-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAuthenticating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-current"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                DECRYPTING...
              </>
            ) : (
              "INITIALIZE SESSION"
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <p className="text-gray-400 text-sm font-mono">
            Unregistered operator?{" "}
            <Link
              to="/signup"
              className="text-[#00d4ff] hover:text-white transition-colors underline decoration-[#00d4ff]/30 underline-offset-4"
            >
              Request Access
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

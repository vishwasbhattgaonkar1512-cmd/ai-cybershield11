import React, { useState } from "react";
import { signup } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // Added confirm password for better UX
  const [error, setError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    // Pre-flight check: Do passwords match?
    if (password !== confirmPassword) {
      setError("SECURITY ALERT: Passphrases do not match.");
      return;
    }

    setIsRegistering(true);

    try {
      // Calls your actual auth service
      await signup(email, password);
      // On success, redirect back to login
      navigate("/");
    } catch (err) {
      // Show sleek inline error
      setError(err.message || "Failed to create entity. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#00ff88]/30">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,136,0.03)_0%,transparent_70%)] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00ff88] to-transparent opacity-50"></div>

      {/* Custom Scifi Styles */}
      <style>{`
        .glass-card-green {
          background: rgba(10, 14, 26, 0.7);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(0, 255, 136, 0.2);
          box-shadow: 0 0 40px rgba(0, 255, 136, 0.05);
        }
        .neon-text-green { text-shadow: 0 0 10px rgba(0, 255, 136, 0.8); }
        .cyber-input-green:focus {
          box-shadow: 0 0 15px rgba(0, 255, 136, 0.2);
          border-color: #00ff88;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }
      `}</style>

      <div className="glass-card-green w-full max-w-md p-8 rounded-2xl relative z-10 animate-slide-up">
        {/* Logo/Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full border-2 border-[#00ff88] flex items-center justify-center shadow-[0_0_15px_#00ff88] mb-4 bg-black/50">
            <svg
              className="w-8 h-8 text-[#00ff88]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              ></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-widest text-white neon-text-green">
            NEW<span className="text-[#00ff88] font-light">_ENTITY</span>
          </h1>
          <p className="text-gray-400 text-sm tracking-wider mt-2 font-mono">
            ENROLLMENT PROTOCOL
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
            <span>[SYSTEM_ERROR]: {error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-xs font-mono text-[#00ff88] mb-2 uppercase tracking-wider">
              Assign Operator ID (Email)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="cyber-input-green w-full bg-black/50 border border-white/10 text-white rounded px-4 py-3 focus:outline-none transition-all font-mono"
              placeholder="new_user@nexus.local"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#00ff88] mb-2 uppercase tracking-wider">
              Generate Passphrase
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="cyber-input-green w-full bg-black/50 border border-white/10 text-white rounded px-4 py-3 focus:outline-none transition-all font-mono tracking-widest"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#00ff88] mb-2 uppercase tracking-wider">
              Confirm Passphrase
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="cyber-input-green w-full bg-black/50 border border-white/10 text-white rounded px-4 py-3 focus:outline-none transition-all font-mono tracking-widest"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className="w-full bg-[#00ff88]/10 hover:bg-[#00ff88] text-[#00ff88] hover:text-black border border-[#00ff88]/50 font-bold tracking-widest uppercase py-4 rounded transition-all duration-300 hover:shadow-[0_0_20px_#00ff88] flex justify-center items-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegistering ? (
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
                ENCRYPTING...
              </>
            ) : (
              "ESTABLISH CONNECTION"
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <p className="text-gray-400 text-sm font-mono">
            Already verified?{" "}
            <Link
              to="/"
              className="text-[#00ff88] hover:text-white transition-colors underline decoration-[#00ff88]/30 underline-offset-4"
            >
              Return to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

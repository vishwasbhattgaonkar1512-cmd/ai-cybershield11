import React, { useState, useEffect } from "react";

// ── API Routing Logic ─────────────────────────────────────────────────────────
// Response shapes aligned with main.py's actual return values.
async function runScan({ email, password, url }) {
  const has = {
    email: !!email.trim(),
    password: !!password.trim(),
    url: !!url.trim(),
  };
  const count = Object.values(has).filter(Boolean).length;

  if (count > 1) {
    const res = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email || "",
        password: password || "",
        url: url || "",
      }),
    });
    if (!res.ok)
      throw new Error("Analysis Engine unreachable. Is the backend running?");
    // main.py returns: { password_score, password_leaked, email_leaked, phishing_detected, ai_advice }
    const data = await res.json();
    return {
      mode: "full",
      password: has.password
        ? { score: data.password_score, is_leaked: data.password_leaked }
        : null,
      email: has.email ? { is_leaked: data.email_leaked } : null,
      url: has.url ? { is_phishing: data.phishing_detected } : null,
      ai_plan: data.ai_advice ?? null,
    };
  }

  if (has.password) {
    const res = await fetch("http://localhost:8000/check/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error("Password check failed.");
    // main.py returns: { score, strength: { suggestions, warning }, is_leaked }
    const d = await res.json();
    return {
      mode: "password",
      password: {
        score: d.score,
        is_leaked: d.is_leaked,
        suggestions: d.strength?.suggestions ?? [],
        warning: d.strength?.warning ?? "",
      },
      email: null,
      url: null,
      ai_plan: null,
    };
  }

  if (has.email) {
    const res = await fetch("http://localhost:8000/check/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error("Email check failed.");
    // main.py returns: { email, is_leaked }
    const d = await res.json();
    return {
      mode: "email",
      password: null,
      email: { is_leaked: d.is_leaked },
      url: null,
      ai_plan: null,
    };
  }

  if (has.url) {
    const res = await fetch("http://localhost:8000/check/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error("URL check failed.");
    // main.py returns: { url, is_phishing }
    const d = await res.json();
    return {
      mode: "url",
      password: null,
      email: null,
      url: { is_phishing: d.is_phishing },
      ai_plan: null,
    };
  }
}

const SCORE_THEME = {
  0: { label: "CRITICAL", color: "#ff3366", bar: "bg-[#ff3366]" },
  1: { label: "WEAK", color: "#f97316", bar: "bg-orange-500" },
  2: { label: "FAIR", color: "#facc15", bar: "bg-yellow-400" },
  3: { label: "STRONG", color: "#00d4ff", bar: "bg-[#00d4ff]" },
  4: { label: "FORTIFIED", color: "#00ff88", bar: "bg-[#00ff88]" },
};

const MODE_LABEL = {
  password: { text: "→ /check/password", hint: "Password-only scan" },
  email: { text: "→ /check/email", hint: "Email-only scan" },
  url: { text: "→ /check/url", hint: "URL-only scan" },
  full: { text: "→ /analyze", hint: "Full AI scan" },
};

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [url, setUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!email.trim() && !password.trim() && !url.trim()) {
      setError("AT LEAST ONE INPUT VECTOR IS REQUIRED.");
      return;
    }
    setIsScanning(true);
    setError(null);
    setResult(null);
    try {
      const data = await runScan({ email, password, url });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const scoreTheme = result?.password
    ? (SCORE_THEME[result.password.score] ?? SCORE_THEME[0])
    : null;

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white p-4 md:p-6 font-sans relative overflow-hidden selection:bg-[#00d4ff]/30">
      <style>{`
        .glass  { background: rgba(10,14,26,0.7); backdrop-filter: blur(12px); border: 1px solid rgba(0,212,255,0.15); box-shadow: 0 4px 30px rgba(0,0,0,0.5); }
        .glow-b { text-shadow: 0 0 10px rgba(0,212,255,0.8); }
        .inp:focus { box-shadow: 0 0 15px rgba(0,212,255,0.3); border-color: #00d4ff; outline: none; }
        .scanline { position:fixed;top:0;left:0;width:100%;height:100%;background:linear-gradient(to bottom,transparent 50%,rgba(0,212,255,0.03) 51%);background-size:100% 4px;pointer-events:none;z-index:50; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.45s ease-out both; }
        @keyframes type  { from{max-width:0} to{max-width:100%} }
        .typing { overflow:hidden; white-space:pre-wrap; animation: type 2.5s steps(60,end); }
        .spin-ring { animation: spin 1s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>

      <div className="scanline" />

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 glass p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-10 h-10 rounded-full border-2 border-[#00d4ff] flex items-center justify-center shadow-[0_0_10px_#00d4ff] bg-black/50">
              <svg
                className="w-5 h-5 text-[#00d4ff]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-widest glow-b">
              AI<span className="text-[#00d4ff] font-light">CYBERSHIELD</span>
            </h1>
          </div>
          <div className="font-mono text-[#00d4ff] text-sm md:text-base tracking-widest bg-[#00d4ff]/10 px-4 py-2 rounded border border-[#00d4ff]/30">
            SYS TIME:{" "}
            {currentTime.toLocaleTimeString("en-US", { hour12: false })}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* INPUT PANEL */}
          <div className="lg:col-span-4 glass p-6 rounded-xl flex flex-col border-t-4 border-t-[#00d4ff]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
              <h2 className="text-xs text-gray-400 uppercase tracking-widest">
                Threat Intelligence Input
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#00d4ff]/30 text-[#00d4ff]/70">
                {[!!email.trim(), !!password.trim(), !!url.trim()].filter(
                  Boolean,
                ).length > 1
                  ? "/analyze"
                  : password.trim()
                    ? "/check/password"
                    : email.trim()
                      ? "/check/email"
                      : url.trim()
                        ? "/check/url"
                        : "idle"}
              </span>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-[#ff3366]/10 border border-[#ff3366]/50 text-[#ff3366] text-xs font-mono rounded">
                [ERR]: {error}
              </div>
            )}

            <form onSubmit={handleScan} className="flex-1 space-y-5">
              {[
                {
                  label: "Target Email",
                  value: email,
                  set: setEmail,
                  type: "email",
                  ph: "user@company.com",
                },
                {
                  label: "Password Payload",
                  value: password,
                  set: setPassword,
                  type: "text",
                  ph: "Enter passphrase to test…",
                },
                {
                  label: "Suspicious URL",
                  value: url,
                  set: setUrl,
                  type: "text",
                  ph: "http://bit.ly/xyz",
                },
              ].map(({ label, value, set, type, ph }) => (
                <div key={label}>
                  <label className="block text-xs font-mono text-[#00d4ff] mb-2 uppercase tracking-wider">
                    {label}
                    {value.trim() && (
                      <span className="ml-2 text-[#00ff88] text-[10px]">
                        ● ACTIVE
                      </span>
                    )}
                  </label>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    className="inp w-full bg-black/50 border border-white/10 text-white rounded px-4 py-3 transition-all font-mono text-sm"
                    placeholder={ph}
                  />
                </div>
              ))}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isScanning}
                  className="w-full bg-[#00d4ff]/10 hover:bg-[#00d4ff] text-[#00d4ff] hover:text-black border border-[#00d4ff]/50 font-bold tracking-widest uppercase py-4 rounded transition-all duration-300 hover:shadow-[0_0_20px_#00d4ff] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <span className="flex items-center gap-2 animate-pulse">
                      <svg
                        className="spin-ring h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          className="opacity-25"
                        />
                        <path
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          className="opacity-75"
                        />
                      </svg>
                      ANALYZING…
                    </span>
                  ) : (
                    "INITIATE SCAN"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* RESULTS PANEL */}
          <div className="lg:col-span-8 glass p-6 rounded-xl flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
              <h2 className="text-xs text-gray-400 uppercase tracking-widest">
                AI Diagnostics & Metrics
              </h2>
              {result && (
                <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff]">
                  {MODE_LABEL[result.mode].text}
                  <span className="text-gray-500 ml-2">
                    {MODE_LABEL[result.mode].hint}
                  </span>
                </span>
              )}
            </div>

            {!isScanning && !result && (
              <div className="flex-1 flex flex-col items-center justify-center opacity-30 font-mono text-sm tracking-widest">
                <svg
                  className="w-16 h-16 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
                <p>SYSTEM AWAITING INPUT VECTORS</p>
                <p className="text-xs mt-2 opacity-60">
                  Fill one or more fields, then scan
                </p>
              </div>
            )}

            {isScanning && (
              <div className="flex-1 flex flex-col items-center justify-center text-[#00d4ff] font-mono">
                <div className="w-32 h-32 border-4 border-[#00d4ff]/20 border-t-[#00d4ff] rounded-full spin-ring mb-4 shadow-[0_0_15px_#00d4ff]" />
                <p className="animate-pulse tracking-widest mt-4">
                  EXECUTING NEURAL SCAN…
                </p>
              </div>
            )}

            {result && !isScanning && (
              <div className="flex-1 flex flex-col gap-6 fade-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password cards */}
                  {result.password &&
                    (() => {
                      const t = scoreTheme;
                      return (
                        <>
                          {/* Strength bar */}
                          <div className="bg-black/40 border border-white/5 p-4 rounded-lg flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                                Passphrase Strength
                              </p>
                              <p
                                className="font-mono text-xl font-bold"
                                style={{ color: t.color }}
                              >
                                [{t.label}] ({result.password.score}/4)
                              </p>
                              {result.password.warning && (
                                <p className="text-xs text-yellow-400 mt-1 font-mono">
                                  {result.password.warning}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              {[0, 1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className={`w-3 h-8 rounded-sm ${i < result.password.score ? t.bar : "bg-gray-800"}`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Leak status */}
                          <div
                            className={`p-4 rounded-lg border ${result.password.is_leaked ? "bg-[#ff3366]/10 border-[#ff3366]/50" : "bg-[#00ff88]/10 border-[#00ff88]/50"}`}
                          >
                            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                              HIBP Breach Check
                            </p>
                            <p
                              className={`font-mono text-xl font-bold ${result.password.is_leaked ? "text-[#ff3366]" : "text-[#00ff88]"}`}
                            >
                              {result.password.is_leaked
                                ? "⚠️ PASSWORD LEAKED"
                                : "✓ NOT LEAKED"}
                            </p>
                            {result.password.suggestions?.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {result.password.suggestions.map((s, i) => (
                                  <li
                                    key={i}
                                    className="text-[11px] text-[#00d4ff] font-mono"
                                  >
                                    › {s}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </>
                      );
                    })()}

                  {/* Email card */}
                  {result.email && (
                    <div
                      className={`p-4 rounded-lg border ${result.email.is_leaked ? "bg-[#ff3366]/10 border-[#ff3366]/50" : "bg-[#00ff88]/10 border-[#00ff88]/50"}`}
                    >
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Dark Web Email Scan
                      </p>
                      <p
                        className={`font-mono text-xl font-bold ${result.email.is_leaked ? "text-[#ff3366]" : "text-[#00ff88]"}`}
                      >
                        {result.email.is_leaked ? "⚠️ COMPROMISED" : "✓ CLEAN"}
                      </p>
                    </div>
                  )}

                  {/* URL card */}
                  {result.url && (
                    <div
                      className={`p-4 rounded-lg border ${result.url.is_phishing ? "bg-[#ff3366]/10 border-[#ff3366]/50" : "bg-[#00ff88]/10 border-[#00ff88]/50"}`}
                    >
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        URL Threat Analysis
                      </p>
                      <p
                        className={`font-mono text-xl font-bold ${result.url.is_phishing ? "text-[#ff3366]" : "text-[#00ff88]"}`}
                      >
                        {result.url.is_phishing
                          ? "⚠️ MALICIOUS LINK"
                          : "✓ SAFE DOMAIN"}
                      </p>
                    </div>
                  )}
                </div>

                {/* AI Action Plan */}
                {result.ai_plan && (
                  <div className="mt-2 flex-1">
                    <h3 className="text-sm text-[#00d4ff] uppercase tracking-widest mb-2 flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 2a2 2 0 012 2v2h2a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h2V4a2 2 0 012-2zm0 2H8v2h4V4zM6 8v8h8V8H6z" />
                      </svg>
                      AI Action Protocol
                      <span className="text-gray-600 text-[10px] font-mono normal-case tracking-normal">
                        (generated by /analyze)
                      </span>
                    </h3>
                    <div className="bg-[#050810] border border-white/10 rounded-lg p-5 min-h-[150px] relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent opacity-30" />
                      <div className="font-mono text-sm leading-relaxed text-gray-300 typing">
                        {result.ai_plan.split("\n").map((line, i) => (
                          <span key={i}>
                            {line.startsWith("-") ? (
                              <span className="text-[#00d4ff]">{line}</span>
                            ) : (
                              line
                            )}
                            <br />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!result.ai_plan && (
                  <p className="text-xs text-gray-600 font-mono mt-auto">
                    ℹ️ Fill multiple fields to trigger{" "}
                    <span className="text-[#00d4ff]">/analyze</span> and get the
                    AI action plan.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

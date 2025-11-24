import React, { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./routes/Dashboard";
import CropForm from "./routes/CropForm";
import RainfallAnalysis from "./routes/RainfallAnalysis";
import Landing from "./routes/Landing";
import { ThemeProvider } from "./context/ThemeContext";
import "./App.css";

function NavItem({ to, label, active, isDark }) {
  const base =
    "px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors duration-300";
  const activeCls = "bg-emerald-500/90 text-slate-900 shadow-sm";
  const inactiveDark = "text-slate-200 hover:bg-slate-700/80 hover:text-white";
  const inactiveLight =
    "text-slate-700 hover:bg-slate-100 hover:text-slate-900";

  return (
    <Link
      to={to}
      className={[
        base,
        active
          ? activeCls
          : isDark
          ? inactiveDark
          : inactiveLight,
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function App() {
  const location = useLocation();
  const path = location.pathname;

  const [isDark, setIsDark] = useState(true);
  const toggleTheme = () => setIsDark((prev) => !prev);

  const shellClass = isDark
    ? "min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100"
    : "min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 text-slate-900";

  const headerClass = isDark
    ? "bg-slate-900/70 border border-slate-700/70 rounded-2xl shadow-lg shadow-slate-950/60 backdrop-blur-sm"
    : "bg-white border border-slate-200 rounded-2xl shadow-md";

  const mainCardClass = isDark
    ? "bg-slate-900/70 border border-slate-800 rounded-2xl shadow-xl shadow-slate-950/60 backdrop-blur-sm"
    : "bg-white border border-slate-200 rounded-2xl shadow-md";

  const footerTextClass = isDark
    ? "text-slate-300"
    : "text-slate-500";

  const subtitleTextClass = isDark
    ? "text-slate-200"
    : "text-slate-600";

  return (
    <ThemeProvider isDark={isDark}>
      <div className={`${shellClass} transition-colors duration-500`}>
        <div className="max-w-6xl mx-auto px-4 py-4 sm:py-6 flex flex-col gap-4 sm:gap-6">
          {/* Header */}
          <header
            className={`${headerClass} px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors duration-500`}
          >
            <div className="text-center sm:text-left">
              <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight bg-gradient-to-r from-emerald-500 via-sky-500 to-emerald-300 bg-clip-text text-transparent">
                Crop Recommendation &amp; Rainfall Prediction
              </h1>
              <p
                className={`text-[11px] sm:text-xs mt-1 font-semibold ${subtitleTextClass}`}
              >
                ML-powered decision support for smarter cropping and rainfall insights.
              </p>
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-2">
              {/* Nav */}
              <nav
                className={
                  "flex items-center justify-center gap-2 rounded-full px-2 py-1 border transition-colors duration-500 " +
                  (isDark
                    ? "bg-slate-800/60 border-slate-700/70"
                    : "bg-slate-50 border-slate-200")
                }
              >
                <NavItem
                  to="/"
                  label="Home"
                  active={path === "/"}
                  isDark={isDark}
                />
                <NavItem
                  to="/dashboard"
                  label="Dashboard"
                  active={path === "/dashboard"}
                  isDark={isDark}
                />
                <NavItem
                  to="/crop"
                  label="Crop Suggestion"
                  active={path === "/crop"}
                  isDark={isDark}
                />
                <NavItem
                  to="/rainfall"
                  label="Rainfall"
                  active={path === "/rainfall"}
                  isDark={isDark}
                />
              </nav>

              {/* Theme Toggle Switch */}
              <div className="flex items-center ml-2">
                <span
                  className={`text-xs mr-2 font-semibold transition-colors duration-300 ${
                    isDark ? "text-slate-300" : "text-slate-600"
                  }`}
                >
                  {isDark ? "Dark" : "Light"}
                </span>
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle Theme"
                  className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 ${
                    isDark
                      ? "bg-emerald-500 ring-offset-slate-900"
                      : "bg-slate-400 ring-offset-slate-100"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                      isDark ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1">
            <div
              className={`${mainCardClass} px-4 sm:px-6 py-5 sm:py-6 transition-colors duration-500`}
            >
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/crop" element={<CropForm />} />
                <Route path="/rainfall" element={<RainfallAnalysis />} />
              </Routes>
            </div>
          </main>

          {/* Footer */}
          <footer
            className={`text-center text-[11px] sm:text-xs ${footerTextClass} pb-3 transition-colors duration-500`}
          >
            <span className="font-semibold">
              Crop &amp; Rainfall Intelligence
            </span>{" "}
            · Built with Flask, React, and ML models.
          </footer>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;

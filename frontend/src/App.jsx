// frontend/src/App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Landing from "./routes/Landing";
import CropForm from "./routes/CropForm";
import RainfallAnalysis from "./routes/RainfallAnalysis";
import Dashboard from "./routes/Dashboard";

import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { PredictionProvider } from "./context/PredictionContext";

function AppShell() {
  const { isDark, toggleTheme } = useTheme();
  const [showIntro, setShowIntro] = useState(true);

  // Intro animation delay
  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  const bgClass = isDark
    ? "bg-slate-950 text-slate-50"
    : "bg-slate-100 text-slate-900";

  const cardClass = isDark
    ? "bg-slate-900/80 border border-slate-700"
    : "bg-white border border-gray-200";

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-500`}>
      {/* Intro Overlay */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 text-slate-50">
          <div className="text-center space-y-4 animate-intro">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-emerald-300">
              Smart Farming Studio
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Crop Recommendation & Rainfall Prediction
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Initializing models, preparing charts, and setting up your
              field-ready dashboard...
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Powered by ML · React · Flask</span>
            </div>
          </div>
        </div>
      )}

      <BrowserRouter>
        {/* Navbar */}
        <header className="border-b border-slate-800/40 bg-slate-900/70 backdrop-blur sticky top-0 z-20">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
            <div className="flex flex-col">
              <h1 className="text-sm sm:text-base font-extrabold text-emerald-400">
                Crop Recommendation & Rainfall Prediction
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-semibold">
                Data-driven decisions for smarter farming
              </p>
            </div>

            <div className="flex items-center gap-4">
              <nav className="hidden sm:flex gap-3 text-xs font-semibold">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `px-2 py-1 rounded-md transition-all ${
                      isActive
                        ? "bg-emerald-500 text-slate-900"
                        : "text-slate-300 hover:bg-slate-800/80"
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/crop"
                  className={({ isActive }) =>
                    `px-2 py-1 rounded-md transition-all ${
                      isActive
                        ? "bg-emerald-500 text-slate-900"
                        : "text-slate-300 hover:bg-slate-800/80"
                    }`
                  }
                >
                  Crop
                </NavLink>
                <NavLink
                  to="/rainfall"
                  className={({ isActive }) =>
                    `px-2 py-1 rounded-md transition-all ${
                      isActive
                        ? "bg-emerald-500 text-slate-900"
                        : "text-slate-300 hover:bg-slate-800/80"
                    }`
                  }
                >
                  Rainfall
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `px-2 py-1 rounded-md transition-all ${
                      isActive
                        ? "bg-emerald-500 text-slate-900"
                        : "text-slate-300 hover:bg-slate-800/80"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
              </nav>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="relative inline-flex h-6 w-11 items-center rounded-full border border-slate-600 bg-slate-800/80 px-0.5 transition-colors hover:border-emerald-400"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-emerald-400 shadow-sm transition-transform duration-300 ${
                    isDark ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Main Container */}
        <main
          className={`max-w-6xl mx-auto px-4 py-6 transform transition-all duration-700 ${
            showIntro ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
          }`}
        >
          <div className={`${cardClass} rounded-2xl p-4 sm:p-6 shadow-sm`}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/crop" element={<CropForm />} />
              <Route path="/rainfall" element={<RainfallAnalysis />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>

          {/* ----------------------------- */}
          {/* 🌟 PROFESSIONAL MODERN FOOTER */}
          {/* ----------------------------- */}
          <footer
            className={`mt-10 border-t ${
              isDark ? "border-slate-700 bg-slate-900/60" : "border-slate-300 bg-white/70"
            } backdrop-blur-md`}
          >
            <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">

              {/* Left Branding */}
              <div className="text-center sm:text-left">
                <p
                  className={`text-sm font-bold ${
                    isDark ? "text-emerald-400" : "text-emerald-600"
                  }`}
                >
                  Smart Farming Studio
                </p>
                <p
                  className={`text-xs font-medium ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Powered by Machine Learning · Built for Farmers
                </p>
              </div>

              {/* Center Separator */}
              <div className="hidden sm:block h-6 w-px bg-slate-600/30"></div>

              {/* Right Copy */}
              <p
                className={`text-xs font-semibold ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}
              >
                © {new Date().getFullYear()}
                <span className="font-bold ml-1 text-emerald-500">
                  Haripriya
                </span>{" "}
                — All Rights Reserved
              </p>
            </div>
          </footer>
        </main>
      </BrowserRouter>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <PredictionProvider>
        <AppShell />
      </PredictionProvider>
    </ThemeProvider>
  );
}

export default App;

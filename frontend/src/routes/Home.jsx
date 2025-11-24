// frontend/src/routes/Home.jsx

import React from "react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

function Home() {
  const { isDark } = useTheme();

  const baseText = isDark ? "text-slate-50" : "text-gray-900";
  const subText = isDark ? "text-slate-300" : "text-gray-700";

  const cardClass = isDark
    ? "bg-slate-900/80 border border-slate-700"
    : "bg-white border border-gray-200";

  return (
    <div className="space-y-6">
      <section
        className={`${cardClass} rounded-2xl p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25`}
      >
        <h2 className={`text-2xl sm:text-3xl font-extrabold mb-2 ${baseText}`}>
          Welcome to Crop Recommendation &amp; Rainfall Prediction
        </h2>
        <p className={`text-sm sm:text-base font-semibold mb-4 ${subText}`}>
          Use this tool to get ML-based crop suggestions and rainfall
          predictions using your own field data.
        </p>

        <div className="flex flex-wrap gap-3">
          <NavLink
            to="/crop"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-500 text-slate-900 text-sm font-extrabold hover:bg-emerald-400 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-500/40"
          >
            Go to Crop Recommendation
          </NavLink>
          <NavLink
            to="/rainfall"
            className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-emerald-500/70 text-sm font-bold text-emerald-400 hover:bg-emerald-500/10 transition-all duration-300 hover:-translate-y-0.5"
          >
            Go to Rainfall Prediction
          </NavLink>
        </div>
      </section>
    </div>
  );
}

export default Home;

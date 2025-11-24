import React from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Landing() {
  const { isDark } = useTheme();

  const leftTextClass = isDark ? "text-slate-100" : "text-slate-900";
  const subTextClass = isDark ? "text-slate-300" : "text-slate-700";

  const rightCardClass = isDark
    ? "bg-slate-900/90 border border-slate-700 text-slate-50"
    : "bg-slate-900/90 border border-slate-700 text-slate-50"; // keep right card always dark

  const eduCardClass = isDark
    ? "bg-slate-900 border border-slate-700 text-slate-50"
    : "bg-white border border-slate-200 text-slate-900";

  const eduSubText = isDark ? "text-slate-300" : "text-slate-700";

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6 space-y-8">
      {/* Hero section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className={leftTextClass}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500 mb-2">
            SMART AGRICULTURE · ML POWERED
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Decision Support for{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-emerald-300 bg-clip-text text-transparent">
              Crop Selection
            </span>{" "}
            &amp;{" "}
            <span className="bg-gradient-to-r from-sky-400 to-indigo-300 bg-clip-text text-transparent">
              Rainfall Prediction
            </span>
          </h2>
          <p className={`text-sm sm:text-base mb-5 font-semibold ${subTextClass}`}>
            This system combines machine learning models with real-world
            agronomic features like soil nutrients (N, P, K), rainfall lags,
            temperature, humidity, and soil pH to recommend suitable crops and
            estimate rainfall for a given month.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-bold bg-emerald-500 text-slate-900 hover:bg-emerald-400 shadow-sm"
            >
              View Analytics Dashboard →
            </Link>
            <Link
              to="/crop"
              className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-semibold border border-emerald-500 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-500/10"
            >
              Try Crop Recommendation
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
            <div>
              <p className="font-extrabold text-emerald-600 dark:text-emerald-300">
                2
              </p>
              <p className={`font-semibold ${subTextClass}`}>
                ML models (Crop &amp; Rainfall)
              </p>
            </div>
            <div>
              <p className="font-extrabold text-emerald-600 dark:text-emerald-300">
                10+
              </p>
              <p className={`font-semibold ${subTextClass}`}>
                Input features analyzed
              </p>
            </div>
            <div>
              <p className="font-extrabold text-emerald-600 dark:text-emerald-300">
                Real-time
              </p>
              <p className={`font-semibold ${subTextClass}`}>
                Visualization &amp; charts
              </p>
            </div>
          </div>
        </div>

        {/* Right side card (kept dark for contrast) */}
        <div
          className={`${rightCardClass} rounded-2xl shadow-lg shadow-slate-950/50 backdrop-blur-sm p-5 sm:p-6 flex flex-col justify-between space-y-4`}
        >
          <div>
            <h3 className="text-lg font-bold mb-2">
              What you can do here
            </h3>
            <ul className="list-disc list-inside text-sm space-y-1.5 font-semibold">
              <li>
                Predict <span className="font-bold">rainfall</span> for a
                month using lag rainfall values.
              </li>
              <li>
                Get a{" "}
                <span className="font-bold">recommended crop</span> based on
                NPK, weather, pH, and rainfall.
              </li>
              <li>
                Explore <span className="font-bold">dashboards</span> with
                charts for soil nutrients, rainfall patterns, and model outputs.
              </li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3">
              <p className="font-bold text-emerald-300 mb-1">
                Backend
              </p>
              <p className="text-slate-200 font-semibold">
                Python, Flask, scikit-learn models, joblib.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3">
              <p className="font-bold text-sky-300 mb-1">
                Frontend
              </p>
              <p className="text-slate-200 font-semibold">
                React, Vite, Tailwind CSS, Recharts, Chart.js.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 font-semibold">
            Use the navigation above to move between{" "}
            <span className="font-bold">Home</span>,{" "}
            <span className="font-bold">Dashboard</span>,{" "}
            <span className="font-bold">Crop Suggestion</span>, and{" "}
            <span className="font-bold">Rainfall</span> modules.
          </p>
        </div>
      </section>

      {/* How the recommendation works */}
      <section
        className={`rounded-2xl border px-4 sm:px-6 py-4 sm:py-5 ${
          isDark
            ? "bg-slate-900/80 border-slate-700 text-slate-50"
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <h3 className="text-lg font-bold mb-2">
          How this Recommendation System Works
        </h3>
        <p className={`text-sm mb-3 font-semibold ${subTextClass}`}>
          The system uses trained machine learning models to learn patterns
          from historical crop and rainfall data. For each new input, it
          predicts:
        </p>
        <ul className={`list-disc list-inside text-sm space-y-1.5 ${subTextClass} font-semibold`}>
          <li>
            <span className="font-bold">Rainfall model:</span> Uses{" "}
            Lag1, Lag2, Lag3 rainfall values and month to estimate expected
            rainfall for the current month.
          </li>
          <li>
            <span className="font-bold">Crop model:</span> Uses soil
            nutrients (N, P, K), temperature, humidity, pH and rainfall-related
            inputs to recommend the most suitable crop.
          </li>
          <li>
            <span className="font-bold">Top-3 crops:</span> The model
            also provides alternative crops with probability distribution to
            support flexible decision making.
          </li>
        </ul>
        <p className={`text-xs mt-3 font-semibold ${subTextClass}`}>
          <span className="font-bold">Note:</span> These outputs are{" "}
          decision support, not guaranteed results. Final crop choice should
          also consider local experience, market price, pest/disease pressure,
          and irrigation facilities.
        </p>
      </section>

      {/* Basic crop education */}
      <section className="space-y-3">
        <h3 className={`text-lg font-extrabold ${leftTextClass}`}>
          Basic Crop Education (for understanding outputs)
        </h3>
        <p className={`text-sm font-semibold ${subTextClass}`}>
          Below are simple guidelines for three commonly recommended crops.
          This helps you understand when a suggested crop is practically
          suitable.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rice */}
          <div className={`${eduCardClass} rounded-xl p-4 shadow-sm`}>
            <h4 className="text-base font-bold mb-1">
              Rice (Paddy)
            </h4>
            <p className={`text-xs mb-2 font-semibold ${eduSubText}`}>
              Suitable for areas with good water availability.
            </p>
            <ul className={`text-xs space-y-1 font-semibold ${eduSubText}`}>
              <li>
                <span className="font-bold">Soil:</span> Clay or loam with
                good water-holding capacity.
              </li>
              <li>
                <span className="font-bold">Water:</span> High rainfall or
                assured irrigation.
              </li>
              <li>
                <span className="font-bold">Temperature:</span> Warm &amp;
                humid (around 20–30°C).
              </li>
              <li>
                <span className="font-bold">When it appears:</span> High
                rainfall + suitable NPK &amp; pH.
              </li>
            </ul>
          </div>

          {/* Wheat */}
          <div className={`${eduCardClass} rounded-xl p-4 shadow-sm`}>
            <h4 className="text-base font-bold mb-1">
              Wheat
            </h4>
            <p className={`text-xs mb-2 font-semibold ${eduSubText}`}>
              More suitable for cooler &amp; relatively dry seasons.
            </p>
            <ul className={`text-xs space-y-1 font-semibold ${eduSubText}`}>
              <li>
                <span className="font-bold">Soil:</span> Well-drained loam.
              </li>
              <li>
                <span className="font-bold">Water:</span> Moderate rainfall,
                avoids waterlogging.
              </li>
              <li>
                <span className="font-bold">Temperature:</span> Cooler
                (around 15–25°C).
              </li>
              <li>
                <span className="font-bold">When it appears:</span> Moderate
                rainfall &amp; suitable temperature range.
              </li>
            </ul>
          </div>

          {/* Maize */}
          <div className={`${eduCardClass} rounded-xl p-4 shadow-sm`}>
            <h4 className="text-base font-bold mb-1">
              Maize (Corn)
            </h4>
            <p className={`text-xs mb-2 font-semibold ${eduSubText}`}>
              A versatile crop suitable for many regions.
            </p>
            <ul className={`text-xs space-y-1 font-semibold ${eduSubText}`}>
              <li>
                <span className="font-bold">Soil:</span> Well-drained,
                fertile soils.
              </li>
              <li>
                <span className="font-bold">Water:</span> Moderate rainfall,
                sensitive to water stress at flowering.
              </li>
              <li>
                <span className="font-bold">Temperature:</span> Warm
                conditions (around 18–27°C).
              </li>
              <li>
                <span className="font-bold">When it appears:</span> Balanced
                NPK + moderate rainfall and good temperature.
              </li>
            </ul>
          </div>
        </div>

        {/* Small tips box */}
        <div
          className={`${eduCardClass} rounded-xl p-4 text-xs font-semibold`}
        >
          <h4 className="text-sm font-bold mb-2">
            How to use this information
          </h4>
          <ol className={`list-decimal list-inside space-y-1 ${eduSubText}`}>
            <li>
              Check the <span className="font-bold">recommended crop</span> in
              the Crop Suggestion page.
            </li>
            <li>
              Compare its basic requirements (rainfall, temperature, soil) with{" "}
              your real field conditions.
            </li>
            <li>
              If conditions do not match, consider one of the{" "}
              <span className="font-bold">alternative crops</span> shown by the
              model.
            </li>
            <li>
              Always combine model output with{" "}
              <span className="font-bold">local farmer experience</span> and{" "}
              expert advice.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}

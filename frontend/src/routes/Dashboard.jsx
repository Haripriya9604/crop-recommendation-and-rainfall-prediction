import React from "react";
import { Link } from "react-router-dom";
import { usePrediction } from "../context/PredictionContext";
import { useTheme } from "../context/ThemeContext";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  ChartTooltip,
  ChartLegend,
  CategoryScale,
  LinearScale,
  BarElement
);

function StatCard({ title, value, subtitle, isDark }) {
  const cardClass = isDark
    ? "bg-slate-900 border border-slate-700"
    : "bg-white border border-gray-200";

  const titleClass = isDark ? "text-slate-200" : "text-gray-700";
  const mainClass = isDark ? "text-slate-50" : "text-gray-900";
  const subClass = isDark ? "text-slate-300" : "text-gray-800";

  return (
    <div className={`${cardClass} rounded-xl shadow-sm p-4`}>
      <p
        className={`text-xs uppercase tracking-wide mb-1 font-bold ${titleClass}`}
      >
        {title}
      </p>
      <p className={`text-2xl font-extrabold ${mainClass}`}>{value}</p>
      {subtitle && (
        <p className={`text-xs mt-1 font-semibold ${subClass}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const { lastCrop, lastRain } = usePrediction();
  const { isDark } = useTheme();

  const baseText = isDark ? "text-slate-50" : "text-gray-900";
  const subText = isDark ? "text-slate-300" : "text-gray-700";
  const cardBase = isDark
    ? "bg-slate-900 border border-slate-700"
    : "bg-white border border-gray-200";

  const legendColor = isDark ? "#e5e7eb" : "#111827";

  const formatDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString();
  };

  const N = lastCrop?.input?.N ? Number(lastCrop.input.N) : 0;
  const P = lastCrop?.input?.P ? Number(lastCrop.input.P) : 0;
  const K = lastCrop?.input?.K ? Number(lastCrop.input.K) : 0;

  const npkChartData = {
    labels: ["N", "P", "K"],
    datasets: [
      {
        label: "Soil NPK",
        data: [N, P, K],
        backgroundColor: ["#0ea5e9", "#22c55e", "#eab308"],
        borderWidth: 1,
      },
    ],
  };

  const npkOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          color: legendColor,
          font: { weight: "bold" },
        },
      },
    },
  };

  const lag1 = lastRain?.input?.lag1 ? Number(lastRain.input.lag1) : 0;
  const lag2 = lastRain?.input?.lag2 ? Number(lastRain.input.lag2) : 0;
  const lag3 = lastRain?.input?.lag3 ? Number(lastRain.input.lag3) : 0;

  const lagPieData = {
    labels: ["Lag1", "Lag2", "Lag3"],
    datasets: [
      {
        label: "Lag Rainfall Composition",
        data: [lag1, lag2, lag3],
        backgroundColor: ["#6366f1", "#ec4899", "#14b8a6"],
        borderWidth: 1,
      },
    ],
  };

  const lagPieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          color: legendColor,
          font: { weight: "bold" },
        },
      },
    },
  };

  const predicted = lastRain?.rainfall ? Number(lastRain.rainfall) : 0;

  const rainBarData = {
    labels: ["Lag1", "Lag2", "Lag3", "Predicted"],
    datasets: [
      {
        label: "Rainfall (mm)",
        data: [lag1, lag2, lag3, predicted],
        backgroundColor: ["#6366f1", "#ec4899", "#14b8a6", "#f97316"],
      },
    ],
  };

  const rainBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          color: legendColor,
          font: { weight: "bold" },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: legendColor, font: { weight: "bold" } },
      },
      y: {
        beginAtZero: true,
        ticks: { color: legendColor, font: { weight: "bold" } },
      },
    },
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top section */}
      <section className={`${cardBase} rounded-xl shadow-sm p-6`}>
        <h2 className={`text-xl font-extrabold mb-2 ${baseText}`}>
          Project Overview
        </h2>
        <p className={`text-sm leading-relaxed font-semibold ${subText}`}>
          This system provides{" "}
          <span className="font-extrabold">crop recommendation</span> based on
          soil nutrients, weather, and recent rainfall patterns, along with{" "}
          <span className="font-extrabold">rainfall prediction</span> using
          lagged rainfall values. It is designed to support farmers and
          decision makers in selecting suitable crops for a given month and
          location.
        </p>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Models"
          value="2"
          subtitle="Crop recommendation & rainfall estimation"
          isDark={isDark}
        />
        <StatCard
          title="Inputs"
          value="10+"
          subtitle="Soil nutrients, weather & rainfall lags"
          isDark={isDark}
        />
        <StatCard
          title="Tech Stack"
          value="Flask + React"
          subtitle="Python backend, Vite/React frontend"
          isDark={isDark}
        />
      </section>

      {/* Last predictions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Last crop */}
        <div className={`${cardBase} rounded-xl shadow-sm p-5 flex flex-col justify-between`}>
          <div>
            <h3 className={`text-lg font-bold mb-2 ${baseText}`}>
              Last Crop Recommendation
            </h3>
            {lastCrop ? (
              <>
                <p className={`text-2xl font-extrabold mb-1 ${baseText}`}>
                  {lastCrop.crop}
                </p>
                {lastCrop.confidence && (
                  <p className={`text-sm font-semibold ${subText}`}>
                    Confidence: {(lastCrop.confidence * 100).toFixed(1)}%
                  </p>
                )}
                {lastCrop.createdAt && (
                  <p className={`text-xs mt-1 font-semibold ${subText}`}>
                    Generated at: {formatDateTime(lastCrop.createdAt)}
                  </p>
                )}
              </>
            ) : (
              <p className={`text-sm font-semibold ${subText}`}>
                No crop recommendation yet. Go to{" "}
                <span className="font-extrabold">Crop Suggestion</span> to get a
                prediction.
              </p>
            )}
          </div>
          <div className="mt-4">
            <Link
              to="/crop"
              className="inline-flex items-center px-3 py-2 rounded-md text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
            >
              Go to Crop Suggestion →
            </Link>
          </div>
        </div>

        {/* Last rainfall */}
        <div className={`${cardBase} rounded-xl shadow-sm p-5 flex flex-col justify-between`}>
          <div>
            <h3 className={`text-lg font-bold mb-2 ${baseText}`}>
              Last Rainfall Prediction
            </h3>
            {lastRain ? (
              <>
                <p className={`text-2xl font-extrabold mb-1 ${baseText}`}>
                  {lastRain.rainfall.toFixed(2)}{" "}
                  <span className="text-base font-semibold">
                    {lastRain.unit}
                  </span>
                </p>
                {lastRain.createdAt && (
                  <p className={`text-xs mt-1 font-semibold ${subText}`}>
                    Generated at: {formatDateTime(lastRain.createdAt)}
                  </p>
                )}
              </>
            ) : (
              <p className={`text-sm font-semibold ${subText}`}>
                No rainfall prediction yet. Go to{" "}
                <span className="font-extrabold">Rainfall</span> to estimate
                rainfall from lag values.
              </p>
            )}
          </div>
          <div className="mt-4">
            <Link
              to="/rainfall"
              className="inline-flex items-center px-3 py-2 rounded-md text-xs font-bold bg-blue-600 text-white hover:bg-blue-700"
            >
              Go to Rainfall Prediction →
            </Link>
          </div>
        </div>
      </section>

      {/* Visual insights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* NPK doughnut */}
        <div className={`${cardBase} rounded-xl shadow-sm p-4 flex flex-col`}>
          <h3 className={`text-sm font-bold mb-2 ${baseText}`}>
            Soil NPK Distribution
          </h3>
          {lastCrop ? (
            <div className="h-44">
              <Doughnut data={npkChartData} options={npkOptions} />
            </div>
          ) : (
            <p className={`text-xs font-semibold ${subText}`}>
              Run a crop prediction to visualize soil N, P, K levels.
            </p>
          )}
        </div>

        {/* Lag rainfall pie */}
        <div className={`${cardBase} rounded-xl shadow-sm p-4 flex flex-col`}>
          <h3 className={`text-sm font-bold mb-2 ${baseText}`}>
            Lag Rainfall Composition
          </h3>
          {lastRain ? (
            <div className="h-44">
              <Pie data={lagPieData} options={lagPieOptions} />
            </div>
          ) : (
            <p className={`text-xs font-semibold ${subText}`}>
              Run a rainfall prediction to see how Lag1–Lag3 contribute.
            </p>
          )}
        </div>

        {/* Rainfall bar chart */}
        <div className={`${cardBase} rounded-xl shadow-sm p-4 flex flex-col`}>
          <h3 className={`text-sm font-bold mb-2 ${baseText}`}>
            Lag vs Predicted Rainfall
          </h3>
          {lastRain ? (
            <div className="h-44">
              <Bar data={rainBarData} options={rainBarOptions} />
            </div>
          ) : (
            <p className={`text-xs font-semibold ${subText}`}>
              Rainfall bars will appear after at least one prediction.
            </p>
          )}
        </div>
      </section>

      {/* How to use */}
      <section className={`${cardBase} rounded-xl shadow-sm p-6`}>
        <h3 className={`text-lg font-bold mb-3 ${baseText}`}>
          How to Use
        </h3>
        <ol
          className={`list-decimal list-inside text-sm space-y-2 font-semibold ${subText}`}
        >
          <li>
            Start with the <span className="font-extrabold">Rainfall</span> page
            and enter lag rainfall values to estimate the current month
            rainfall.
          </li>
          <li>
            Go to <span className="font-extrabold">Crop Suggestion</span> and
            fill in soil nutrients (N, P, K), temperature, humidity, pH, and
            rainfall-related inputs.
          </li>
          <li>
            Review the{" "}
            <span className="font-extrabold">recommended crop</span>,
            confidence score, alternative options, and the visual insights
            above before finalizing the decision.
          </li>
        </ol>
      </section>
    </div>
  );
}

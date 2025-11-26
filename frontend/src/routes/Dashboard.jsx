import React from "react";
import { usePrediction } from "../context/PredictionContext";
import { useTheme } from "../context/ThemeContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";

function Dashboard() {
  const { lastCrop, lastRain } = usePrediction();
  const { isDark } = useTheme();

  const baseText = isDark ? "text-slate-50" : "text-gray-900";
  const subText = isDark ? "text-slate-300" : "text-gray-700";

  const cardClass = isDark
    ? "bg-slate-900/80 border border-slate-700"
    : "bg-white border border-gray-200";

  const softCardClass = isDark
    ? "bg-slate-900/70 border border-slate-700/70"
    : "bg-slate-50 border border-slate-200";

  const axisColor = isDark ? "#e5e7eb" : "#111827";
  const gridColor = isDark ? "#1f2937" : "#e5e7eb";

  const cropInput = lastCrop?.input || null;
  const rainInput = lastRain?.input || null;

  // NPK snapshot + average soil health
  let npkSnapshot = [];
  let avgNpk = null;
  let avgNpkLabel = "No data yet";

  if (cropInput) {
    const N = Number(cropInput.N) || 0;
    const P = Number(cropInput.P) || 0;
    const K = Number(cropInput.K) || 0;
    npkSnapshot = [
      { name: "N", value: N },
      { name: "P", value: P },
      { name: "K", value: K },
    ];
    avgNpk = (N + P + K) / 3;

    if (avgNpk < 30) avgNpkLabel = "Low nutrient availability";
    else if (avgNpk < 70) avgNpkLabel = "Moderate / balanced profile";
    else avgNpkLabel = "High nutrient regime";
  }

  // Rainfall trend: Lag1–Lag3 + Predicted
  const rainfallTrendData =
    rainInput && lastRain
      ? [
          { name: "Lag1", value: Number(rainInput.lag1) || 0 },
          { name: "Lag2", value: Number(rainInput.lag2) || 0 },
          { name: "Lag3", value: Number(rainInput.lag3) || 0 },
          {
            name: "Predicted",
            value: Number(lastRain.rainfall) || 0,
          },
        ]
      : [];

  // Simple mini sparkline using the same rainfall trend data
  const sparklineData = rainfallTrendData;

  // Environment snapshot for bar chart
  const envSnapshot =
    cropInput && lastRain
      ? [
          {
            name: "Field",
            Temperature: Number(cropInput.temperature) || 0,
            Humidity: Number(cropInput.humidity) || 0,
            Rainfall: Number(lastRain.rainfall) || 0,
          },
        ]
      : [];

  const cropConfidence =
    lastCrop?.confidence != null
      ? (lastCrop.confidence * 100).toFixed(1)
      : null;

  const lastCropTime = lastCrop?.createdAt
    ? new Date(lastCrop.createdAt).toLocaleString()
    : null;

  const lastRainTime = lastRain?.createdAt
    ? new Date(lastRain.createdAt).toLocaleString()
    : null;

  // ---- Rainfall vs Season (hardcoded normal values + overlay predicted) ----
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Example normal seasonal rainfall (mm) – just demo values
  const normalSeasonal = [20, 25, 30, 50, 80, 120, 150, 140, 110, 70, 40, 25];

  const currentMonthIndex =
    rainInput && rainInput.month >= 1 && rainInput.month <= 12
      ? rainInput.month - 1
      : null;

  const seasonalRainData = monthNames.map((m, idx) => {
    let predicted = null;
    if (lastRain && currentMonthIndex === idx) {
      predicted = Number(lastRain.rainfall) || 0;
    }
    return {
      month: m,
      normal: normalSeasonal[idx],
      predicted,
    };
  });

  return (
    <div className="space-y-6 animate-page">
      {/* Title */}
      <div className="space-y-1 text-center">
        <h2 className={`text-xl font-extrabold ${baseText}`}>
          Smart Farming Overview
        </h2>
        <p className={`text-sm font-semibold ${subText}`}>
          A single glance summary of your latest crop recommendation, rainfall
          estimate, and soil health.
        </p>
      </div>

      {/* TOP: Summary tiles (4) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Tile 1: Last Crop */}
        <div
          className={`${softCardClass} rounded-xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-emerald-500/25`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400 mb-1">
            Last Predicted Crop
          </p>
          {lastCrop ? (
            <>
              <p className="text-lg font-extrabold text-emerald-400">
                {lastCrop.crop}
              </p>
              {lastCropTime && (
                <p className="text-[11px] mt-2 text-slate-400 font-semibold">
                  Updated: {lastCropTime}
                </p>
              )}
            </>
          ) : (
            <p className={`text-xs font-semibold ${subText}`}>
              No crop predicted yet. Use the{" "}
              <span className="font-bold">Crop</span> page to get a
              recommendation.
            </p>
          )}
        </div>

        {/* Tile 2: Confidence */}
        <div
          className={`${softCardClass} rounded-xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/25`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-400 mb-1">
            Model Confidence
          </p>
          {cropConfidence ? (
            <>
              <p className="text-2xl font-extrabold text-cyan-400">
                {cropConfidence}%
              </p>
              <p className={`text-[11px] mt-2 font-semibold ${subText}`}>
                Higher confidence means the model is more certain about this
                crop with the given conditions.
              </p>
            </>
          ) : (
            <p className={`text-xs font-semibold ${subText}`}>
              Confidence will appear once you have at least one crop
              recommendation.
            </p>
          )}
        </div>

        {/* Tile 3: Last Rainfall Estimate + tiny sparkline */}
        <div
          className={`${softCardClass} rounded-xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-sky-500/25`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400 mb-1">
            Last Rainfall Estimate
          </p>
          {lastRain ? (
            <>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-lg font-extrabold text-sky-400">
                  {lastRain.rainfall.toFixed(2)}{" "}
                  <span className="text-xs font-semibold text-slate-300">
                    {lastRain.unit}
                  </span>
                </p>
              </div>
              {lastRainTime && (
                <p className="text-[11px] mt-1 text-slate-400 font-semibold">
                  Updated: {lastRainTime}
                </p>
              )}
              {/* Mini sparkline */}
              {sparklineData.length > 0 && (
                <div className="h-16 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#38bdf8"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          ) : (
            <p className={`text-xs font-semibold ${subText}`}>
              No rainfall prediction yet. Use the{" "}
              <span className="font-bold">Rainfall</span> page to get a
              forecast.
            </p>
          )}
        </div>

        {/* Tile 4: Average NPK health */}
        <div
          className={`${softCardClass} rounded-xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/25`}
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400 mb-1">
            Average Soil Nutrient Health
          </p>
          {avgNpk !== null ? (
            <>
              <p className="text-lg font-extrabold text-amber-300">
                {avgNpk.toFixed(1)} (NPK avg)
              </p>
              <p className={`text-[11px] mt-1 font-semibold ${subText}`}>
                {avgNpkLabel}
              </p>
              <p className={`text-[11px] mt-1 font-semibold ${subText}`}>
                N: {cropInput.N}, P: {cropInput.P}, K: {cropInput.K}
              </p>
            </>
          ) : (
            <p className={`text-xs font-semibold ${subText}`}>
              NPK health will be summarized here once you submit at least one
              crop recommendation.
            </p>
          )}
        </div>
      </section>

      {/* MIDDLE: NPK & Environment */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* NPK snapshot */}
        <div
          className={`${cardClass} rounded-xl p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20`}
        >
          <h3 className={`text-sm font-bold ${baseText}`}>
            Soil Nutrient Snapshot (N · P · K)
          </h3>
          <p className={`text-xs font-semibold ${subText}`}>
            Based on the last crop recommendation input. Use this to decide
            whether to correct deficiencies or avoid over-application.
          </p>
          {npkSnapshot.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={npkSnapshot}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="name"
                    stroke={axisColor}
                    tick={{ fill: axisColor, fontWeight: 600, fontSize: 11 }}
                  />
                  <YAxis
                    stroke={axisColor}
                    tick={{ fill: axisColor, fontWeight: 600, fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className={`text-xs font-semibold mt-2 ${subText}`}>
              NPK bars will appear after you submit at least one crop
              recommendation.
            </p>
          )}
        </div>

        {/* Environment snapshot */}
        <div
          className={`${cardClass} rounded-xl p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/20`}
        >
          <h3 className={`text-sm font-bold ${baseText}`}>
            Environment Snapshot
          </h3>
          <p className={`text-xs font-semibold ${subText}`}>
            Combines your temperature, humidity, and the latest rainfall
            prediction to describe your field&apos;s current climatic mood.
          </p>
          {envSnapshot.length > 0 ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={envSnapshot}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="name"
                    stroke={axisColor}
                    tick={{ fill: axisColor, fontWeight: 600, fontSize: 11 }}
                  />
                  <YAxis
                    stroke={axisColor}
                    tick={{ fill: axisColor, fontWeight: 600, fontSize: 11 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Temperature" fill="#f97316" />
                  <Bar dataKey="Humidity" fill="#3b82f6" />
                  <Bar dataKey="Rainfall" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className={`text-xs font-semibold mt-2 ${subText}`}>
              Environment chart will appear once both crop and rainfall
              predictions are available.
            </p>
          )}
        </div>
      </section>

      {/* BOTTOM: Rainfall story + Rainfall vs Season */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Rainfall story: lags vs predicted */}
        <div
          className={`${cardClass} rounded-xl p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/20`}
        >
          <h3 className={`text-sm font-bold ${baseText}`}>
            Rainfall Story: Lags vs Predicted
          </h3>
          <p className={`text-xs font-semibold ${subText}`}>
            Tracks how recent rainfall lags compare with the predicted
            rainfall. A higher predicted point than all lags suggests an
            upcoming wetter spell.
          </p>

          {rainfallTrendData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rainfallTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                  <XAxis
                    dataKey="name"
                    stroke={axisColor}
                    tick={{ fill: axisColor, fontWeight: 600, fontSize: 11 }}
                  />
                  <YAxis
                    stroke={axisColor}
                    tick={{ fill: axisColor, fontWeight: 600, fontSize: 11 }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className={`text-xs font-semibold mt-2 ${subText}`}>
              Run at least one rainfall prediction to see this story.
            </p>
          )}
        </div>

        {/* Rainfall vs Season */}
        <div
          className={`${cardClass} rounded-xl p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20`}
        >
          <h3 className={`text-sm font-bold ${baseText}`}>
            Rainfall vs Seasonal Pattern
          </h3>
          <p className={`text-xs font-semibold ${subText}`}>
            Compares typical seasonal rainfall for each month with your latest
            prediction for the selected month. Helps you see if you&apos;re
            heading into a drier or wetter-than-normal season.
          </p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalRainData}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis
                  dataKey="month"
                  stroke={axisColor}
                  tick={{ fill: axisColor, fontWeight: 600, fontSize: 10 }}
                />
                <YAxis
                  stroke={axisColor}
                  tick={{ fill: axisColor, fontWeight: 600, fontSize: 11 }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="normal" fill="#334155" name="Normal Season" />
                <Bar dataKey="predicted" fill="#22c55e" name="Predicted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

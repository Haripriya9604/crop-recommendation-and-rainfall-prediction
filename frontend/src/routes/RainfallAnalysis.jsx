import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { usePrediction } from "../context/PredictionContext";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const API_BASE = "http://127.0.0.1:5000";

// Simple seasonal monsoon info (generic Indian pattern)
const RAINFALL_SEASONS = [
  {
    monthIndex: 0,
    monthName: "January",
    phase: "Winter / Dry",
    typical: "Very low rainfall; cool & dry conditions.",
    icon: "❄️",
    colorClass: "bg-sky-500/80 text-sky-50",
  },
  {
    monthIndex: 1,
    monthName: "February",
    phase: "Winter / Pre-Heat",
    typical: "Generally dry with slowly rising temperatures.",
    icon: "🌤️",
    colorClass: "bg-sky-400/80 text-sky-50",
  },
  {
    monthIndex: 2,
    monthName: "March",
    phase: "Pre-Monsoon",
    typical: "Hotter days; occasional thunderstorms in some regions.",
    icon: "🌦️",
    colorClass: "bg-amber-500/80 text-amber-50",
  },
  {
    monthIndex: 3,
    monthName: "April",
    phase: "Pre-Monsoon",
    typical: "Very warm; convective showers possible by evening.",
    icon: "🌡️",
    colorClass: "bg-amber-600/80 text-amber-50",
  },
  {
    monthIndex: 4,
    monthName: "May",
    phase: "Pre-Monsoon / Onset Prep",
    typical: "Peak summer; first monsoon clouds build up in south.",
    icon: "🔥",
    colorClass: "bg-red-500/80 text-red-50",
  },
  {
    monthIndex: 5,
    monthName: "June",
    phase: "SW Monsoon Onset",
    typical: "Monsoon sets in; rainfall quickly increases.",
    icon: "🌧️",
    colorClass: "bg-emerald-600/80 text-emerald-50",
  },
  {
    monthIndex: 6,
    monthName: "July",
    phase: "SW Monsoon Peak",
    typical: "Very high rainfall; major water recharge month.",
    icon: "🌧️",
    colorClass: "bg-emerald-500/90 text-emerald-50",
  },
  {
    monthIndex: 7,
    monthName: "August",
    phase: "SW Monsoon Active",
    typical: "Sustained monsoon with breaks; good crop moisture.",
    icon: "💧",
    colorClass: "bg-emerald-500/80 text-emerald-50",
  },
  {
    monthIndex: 8,
    monthName: "September",
    phase: "SW Monsoon Withdrawal",
    typical: "Rains start reducing; transition to post-monsoon.",
    icon: "🌦️",
    colorClass: "bg-emerald-400/80 text-emerald-50",
  },
  {
    monthIndex: 9,
    monthName: "October",
    phase: "NE Monsoon / Post-Monsoon",
    typical: "Rain in east & south; retreating monsoon showers.",
    icon: "🌧️",
    colorClass: "bg-indigo-500/80 text-indigo-50",
  },
  {
    monthIndex: 10,
    monthName: "November",
    phase: "NE Monsoon / Cool",
    typical: "Rainy spells in some regions; temps start to drop.",
    icon: "🌧️",
    colorClass: "bg-indigo-600/80 text-indigo-50",
  },
  {
    monthIndex: 11,
    monthName: "December",
    phase: "Winter Onset",
    typical: "Mostly dry and cooler; isolated showers possible.",
    icon: "❄️",
    colorClass: "bg-slate-600/80 text-slate-50",
  },
];

function classifyRainfallLevel(valueMm) {
  if (valueMm == null || isNaN(valueMm)) return "Unknown";
  if (valueMm < 20) return "Very Low";
  if (valueMm < 60) return "Low to Moderate";
  if (valueMm < 120) return "Good / Adequate";
  if (valueMm < 200) return "High";
  return "Very High / Heavy";
}

// 🔍 Minimal dark tooltip style (no big white box)
const tooltipStyle = {
  backgroundColor: "rgba(15,23,42,0.95)",
  border: "none",
  borderRadius: "0.5rem",
  padding: "4px 8px",
  color: "#e5e7eb",
  boxShadow: "0 10px 30px rgba(15,23,42,0.55)",
};

function RainfallAnalysis() {
  const [formValues, setFormValues] = useState({
    month: 11,
    lag1: 60,
    lag2: 55,
    lag3: 50,
  });

  const { isDark } = useTheme();
  const { setLastRain } = usePrediction();

  const { mutate, data, isPending, isError, error } = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post(
        `${API_BASE}/api/predict-rainfall`,
        payload
      );
      return res.data;
    },
    onSuccess: (result) => {
      setLastRain({
        ...result,
        input: { ...formValues },
        createdAt: new Date().toISOString(),
      });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      month: Number(formValues.month),
      lag1: Number(formValues.lag1),
      lag2: Number(formValues.lag2),
      lag3: Number(formValues.lag3),
    };
    mutate(payload);
  };

  const baseText = isDark ? "text-slate-50" : "text-gray-900";
  const subText = isDark ? "text-slate-300" : "text-gray-700";

  const cardClass = isDark
    ? "bg-slate-900/80 border border-slate-700"
    : "bg-white border border-gray-200";

  const inputClass = isDark
    ? "border border-slate-600 bg-slate-900/90 text-slate-50"
    : "border border-gray-300 bg-white text-gray-900";

  const axisColor = isDark ? "#e5e7eb" : "#111827";
  const gridColor = isDark ? "#1f2937" : "#e5e7eb";

  const rainfall = data?.rainfall ?? null;
  const rainfallLevel = classifyRainfallLevel(rainfall);

  const l1 = Number(formValues.lag1) || 0;
  const l2 = Number(formValues.lag2) || 0;
  const l3 = Number(formValues.lag3) || 0;

  const historyData = [
    { name: "Lag1", value: l1 },
    { name: "Lag2", value: l2 },
    { name: "Lag3", value: l3 },
  ];

  const lineData = [
    { name: "Lag1", value: l1 },
    { name: "Lag2", value: l2 },
    { name: "Lag3", value: l3 },
    rainfall != null ? { name: "Predicted", value: rainfall } : null,
  ].filter(Boolean);

  const monthIndex = (Number(formValues.month) || 1) - 1;
  const activeMonthInfo =
    RAINFALL_SEASONS.find((m) => m.monthIndex === monthIndex) ||
    RAINFALL_SEASONS[0];

  const calendarBoxClass = isDark
    ? "bg-slate-900/70 border border-emerald-600/60 text-emerald-100"
    : "bg-emerald-50 border border-emerald-300 text-emerald-900";

  // 🧠 Simple “next 7 days” to-do based on rainfall level
  const next7DaysTasks = (() => {
    if (rainfall == null) return [];
    switch (rainfallLevel) {
      case "Very Low":
        return [
          "Plan supplemental irrigation if crop is in vegetative/flowering stage.",
          "Use mulching to conserve soil moisture and reduce evaporation.",
          "Avoid heavy nitrogen top-dressing until some moisture is available.",
        ];
      case "Low to Moderate":
        return [
          "Good for early establishment – schedule light irrigation only if soil cracks.",
          "Plan weeding & intercultivation; soil is moist enough to work.",
          "Check canal/borewell availability in case next spell is delayed.",
        ];
      case "Good / Adequate":
        return [
          "Ideal window for nutrient application (top-dress N & K) if crop stage matches.",
          "Use this moisture to complete any pending gap-filling or thinning.",
          "Monitor for foliar diseases after 3–4 continuous cloudy days.",
        ];
      case "High":
        return [
          "Inspect drainage channels and bunds to avoid standing water.",
          "Avoid entering fields with machinery until topsoil dries slightly.",
          "Watch out for root diseases and nutrient leaching; plan corrective spray/basal later.",
        ];
      case "Very High / Heavy":
        return [
          "High risk of waterlogging – open emergency drains where possible.",
          "Post-rain: check for lodging, root rot and yellowing due to nutrient wash-out.",
          "Delay sowing/planting until field is workable; avoid compaction.",
        ];
      default:
        return [
          "Use the predicted rainfall along with local IMD / weather apps.",
          "Adjust irrigation and field operations based on real-time conditions.",
        ];
    }
  })();

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-page">
      {/* Title */}
      <div className="space-y-1 text-center">
        <h2 className={`text-xl font-extrabold ${baseText}`}>
          Rainfall Prediction & Seasonal Insight
        </h2>
        <p className={`text-sm font-semibold ${subText}`}>
          Estimate upcoming rainfall using lag values, and see where it fits
          into your monsoon calendar.
        </p>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT: form + result */}
        <div className="space-y-4">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl shadow-sm p-6 ${cardClass} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/25`}
          >
            <div className="flex flex-col">
              <label className={`text-sm font-bold mb-1 ${baseText}`}>
                Month (1–12)
              </label>
              <input
                type="number"
                name="month"
                min="1"
                max="12"
                value={formValues.month}
                onChange={handleChange}
                className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200`}
              />
            </div>

            <div className="flex flex-col">
              <label className={`text-sm font-bold mb-1 ${baseText}`}>
                Lag1 Rainfall (mm)
              </label>
              <input
                type="number"
                name="lag1"
                value={formValues.lag1}
                onChange={handleChange}
                className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200`}
              />
            </div>

            <div className="flex flex-col">
              <label className={`text-sm font-bold mb-1 ${baseText}`}>
                Lag2 Rainfall (mm)
              </label>
              <input
                type="number"
                name="lag2"
                value={formValues.lag2}
                onChange={handleChange}
                className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200`}
              />
            </div>

            <div className="flex flex-col">
              <label className={`text-sm font-bold mb-1 ${baseText}`}>
                Lag3 Rainfall (mm)
              </label>
              <input
                type="number"
                name="lag3"
                value={formValues.lag3}
                onChange={handleChange}
                className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-200`}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="col-span-1 sm:col-span-2 mt-2 inline-flex justify-center items-center px-4 py-2 rounded-md bg-sky-500 text-slate-900 text-sm font-extrabold hover:bg-sky-400 disabled:opacity-60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-sky-500/40"
            >
              {isPending ? "Predicting..." : "Predict Rainfall"}
            </button>
          </form>

          {/* Error */}
          {isError && (
            <div className="text-sm text-red-300 bg-red-950/60 border border-red-900 p-3 rounded-md font-semibold">
              Error:{" "}
              {error?.response?.data?.error || error.message || "Unknown error"}
            </div>
          )}

          {/* Result card */}
          <div
            className={`${cardClass} rounded-xl shadow-sm p-6 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/25`}
          >
            <h3 className={`text-lg font-bold ${baseText}`}>
              Predicted Rainfall
            </h3>

            {rainfall != null ? (
              <>
                <p className="text-3xl font-extrabold text-sky-400">
                  {rainfall.toFixed(2)} mm
                </p>
                <p className={`text-sm font-semibold ${subText}`}>
                  Level:{" "}
                  <span className="font-bold text-sky-400">
                    {rainfallLevel}
                  </span>
                </p>

                {/* 🔹 Tiny sparkline trend inside result card */}
                <div className="mt-3">
                  <p className={`text-[11px] mb-1 font-semibold ${subText}`}>
                    Recent lag trend vs predicted:
                  </p>
                  <div className="h-20 rounded-lg border border-sky-500/40 bg-sky-500/5 px-2 py-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={lineData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={isDark ? "#1f2937" : "#e5e7eb"}
                        />
                        <XAxis
                          dataKey="name"
                          hide
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={tooltipStyle}
                          labelStyle={{
                            color: "#e5e7eb",
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                          itemStyle={{
                            color: "#e5e7eb",
                            fontWeight: 600,
                            fontSize: 11,
                          }}
                          cursor={{
                            stroke: "#0ea5e9",
                            strokeWidth: 1,
                            strokeDasharray: "3 3",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div
                  className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${calendarBoxClass}`}
                >
                  <p className="text-[11px] uppercase tracking-wide font-extrabold mb-1">
                    What this means for your field
                  </p>
                  <p className="text-[13px] font-bold mb-1">
                    {activeMonthInfo.monthName} • {activeMonthInfo.phase}
                  </p>
                  <p className="text-[12px] mb-1">
                    Typical pattern: {activeMonthInfo.typical}
                  </p>
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    {rainfallLevel === "Very Low" && (
                      <>
                        <li>
                          Plan supplemental irrigation or choose
                          drought-tolerant crops.
                        </li>
                        <li>
                          Mulch the soil to conserve moisture and reduce
                          evaporation.
                        </li>
                      </>
                    )}
                    {rainfallLevel === "Low to Moderate" && (
                      <>
                        <li>
                          Good for early vegetative stages with controlled
                          irrigation.
                        </li>
                        <li>
                          Monitor soil moisture; avoid waterlogging sensitive
                          crops.
                        </li>
                      </>
                    )}
                    {rainfallLevel === "Good / Adequate" && (
                      <>
                        <li>
                          Favourable for most field crops if drainage is proper.
                        </li>
                        <li>
                          Use this window for nutrient applications and
                          intercultivation.
                        </li>
                      </>
                    )}
                    {rainfallLevel === "High" && (
                      <>
                        <li>
                          Ensure drainage to avoid waterlogging and root
                          diseases.
                        </li>
                        <li>
                          Avoid heavy field operations when soil is saturated.
                        </li>
                      </>
                    )}
                    {rainfallLevel === "Very High / Heavy" && (
                      <>
                        <li>
                          High risk of flooding / lodging; strengthen bunds and
                          drainage.
                        </li>
                        <li>
                          Post-rain, check for nutrient leaching and apply top
                          up if needed.
                        </li>
                      </>
                    )}
                  </ul>
                  <p className="text-[11px] mt-2 opacity-80">
                    Use this predicted value along with your local forecast
                    (IMD / apps) to plan irrigation, sowing and fertilizer
                    schedule.
                  </p>
                </div>

                {/* ✅ Next 7 days action checklist */}
                {next7DaysTasks.length > 0 && (
                  <div className="mt-3 rounded-lg border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-semibold">
                    <p className="text-[11px] uppercase tracking-wide font-extrabold mb-1 text-sky-200">
                      Suggested focus – next 7 days
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {next7DaysTasks.map((task, idx) => (
                        <li key={idx}>{task}</li>
                      ))}
                    </ul>
                    <p className="text-[11px] mt-2 opacity-80 text-sky-100">
                      Treat this as guidance and always adapt to your exact
                      crop stage and local advisories.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className={`text-sm font-semibold ${subText}`}>
                Submit the form to see the predicted rainfall (mm), level
                (very low → heavy) and seasonal guidance based on the month you
                selected.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT: charts + monsoon calendar */}
        <div className="space-y-4">
          {/* Bar chart of lag rainfall */}
          <div
            className={`${cardClass} rounded-xl shadow-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/25`}
          >
            <h4 className={`text-sm font-bold mb-1 ${baseText}`}>
              Lag Rainfall Comparison
            </h4>
            <p className={`text-xs mb-2 font-semibold ${subText}`}>
              Visual comparison of the last three observed rainfall values.
            </p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={historyData}>
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
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{
                      color: "#e5e7eb",
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                    itemStyle={{
                      color: "#e5e7eb",
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                    cursor={{
                      stroke: "#38bdf8",
                      strokeWidth: 1,
                      strokeDasharray: "3 3",
                    }}
                  />
                  <Bar dataKey="value" fill="#38bdf8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line chart including predicted */}
          <div
            className={`${cardClass} rounded-xl shadow-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-sky-500/25`}
          >
            <h4 className={`text-sm font-bold mb-1 ${baseText}`}>
              Rainfall Trend (Lags + Prediction)
            </h4>
            <p className={`text-xs mb-2 font-semibold ${subText}`}>
              See how the predicted value sits after the last three observed
              lags.
            </p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
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
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={{
                      color: "#e5e7eb",
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                    itemStyle={{
                      color: "#e5e7eb",
                      fontWeight: 600,
                      fontSize: 11,
                    }}
                    cursor={{
                      stroke: "#0ea5e9",
                      strokeWidth: 1,
                      strokeDasharray: "3 3",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monsoon calendar – 12 months, colourful, icon-based */}
          <div
            className={`${cardClass} rounded-xl shadow-lg p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-sky-500/30`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4
                className={`text-sm font-bold flex items-center gap-2 ${baseText}`}
              >
                <span className="text-lg">🗓️</span>
                Monsoon Calendar (Year View)
              </h4>
              <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-500">
                Active Month: {activeMonthInfo.monthName}
              </span>
            </div>

            <p className={`text-xs mb-3 font-semibold ${subText}`}>
              Each tile shows the typical rainfall behaviour for a month.
              The month you selected in the form is highlighted to help you
              read the prediction in the right seasonal context.
            </p>

            <div className="rounded-xl bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-emerald-500/10 border border-sky-500/30 px-3 py-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-[11px]">
                {RAINFALL_SEASONS.map((m) => {
                  const isActive = m.monthIndex === monthIndex;
                  const baseTile =
                    "relative rounded-lg min-h[72px] min-h-[72px] flex flex-col justify-between p-2 border text-[11px] font-semibold transition-all duration-200 cursor-default";
                  const themed =
                    m.colorClass +
                    " border-transparent shadow-sm hover:shadow-lg hover:-translate-y-0.5";
                  const activeRing = isActive
                    ? "ring-2 ring-offset-2 ring-sky-400 ring-offset-slate-950/60"
                    : "";

                  return (
                    <div
                      key={m.monthIndex}
                      className={`${baseTile} ${themed} ${activeRing}`}
                      title={`${m.monthName}: ${m.phase}`}
                    >
                      {/* Top row: month + icon */}
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-extrabold">
                          {m.monthName}
                        </p>
                        <span className="text-base ml-1">{m.icon}</span>
                      </div>

                      {/* Phase */}
                      <p className="mt-1 text-[10px] font-bold opacity-90">
                        {m.phase}
                      </p>

                      {/* Typical description */}
                      <p className="mt-1 text-[10px] leading-snug opacity-95">
                        {m.typical}
                      </p>

                      {isActive && (
                        <div className="absolute -top-2 -right-2 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-900/80 text-sky-300 shadow-md">
                          Selected
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className={`text-[11px] mt-3 font-semibold ${subText}`}>
              Combine this{" "}
              <span className="font-bold">monsoon calendar</span> with the
              predicted rainfall value to decide if conditions are early,
              normal or delayed for sowing, irrigation and fertilizer planning.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RainfallAnalysis;

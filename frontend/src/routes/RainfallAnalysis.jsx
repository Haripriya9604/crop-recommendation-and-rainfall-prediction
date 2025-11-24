import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { predictRainfall } from "../lib/rainApi";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

const LAG_COLORS = ["#6366f1", "#ec4899", "#14b8a6"];

function RainfallAnalysis() {
  const [values, setValues] = useState({
    month: 11,
    lag1: 60,
    lag2: 55,
    lag3: 50,
  });

  const { setLastRain } = usePrediction();
  const { isDark } = useTheme();

  const { mutate, data, isPending, isError, error } = useMutation({
    mutationFn: predictRainfall,
    onSuccess: (result) => {
      setLastRain({
        ...result,
        input: { ...values },
        createdAt: new Date().toISOString(),
      });
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      month: Number(values.month),
      lag1: Number(values.lag1),
      lag2: Number(values.lag2),
      lag3: Number(values.lag3),
    };

    mutate(payload);
  };

  const chartData = [
    { name: "Lag1", value: Number(values.lag1) || 0 },
    { name: "Lag2", value: Number(values.lag2) || 0 },
    { name: "Lag3", value: Number(values.lag3) || 0 },
    data
      ? {
          name: "Predicted",
          value: Number(data.rainfall) || 0,
        }
      : null,
  ].filter(Boolean);

  const lagPieData = [
    { name: "Lag1", value: Number(values.lag1) || 0 },
    { name: "Lag2", value: Number(values.lag2) || 0 },
    { name: "Lag3", value: Number(values.lag3) || 0 },
  ];

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

  const rainfallValue = data ? Number(data.rainfall) : null;

  const tipsBoxClass = isDark
    ? "bg-blue-900/40 border border-blue-600/60 text-blue-100"
    : "bg-blue-50 border border-blue-300 text-blue-900";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-page">
      {/* Title */}
      <div className="space-y-1 text-center">
        <h2 className={`text-xl font-extrabold ${baseText}`}>
          Rainfall Prediction
        </h2>
        <p className={`text-sm font-semibold ${subText}`}>
          Adjust lag rainfall values on the left and see the trend & composition
          update live on the right.
        </p>
      </div>

      {/* Main layout */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className={`${cardClass} rounded-xl shadow-sm p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25`}
          >
            <div className="flex flex-col">
              <label className={`text-sm font-bold mb-1 ${baseText}`}>
                Month (1–12)
              </label>
              <input
                type="number"
                name="month"
                value={values.month}
                onChange={handleChange}
                className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className={`text-sm font-bold mb-1 ${baseText}`}>
                  Lag1 Rainfall (mm)
                </label>
                <input
                  type="number"
                  name="lag1"
                  value={values.lag1}
                  onChange={handleChange}
                  className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200`}
                />
              </div>

              <div className="flex flex-col">
                <label className={`text-sm font-bold mb-1 ${baseText}`}>
                  Lag2 Rainfall (mm)
                </label>
                <input
                  type="number"
                  name="lag2"
                  value={values.lag2}
                  onChange={handleChange}
                  className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200`}
                />
              </div>

              <div className="flex flex-col">
                <label className={`text-sm font-bold mb-1 ${baseText}`}>
                  Lag3 Rainfall (mm)
                </label>
                <input
                  type="number"
                  name="lag3"
                  value={values.lag3}
                  onChange={handleChange}
                  className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 inline-flex justify-center items-center px-4 py-2 rounded-md bg-emerald-500 text-slate-900 text-sm font-extrabold hover:bg-emerald-400 disabled:opacity-60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-500/40"
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

          {/* Result Story + Insights */}
          {data && (
            <section
              className={`${cardClass} rounded-xl shadow-sm p-6 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25`}
            >
              <h3 className={`text-lg font-bold ${baseText}`}>
                Estimated Rainfall
              </h3>
              <p className="text-2xl font-extrabold text-emerald-400">
                {data.rainfall.toFixed(2)}{" "}
                <span className={`text-base font-semibold ${subText}`}>
                  {data.unit}
                </span>
              </p>
              {data.note && (
                <p className={`text-xs font-semibold ${subText}`}>
                  {data.note}
                </p>
              )}
              <p className={`text-xs font-semibold ${subText}`}>
                Based on Lag1, Lag2, Lag3 and the selected month.
              </p>

              {/* Rainfall insights box */}
              {rainfallValue !== null && (
                <div
                  className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${tipsBoxClass}`}
                >
                  <p className="text-[11px] uppercase tracking-wide font-extrabold mb-1">
                    Rainfall Insights
                  </p>

                  {rainfallValue < 40 && (
                    <>
                      <p className="text-[13px] font-bold mb-1">
                        ☀️ Low Rainfall Expected
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          Consider drought-tolerant crops (millets, pulses,
                          sorghum).
                        </li>
                        <li>Use mulching to retain soil moisture.</li>
                        <li>
                          Avoid heavy nitrogen application before expected rain.
                        </li>
                        <li>Plan supplemental irrigation if possible.</li>
                      </ul>
                    </>
                  )}

                  {rainfallValue >= 40 && rainfallValue <= 120 && (
                    <>
                      <p className="text-[13px] font-bold mb-1">
                        🌦️ Moderate Rainfall
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Good conditions for most cereals and vegetables.</li>
                        <li>
                          Ensure proper drainage to avoid mild waterlogging.
                        </li>
                        <li>
                          Split fertilizer doses to reduce nutrient losses.
                        </li>
                      </ul>
                    </>
                  )}

                  {rainfallValue > 120 && (
                    <>
                      <p className="text-[13px] font-bold mb-1">
                        🌧️⚠️ High Rainfall Warning
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>
                          High risk of waterlogging – improve field drainage.
                        </li>
                        <li>
                          Avoid sowing crops sensitive to excess moisture in
                          low-lying fields.
                        </li>
                        <li>
                          Delay nitrogen fertilizers – high chance of leaching.
                        </li>
                        <li>
                          Monitor for fungal diseases and follow IPM practices.
                        </li>
                      </ul>
                    </>
                  )}
                </div>
              )}
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: charts */}
        <div className="space-y-4">
          {/* Line chart story */}
          <section
            className={`${cardClass} rounded-xl shadow-sm p-5 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25`}
          >
            <h4 className={`text-sm font-bold ${baseText}`}>
              Trend: Past vs Predicted Rainfall
            </h4>
            <p className={`text-xs font-semibold ${subText}`}>
              Compares your three lag values with the predicted rainfall. If the
              predicted point is above all lags, the model expects wetter
              conditions; below means drier.
            </p>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
          </section>

          {/* Pie chart story – FIXED SPACING */}
          <section
            className={`${cardClass} rounded-xl shadow-sm p-5 space-y-3 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25`}
          >
            <h4 className={`text-sm font-bold ${baseText}`}>
              Lag Rainfall Composition
            </h4>
            <p className={`text-xs font-semibold ${subText}`}>
              Shows how much each lag contributes to your rainfall history. A
              big slice means that lag is dominating the pattern.
            </p>
            <div className="h-64 mt-1 w-full flex justify-center items-center px-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, bottom: 20 }}>
                  <Pie
                    data={lagPieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    label={(entry) =>
                      `${entry.name}: ${entry.value.toFixed(1)} mm`
                    }
                    labelLine={false}
                  >
                    {lagPieData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={LAG_COLORS[index % LAG_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

export default RainfallAnalysis;

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className={`text-xl font-extrabold text-center ${baseText}`}>
        Rainfall Prediction
      </h2>
      <p className={`text-sm text-center font-semibold ${subText}`}>
        Enter lag rainfall values to estimate the current month&apos;s rainfall.
        Charts below react live to the inputs.
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className={`${cardClass} rounded-xl shadow-sm p-6 space-y-4`}
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
            className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500`}
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
              className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500`}
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
              className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500`}
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
              className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 inline-flex justify-center items-center px-4 py-2 rounded-md bg-emerald-500 text-slate-900 text-sm font-extrabold hover:bg-emerald-400 disabled:opacity-60"
        >
          {isPending ? "Predicting..." : "Predict Rainfall"}
        </button>
      </form>

      {/* Error */}
      {isError && (
        <div className="text-sm text-red-300 bg-red-950/60 border border-red-900 p-3 rounded-md font-semibold">
          Error: {error?.response?.data?.error || error.message || "Unknown error"}
        </div>
      )}

      {/* Result card */}
      {data && (
        <div className={`${cardClass} rounded-xl shadow-sm p-6`}>
          <h3 className={`text-lg font-bold mb-2 ${baseText}`}>
            Estimated Rainfall
          </h3>
          <p className="text-2xl font-extrabold mb-1 text-emerald-400">
            {data.rainfall.toFixed(2)}{" "}
            <span className={`text-base font-semibold ${subText}`}>
              {data.unit}
            </span>
          </p>
          {data.note && (
            <p className={`text-xs mt-1 font-semibold ${subText}`}>
              {data.note}
            </p>
          )}
        </div>
      )}

      {/* Line chart + donut chart */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${cardClass} rounded-xl shadow-sm p-4`}>
          <h4 className={`text-sm font-bold mb-2 ${baseText}`}>
            Lag Rainfall vs Predicted
          </h4>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#e5e7eb" />
                <YAxis stroke="#e5e7eb" />
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
        </div>

        <div
          className={`${cardClass} rounded-xl shadow-sm p-4 flex flex-col items-center justify-center`}
        >
          <h4 className={`text-sm font-bold mb-2 ${baseText}`}>
            Lag Rainfall Composition
          </h4>
          <p
            className={`text-xs mb-1 text-center font-semibold ${subText}`}
          >
            Shows how much each lag contributes to the overall pattern.
          </p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={lagPieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  label={(entry) =>
                    `${entry.name}: ${entry.value.toFixed(1)} mm`
                  }
                >
                  {lagPieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={LAG_COLORS[index % LAG_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RainfallAnalysis;

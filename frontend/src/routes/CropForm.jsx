import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { recommendCrop } from "../lib/cropApi";
import { usePrediction } from "../context/PredictionContext";
import { useTheme } from "../context/ThemeContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const NPK_COLORS = ["#0ea5e9", "#22c55e", "#eab308"];
const PIE_COLORS = ["#22c55e", "#0ea5e9", "#f97316"];

function CropForm() {
  const [formValues, setFormValues] = useState({
    month: 11,
    lag1: 60,
    lag2: 55,
    lag3: 50,
    N: 60,
    P: 40,
    K: 50,
    temperature: 23,
    humidity: 55,
    pH: 6.2,
  });

  const { isDark } = useTheme();
  const { setLastCrop } = usePrediction();

  const { mutate, data, isPending, isError, error } = useMutation({
    mutationFn: recommendCrop,
    onSuccess: (result) => {
      setLastCrop({
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
      N: Number(formValues.N),
      P: Number(formValues.P),
      K: Number(formValues.K),
      temperature: Number(formValues.temperature),
      humidity: Number(formValues.humidity),
      pH: Number(formValues.pH),
    };

    mutate(payload);
  };

  const fields = [
    { name: "month", label: "Month (1–12)" },
    { name: "lag1", label: "Lag1 Rainfall (mm)" },
    { name: "lag2", label: "Lag2 Rainfall (mm)" },
    { name: "lag3", label: "Lag3 Rainfall (mm)" },
    { name: "N", label: "Nitrogen (N)" },
    { name: "P", label: "Phosphorus (P)" },
    { name: "K", label: "Potassium (K)" },
    { name: "temperature", label: "Temperature (°C)" },
    { name: "humidity", label: "Humidity (%)" },
    { name: "pH", label: "Soil pH" },
  ];

  const npkData = [
    { name: "N", value: Number(formValues.N) || 0 },
    { name: "P", value: Number(formValues.P) || 0 },
    { name: "K", value: Number(formValues.K) || 0 },
  ];

  const rainfallEst =
    (Number(formValues.lag1) +
      Number(formValues.lag2) +
      Number(formValues.lag3)) /
      3 || 0;

  const envData = [
    {
      name: "Env",
      Temperature: Number(formValues.temperature) || 0,
      Humidity: Number(formValues.humidity) || 0,
      Rainfall: Number(rainfallEst.toFixed(2)),
    },
  ];

  const lagData = [
    { name: "Lag1", value: Number(formValues.lag1) || 0 },
    { name: "Lag2", value: Number(formValues.lag2) || 0 },
    { name: "Lag3", value: Number(formValues.lag3) || 0 },
  ];

  let top3ChartData = [];
  if (data && data.top3 && data.top3.length > 0) {
    const probs =
      data.top3_probs && data.top3_probs.length === data.top3.length
        ? data.top3_probs.map((p) => p * 100)
        : new Array(data.top3.length).fill(100 / data.top3.length);

    top3ChartData = data.top3.map((label, idx) => ({
      name: label,
      value: Number(probs[idx].toFixed(2)),
    }));
  }

  const baseText = isDark ? "text-slate-50" : "text-gray-900";
  const subText = isDark ? "text-slate-300" : "text-gray-700";

  const cardClass = isDark
    ? "bg-slate-900/80 border border-slate-700"
    : "bg-white border border-gray-200";

  const inputClass = isDark
    ? "border border-slate-600 bg-slate-900/90 text-slate-50"
    : "border border-gray-300 bg-white text-gray-900";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h2 className={`text-xl font-extrabold text-center ${baseText}`}>
        Crop Recommendation
      </h2>
      <p className={`text-sm text-center font-semibold ${subText}`}>
        Enter rainfall history and soil parameters to get a crop suggestion.
        The charts below update live as you change values.
      </p>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className={`grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl shadow-sm p-6 ${cardClass}`}
      >
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col">
            <label className={`text-sm font-bold mb-1 ${baseText}`}>
              {field.label}
            </label>
            <input
              type="number"
              step="any"
              name={field.name}
              value={formValues[field.name]}
              onChange={handleChange}
              className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={isPending}
          className="col-span-1 sm:col-span-2 mt-2 inline-flex justify-center items-center px-4 py-2 rounded-md bg-emerald-500 text-slate-900 text-sm font-extrabold hover:bg-emerald-400 disabled:opacity-60"
        >
          {isPending ? "Predicting..." : "Get Recommendation"}
        </button>
      </form>

      {/* Error */}
      {isError && (
        <div className="text-sm text-red-300 bg-red-950/60 border border-red-900 p-3 rounded-md font-semibold">
          Error: {error?.response?.data?.error || error.message || "Unknown error"}
        </div>
      )}

      {/* Result + donut */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`${cardClass} rounded-xl shadow-sm p-6`}>
          <h3 className={`text-lg font-bold mb-2 ${baseText}`}>
            Recommended Crop
          </h3>

          {data ? (
            <>
              <p className="text-2xl font-extrabold mb-1 text-emerald-400">
                {data.crop}
              </p>

              {data.confidence && (
                <p className={`text-sm font-semibold ${subText}`}>
                  Confidence: {(data.confidence * 100).toFixed(1)}%
                </p>
              )}

              {data.top3 && data.top3.length > 0 && (
                <p className={`text-sm mt-2 font-semibold ${subText}`}>
                  Alternatives:{" "}
                  <span className="font-bold">
                    {data.top3.join(", ")}
                  </span>
                </p>
              )}
            </>
          ) : (
            <p className={`text-sm font-semibold ${subText}`}>
              Submit the form to see the recommended crop and probability
              distribution.
            </p>
          )}
        </div>

        <div
          className={`${cardClass} rounded-xl shadow-sm p-6 flex flex-col items-center justify-center`}
        >
          <h4 className={`text-sm font-bold mb-2 ${baseText}`}>
            Crop Probability Distribution (Top 3)
          </h4>
          {top3ChartData.length > 0 ? (
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={top3ChartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    label={(entry) =>
                      `${entry.name} (${entry.value.toFixed(1)}%)`
                    }
                  >
                    {top3ChartData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(1)} %`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p
              className={`text-xs mt-2 text-center font-semibold ${subText}`}
            >
              Probability chart will appear after a prediction.
            </p>
          )}
        </div>
      </section>

      {/* NPK + Env */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className={`${cardClass} rounded-xl shadow-sm p-4`}>
          <h4 className={`text-sm font-bold mb-2 ${baseText}`}>
            Soil Nutrients (N, P, K)
          </h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={npkData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#e5e7eb" />
                <YAxis stroke="#e5e7eb" />
                <Tooltip />
                <Bar dataKey="value">
                  {npkData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={NPK_COLORS[index % NPK_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${cardClass} rounded-xl shadow-sm p-4 lg:col-span-2`}>
          <h4 className={`text-sm font-bold mb-2 ${baseText}`}>
            Environmental Conditions
          </h4>
          <p className={`text-xs mb-1 font-semibold ${subText}`}>
            Temperature, humidity and estimated rainfall based on lag values.
          </p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={envData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="name" stroke="#e5e7eb" />
                <YAxis stroke="#e5e7eb" />
                <Tooltip />
                <Legend />
                <Bar dataKey="Temperature" fill="#f97316" />
                <Bar dataKey="Humidity" fill="#3b82f6" />
                <Bar dataKey="Rainfall" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Lag line */}
      <section className={`${cardClass} rounded-xl shadow-sm p-4`}>
        <h4 className={`text-sm font-bold mb-2 ${baseText}`}>
          Recent Rainfall Pattern (Lag1–Lag3)
        </h4>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lagData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="name" stroke="#e5e7eb" />
              <YAxis stroke="#e5e7eb" />
              <Tooltip />
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
    </div>
  );
}

export default CropForm;

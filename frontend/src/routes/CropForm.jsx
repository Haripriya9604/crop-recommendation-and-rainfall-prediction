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

// Simple knowledge base for crop tips
const CROP_TIPS = {
  rice: {
    title: "Rice – Tips for Better Yield",
    bullets: [
      "Maintain standing water (2–5 cm) during most growth stages; avoid complete drying.",
      "Prepare a well puddled field with good bunding to reduce water loss.",
      "Apply basal NPK as per soil test; split nitrogen into 3–4 doses (basal, tillering, panicle initiation).",
      "Keep fields weed-free during the first 30–40 days using hand weeding or pre-emergence herbicides.",
      "Monitor for pests like stem borer and leaf folder; use recommended IPM practices instead of only chemical sprays.",
    ],
  },
  wheat: {
    title: "Wheat – Tips for Better Yield",
    bullets: [
      "Use well-drained loam soil; avoid waterlogging at crown root initiation stage.",
      "Sow with proper spacing and recommended seed rate to avoid overcrowding.",
      "Apply nitrogen in 2–3 splits (basal + crown root initiation + booting) for better grain filling.",
      "Irrigate at critical stages: CRI, tillering, booting, flowering and milk stage if water is available.",
      "Keep rust and foliar diseases under check with timely monitoring and recommended fungicides.",
    ],
  },
  maize: {
    title: "Maize – Tips for Better Yield",
    bullets: [
      "Ensure good land preparation and proper seed depth (3–5 cm) for uniform emergence.",
      "Maintain optimum plant population with recommended row and plant spacing.",
      "Provide adequate NPK, especially nitrogen split across early growth and knee-high stages.",
      "Avoid moisture stress at tasseling and silking stages; irrigate if rainfall is not sufficient.",
      "Control weeds during the first 30–35 days using intercultivation or suitable herbicides.",
    ],
  },
  default: {
    title: "General Tips for Maximizing Yield",
    bullets: [
      "Follow soil testing and apply NPK based on recommendations rather than guesswork.",
      "Choose disease-free quality seeds of recommended varieties/hybrids.",
      "Time your sowing with optimum temperature and expected rainfall for the crop.",
      "Keep the field weed-free during early growth to reduce competition for nutrients and light.",
      "Monitor pests and diseases regularly and adopt integrated pest management (IPM).",
    ],
  },
};

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
      name: "Environment",
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

  const axisColor = isDark ? "#e5e7eb" : "#111827";
  const gridColor = isDark ? "#1f2937" : "#e5e7eb";

  const cropName = data?.crop || "";
  const tipsKey = cropName ? cropName.toLowerCase() : "";
  const cropTips = CROP_TIPS[tipsKey] || CROP_TIPS.default;

  const tipsBoxClass = isDark
    ? "bg-emerald-900/40 border border-emerald-600/60 text-emerald-100"
    : "bg-emerald-50 border border-emerald-300 text-emerald-900";

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-page">
      {/* Title */}
      <div className="space-y-1 text-center">
        <h2 className={`text-xl font-extrabold ${baseText}`}>
          Crop Recommendation
        </h2>
        <p className={`text-sm font-semibold ${subText}`}>
          Fill your field conditions on the left and watch the crop logic
          update live in the charts on the right.
        </p>
      </div>

      {/* Main layout: left = form + result, right = charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-4">
          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl shadow-sm p-6 ${cardClass} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25`}
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
                  className={`${inputClass} rounded-md px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200`}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={isPending}
              className="col-span-1 sm:col-span-2 mt-2 inline-flex justify-center items-center px-4 py-2 rounded-md bg-emerald-500 text-slate-900 text-sm font-extrabold hover:bg-emerald-400 disabled:opacity-60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-emerald-500/40"
            >
              {isPending ? "Predicting..." : "Get Recommendation"}
            </button>
          </form>

          {/* Error */}
          {isError && (
            <div className="text-sm text-red-300 bg-red-950/60 border border-red-900 p-3 rounded-md font-semibold">
              Error:{" "}
              {error?.response?.data?.error || error.message || "Unknown error"}
            </div>
          )}

          {/* Result card + tips */}
          <div
            className={`${cardClass} rounded-xl shadow-sm p-6 space-y-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25`}
          >
            <h3 className={`text-lg font-bold ${baseText}`}>
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
                  <p className={`text-sm font-semibold ${subText}`}>
                    Alternatives:{" "}
                    <span className="font-bold">
                      {data.top3.join(", ")}
                    </span>
                  </p>
                )}

                {/* Tips box */}
                <div
                  className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${tipsBoxClass}`}
                >
                  <p className="text-[11px] uppercase tracking-wide font-extrabold mb-1">
                    Tips to Maximize Yield
                  </p>
                  <p className="text-[13px] font-bold mb-1">
                    {cropTips.title}
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {cropTips.bullets.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <p className={`text-sm font-semibold ${subText}`}>
                Submit the form to see the recommended crop, confidence and
                tailored agronomic tips to improve yield.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: live charts */}
        <div className="space-y-4">
          {/* Probability donut – FIXED SPACING */}
          <div
            className={`${cardClass} rounded-xl shadow-sm p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25`}
          >
            <h4 className={`text-sm font-bold ${baseText}`}>
              Crop Probability Distribution (Top 3)
            </h4>
            <p className={`text-xs font-semibold ${subText}`}>
              Shows how the model splits probability between the top-3 crops.
            </p>

            {top3ChartData.length > 0 ? (
              <div className="h-64 mt-1 flex justify-center items-center px-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 20, bottom: 20 }}>
                    <Pie
                      data={top3ChartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      label={({ name, value }) =>
                        `${name} (${value.toFixed(1)}%)`
                      }
                      labelLine={false}
                    >
                      {top3ChartData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={PIE_COLORS[index % PIE_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toFixed(1)} %`} />
                    <Legend verticalAlign="bottom" height={36} />
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

          {/* Soil NPK */}
          <div
            className={`${cardClass} rounded-xl shadow-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25`}
          >
            <h4 className={`text-sm font-bold mb-1 ${baseText}`}>
              Soil Nutrients (N, P, K)
            </h4>
            <p className={`text-xs mb-2 font-semibold ${subText}`}>
              Bar heights change live as you modify N, P, and K.
            </p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={npkData}>
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

          {/* Environment */}
          <div
            className={`${cardClass} rounded-xl shadow-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25`}
          >
            <h4 className={`text-sm font-bold mb-1 ${baseText}`}>
              Environment: Temp · Humidity · Estimated Rainfall
            </h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={envData}>
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
          </div>

          {/* Lag line */}
          <div
            className={`${cardClass} rounded-xl shadow-sm p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25`}
          >
            <h4 className={`text-sm font-bold mb-1 ${baseText}`}>
              Rainfall History (Lag1–Lag3)
            </h4>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lagData}>
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
        </div>
      </section>
    </div>
  );
}

export default CropForm;

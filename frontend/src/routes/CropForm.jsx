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
// from your older code
const CROP_COLORS = ["#22c55e", "#facc15", "#38bdf8"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

// -------- Fertilizer recommendation logic (frontend, rule-based) --------

function getCropTargets(cropName) {
  const key = cropName ? cropName.toLowerCase() : "default";

  const cropTargets = {
    rice: { N: 100, P: 50, K: 50 },
    wheat: { N: 90, P: 40, K: 40 },
    maize: { N: 120, P: 60, K: 40 },
    default: { N: 80, P: 40, K: 40 },
  };

  return cropTargets[key] || cropTargets.default;
}

function buildFertilizerPlan(cropName, N, P, K) {
  const n = Number(N) || 0;
  const p = Number(P) || 0;
  const k = Number(K) || 0;

  const target = getCropTargets(cropName);

  const needN = Math.max(0, target.N - n);
  const needP = Math.max(0, target.P - p);
  const needK = Math.max(0, target.K - k);

  // Convert nutrient requirement to product quantity (kg/acre)
  // Urea ≈ 46% N, DAP ≈ 46% P2O5, MOP ≈ 60% K2O
  const ureaKg = needN > 0 ? needN / 0.46 : 0;
  const dapKg = needP > 0 ? needP / 0.46 : 0;
  const mopKg = needK > 0 ? needK / 0.60 : 0;

  const rounded = (v) => (v <= 0 ? 0 : Number(v.toFixed(1)));

  return {
    target,
    need: {
      N: Number(needN.toFixed(1)),
      P: Number(needP.toFixed(1)),
      K: Number(needK.toFixed(1)),
    },
    products: {
      urea_kg_per_acre: rounded(ureaKg),
      dap_kg_per_acre: rounded(dapKg),
      mop_kg_per_acre: rounded(mopKg),
    },
    note:
      "These are approximate per-acre quantities based on a generic recommendation. Always fine-tune using local soil test reports and agronomist advice.",
  };
}

// -------- Yield estimate logic (t/ha) --------

function buildYieldEstimate(cropName, N, P, K, lastRain) {
  const n = Number(N) || 0;
  const p = Number(P) || 0;
  const k = Number(K) || 0;
  const key = cropName ? cropName.toLowerCase() : "default";

  const baseYield = {
    rice: 5.0,
    wheat: 4.5,
    maize: 6.0,
    default: 3.5,
  }[key] || 3.5;

  const targets = getCropTargets(cropName);

  // Nutrient sufficiency score (0–1)
  const nScore = Math.min(n / targets.N, 1);
  const pScore = Math.min(p / targets.P, 1);
  const kScore = Math.min(k / targets.K, 1);
  const nutrientScore = (nScore + pScore + kScore) / 3;

  // Rainfall suitability score (0–1) using lastRain.rainfall if available
  let rainfallScore = 0.6; // neutral default
  let rainfallUsed = null;
  let idealRain = {
    rice: 140,
    wheat: 80,
    maize: 110,
    default: 100,
  }[key] || 100;

  if (lastRain && typeof lastRain.rainfall === "number") {
    rainfallUsed = Number(lastRain.rainfall);
    const ratio = Math.max(
      0,
      1 - Math.abs(rainfallUsed - idealRain) / idealRain
    );
    rainfallScore = Math.min(Math.max(ratio, 0), 1);
  }

  // Combine into an overall score and scale base yield
  const overallScore = 0.55 * nutrientScore + 0.45 * rainfallScore;
  const yieldMultiplier = 0.7 + 0.6 * overallScore; // between ~0.7x and ~1.3x
  const estimatedYield = Number((baseYield * yieldMultiplier).toFixed(2));

  let level = "Moderate";
  if (overallScore < 0.4) level = "Low";
  else if (overallScore > 0.7) level = "High";

  return {
    baseYield,
    estimatedYield,
    level,
    nutrientScore: Number(nutrientScore.toFixed(2)),
    rainfallScore: Number(rainfallScore.toFixed(2)),
    rainfallUsed,
    idealRain,
    note:
      "This is a rough potential yield estimate based on soil NPK sufficiency and the latest predicted rainfall. For actual field planning, always combine this with local expert advice and management practices.",
  };
}

// -------- Crop calendar knowledge base --------

const CROP_CALENDAR = {
  rice: {
    title: "Rice Crop Calendar (Typical Season)",
    phases: [
      {
        stage: "Sowing / Nursery",
        window: "Week 0–2",
        notes:
          "Prepare nursery beds or trays; use treated seeds and maintain adequate moisture for uniform germination.",
      },
      {
        stage: "Transplanting / Early Establishment",
        window: "Week 3–4",
        notes:
          "Transplant healthy seedlings into well puddled main field; maintain shallow water layer (2–3 cm).",
      },
      {
        stage: "Tillering & Nutrient Boost",
        window: "Week 4–7",
        notes:
          "Apply split nitrogen dose; keep weeds under control and maintain 2–5 cm water level.",
      },
      {
        stage: "Panicle Initiation / Flowering",
        window: "Week 8–11",
        notes:
          "Very sensitive stage to water stress; ensure continuous moisture and monitor for major pests and diseases.",
      },
      {
        stage: "Grain Filling & Maturity",
        window: "Week 12–16",
        notes:
          "Drain excess water 7–10 days before harvest; avoid lodging and plan harvest at proper grain moisture.",
      },
    ],
  },
  wheat: {
    title: "Wheat Crop Calendar (Typical Season)",
    phases: [
      {
        stage: "Seedbed Preparation & Sowing",
        window: "Week 0–2",
        notes:
          "Ensure fine, firm seedbed; sow with recommended spacing and depth to ensure uniform emergence.",
      },
      {
        stage: "Crown Root Initiation",
        window: "Week 3–4",
        notes:
          "Critical stage for first irrigation and top-dressing of nitrogen to build strong root and tiller base.",
      },
      {
        stage: "Tillering & Vegetative Growth",
        window: "Week 5–8",
        notes:
          "Maintain adequate moisture; weed control is important to avoid yield loss.",
      },
      {
        stage: "Booting & Flowering",
        window: "Week 9–11",
        notes:
          "Protect against foliar diseases and ensure no moisture stress during flowering.",
      },
      {
        stage: "Grain Filling & Ripening",
        window: "Week 12–15",
        notes:
          "Irrigate if needed at milk and dough stages; harvest at physiological maturity to reduce shattering.",
      },
    ],
  },
  maize: {
    title: "Maize Crop Calendar (Typical Season)",
    phases: [
      {
        stage: "Land Preparation & Sowing",
        window: "Week 0–2",
        notes:
          "Prepare well-tilled soil and sow at correct depth; ensure optimum plant population per acre.",
      },
      {
        stage: "Early Vegetative",
        window: "Week 2–4",
        notes:
          "Maintain soil moisture and control early weeds; first nitrogen application around 3–4 leaf stage.",
      },
      {
        stage: "Knee-High to Tasseling",
        window: "Week 5–8",
        notes:
          "Second major nitrogen application; avoid water stress during tasseling and silking.",
      },
      {
        stage: "Silking & Pollination",
        window: "Week 8–10",
        notes:
          "Very critical for yield; maintain good moisture and monitor for pests like fall armyworm.",
      },
      {
        stage: "Grain Filling & Maturity",
        window: "Week 11–14",
        notes:
          "Reduce irrigation closer to harvest; pick cobs at proper maturity to ensure good grain quality.",
      },
    ],
  },
  default: {
    title: "Generic Crop Calendar (Illustrative)",
    phases: [
      {
        stage: "Sowing / Establishment",
        window: "Week 0–2",
        notes:
          "Use quality seeds, correct sowing depth and spacing; ensure good seed–soil contact.",
      },
      {
        stage: "Early Growth",
        window: "Week 2–5",
        notes:
          "Weed management and early nutrient support are crucial to avoid competition and stress.",
      },
      {
        stage: "Vegetative Peak",
        window: "Week 5–8",
        notes:
          "Apply split nitrogen as needed; monitor pest and disease pressure regularly.",
      },
      {
        stage: "Flowering / Reproductive Stage",
        window: "Week 8–11",
        notes:
          "Most sensitive stage to water and nutrient stress; maintain adequate moisture and crop protection.",
      },
      {
        stage: "Maturity & Harvest",
        window: "Week 11–14",
        notes:
          "Plan harvest at correct maturity to balance yield and quality; avoid mechanical damage and losses.",
      },
    ],
  },
};

function buildCropCalendar(cropName) {
  const key = cropName ? cropName.toLowerCase() : "default";
  return CROP_CALENDAR[key] || CROP_CALENDAR.default;
}

// 🌾 Pick an icon for each stage
function getStageIcon(stageName = "") {
  const s = stageName.toLowerCase();
  if (s.includes("sowing") || s.includes("nursery") || s.includes("seedbed"))
    return "🌱";
  if (s.includes("transplant") || s.includes("establish")) return "🪴";
  if (s.includes("vegetative") || s.includes("tillering")) return "🌿";
  if (s.includes("booting") || s.includes("panicle")) return "🌾";
  if (s.includes("flower") || s.includes("pollination") || s.includes("silking"))
    return "🌸";
  if (s.includes("grain") || s.includes("ripening") || s.includes("maturity"))
    return "🥇";
  return "🧭";
}

// Colours for different stages in the calendar grid
const STAGE_COLOR_CLASSES = [
  "bg-emerald-500/80 text-emerald-50",
  "bg-sky-500/80 text-sky-50",
  "bg-amber-500/80 text-amber-50",
  "bg-violet-500/80 text-violet-50",
  "bg-rose-500/80 text-rose-50",
];

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

  // 📅 how many months after the starting month we are viewing
  const [calendarOffset, setCalendarOffset] = useState(0);

  const { isDark } = useTheme();
  const { setLastCrop, lastRain } = usePrediction();

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

  // 🔍 Dark, minimal tooltip style (from your older code)
  const tooltipStyle = {
    backgroundColor: "rgba(15,23,42,0.95)",
    border: "none",
    borderRadius: "0.5rem",
    padding: "4px 8px",
    color: "#e5e7eb",
    boxShadow: "0 10px 30px rgba(15,23,42,0.55)",
  };
  const tooltipLabelStyle = {
    color: "#e5e7eb",
    fontSize: 11,
    fontWeight: 600,
  };
  const tooltipItemStyle = {
    color: "#e5e7eb",
    fontSize: 11,
    fontWeight: 600,
  };

  const cropName = data?.crop || "";
  const tipsKey = cropName ? cropName.toLowerCase() : "";
  const cropTips = CROP_TIPS[tipsKey] || CROP_TIPS.default;

  const tipsBoxClass = isDark
    ? "bg-emerald-900/40 border border-emerald-600/60 text-emerald-100"
    : "bg-emerald-50 border border-emerald-300 text-emerald-900";

  // Fertilizer plan
  const fertilizerPlan = data
    ? buildFertilizerPlan(cropName, formValues.N, formValues.P, formValues.K)
    : null;

  const fertBoxClass = isDark
    ? "bg-slate-900/70 border border-amber-500/60 text-amber-100"
    : "bg-amber-50 border border-amber-300 text-amber-900";

  // Yield estimate using lastRain (from rainfall prediction page)
  const yieldEstimate =
    data && lastRain
      ? buildYieldEstimate(
          cropName,
          formValues.N,
          formValues.P,
          formValues.K,
          lastRain
        )
      : null;

  const yieldBoxClass = isDark
    ? "bg-slate-900/70 border border-sky-500/60 text-sky-100"
    : "bg-sky-50 border border-sky-300 text-sky-900";

  // Crop calendar
  const cropCalendar = data ? buildCropCalendar(cropName) : null;

  const calendarBoxClass = isDark
    ? "bg-slate-900/70 border border-emerald-600/60 text-emerald-100"
    : "bg-emerald-50 border border-emerald-300 text-emerald-900";

  // -------- REAL-LIFE-LIKE MONTH CALENDAR WITH MULTI-MONTH NAV --------
  let calendarMonthName = "";
  let calendarDays = [];
  let calendarLegend = [];
  let maxCalendarOffset = 0;

  if (cropCalendar) {
    const monthIndexStart = (Number(formValues.month) || 1) - 1;

    // Map each phase to an index and colour
    const parsedPhases = cropCalendar.phases.map((phase, idx) => {
      let startWeek = 1;
      let endWeek = 1;
      const match = phase.window.match(/Week\s*(\d+)[–-](\d+)/);
      if (match) {
        startWeek = parseInt(match[1], 10);
        endWeek = parseInt(match[2], 10);
      }
      return {
        ...phase,
        startWeek,
        endWeek,
        icon: getStageIcon(phase.stage),
        colorClass: STAGE_COLOR_CLASSES[idx % STAGE_COLOR_CLASSES.length],
      };
    });

    if (parsedPhases.length > 0) {
      const maxWeek = Math.max(...parsedPhases.map((ph) => ph.endWeek));
      maxCalendarOffset = Math.floor(Math.max(0, maxWeek - 1) / 4); // each offset = 4 weeks

      // clamp the effective offset so it doesn't go out of range
      const effectiveOffset = Math.min(calendarOffset, maxCalendarOffset);

      const displayMonthIndex =
        (monthIndexStart + effectiveOffset + 12) % 12;
      calendarMonthName = MONTH_NAMES[displayMonthIndex] || "Season";

      // Build legend (unique stages)
      calendarLegend = parsedPhases.map((phase) => ({
        stage: phase.stage,
        icon: phase.icon,
        colorClass: phase.colorClass,
      }));

      // For this month view, we show weeks: 4*effectiveOffset + 1 to 4*effectiveOffset + 4
      // Each row of 7 days = one week in this seasonal scale
      for (let day = 1; day <= 28; day++) {
        const visualWeek = Math.ceil(day / 7); // 1..4
        const globalWeek = effectiveOffset * 4 + visualWeek;

        // Find phase whose [startWeek, endWeek] covers globalWeek
        let matchedPhase = null;
        for (const phase of parsedPhases) {
          if (
            globalWeek >= phase.startWeek &&
            globalWeek <= phase.endWeek
          ) {
            matchedPhase = phase;
          }
        }

        if (!matchedPhase) {
          // if nothing matches, approximate using min/max weeks
          const minStart = Math.min(
            ...parsedPhases.map((ph) => ph.startWeek)
          );
          const maxEnd = Math.max(
            ...parsedPhases.map((ph) => ph.endWeek)
          );
          if (globalWeek < minStart) matchedPhase = parsedPhases[0];
          else if (globalWeek > maxEnd)
            matchedPhase = parsedPhases[parsedPhases.length - 1];
        }

        calendarDays.push({
          day,
          visualWeek,
          globalWeek,
          stage: matchedPhase?.stage || null,
          icon: matchedPhase?.icon || null,
          colorClass: matchedPhase?.colorClass || null,
        });
      }

      // update nav handlers using computed maxCalendarOffset
    } else {
      calendarMonthName = MONTH_NAMES[monthIndexStart] || "Season";
    }
  }

  const handlePrevMonth = () => {
    setCalendarOffset((prev) => Math.max(0, prev - 1));
  };

  const handleNextMonth = () => {
    setCalendarOffset((prev) =>
      Math.min(maxCalendarOffset, prev + 1)
    );
  };

  const baseMonthIndex = (Number(formValues.month) || 1) - 1;
  const safeOffset = Math.min(calendarOffset, maxCalendarOffset);
  const displayMonthIndex =
    (baseMonthIndex + safeOffset + 12) % 12;
  const finalMonthName = cropCalendar
    ? MONTH_NAMES[displayMonthIndex]
    : "";

  const canPrev = safeOffset > 0;
  const canNext = safeOffset < maxCalendarOffset;

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

          {/* Result card + tips + fertilizer + yield + text calendar */}
          <div
            className={`${cardClass} rounded-xl shadow-sm p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25`}
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

                {/* Fertilizer recommendation box */}
                {fertilizerPlan && (
                  <div
                    className={`mt-4 rounded-lg px-3 py-3 text-xs font-semibold ${fertBoxClass}`}
                  >
                    <p className="text-[11px] uppercase tracking-wide font-extrabold mb-1">
                      Fertilizer Recommendation (per acre)
                    </p>
                    <p className="text-[13px] font-bold mb-1">
                      Target NPK for {cropName || "this crop"}:{" "}
                      <span className="font-semibold">
                        N {fertilizerPlan.target.N} · P{" "}
                        {fertilizerPlan.target.P} · K{" "}
                        {fertilizerPlan.target.K} kg/acre
                      </span>
                    </p>
                    <p className="text-[12px] mb-1">
                      Based on your current soil values (N {formValues.N}, P{" "}
                      {formValues.P}, K {formValues.K}), the additional nutrients
                      roughly required:
                    </p>
                    <ul className="list-disc list-inside space-y-1 mb-2">
                      <li>
                        N needed:{" "}
                        <span className="font-bold">
                          {fertilizerPlan.need.N} kg/acre
                        </span>
                      </li>
                      <li>
                        P needed:{" "}
                        <span className="font-bold">
                          {fertilizerPlan.need.P} kg/acre
                        </span>
                      </li>
                      <li>
                        K needed:{" "}
                        <span className="font-bold">
                          {fertilizerPlan.need.K} kg/acre
                        </span>
                      </li>
                    </ul>
                    <p className="text-[12px] mb-1">
                      Approximate fertilizer products to supply this:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Urea:{" "}
                        <span className="font-bold">
                          {fertilizerPlan.products.urea_kg_per_acre} kg/acre
                        </span>{" "}
                        (46% N)
                      </li>
                      <li>
                        DAP:{" "}
                        <span className="font-bold">
                          {fertilizerPlan.products.dap_kg_per_acre} kg/acre
                        </span>{" "}
                        (46% P₂O₅)
                      </li>
                      <li>
                        MOP:{" "}
                        <span className="font-bold">
                          {fertilizerPlan.products.mop_kg_per_acre} kg/acre
                        </span>{" "}
                        (60% K₂O)
                      </li>
                    </ul>
                    <p className="text-[11px] mt-2 opacity-80">
                      {fertilizerPlan.note}
                    </p>
                  </div>
                )}

                {/* Yield estimate box */}
                {yieldEstimate && (
                  <div
                    className={`mt-4 rounded-lg px-3 py-3 text-xs font-semibold ${yieldBoxClass}`}
                  >
                    <p className="text-[11px] uppercase tracking-wide font-extrabold mb-1">
                      Estimated Yield Potential
                    </p>
                    <p className="text-[13px] font-bold mb-1">
                      Expected yield for {cropName || "this crop"}:
                    </p>
                    <p className="text-lg font-extrabold mb-1">
                      {yieldEstimate.estimatedYield} t/ha{" "}
                      <span className="text-[11px] font-semibold opacity-80">
                        ({yieldEstimate.level} potential)
                      </span>
                    </p>
                    <p className="text-[11px] mb-1">
                      Base typical yield used:{" "}
                      <span className="font-bold">
                        {yieldEstimate.baseYield} t/ha
                      </span>
                    </p>

                    <p className="text-[12px] mt-2 mb-1">
                      Contribution breakdown:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>
                        Nutrient sufficiency score:{" "}
                        <span className="font-bold">
                          {yieldEstimate.nutrientScore}
                        </span>
                      </li>
                      <li>
                        Rainfall suitability score:{" "}
                        <span className="font-bold">
                          {yieldEstimate.rainfallScore}
                        </span>
                        {yieldEstimate.rainfallUsed != null && (
                          <>
                            {" "}
                            (predicted {yieldEstimate.rainfallUsed.toFixed(1)}{" "}
                            mm vs ideal ~{yieldEstimate.idealRain} mm)
                          </>
                        )}
                      </li>
                    </ul>

                    <p className="text-[11px] mt-2 opacity-80">
                      {yieldEstimate.note}
                    </p>
                  </div>
                )}

                {!lastRain && data && (
                  <p className={`text-[11px] mt-3 font-semibold ${subText}`}>
                    Tip: For a more realistic yield estimate, also run a
                    rainfall prediction on the <span className="font-bold">
                      Rainfall
                    </span>{" "}
                    page. The model will then combine soil NPK and predicted
                    rainfall.
                  </p>
                )}

                {/* Crop calendar TEXT (stages description) */}
                {cropCalendar && (
                  <div
                    className={`mt-4 rounded-lg px-3 py-3 text-xs font-semibold ${calendarBoxClass}`}
                  >
                    <p className="text-[11px] uppercase tracking-wide font-extrabold mb-1">
                      Crop Calendar – Growth Stages
                    </p>
                    <p className="text-[13px] font-bold mb-2">
                      {cropCalendar.title}
                    </p>
                    <div className="space-y-2">
                      {cropCalendar.phases.map((phase, idx) => (
                        <div
                          key={idx}
                          className="flex gap-2 items-start border-l-2 border-emerald-400/70 pl-2"
                        >
                          <div className="mt-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                          <div>
                            <p className="text-[12px] font-bold">
                              {phase.stage}{" "}
                              <span className="text-[11px] opacity-80">
                                • {phase.window}
                              </span>
                            </p>
                            <p className="text-[11px] mt-0.5">
                              {phase.notes}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] mt-2 opacity-80">
                      Use this as a guiding timeline. Exact weeks can shift
                      slightly depending on sowing date, variety and local
                      climate.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className={`text-sm font-semibold ${subText}`}>
                Submit the form to see the recommended crop, confidence,
                tailored agronomic tips, fertilizer guidance, yield potential
                and a crop calendar of key stages from sowing to harvest.
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: live charts + calendar */}
        <div className="space-y-4">
          {/* Probability donut – layout & hover from your older code */}
          <div
            className={`${cardClass} rounded-xl shadow-sm p-5 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/25`}
          >
            <h4 className={`text-sm font-bold ${baseText}`}>
              Crop Probability Distribution (Top 3)
            </h4>
            <p className={`text-xs font-semibold ${subText}`}>
              See how the model spreads its confidence across the top suggested
              crops.
            </p>

            {top3ChartData.length > 0 ? (
              <div className="flex items-center gap-4 mt-1">
                <div className="w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={top3ChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius="55%"
                        outerRadius="80%"
                        paddingAngle={3}
                      >
                        {top3ChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={CROP_COLORS[index % CROP_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        labelStyle={tooltipLabelStyle}
                        itemStyle={tooltipItemStyle}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex-1 text-xs space-y-1">
                  {top3ChartData.map((d, i) => (
                    <div
                      key={d.name}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{
                            backgroundColor:
                              CROP_COLORS[i % CROP_COLORS.length],
                          }}
                        />
                        <span className="font-bold">{d.name}</span>
                      </div>
                      <span className="font-extrabold">
                        {d.value.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                  <p className={`mt-2 text-[11px] ${subText}`}>
                    Use this to compare backup options if the main crop is not
                    feasible due to market or input constraints.
                  </p>
                </div>
              </div>
            ) : (
              <p
                className={`text-xs mt-2 text-center font-semibold ${subText}`}
              >
                Probability chart will appear after you run at least one crop
                recommendation.
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
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                  />
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
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                  />
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
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelStyle={tooltipLabelStyle}
                    itemStyle={tooltipItemStyle}
                  />
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

          {/* Multi-month real-life calendar card */}
          {cropCalendar && calendarDays.length > 0 && (
            <div
              className={`${cardClass} rounded-xl shadow-lg p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/30`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    disabled={!canPrev}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                      canPrev
                        ? "border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/15"
                        : "border-slate-500/30 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    ←
                  </button>
                  <h4
                    className={`text-sm font-bold flex items-center gap-2 ${baseText} cursor-pointer`}
                    onClick={() => {
                      if (canNext) handleNextMonth();
                    }}
                    title={
                      canNext
                        ? "Click to jump to the next month in the crop season"
                        : "End of crop calendar window"
                    }
                  >
                    <span className="text-lg">📅</span>
                    <span>{finalMonthName || "Season"}</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    disabled={!canNext}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                      canNext
                        ? "border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/15"
                        : "border-slate-500/30 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    →
                  </button>
                </div>
                {cropCalendar && (
                  <span className="text-[10px] font-extrabold px-2 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-500">
                    Weeks {safeOffset * 4 + 1}–{safeOffset * 4 + 4}
                  </span>
                )}
              </div>

              <p className={`text-xs mb-3 font-semibold ${subText}`}>
                Navigate through months to see how your crop moves from sowing
                to maturity across the season. Each coloured box is like a date
                on your farm calendar.
              </p>

              <div className="rounded-xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-sky-500/10 border border-emerald-500/30 px-3 py-3">
                {/* Weekday header */}
                <div
                  className={`grid grid-cols-7 gap-1 text-[11px] font-bold mb-2 ${
                    isDark ? "text-emerald-100" : "text-emerald-900"
                  }`}
                >
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <div
                        key={d}
                        className="text-center uppercase tracking-wide"
                      >
                        {d}
                      </div>
                    )
                  )}
                </div>

                {/* Days grid: 4 weeks x 7 days (1–28) */}
                <div className="grid grid-cols-7 gap-1 text-[11px]">
                  {calendarDays.map((dayObj) => {
                    const {
                      day,
                      stage,
                      icon,
                      colorClass,
                      globalWeek,
                    } = dayObj;
                    const isEmpty = !stage;
                    const baseCell =
                      "relative rounded-lg min-h-[42px] flex flex-col items-center justify-center border text-[11px] font-semibold transition-all duration-200";
                    const coloredCell = colorClass
                      ? `${colorClass} border-emerald-500/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5`
                      : `border-dashed ${
                          isDark
                            ? "border-slate-600 text-slate-300"
                            : "border-slate-300 text-slate-500"
                        }`;

                    return (
                      <div
                        key={day}
                        className={`${baseCell} ${coloredCell} cursor-default`}
                        title={
                          stage
                            ? `${icon || ""} ${stage} · Week ${globalWeek}, Day ${day}`
                            : `Day ${day}`
                        }
                      >
                        {/* Day number */}
                        <div className="absolute top-1 left-1 text-[10px] font-extrabold opacity-90">
                          {day}
                        </div>
                        {/* Icon + short label */}
                        {!isEmpty && (
                          <div className="flex flex-col items-center justify-center mt-1">
                            <span className="text-sm mb-0.5">{icon}</span>
                            <span className="text-[10px] text-center leading-tight">
                              {stage.split(" ")[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Legend */}
              {calendarLegend.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {calendarLegend.map((item, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold ${item.colorClass} bg-opacity-90 shadow-sm`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.stage}</span>
                    </div>
                  ))}
                </div>
              )}

              <p className={`text-[11px] mt-3 font-semibold ${subText}`}>
                Swipe through the months using the arrows or by clicking on the{" "}
                <span className="font-bold">month label</span>. This lets you
                see when sowing, vegetative growth, flowering and harvest fall
                across your season timeline.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default CropForm;

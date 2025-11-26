// frontend/src/routes/Landing.jsx

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

// 🔹 AI-like reply logic (can be replaced with real API later)
function getBotReply(message) {
  const msg = (message || "").toLowerCase();

  if (!msg.trim()) {
    return "I can help you understand crop recommendation, rainfall prediction, the dashboard analytics, or how to explain this project in a viva. Ask me anything.";
  }

  if (msg.includes("crop") || msg.includes("recommend")) {
    return (
      "To get a crop recommendation, go to the Crop page. Enter N, P, K, rainfall lags, temperature, humidity and pH. " +
      "The ML model then predicts the best-suited crop and also shows top-3 alternatives with probabilities."
    );
  }

  if (msg.includes("rain") || msg.includes("rainfall") || msg.includes("monsoon")) {
    return (
      "On the Rainfall page, you provide the month and three lag rainfall values. " +
      "The model predicts the expected rainfall (mm), classifies it as Very Low → Very High, " +
      "and the UI shows how it fits into the monsoon calendar for that month."
    );
  }

  if (msg.includes("dashboard") || msg.includes("analytics") || msg.includes("chart")) {
    return (
      "The Analytics Dashboard summarises your latest crop and rainfall predictions. " +
      "It shows NPK levels, rainfall trends, environment parameters, and probability charts. " +
      "You can use this dashboard as a storytelling tool during your demo or viva."
    );
  }

  if (msg.includes("viva") || msg.includes("explain") || msg.includes("presentation")) {
    return (
      "Short viva explanation:\n" +
      "“This is a smart agriculture decision-support system. The backend is a Flask API with trained machine learning models — " +
      "one for crop recommendation and one for rainfall prediction. The frontend is built using React, Tailwind CSS and Recharts " +
      "to visualise inputs and outputs in real time. Users enter soil nutrients, climate and rainfall history; the system predicts " +
      "the best crop and expected rainfall, and gives supporting charts and agronomic tips.”"
    );
  }

  if (msg.includes("how to use") || msg.includes("help") || msg.includes("guide")) {
    return (
      "Quick usage guide:\n" +
      "1️⃣ Start with Crop or Rainfall page and enter realistic values.\n" +
      "2️⃣ Submit to get predictions, confidence scores, tips and charts.\n" +
      "3️⃣ Open the Dashboard to view a combined summary of your latest predictions.\n" +
      "If you tell me what you are confused about, I can simplify that part for viva."
    );
  }

  if (msg.includes("technology") || msg.includes("tech stack") || msg.includes("stack")) {
    return (
      "Tech overview: React + Vite + Tailwind on the frontend, Recharts for visualisation, and Flask + scikit-learn models on the backend. " +
      "Models are loaded via joblib and exposed as REST APIs that the frontend calls using HTTP."
    );
  }

  return (
    "Understood 👍. I’m your Smart Farm Assistant. I mainly help you with:\n" +
    "• How the crop & rainfall models work\n" +
    "• How to use each page (Crop, Rainfall, Dashboard)\n" +
    "• How to explain this project clearly in a viva.\n" +
    "Try asking: “Explain crop recommendation model”, “How does rainfall prediction work?”, or “Give me a 1-minute viva summary”."
  );
}

export default function Landing() {
  const { isDark } = useTheme();

  // 🔹 Chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text:
        "Hi, I’m your AI-powered Smart Farm Assistant 🤖🌾.\n" +
        "I can help you understand crop recommendation, rainfall prediction, the dashboard, or how to explain this project in your viva.",
      ts: Date.now(),
    },
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll when messages update
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isThinking]);

  const handleSend = (e) => {
    e?.preventDefault?.();
    const trimmed = chatInput.trim();
    if (!trimmed || isThinking) return;

    const userMsg = {
      sender: "user",
      text: trimmed,
      ts: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsThinking(true);

    // Simulate AI thinking delay, then respond
    setTimeout(() => {
      const botMsg = {
        sender: "bot",
        text: getBotReply(trimmed),
        ts: Date.now() + 1,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 550);
  };

  const leftTextClass = isDark ? "text-slate-100" : "text-slate-900";
  const subTextClass = isDark ? "text-slate-300" : "text-slate-700";

  const rightCardClass = isDark
    ? "bg-slate-900/90 border border-slate-700 text-slate-50"
    : "bg-slate-900/90 border border-slate-700 text-slate-50"; // keep right card always dark

  const eduCardClass = isDark
    ? "bg-slate-900 border border-slate-700 text-slate-50"
    : "bg-white border border-slate-200 text-slate-900";

  const eduSubText = isDark ? "text-slate-300" : "text-slate-700";

  const chatBg = isDark ? "bg-slate-950/95" : "bg-white";
  const chatBorder = isDark ? "border-slate-700" : "border-slate-300";
  const chatText = isDark ? "text-slate-50" : "text-slate-900";
  const chatSub = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="max-w-5xl mx-auto py-4 sm:py-6 space-y-8 relative">
      {/* Hero section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: title + description */}
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
              className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-bold bg-emerald-500 text-slate-900 shadow-sm hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              View Analytics Dashboard →
            </Link>
            <Link
              to="/crop"
              className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-semibold border border-emerald-500 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-500/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300"
            >
              Try Crop Recommendation
            </Link>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
            <div className="transition-all duration-300 hover:-translate-y-0.5">
              <p className="font-extrabold text-emerald-600 dark:text-emerald-300">
                2
              </p>
              <p className={`font-semibold ${subTextClass}`}>
                ML models (Crop &amp; Rainfall)
              </p>
            </div>
            <div className="transition-all duration-300 hover:-translate-y-0.5">
              <p className="font-extrabold text-emerald-600 dark:text-emerald-300">
                10+
              </p>
              <p className={`font-semibold ${subTextClass}`}>
                Input features analyzed
              </p>
            </div>
            <div className="transition-all duration-300 hover:-translate-y-0.5">
              <p className="font-extrabold text-emerald-600 dark:text-emerald-300">
                Real-time
              </p>
              <p className={`font-semibold ${subTextClass}`}>
                Visualization &amp; charts
              </p>
            </div>
          </div>
        </div>

        {/* Right: main info card */}
        <div
          className={`${rightCardClass} rounded-2xl shadow-lg shadow-slate-950/50 backdrop-blur-sm p-5 sm:p-6 flex flex-col justify-between space-y-4 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/30`}
        >
          <div>
            <h3 className="text-lg font-bold mb-2">What you can do here</h3>
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
        className={`rounded-2xl border px-4 sm:px-6 py-4 sm:py-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
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
        <ul
          className={`list-disc list-inside text-sm space-y-1.5 ${subTextClass} font-semibold`}
        >
          <li>
            <span className="font-bold">Rainfall model:</span> Uses Lag1,
            Lag2, Lag3 rainfall values and month to estimate expected rainfall
            for the current month.
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

      {/* Basic crop education + “carousel” effect */}
      <section className="space-y-3">
        <h3 className={`text-lg font-extrabold ${leftTextClass}`}>
          Basic Crop Education (for understanding outputs)
        </h3>
        <p className={`text-sm font-semibold ${subTextClass}`}>
          Below are simple guidelines for three commonly recommended crops.
          This helps you understand when a suggested crop is practically
          suitable.
        </p>

        {/* Helper hint for mobile scroll */}
        <p className={`text-[11px] font-semibold ${subTextClass} md:hidden`}>
          👉 Swipe horizontally to view all crop cards.
        </p>

        {/* Mobile: horizontal scroll “carousel”; Desktop: grid */}
        <div className="flex gap-4 overflow-x-auto md:grid md:grid-cols-3 md:overflow-visible snap-x snap-mandatory pb-2">
          {/* Rice */}
          <div
            className={`${eduCardClass} rounded-xl p-4 shadow-sm min-w-[260px] snap-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/25`}
          >
            <h4 className="text-base font-bold mb-1">Rice (Paddy)</h4>
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
          <div
            className={`${eduCardClass} rounded-xl p-4 shadow-sm min-w-[260px] snap-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/25`}
          >
            <h4 className="text-base font-bold mb-1">Wheat</h4>
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
          <div
            className={`${eduCardClass} rounded-xl p-4 shadow-sm min-w-[260px] snap-center transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/25`}
          >
            <h4 className="text-base font-bold mb-1">Maize (Corn)</h4>
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
          className={`${eduCardClass} rounded-xl p-4 text-xs font-semibold transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20`}
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

      {/* 🌟 AI Chatbot Floating Widget */}

      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setChatOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-30 inline-flex items-center gap-2 rounded-full px-4 py-2.5 bg-emerald-500 text-slate-900 text-xs sm:text-sm font-bold shadow-lg shadow-emerald-500/40 hover:bg-emerald-400 hover:-translate-y-0.5 transition-all duration-300"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/90 text-emerald-300 text-sm">
          🤖
        </span>
        <span>{chatOpen ? "Close AI Assistant" : "Ask AI Assistant"}</span>
      </button>

      {/* Chat Panel */}
      {chatOpen && (
        <div
          className={`fixed bottom-20 right-4 z-30 w-80 max-w-[90vw] rounded-2xl border ${chatBorder} ${chatBg} ${chatText} shadow-2xl shadow-black/40 flex flex-col`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700/60">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-emerald-500/10 flex items-center justify-center text-lg">
                🤖
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold">
                  Smart Farm AI Assistant
                </span>
                <span className={`text-[10px] ${chatSub}`}>
                  Explains crop model, rainfall & dashboard
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setChatOpen(false)}
              className="text-xs px-2 py-1 rounded-md hover:bg-slate-700/60"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="px-3 py-2 max-h-72 overflow-y-auto space-y-2 text-[11px]">
            {messages.map((m) => (
              <div
                key={m.ts + m.sender}
                className={`flex ${
                  m.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`inline-block px-3 py-2 rounded-2xl max-w-[80%] whitespace-pre-line ${
                    m.sender === "user"
                      ? "bg-emerald-500 text-slate-900 rounded-br-sm"
                      : "bg-slate-800 text-slate-100 rounded-bl-sm"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-slate-800 text-slate-300 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
                  <span className="ml-1">Thinking…</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick suggested prompts */}
          <div className="px-3 pb-1 flex flex-wrap gap-1">
            {[
              "Explain crop recommendation model",
              "How does rainfall prediction work?",
              "Give viva explanation in 1 minute",
            ].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  if (isThinking) return;
                  setChatInput(q);
                }}
                className="text-[10px] px-2 py-1 rounded-full border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/10 transition-all"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 px-3 py-2 border-t border-slate-700/60"
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask something like “Explain rainfall model”"
              className={`flex-1 text-[11px] px-2 py-1.5 rounded-md outline-none ${
                isDark
                  ? "bg-slate-900 border border-slate-700 text-slate-50"
                  : "bg-slate-100 border border-slate-300 text-slate-900"
              }`}
            />
            <button
              type="submit"
              disabled={isThinking}
              className="text-[11px] font-bold px-3 py-1.5 rounded-md bg-emerald-500 text-slate-900 hover:bg-emerald-400 disabled:opacity-60 transition-all"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

async function predict() {
  const month = Number(document.getElementById("month").value);
  const lag1 = Number(document.getElementById("lag1").value);
  const lag2 = Number(document.getElementById("lag2").value);
  const lag3 = Number(document.getElementById("lag3").value);

  const N = Number(document.getElementById("N").value);
  const P = Number(document.getElementById("P").value);
  const K = Number(document.getElementById("K").value);
  const T = Number(document.getElementById("T").value);
  const H = Number(document.getElementById("H").value);
  const pH = Number(document.getElementById("pH").value);

  const rainEl = document.getElementById("rain-result");
  const rainNoteEl = document.getElementById("rain-note");
  const cropEl = document.getElementById("crop-result");
  const suitabilityPill = document.getElementById("suitability-pill");
  const suitabilityScoreEl = document.getElementById("suitability-score");
  const altList = document.getElementById("alt-list");
  const adviceText = document.getElementById("advice-text");
  const farmerSummaryEl = document.getElementById("farmer-summary");

  rainEl.textContent = "…";
  cropEl.textContent = "…";
  rainNoteEl.textContent = "Running prediction…";
  suitabilityPill.classList.add("hidden");
  altList.innerHTML = '<li class="alt-placeholder">Calculating alternatives…</li>';
  adviceText.textContent = "Generating advisory note…";
  if (farmerSummaryEl) {
    farmerSummaryEl.textContent = "Generating farmer summary…";
  }

  try {
    const res = await fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        month,
        lag1,
        lag2,
        lag3,
        N,
        P,
        K,
        T,
        H,
        pH,
      }),
    });

    if (!res.ok) {
      throw new Error("Server error: " + res.status);
    }

    const data = await res.json();

    const rain = data.predicted_rainfall;
    const crop = data.main_crop;
    const score = data.main_crop_score;
    const alternatives = data.alternatives || [];
    const advice = data.advice || "";

    // --- Update UI ---
    rainEl.textContent = rain.toFixed(2) + " mm";
    cropEl.textContent = crop;
    rainNoteEl.textContent = "Estimated rainfall for the given month and history.";

    if (!isNaN(score)) {
      suitabilityPill.classList.remove("hidden");
      suitabilityScoreEl.textContent = score.toFixed(1);
    } else {
      suitabilityPill.classList.add("hidden");
    }

    // Alternatives list
    if (alternatives.length === 0) {
      altList.innerHTML = '<li class="alt-placeholder">No alternative crops returned.</li>';
    } else {
      altList.innerHTML = "";
      alternatives.forEach((alt, idx) => {
        const li = document.createElement("li");
        const scoreText = alt.score != null ? alt.score.toFixed(1) + "%" : "";
        li.innerHTML = `
          <span>${idx === 0 ? "⭐ " : ""}${alt.crop}</span>
          <span>${scoreText}</span>
        `;
        altList.appendChild(li);
      });
    }

    // Advisory note
    adviceText.textContent = advice || "Prediction completed successfully.";

    // Farmer-friendly summary
    if (farmerSummaryEl) {
      farmerSummaryEl.textContent =
        `Suggested crop: ${crop}. Estimated rainfall: ${rain.toFixed(0)} mm. ` +
        `Please discuss this recommendation with your local agriculture officer for variety, seed rate and irrigation plan.`;
    }

    // Save last prediction for dashboard insights
    const lastPrediction = {
      inputs: { month, lag1, lag2, lag3, N, P, K, T, H, pH },
      predicted_rainfall: rain,
      main_crop: crop,
      main_crop_score: score,
      alternatives,
      advice,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem("lastPrediction", JSON.stringify(lastPrediction));
    } catch (e) {
      console.warn("Could not store last prediction in localStorage:", e);
    }
  } catch (err) {
    console.error(err);
    rainEl.textContent = "Error";
    cropEl.textContent = "Error";
    rainNoteEl.textContent = "Something went wrong. Please try again.";
    suitabilityPill.classList.add("hidden");
    altList.innerHTML = '<li class="alt-placeholder">Error while fetching prediction.</li>';
    adviceText.textContent = String(err);
    if (farmerSummaryEl) {
      farmerSummaryEl.textContent = "Could not generate summary due to an error.";
    }
  }
}

// Predict button
const predictBtn = document.getElementById("predict-btn");
if (predictBtn) {
  predictBtn.addEventListener("click", function (e) {
    e.preventDefault();
    predict();
    // small click animation on button
    predictBtn.style.transform = "translateY(0px) scale(0.97)";
    setTimeout(() => {
      predictBtn.style.transform = "";
    }, 120);
  });
}

// Print / Save button
const printBtn = document.getElementById("print-btn");
if (printBtn) {
  printBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.print();
  });
}

/* Scroll reveal animations for .reveal elements */
document.addEventListener("DOMContentLoaded", () => {
  const revealEls = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || revealEls.length === 0) {
    // Fallback: just show everything
    revealEls.forEach((el) => el.classList.add("reveal-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.getAttribute("data-reveal-delay");
          if (delay) {
            el.style.setProperty("--reveal-delay", delay);
          }
          el.classList.add("reveal-visible");
          observer.unobserve(el);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  revealEls.forEach((el) => observer.observe(el));
});

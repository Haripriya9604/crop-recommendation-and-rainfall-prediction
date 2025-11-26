// frontend/src/routes/About.jsx

import React from "react";
import { useTheme } from "../context/ThemeContext";
import ProfileCard from "../components/ProfileCard";

export default function About() {
  const { isDark } = useTheme();

  const headingText = isDark ? "text-slate-50" : "text-slate-900";
  const subText = isDark ? "text-slate-300" : "text-slate-700";

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-8 space-y-6">
      {/* Top heading */}
      <header className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
          About the Developer
        </p>
        <h1 className={`text-2xl sm:text-3xl font-extrabold ${headingText}`}>
          Haripriya SK
        </h1>
        <p className={`text-sm sm:text-base font-semibold ${subText}`}>
          Final-year Data Analytics student &amp; developer of the{" "}
          <span className="font-bold">
            Crop Recommendation &amp; Rainfall Prediction
          </span>{" "}
          system.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-8 items-start">
        {/* Tilt Profile Card */}
        <div className="flex justify-center">
          <ProfileCard
            name="Haripriya SK"
            title="Data Analyst & Software Engineer"
            handle="haripriya-sk"
            status="Online"
            contactText="Contact Me"
            avatarUrl="/haripriya.jpg"      // 👈 put this file in frontend/public/haripriya.jpg
            miniAvatarUrl="/haripriya.jpg"  // 👈 same image for mini avatar
            showUserInfo={true}
            enableTilt={true}
            enableMobileTilt={false}
            onContactClick={() => {
              // 👉 replace with your real LinkedIn
              window.open("https://www.linkedin.com", "_blank");
            }}
          />
        </div>

        {/* Text content aligned with profile card */}
        <div className="space-y-4 text-sm sm:text-base">
          {/* Section: Who am I */}
          <section className={`space-y-2 ${subText}`}>
            <h2 className={`text-lg font-bold ${headingText}`}>Who I am</h2>
            <p className="font-semibold">
              I’m <span className="font-bold">Haripriya SK</span>, a{" "}
              <span className="font-bold">final-year Data Analytics student</span>{" "}
              with a strong interest in{" "}
              <span className="font-bold">
                machine learning, data-driven decision making, and modern web
                development.
              </span>
            </p>
            <p className="font-semibold">
              I enjoy building clean, practical applications where{" "}
              <span className="font-bold">ML models</span> are not just trained,
              but also{" "}
              <span className="font-bold">
                deployed with intuitive dashboards and user experience
              </span>{" "}
              — exactly like this smart agriculture project.
            </p>
          </section>

          {/* Section: About this project */}
          <section className={`space-y-2 ${subText}`}>
            <h2 className={`text-lg font-bold ${headingText}`}>
              What I built in this project
            </h2>
            <ul className="list-disc list-inside space-y-1 font-semibold">
              <li>
                Trained separate{" "}
                <span className="font-bold">
                  ML models for crop recommendation &amp; rainfall prediction
                </span>{" "}
                using real-world style feature sets.
              </li>
              <li>
                Designed a{" "}
                <span className="font-bold">
                  React + Tailwind frontend with dashboards
                </span>{" "}
                for soil nutrients, rainfall trends &amp; prediction outputs.
              </li>
              <li>
                Built a{" "}
                <span className="font-bold">
                  Flask backend with REST APIs
                </span>{" "}
                to serve predictions to the UI in real time.
              </li>
              <li>
                Added a small{" "}
                <span className="font-bold">AI-style assistant</span> on the
                landing page to help explain{" "}
                <span className="font-bold">
                  crop model, rainfall model &amp; viva answers
                </span>
                .
              </li>
            </ul>
          </section>

          {/* Section: Skills */}
          <section className={`space-y-2 ${subText}`}>
            <h2 className={`text-lg font-bold ${headingText}`}>
              Tech &amp; Skills used
            </h2>
            <ul className="list-disc list-inside space-y-1 font-semibold">
              <li>Python (pandas, scikit-learn) for data &amp; ML modelling</li>
              <li>Flask for building prediction APIs</li>
              <li>
                React + Tailwind CSS for a{" "}
                <span className="font-bold">modern, responsive UI</span>
              </li>
              <li>Recharts / charts for visualising model outputs</li>
              <li>Basic deployment-ready project structure (frontend + backend)</li>
            </ul>
          </section>

          {/* Section: Contact */}
          <section className={`space-y-2 ${subText}`}>
            <h2 className={`text-lg font-bold ${headingText}`}>
              How to contact me
            </h2>
            <p className="font-semibold">
              You can reach me via{" "}
              <span className="font-bold">LinkedIn, email, or GitHub</span>.
              <br />
              Click on the <span className="font-bold">“Contact Me”</span>{" "}
              button on the card to open my profile, or you can also link this
              project in your resume &amp; portfolio as a{" "}
              <span className="font-bold">
                full-stack ML + dashboard application.
              </span>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

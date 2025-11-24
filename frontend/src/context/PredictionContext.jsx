import React, { createContext, useContext, useState } from "react";

const PredictionContext = createContext(null);

export function PredictionProvider({ children }) {
  const [lastCrop, setLastCrop] = useState(null);
  const [lastRain, setLastRain] = useState(null);

  const value = {
    lastCrop,
    setLastCrop,
    lastRain,
    setLastRain,
  };

  return (
    <PredictionContext.Provider value={value}>
      {children}
    </PredictionContext.Provider>
  );
}

export function usePrediction() {
  const ctx = useContext(PredictionContext);
  if (!ctx) {
    throw new Error("usePrediction must be used within PredictionProvider");
  }
  return ctx;
}

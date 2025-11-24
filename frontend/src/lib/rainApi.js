import api from "./apiClient";

export const predictRainfall = async (payload) => {
  const { data } = await api.post("/api/predict-rainfall", payload);
  return data; // { rainfall, unit, note }
};

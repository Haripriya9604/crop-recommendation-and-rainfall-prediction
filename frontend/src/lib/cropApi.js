import api from "./apiClient";

export const recommendCrop = async (payload) => {
  const { data } = await api.post("/api/recommend-crop", payload);
  return data; // { crop, confidence?, top3?, top3_probs? }
};

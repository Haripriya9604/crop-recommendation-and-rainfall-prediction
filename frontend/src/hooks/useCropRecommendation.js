// src/hooks/useCropRecommendation.js
import { useMutation } from "@tanstack/react-query";
import { recommendCrop } from "../lib/cropApi";

export const useCropRecommendation = () => {
  return useMutation({
    mutationFn: recommendCrop,
  });
};

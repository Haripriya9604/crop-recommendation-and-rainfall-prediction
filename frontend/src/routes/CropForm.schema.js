// src/routes/CropForm.schema.js
import { z } from "zod";

export const cropInputSchema = z.object({
  month: z.coerce.number().min(1).max(12),
  lag1: z.coerce.number().nonnegative(),
  lag2: z.coerce.number().nonnegative(),
  lag3: z.coerce.number().nonnegative(),
  N: z.coerce.number().nonnegative(),
  P: z.coerce.number().nonnegative(),
  K: z.coerce.number().nonnegative(),
  temperature: z.coerce.number().min(-10).max(60),
  humidity: z.coerce.number().min(0).max(100),
  pH: z.coerce.number().min(0).max(14),
});

export const defaultValues = {
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
};

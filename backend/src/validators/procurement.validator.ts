import { z } from "zod";

export const createProcurementSchema = z.object({
  cropId: z.string(),
  requiredQuantity: z.number().positive(),
  unit: z.enum(["kg", "mon", "tonne"]).default("kg"),
  qualityGrade: z.string().default("Grade A"),
  maxBudgetPerUnit: z.number().min(0),
  isBudgetPrivate: z.boolean().default(false),
  deliveryLocation: z.string(),
  deliveryDistrict: z.string(),
  requiredDeliveryDate: z.string(),
  allowSplitFulfillment: z.boolean().default(true),
  notes: z.string().optional(),
});

export const submitOfferSchema = z.object({
  offeredQuantity: z.number().positive(),
  pricePerUnit: z.number().positive(),
  qualityGrade: z.string().default("Grade A"),
  estimatedDeliveryDate: z.string(),
  notes: z.string().optional(),
});


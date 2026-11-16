import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nameBn: z.string().optional(),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(8, "Valid phone number required"),
  role: z.enum(["farmer", "buyer", "factory", "retailer", "exporter", "importer", "admin"]),
  district: z.string().min(2, "District is required"),
  upazila: z.string().optional(),
  companyName: z.string().optional(),
});

export const switchUserSchema = z.object({
  switchUserId: z.string(),
});


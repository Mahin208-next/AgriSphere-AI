import { z } from "zod";

export const createListingSchema = z.object({
  cropId: z.string(),
  variety: z.string().optional(),
  quantity: z.number().positive("Quantity must be greater than zero"),
  unit: z.enum(["kg", "mon", "tonne"]).default("kg"),
  grade: z.enum(["Grade A", "Grade B", "Standard"]).default("Grade A"),
  startingPrice: z.number().positive(),
  expectedPrice: z.number().positive(),
  privateReservePrice: z.number().positive(),
  isAuction: z.boolean().default(false),
  auctionDurationMinutes: z.number().int().min(5).max(180).optional(),
  minIncrement: z.number().positive().optional(),
  harvestDate: z.string().optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export const placeBidSchema = z.object({
  amount: z.number().positive("Bid amount must be positive"),
  isAnonymous: z.boolean().optional(),
  bidderId: z.string().optional(),
});


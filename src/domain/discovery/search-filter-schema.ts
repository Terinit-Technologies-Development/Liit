import { z } from "zod";

export const searchFiltersSchema = z.object({
  category: z
    .enum([
      "music",
      "nightlife",
      "cultural",
      "fashion",
      "art",
      "food_drink",
      "sport",
      "networking",
      "pop_up",
    ])
    .nullable(),

  date: z.enum(["any", "today", "tomorrow", "this_weekend"]),

  distanceKm: z
    .union([z.literal(5), z.literal(10), z.literal(25), z.literal(50)])
    .nullable(),

  maxPriceMinor: z.number().int().nonnegative().nullable(),

  availabilityOnly: z.boolean(),

  liveOnly: z.boolean(),
});

export type SearchFiltersFormValues = z.infer<typeof searchFiltersSchema>;

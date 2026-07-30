import { z } from "zod";

export const mapFiltersSchema = z.object({
  categories: z.array(
    z.enum([
      "music",
      "nightlife",
      "cultural",
      "fashion",
      "art",
      "food_drink",
      "sport",
      "networking",
      "pop_up",
    ]),
  ),

  statuses: z.array(z.enum(["live", "available", "sold_out"])),

  distanceKm: z
    .union([z.literal(5), z.literal(10), z.literal(25), z.literal(50)])
    .nullable(),

  freeOnly: z.boolean(),
});

export type MapFiltersFormValues = z.infer<typeof mapFiltersSchema>;

export const DEFAULT_MAP_FILTERS: MapFiltersFormValues = {
  categories: [],
  statuses: [],
  distanceKm: null,
  freeOnly: false,
};

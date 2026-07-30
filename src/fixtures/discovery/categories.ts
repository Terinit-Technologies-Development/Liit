import { EventCategory } from "../../domain/events";

export interface CategoryInfo {
  id: EventCategory;
  name: string;
  icon: string;
}

export const discoveryCategories: CategoryInfo[] = [
  { id: "music", name: "Music & Live Shows", icon: "music" },
  { id: "nightlife", name: "Nightlife & Clubs", icon: "moon" },
  { id: "cultural", name: "Culture & Heritage", icon: "landmark" },
  { id: "fashion", name: "Fashion & Style", icon: "sparkles" },
  { id: "art", name: "Art & Exhibitions", icon: "palette" },
  { id: "food_drink", name: "Food & Drink", icon: "utensils" },
  { id: "sport", name: "Sports & Fitness", icon: "activity" },
  { id: "networking", name: "Networking & Tech", icon: "users" },
  { id: "pop_up", name: "Markets & Pop-ups", icon: "shoppingBag" },
];

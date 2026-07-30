import { PublicHostProfile } from "../../domain/hosts/public-host";
import { discoveryHosts } from "../discovery";

export const publicHostProfiles: Record<string, PublicHostProfile> = {
  "host-1": {
    host: discoveryHosts[0], // Groove Co.
    coverImageKey: "eventMidnightGrooves",
    bio: "Johannesburg's premier nightlife & electronic event collective. Curating deep house, amapiano, and immersive rooftop experiences across Gauteng.",
    metrics: [
      { id: "followers", label: "Followers", value: "4.8k" },
      { id: "rating", label: "Rating", value: "4.9 ★" },
      { id: "events_hosted", label: "Events", value: "32" },
    ],
    upcomingEventIds: ["evt-midnight-grooves", "evt-deep-house-rooftop"],
    pastHighlights: [
      {
        id: "hl-1",
        title: "Winter Rooftop Fest 2025",
        imageKey: "eventDeepHouseRooftop",
        caption: "Sold-out crowd of 500 at Braamfontein Rooftop.",
      },
      {
        id: "hl-2",
        title: "Spring Sunset Session",
        imageKey: "eventMidnightGrooves",
        caption: "Analog vinyl sets with local guest headliners.",
      },
    ],
  },

  "host-2": {
    host: discoveryHosts[1], // Jozi Vibe Tribe
    coverImageKey: "eventSowetoFoodMarket",
    bio: "Community-driven cultural pop-ups, street food markets, and urban trail run socials connecting Johannesburg's creative pulse.",
    metrics: [
      { id: "followers", label: "Followers", value: "3.2k" },
      { id: "rating", label: "Rating", value: "4.8 ★" },
      { id: "events_hosted", label: "Events", value: "19" },
    ],
    upcomingEventIds: ["evt-soweto-food-market", "evt-jozi-run-club"],
    pastHighlights: [
      {
        id: "hl-3",
        title: "Maboneng Mural 10K",
        imageKey: "eventJoziRunClub",
        caption: "200 runners exploring street art.",
      },
    ],
  },

  "host-3": {
    host: discoveryHosts[2], // Art Hub JHB
    coverImageKey: "eventRosebankArtJazz",
    bio: "Contemporary art gallery lounge, live jazz quartets, and fashion pop-ups along Keyes Art Mile, Rosebank.",
    metrics: [
      { id: "followers", label: "Followers", value: "2.1k" },
      { id: "rating", label: "Rating", value: "4.7 ★" },
      { id: "events_hosted", label: "Events", value: "14" },
    ],
    upcomingEventIds: ["evt-rosebank-art-jazz"],
    pastHighlights: [],
  },

  "host-4": {
    host: discoveryHosts[3], // Amapiano Pulse (Host with NO upcoming events)
    coverImageKey: "eventAmapianoSunset",
    bio: "Underground amapiano movement bringing raw township soundscapes to Johannesburg stages.",
    metrics: [
      { id: "followers", label: "Followers", value: "1.5k" },
      { id: "rating", label: "Rating", value: "4.6 ★" },
      { id: "events_hosted", label: "Events", value: "8" },
    ],
    upcomingEventIds: [], // Empty upcoming events list for testing empty state
    pastHighlights: [
      {
        id: "hl-4",
        title: "Soweto Bass Night",
        imageKey: "eventAmapianoSunset",
        caption: "Amapiano sunset series outdoor stage.",
      },
    ],
  },
};

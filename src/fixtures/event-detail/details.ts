import { EventDetailPayload } from "../../domain/event-detail";
import { deepHouseLineup, midnightGroovesLineup } from "./lineups";
import { deepHouseTiers, midnightGroovesTiers } from "./ticket-tiers";
import { amapianoSunsetPosts } from "./posts";

export const eventDetailById: Record<
  string,
  Omit<EventDetailPayload, "event">
> = {
  "evt-midnight-grooves": {
    longDescription:
      "A late-night Johannesburg music experience bringing together electronic sounds, amapiano grooves, and rooftop views of the skyline under the stars at Braamfontein Rooftop.",
    conversionMode: "paid",
    modules: {
      lineup: true,
      ticketTiers: true,
      attendeeProof: true,
      eventPosts: false,
      relatedEvents: true,
    },
    lineup: midnightGroovesLineup,
    ticketTiers: midnightGroovesTiers,
    attendeeAvatarKeys: ["avatar1", "avatar2", "avatar3"],
    attendeeCount: 247,
    posts: [],
    relatedEventIds: ["evt-deep-house-rooftop", "evt-amapiano-fest"],
  },

  "evt-soweto-food-market": {
    longDescription:
      "A free community food and culture festival outside Soweto Theatre featuring authentic street food, local fashion pop-ups, acoustic sets, and family activities.",
    conversionMode: "free_registration",
    modules: {
      lineup: false,
      ticketTiers: false,
      attendeeProof: true,
      eventPosts: false,
      relatedEvents: true,
    },
    lineup: [],
    ticketTiers: [],
    attendeeAvatarKeys: ["avatar2", "avatar4"],
    attendeeCount: 650,
    posts: [],
    relatedEventIds: ["evt-rosebank-art-jazz", "evt-jozi-run-club"],
  },

  "evt-amapiano-fest": {
    longDescription:
      "The ultimate outdoor amapiano celebration currently happening live with top headliner DJs, food trucks, and light shows under the Soweto sky.",
    conversionMode: "paid",
    modules: {
      lineup: true,
      ticketTiers: true,
      attendeeProof: true,
      eventPosts: true,
      relatedEvents: true,
    },
    lineup: midnightGroovesLineup,
    ticketTiers: midnightGroovesTiers,
    attendeeAvatarKeys: ["avatar1", "avatar3", "avatar4"],
    attendeeCount: 1850,
    posts: amapianoSunsetPosts,
    relatedEventIds: ["evt-midnight-grooves", "evt-deep-house-rooftop"],
  },

  "evt-deep-house-rooftop": {
    longDescription:
      "An intimate rooftop deep-house vinyl session overlooking the Jozi skyline. All general tickets are now sold out; join the official waitlist for cancellations.",
    conversionMode: "waitlist",
    modules: {
      lineup: true,
      ticketTiers: true,
      attendeeProof: true,
      eventPosts: false,
      relatedEvents: true,
    },
    lineup: deepHouseLineup,
    ticketTiers: deepHouseTiers,
    attendeeAvatarKeys: ["avatar1", "avatar3"],
    attendeeCount: 320,
    posts: [],
    relatedEventIds: ["evt-midnight-grooves"],
  },

  "evt-fashion-week-popup": {
    longDescription:
      "Exclusive preview of spring streetwear collections by local Gauteng designers. This event has officially completed.",
    conversionMode: "none",
    modules: {
      lineup: false,
      ticketTiers: false,
      attendeeProof: true,
      eventPosts: false,
      relatedEvents: true,
    },
    lineup: [],
    ticketTiers: [],
    attendeeAvatarKeys: ["avatar2", "avatar3"],
    attendeeCount: 400,
    posts: [],
    relatedEventIds: ["evt-rosebank-art-jazz"],
  },

  "evt-completed-highlight": {
    longDescription:
      "A completed retrospective showcase of Jozi nightlife and culture. No active registration or ticket sales available.",
    conversionMode: "none",
    modules: {
      lineup: false,
      ticketTiers: false,
      attendeeProof: true,
      eventPosts: false,
      relatedEvents: true,
    },
    lineup: [],
    ticketTiers: [],
    attendeeAvatarKeys: ["avatar1", "avatar2"],
    attendeeCount: 150,
    posts: [],
    relatedEventIds: ["evt-midnight-grooves"],
  },
};

import { FeedEntry } from "../../domain/discovery";
import { discoveryEvents } from "./events";
import { discoveryHosts } from "./hosts";

export const mockLiveRecentFeedEntries: FeedEntry[] = [
  {
    id: "feed-1-event",
    kind: "event",
    event: discoveryEvents[4], // Braam Deep House Sessions (LIVE)
    editorialRank: 1,
    attendeeCount: 142,
    attendeeAvatarKeys: ["avatar1", "avatar2", "avatar3"],
  },
  {
    id: "feed-2-creator-post",
    kind: "creator_post",
    host: discoveryHosts[0], // Groove Co.
    createdAt: "2026-07-30T19:30:00.000Z",
    body: "Soundcheck is complete at Braamfontein Rooftop! Doors are officially open for tonight's Deep House Session. See you on the dancefloor 🎧✨",
    mediaImageKey: "eventMidnightGrooves",
    reactionCount: 128,
    commentCount: 24,
    relatedEventId: "evt-midnight-grooves",
  },
  {
    id: "feed-3-live-placeholder",
    kind: "live_placeholder",
    host: discoveryHosts[3], // Amapiano Pulse
    title: "PROTOTYPE LIVE: DJ Set Soundcheck Broadcast",
    viewerCount: 384,
    relatedEventId: "evt-amapiano-fest",
    previewImageKey: "eventAmapianoSunset",
  },
  {
    id: "feed-4-event",
    kind: "event",
    event: discoveryEvents[0], // Midnight Kinetic Grooves
    editorialRank: 2,
    attendeeCount: 285,
    attendeeAvatarKeys: ["avatar2", "avatar3", "avatar4"],
  },
  {
    id: "feed-5-event",
    kind: "event",
    event: discoveryEvents[2], // Soweto Street Food
    editorialRank: 3,
    attendeeCount: 420,
    attendeeAvatarKeys: ["avatar1", "avatar4"],
  },
];

export const mockUpcomingFeedEntries: FeedEntry[] = [
  {
    id: "feed-up-1",
    kind: "event",
    event: discoveryEvents[1], // Rosebank Art & Jazz
    editorialRank: 1,
    attendeeCount: 95,
    attendeeAvatarKeys: ["avatar1", "avatar2"],
  },
  {
    id: "feed-up-2",
    kind: "event",
    event: discoveryEvents[3], // Jozi Run Club
    editorialRank: 2,
    attendeeCount: 64,
    attendeeAvatarKeys: ["avatar3", "avatar4"],
  },
  {
    id: "feed-up-3",
    kind: "event",
    event: discoveryEvents[5], // Amapiano Sunset Festival
    editorialRank: 3,
    attendeeCount: 1890,
    attendeeAvatarKeys: ["avatar1", "avatar3"],
  },
];

import { Event } from "../events";
import { ImageAssetKey } from "../../assets/image-registry";
import { formatCurrency, formatDateRange } from "../../utils/format";

const SELLING_FAST_RATIO = 0.2;

export type EventDisplayStatus =
  | "Live"
  | "Selling Fast"
  | "Sold Out"
  | "Free"
  | "Upcoming"
  | "Completed"
  | "Cancelled";

export function getEventDisplayStatus(
  event: Event,
  nowIso: string,
): EventDisplayStatus {
  const now = Date.parse(nowIso);
  const start = Date.parse(event.occurrence.startTime);
  const end = Date.parse(event.occurrence.endTime);

  if (event.status === "cancelled") {
    return "Cancelled";
  }

  if (event.status === "completed" || end < now) {
    return "Completed";
  }

  if (event.status === "sold_out" || event.remainingTickets <= 0) {
    return "Sold Out";
  }

  if (event.status === "live" || (start <= now && now <= end)) {
    return "Live";
  }

  if (event.startingPriceMinor === 0) {
    return "Free";
  }

  const remainingRatio =
    event.totalCapacity > 0 ? event.remainingTickets / event.totalCapacity : 1;

  if (remainingRatio <= SELLING_FAST_RATIO) {
    return "Selling Fast";
  }

  return "Upcoming";
}

export interface EventCardViewModel {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  status: EventDisplayStatus;
  hostName: string;
  hostHandle: string;
  venueName: string;
  suburb: string;
  city: string;
  venueLine: string;
  dateLabel: string;
  priceLabel: string;
  isSaved: boolean;
  imageKey: ImageAssetKey;
  attendeeCount: number;
}

export function toEventCardViewModel(
  event: Event,
  options: {
    nowIso: string;
    attendeeCount?: number;
    isSaved?: boolean;
  },
): EventCardViewModel {
  const status = getEventDisplayStatus(event, options.nowIso);
  const dateLabel = formatDateRange(
    event.occurrence.startTime,
    event.occurrence.endTime,
  );

  const priceLabel =
    event.startingPriceMinor === 0
      ? "Free"
      : `From ${formatCurrency(event.startingPriceMinor, event.currency)}`;

  const imageKey: ImageAssetKey = event.heroImageKey ?? "eventMidnightGrooves";

  return {
    id: event.id,
    title: event.title,
    tagline: event.tagline,
    description: event.description,
    category: event.category,
    status,
    hostName: event.host.name,
    hostHandle: event.host.handle,
    venueName: event.venue.name,
    suburb: event.venue.suburb,
    city: event.venue.city,
    venueLine: `${event.venue.name}, ${event.venue.suburb}`,
    dateLabel,
    priceLabel,
    isSaved: options.isSaved ?? Boolean(event.isSaved),
    imageKey,
    attendeeCount: options.attendeeCount ?? 0,
  };
}

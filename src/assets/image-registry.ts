import { ImageSourcePropType } from "react-native";

export const imageRegistry = {
  // Events
  eventMidnightGrooves: require("../../assets/images/events/midnight-grooves.png"),
  eventRosebankArtJazz: require("../../assets/images/events/rosebank-art-jazz.png"),
  eventSowetoFoodMarket: require("../../assets/images/events/soweto-food-market.png"),
  eventJoziRunClub: require("../../assets/images/events/jozi-run-club.png"),
  eventDeepHouseRooftop: require("../../assets/images/events/deep-house-rooftop.png"),
  eventAmapianoSunset: require("../../assets/images/events/amapiano-sunset.png"),
  eventFashionWeekPopup: require("../../assets/images/events/fashion-week-popup.png"),

  // Venues
  venueBraamRooftop: require("../../assets/images/venues/braam-rooftop.png"),
  venueKeyesArtMile: require("../../assets/images/venues/keyes-art-mile.png"),
  venueSowetoTheatre: require("../../assets/images/venues/soweto-theatre.png"),
  venueMabonengPrecinct: require("../../assets/images/venues/maboneng-precinct.png"),

  // Hosts
  hostGrooveCo: require("../../assets/images/hosts/groove-co.png"),
  hostJoziVibeTribe: require("../../assets/images/hosts/jozi-vibe-tribe.png"),
  hostArtHubJhb: require("../../assets/images/hosts/art-hub-jhb.png"),
  hostAmapianoPulse: require("../../assets/images/hosts/amapiano-pulse.png"),

  // Avatars
  avatar1: require("../../assets/images/avatars/avatar-1.png"),
  avatar2: require("../../assets/images/avatars/avatar-2.png"),
  avatar3: require("../../assets/images/avatars/avatar-3.png"),
  avatar4: require("../../assets/images/avatars/avatar-4.png"),
} satisfies Record<string, ImageSourcePropType>;

export type ImageAssetKey = keyof typeof imageRegistry;

export function getImageSource(
  key?: ImageAssetKey | string | null,
): ImageSourcePropType {
  if (key && key in imageRegistry) {
    return imageRegistry[key as ImageAssetKey];
  }
  return imageRegistry.eventMidnightGrooves;
}

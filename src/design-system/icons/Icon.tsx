import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { theme } from "../theme";
import { layoutTokens } from "../tokens/layout";

export type SemanticIconName =
  | "feed"
  | "explore"
  | "map"
  | "tickets"
  | "profile"
  | "dashboard"
  | "create"
  | "events"
  | "tools"
  | "settings"
  | "search"
  | "filter"
  | "calendar"
  | "location"
  | "user"
  | "heart"
  | "share"
  | "close"
  | "back"
  | "arrowLeft"
  | "check"
  | "checkmark"
  | "alert"
  | "alertCircle"
  | "refresh"
  | "bell"
  | "sparkles"
  | "chevronRight"
  | "chevronLeft"
  | "music"
  | "bookmark"
  | "bookmarkFilled"
  | "mapPin"
  | "messageCircle"
  | "chat"
  | "more"
  | "landmark"
  | "palette"
  | "utensils"
  | "activity"
  | "users"
  | "shoppingBag"
  | "moon"
  | "qr"
  | "card"
  | "plus"
  | "minus"
  | "lock";

const iconNameMap: Record<SemanticIconName, keyof typeof Ionicons.glyphMap> = {
  feed: "flame-outline",
  explore: "compass-outline",
  map: "map-outline",
  tickets: "ticket-outline",
  profile: "person-outline",
  dashboard: "stats-chart-outline",
  create: "add-circle-outline",
  events: "calendar-outline",
  tools: "construct-outline",
  settings: "options-outline",
  search: "search-outline",
  filter: "funnel-outline",
  calendar: "calendar-clear-outline",
  location: "location-outline",
  user: "person-circle-outline",
  heart: "heart-outline",
  share: "share-social-outline",
  close: "close-outline",
  back: "arrow-back-outline",
  arrowLeft: "arrow-back-outline",
  check: "checkmark-outline",
  checkmark: "checkmark-outline",
  alert: "alert-circle-outline",
  alertCircle: "alert-circle-outline",
  refresh: "refresh-outline",
  bell: "notifications-outline",
  sparkles: "sparkles-outline",
  chevronRight: "chevron-forward-outline",
  chevronLeft: "chevron-back-outline",
  music: "musical-notes-outline",
  bookmark: "bookmark-outline",
  bookmarkFilled: "bookmark",
  mapPin: "location-outline",
  messageCircle: "chatbubble-outline",
  chat: "chatbubble-outline",
  more: "ellipsis-horizontal-outline",
  landmark: "library-outline",
  palette: "color-palette-outline",
  utensils: "restaurant-outline",
  activity: "fitness-outline",
  users: "people-outline",
  shoppingBag: "bag-handle-outline",
  moon: "moon-outline",
  qr: "qr-code-outline",
  card: "card-outline",
  plus: "add-outline",
  minus: "remove-outline",
  lock: "lock-closed-outline",
};

export interface IconProps {
  name: SemanticIconName;
  size?: keyof typeof layoutTokens.iconSizes | number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = "md",
  color = theme.colors.textPrimary,
  style,
  accessibilityLabel,
}) => {
  const numericSize =
    typeof size === "number" ? size : layoutTokens.iconSizes[size] || 24;
  const ioniconName = iconNameMap[name] || "help-circle-outline";

  return (
    <View
      style={style}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || `${name} icon`}
    >
      <Ionicons name={ioniconName} size={numericSize} color={color} />
    </View>
  );
};

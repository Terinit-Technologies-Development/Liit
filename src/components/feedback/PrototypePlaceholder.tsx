import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { AppText } from "../ui/AppText";
import { Chip } from "../ui/Chip";
import { Card } from "../ui/Card";
import { Icon, SemanticIconName } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export type PlaceholderReason =
  | "not_implemented_in_this_pr"
  | "simulated_feature"
  | "temporarily_unavailable"
  | "requires_future_service";

export interface PrototypePlaceholderProps {
  title: string;
  routePurpose: string;
  reason?: PlaceholderReason;
  icon?: SemanticIconName;
  activeMode?: "consumer" | "creator";
  style?: ViewStyle;
}

const reasonLabels: Record<
  PlaceholderReason,
  { label: string; color: string }
> = {
  not_implemented_in_this_pr: {
    label: "Foundation Shell — Screen Pending Next PR",
    color: theme.colors.accentStart,
  },
  simulated_feature: {
    label: "Simulated Local Prototype Feature",
    color: theme.colors.statusWarning,
  },
  temporarily_unavailable: {
    label: "Temporarily Unavailable",
    color: theme.colors.textMuted,
  },
  requires_future_service: {
    label: "Requires Future Service Integration",
    color: theme.colors.accentEnd,
  },
};

export const PrototypePlaceholder: React.FC<PrototypePlaceholderProps> = ({
  title,
  routePurpose,
  reason = "not_implemented_in_this_pr",
  icon = "sparkles",
  activeMode = "consumer",
  style,
}) => {
  const badgeInfo = reasonLabels[reason];

  return (
    <View style={[styles.container, style]}>
      <Card radius="xxl" padding="xl" style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconBox}>
            <Icon name={icon} size="lg" color={theme.colors.accentStart} />
          </View>
          <Chip
            label={`${activeMode.toUpperCase()} MODE`}
            selected={activeMode === "creator"}
          />
        </View>

        <AppText variant="display" style={styles.title}>
          {title}
        </AppText>

        <AppText
          variant="subheading"
          color={theme.colors.textSecondary}
          style={styles.purpose}
        >
          {routePurpose}
        </AppText>

        <View style={styles.badgeBox}>
          <Chip label={badgeInfo.label} icon="sparkles" />
        </View>

        <AppText
          variant="caption"
          color={theme.colors.textMuted}
          style={styles.notice}
        >
          LIIT Foundation Shell (SDK 57) • Architecture & navigation baseline
          active.
        </AppText>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.borderSubtle,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.lg,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  purpose: {
    marginBottom: theme.spacing.lg,
  },
  badgeBox: {
    alignSelf: "flex-start",
    marginBottom: theme.spacing.md,
  },
  notice: {
    marginTop: theme.spacing.sm,
  },
});

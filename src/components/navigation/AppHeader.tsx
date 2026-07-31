import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../ui/AppText";
import { IconButton } from "../ui/IconButton";
import { Chip } from "../ui/Chip";
import { useRouter } from "expo-router";
import { useAppStore } from "../../state/useAppStore";
import { theme } from "../../design-system/theme";

export interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  onBackPress?: () => void;
  onBack?: () => void;
  showDevControls?: boolean;
  rightActionIcon?: string;
  onRightAction?: () => void;
  rightAction?: {
    label?: string;
    icon?: string;
    accessibilityLabel?: string;
    onPress: () => void;
    testID?: string;
  };
  style?: ViewStyle;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  onBackPress,
  onBack,
  showDevControls = true,
  rightAction,
  style,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeMode = useAppStore((state) => state.activeMode);

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
    } else if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, theme.spacing.md) },
        style,
      ]}
      accessibilityRole="header"
    >
      <View style={styles.contentRow}>
        <View style={styles.leftSection}>
          {showBack ? (
            <IconButton
              icon="back"
              onPress={handleBack}
              accessibilityLabel="Navigate back"
              variant="ghost"
              size="sm"
            />
          ) : null}
          <AppText variant="heading" style={styles.title}>
            {title}
          </AppText>
        </View>

        <View style={styles.rightSection}>
          {rightAction ? (
            rightAction.label ? (
              <Chip label={rightAction.label} onPress={rightAction.onPress} />
            ) : (
              <IconButton
                testID={rightAction.testID}
                icon={(rightAction.icon ?? "close") as any}
                onPress={rightAction.onPress}
                accessibilityLabel={
                  rightAction.accessibilityLabel ??
                  rightAction.label ??
                  "Right action"
                }
                variant="surface"
                size="sm"
              />
            )
          ) : null}
          <Chip
            label={(activeMode ?? "consumer").toUpperCase()}
            selected={activeMode === "creator"}
            onPress={
              showDevControls
                ? () => router.push("/(modals)/prototype-controls" as any)
                : undefined
            }
          />
          {showDevControls ? (
            <IconButton
              icon="settings"
              onPress={() => router.push("/(modals)/prototype-controls" as any)}
              accessibilityLabel="Open Prototype Controls"
              variant="surface"
              size="sm"
            />
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.canvas,
    paddingHorizontal: theme.spacing.gutter,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 44,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  title: {
    fontWeight: "700",
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
});

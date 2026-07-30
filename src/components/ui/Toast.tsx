import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { useToast } from "../../hooks/useToast";
import { AppText } from "./AppText";
import { Icon } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export const ToastBanner: React.FC = () => {
  const { toast, hideToast } = useToast();

  if (!toast) return null;

  const iconName =
    toast.type === "success"
      ? "check"
      : toast.type === "error"
        ? "alert"
        : toast.type === "warning"
          ? "alert"
          : "sparkles";

  const accentColor =
    toast.type === "success"
      ? theme.colors.emerald400
      : toast.type === "error"
        ? theme.colors.statusDanger
        : toast.type === "warning"
          ? theme.colors.amber400
          : theme.colors.accentStart;

  return (
    <View style={styles.toastContainer} accessibilityRole="alert">
      <View style={[styles.card, { borderColor: accentColor }]}>
        <Icon name={iconName} size="md" color={accentColor} />
        <View style={styles.content}>
          <AppText variant="bodyStrong">{toast.title}</AppText>
          <AppText variant="caption" color={theme.colors.textSecondary}>
            {toast.message}
          </AppText>
        </View>
        <Pressable
          onPress={hideToast}
          accessibilityLabel="Dismiss notification"
        >
          <Icon name="close" size="sm" color={theme.colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: "absolute",
    top: 50,
    left: theme.spacing.gutter,
    right: theme.spacing.gutter,
    zIndex: theme.layout.zIndex.toast,
  },
  card: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flex: 1,
  },
});

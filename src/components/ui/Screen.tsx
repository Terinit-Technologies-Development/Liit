import React from "react";
import { View, StyleSheet, ScrollView, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar, StatusBarStyle } from "expo-status-bar";
import { theme } from "../../design-system/theme";

export interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  statusBarStyle?: StatusBarStyle;
  unsafe?: boolean;
  gutter?: boolean;
  safeAreaEdges?: ("top" | "bottom" | "left" | "right")[];
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  statusBarStyle = "light",
  unsafe = false,
  gutter = true,
  safeAreaEdges,
}) => {
  const insets = useSafeAreaInsets();

  const includeTop =
    !unsafe && (!safeAreaEdges || safeAreaEdges.includes("top"));
  const includeBottom =
    !unsafe && (!safeAreaEdges || safeAreaEdges.includes("bottom"));

  const containerPadding: ViewStyle = {
    paddingTop: includeTop ? insets.top : 0,
    paddingBottom: includeBottom ? insets.bottom : 0,
    paddingLeft: unsafe ? 0 : insets.left + (gutter ? theme.spacing.gutter : 0),
    paddingRight: unsafe
      ? 0
      : insets.right + (gutter ? theme.spacing.gutter : 0),
  };

  return (
    <View style={[styles.root, style]}>
      <StatusBar style={statusBarStyle} />
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[containerPadding, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={[styles.fixedContent, containerPadding, contentContainerStyle]}
        >
          {children}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  scroll: {
    flex: 1,
  },
  fixedContent: {
    flex: 1,
  },
});

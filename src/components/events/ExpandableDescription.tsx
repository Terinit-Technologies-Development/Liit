import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

export interface ExpandableDescriptionProps {
  text: string;
}

export function ExpandableDescription({ text }: ExpandableDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > 140;

  return (
    <View style={styles.container}>
      <AppText variant="subheading" style={styles.title}>
        About this event
      </AppText>

      <AppText
        variant="body"
        color={theme.colors.textSecondary}
        numberOfLines={expanded ? undefined : 3}
      >
        {text}
      </AppText>

      {isLong ? (
        <Pressable
          testID="event-description-toggle"
          accessibilityRole="button"
          accessibilityLabel={
            expanded
              ? "Show less event description"
              : "Read full event description"
          }
          accessibilityState={{
            expanded,
          }}
          onPress={() => setExpanded((current) => !current)}
          style={styles.toggleBtn}
        >
          <AppText variant="label" color={theme.colors.accentStart}>
            {expanded ? "Show less" : "Read full description"}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  title: {
    fontWeight: "700",
  },
  toggleBtn: {
    paddingVertical: theme.spacing.xs,
  },
});

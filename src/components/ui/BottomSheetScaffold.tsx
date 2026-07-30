import React from "react";
import { View, StyleSheet, Pressable, Modal, ViewStyle } from "react-native";
import { AppText } from "./AppText";
import { Icon } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export interface BottomSheetScaffoldProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const BottomSheetScaffold: React.FC<BottomSheetScaffoldProps> = ({
  visible,
  onClose,
  title,
  children,
  containerStyle,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={styles.dismissArea}
          onPress={onClose}
          accessibilityLabel="Close sheet"
        />
        <View style={[styles.sheet, containerStyle]}>
          <View style={styles.handleBar}>
            <View style={styles.handle} />
          </View>
          {title ? (
            <View style={styles.header}>
              <AppText variant="title">{title}</AppText>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                accessibilityLabel="Close sheet modal"
              >
                <Icon name="close" size="sm" color={theme.colors.textMuted} />
              </Pressable>
            </View>
          ) : null}
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.overlayBackdrop,
    justifyContent: "flex-end",
  },
  dismissArea: {
    flex: 1,
  },
  sheet: {
    backgroundColor: theme.colors.surfaceElevated,
    borderTopLeftRadius: theme.radii.largeCard,
    borderTopRightRadius: theme.radii.largeCard,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    borderTopWidth: 1,
    borderColor: theme.colors.ghostBorder,
    maxHeight: "85%",
  },
  handleBar: {
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: theme.radii.full,
    backgroundColor: theme.colors.textMuted,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  content: {
    paddingBottom: theme.spacing.lg,
  },
});

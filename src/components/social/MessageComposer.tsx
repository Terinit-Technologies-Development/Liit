import React, { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { IconButton } from "../ui/IconButton";
import { Icon } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";

export interface MessageComposerProps {
  value?: string;
  onChangeText?(text: string): void;
  onSend(text: string): void;
  onAttachmentPress?(): void;
  onEmojiPress?(): void;
  disabled?: boolean;
  placeholder?: string;
  testID?: string;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  value,
  onChangeText,
  onSend,
  onAttachmentPress,
  onEmojiPress,
  disabled = false,
  placeholder = "Type a message…",
  testID = "message-composer",
}) => {
  const [internalText, setInternalText] = useState("");
  const currentText = value !== undefined ? value : internalText;

  const handleChangeText = (text: string) => {
    if (onChangeText) {
      onChangeText(text);
    } else {
      setInternalText(text);
    }
  };

  const isControlled = value !== undefined;

  const handleSend = () => {
    const trimmed = currentText.trim();
    if (!trimmed || disabled) {
      return;
    }
    onSend(trimmed);
    if (!isControlled) {
      setInternalText("");
    }
  };

  const isSendable = currentText.trim().length > 0 && !disabled;

  return (
    <View style={styles.container} testID={testID}>
      {onAttachmentPress ? (
        <IconButton
          icon="add"
          accessibilityLabel="Attach photo or file"
          onPress={onAttachmentPress}
          variant="ghost"
          size="sm"
          disabled={disabled}
          testID="composer-attachment-button"
        />
      ) : null}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={currentText}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          multiline
          editable={!disabled}
          accessibilityLabel="Message input"
          testID="composer-input"
        />
        {onEmojiPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add emoji"
            onPress={onEmojiPress}
            disabled={disabled}
            style={styles.emojiButton}
            testID="composer-emoji-button"
          >
            <Icon name="heart" size={16} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Send message"
        onPress={handleSend}
        disabled={!isSendable}
        style={({ pressed }) => [
          styles.sendButton,
          isSendable ? styles.sendButtonActive : styles.sendButtonDisabled,
          pressed && isSendable && styles.sendButtonPressed,
        ]}
        testID="composer-send-button"
      >
        <Icon
          name="send"
          size={18}
          color={isSendable ? "#FFFFFF" : theme.colors.textMuted}
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfacePrimary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSubtle,
    gap: theme.spacing.xs,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    minHeight: 40,
    maxHeight: 100,
  },
  input: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.body.fontFamily,
    fontSize: 15,
    paddingTop: 0,
    paddingBottom: 0,
  },
  emojiButton: {
    padding: 4,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: theme.colors.accentStart,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.surfaceElevated,
    opacity: 0.5,
  },
  sendButtonPressed: {
    opacity: 0.8,
  },
});

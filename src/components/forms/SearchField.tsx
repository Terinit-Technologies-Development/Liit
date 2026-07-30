import React from "react";
import { View, ViewStyle } from "react-native";
import { TextField, TextFieldProps } from "./TextField";

export interface SearchFieldProps extends Omit<
  TextFieldProps,
  "leftIcon" | "rightIcon" | "rightAction"
> {
  onClear?: () => void;
  containerStyle?: ViewStyle;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  value,
  onClear,
  containerStyle,
  placeholder = "Search events, hosts, or venues...",
  ...props
}) => {
  return (
    <View style={containerStyle}>
      <TextField
        value={value}
        placeholder={placeholder}
        leftIcon="search"
        rightAction={
          value
            ? {
                icon: "close",
                accessibilityLabel: "Clear search",
                onPress: onClear ?? (() => undefined),
              }
            : undefined
        }
        accessibilityRole="search"
        accessibilityLabel="Search input field"
        {...props}
      />
    </View>
  );
};

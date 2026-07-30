import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { TextField, TextFieldProps } from "../forms/TextField";

export interface FormFieldProps extends TextFieldProps {
  fieldContainerStyle?: ViewStyle;
}

export const FormField: React.FC<FormFieldProps> = ({
  fieldContainerStyle,
  ...props
}) => {
  return (
    <View style={[styles.fieldContainer, fieldContainerStyle]}>
      <TextField {...props} />
    </View>
  );
};

const styles = StyleSheet.create({
  fieldContainer: {
    width: "100%",
  },
});

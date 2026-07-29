import React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";
import { theme } from "../../design-system/theme";
import { TypographyTokenKey } from "../../design-system/tokens/typography";

export interface AppTextProps extends RNTextProps {
  variant?: TypographyTokenKey;
  color?: string;
  align?: "auto" | "left" | "right" | "center" | "justify";
  children?: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({
  variant = "body",
  color = theme.colors.textPrimary,
  align = "left",
  style,
  children,
  ...props
}) => {
  const tokenStyle = theme.typography[variant];

  return (
    <RNText
      style={[tokenStyle, { color, textAlign: align }, style]}
      allowFontScaling={true}
      {...props}
    >
      {children}
    </RNText>
  );
};

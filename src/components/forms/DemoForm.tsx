import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "./TextField";
import { AppButton } from "../ui/AppButton";
import { AppText } from "../ui/AppText";
import { theme } from "../../design-system/theme";

const demoSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

export type DemoFormData = z.infer<typeof demoSchema>;

export interface DemoFormProps {
  onSubmitSuccess?: (data: DemoFormData) => void;
}

export const DemoForm: React.FC<DemoFormProps> = ({ onSubmitSuccess }) => {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<DemoFormData>({
    resolver: zodResolver(demoSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const onSubmit = async (data: DemoFormData) => {
    setIsSubmitting(true);
    setFormError(null);

    // Simulate async submission
    setTimeout(() => {
      setIsSubmitting(false);
      if (data.email.includes("fail")) {
        setFormError(
          "Simulated server validation error. Please try another email.",
        );
      } else {
        onSubmitSuccess?.(data);
      }
    }, 800);
  };

  return (
    <View style={styles.formContainer}>
      <AppText variant="heading" style={styles.formTitle}>
        Demonstration Validation Form
      </AppText>
      <AppText
        variant="body"
        color={theme.colors.textSecondary}
        style={styles.formSubtitle}
      >
        Proves React Hook Form + Zod integration with accessible feedback.
      </AppText>

      {formError ? (
        <View style={styles.formErrorBox} accessibilityRole="alert">
          <AppText variant="caption" color={theme.colors.statusDanger}>
            {formError}
          </AppText>
        </View>
      ) : null}

      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Full Name *"
            placeholder="e.g. Thabo Mbeki"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.fullName?.message}
            leftIcon="user"
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextField
            label="Email Address *"
            placeholder="e.g. thabo@example.co.za"
            keyboardType="email-address"
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.email?.message}
            hint="Enter 'fail@test.com' to trigger form-level error."
            leftIcon="user"
          />
        )}
      />

      <AppButton
        label="Submit Form"
        onPress={handleSubmit(onSubmit)}
        variant="primary"
        loading={isSubmitting}
        disabled={!isValid || isSubmitting}
        fullWidth
        style={styles.submitBtn}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surfaceCard,
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  formTitle: {
    fontWeight: "700",
  },
  formSubtitle: {
    marginTop: -theme.spacing.sm,
  },
  formErrorBox: {
    padding: theme.spacing.md,
    backgroundColor: "rgba(248, 113, 113, 0.15)",
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.statusDanger,
  },
  submitBtn: {
    marginTop: theme.spacing.md,
  },
});

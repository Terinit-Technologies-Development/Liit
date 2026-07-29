import React from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { SecondaryButton } from "../../src/components/ui/SecondaryButton";
import { IconButton } from "../../src/components/ui/IconButton";
import { GlassSurface } from "../../src/components/ui/GlassSurface";
import { Surface } from "../../src/components/ui/Surface";
import { Card } from "../../src/components/ui/Card";
import { Chip } from "../../src/components/ui/Chip";
import { StatusPill } from "../../src/components/ui/StatusPill";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import { PrototypeBadge } from "../../src/components/ui/PrototypeBadge";
import { Avatar } from "../../src/components/ui/Avatar";
import { Divider } from "../../src/components/ui/Divider";
import { Stack } from "../../src/components/ui/Stack";
import { Row } from "../../src/components/ui/Row";
import { DemoForm } from "../../src/components/forms/DemoForm";
import { LoadingView } from "../../src/components/feedback/LoadingView";
import { EmptyState } from "../../src/components/feedback/EmptyState";
import { ErrorState } from "../../src/components/feedback/ErrorState";
import { OfflineBanner } from "../../src/components/feedback/OfflineBanner";
import { Skeleton } from "../../src/components/feedback/Skeleton";
import { theme } from "../../src/design-system/theme";

export default function ComponentPreviewScreen() {
  const router = useRouter();

  return (
    <Screen scrollable>
      <Row justify="space-between" align="center" style={styles.topRow}>
        <AppText variant="heading">UI Component Preview Library</AppText>
        <IconButton
          icon="close"
          onPress={() => router.back()}
          accessibilityLabel="Close component preview"
          variant="surface"
          size="sm"
        />
      </Row>

      <Stack gap="xxl" style={styles.content}>
        {/* Typography & Badges */}
        <Stack gap="sm">
          <SectionHeader title="1. Typography & Badges" />
          <Row gap="xs" align="center">
            <PrototypeBadge label="PROTOTYPE COMPONENT" />
            <StatusPill label="LIVE" type="live" />
            <StatusPill label="VERIFIED" type="verified" />
            <StatusPill label="DRAFT" type="draft" />
          </Row>
          <AppText variant="display">Display Text (34px)</AppText>
          <AppText variant="title">Title Text (26px)</AppText>
          <AppText variant="heading">Heading Text (22px)</AppText>
          <AppText variant="subheading">Subheading Text (18px)</AppText>
          <AppText variant="body">Body Regular Text (15px)</AppText>
          <AppText variant="bodyStrong">Body Strong Text (15px)</AppText>
          <AppText variant="caption" color={theme.colors.textSecondary}>
            Caption Text (13px)
          </AppText>
          <AppText variant="label" color={theme.colors.textMuted}>
            LABEL TEXT (12px)
          </AppText>
        </Stack>

        <Divider />

        {/* Action Buttons */}
        <Stack gap="md">
          <SectionHeader title="2. Action Buttons (Pill & Secondary)" />
          <Stack gap="sm">
            <GradientButton
              label="Gradient Button (Signature)"
              onPress={() => {}}
              fullWidth
            />
            <SecondaryButton
              label="Secondary Tonal Button"
              onPress={() => {}}
              fullWidth
            />
            <Row gap="sm" wrap>
              <AppButton label="Primary" onPress={() => {}} variant="primary" />
              <AppButton label="Ghost" onPress={() => {}} variant="ghost" />
              <AppButton label="Danger" onPress={() => {}} variant="danger" />
            </Row>
            <Row gap="sm">
              <AppButton label="Loading State" onPress={() => {}} loading />
              <AppButton label="Disabled State" onPress={() => {}} disabled />
            </Row>
          </Stack>
        </Stack>

        <Divider />

        {/* Surfaces & Glassmorphism */}
        <Stack gap="md">
          <SectionHeader title="3. Glassmorphism & Tonal Surfaces" />
          <GlassSurface radius="largeCard" padding="lg">
            <AppText variant="subheading" color={theme.colors.textPrimary}>
              GlassSurface Component
            </AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Translucent dark surface with 72% opacity and ghost border.
            </AppText>
          </GlassSurface>
          <Surface level="elevated" padding="lg">
            <AppText variant="body">Surface Level: Elevated (#272431)</AppText>
          </Surface>
          <Card radius="xl" padding="lg">
            <AppText variant="subheading">Card Primitive (24px Radius)</AppText>
          </Card>
        </Stack>

        <Divider />

        {/* Chips & Avatars */}
        <Stack gap="sm">
          <SectionHeader title="4. Chips & Avatars" />
          <Row gap="xs" wrap>
            <Chip label="Unselected Chip" selected={false} />
            <Chip label="Selected Chip" selected={true} />
            <Chip label="With Icon" icon="sparkles" selected={false} />
          </Row>
          <Row gap="md" align="center">
            <Avatar name="Thabo Mbeki" size="sm" isVerified />
            <Avatar name="Thabo Mbeki" size="md" isVerified />
            <Avatar name="Thabo Mbeki" size="lg" isVerified />
            <Avatar name="Thabo Mbeki" size="xl" isVerified />
          </Row>
        </Stack>

        <Divider />

        {/* Form Controls */}
        <Stack gap="md">
          <SectionHeader title="5. Form Controls & Validation" />
          <DemoForm />
        </Stack>

        <Divider />

        {/* Feedback States */}
        <Stack gap="md">
          <SectionHeader title="6. Feedback States" />
          <OfflineBanner />
          <LoadingView message="Loading component preview..." />
          <Skeleton height={60} borderRadius="lg" />
          <EmptyState
            title="Empty Preview State"
            description="No items found matching your current search query."
            actionLabel="Reset Search"
            onAction={() => {}}
          />
          <ErrorState
            title="Error Preview State"
            message="Failed to connect to local mock repository."
            onRetry={() => {}}
          />
        </Stack>
      </Stack>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    paddingVertical: theme.spacing.md,
  },
  content: {
    paddingBottom: theme.spacing.xxl,
  },
});

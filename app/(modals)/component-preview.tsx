import React from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { IconButton } from "../../src/components/ui/IconButton";
import { Surface } from "../../src/components/ui/Surface";
import { Card } from "../../src/components/ui/Card";
import { Chip } from "../../src/components/ui/Chip";
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
        <AppText variant="heading">UI Component Preview</AppText>
        <IconButton
          icon="close"
          onPress={() => router.back()}
          accessibilityLabel="Close component preview"
          variant="surface"
          size="sm"
        />
      </Row>

      <Stack gap="xxl" style={styles.content}>
        {/* Typography */}
        <Stack gap="sm">
          <AppText variant="heading" color={theme.colors.accentStart}>
            1. Typography Tokens
          </AppText>
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
          <AppText variant="metric">R 95,000 (Metric)</AppText>
        </Stack>

        <Divider />

        {/* Buttons */}
        <Stack gap="md">
          <AppText variant="heading" color={theme.colors.accentStart}>
            2. AppButton & IconButton
          </AppText>
          <Row gap="sm" wrap>
            <AppButton label="Primary" onPress={() => {}} variant="primary" />
            <AppButton
              label="Secondary"
              onPress={() => {}}
              variant="secondary"
            />
            <AppButton label="Ghost" onPress={() => {}} variant="ghost" />
            <AppButton label="Danger" onPress={() => {}} variant="danger" />
          </Row>
          <Row gap="sm">
            <AppButton label="Loading State" onPress={() => {}} loading />
            <AppButton label="Disabled" onPress={() => {}} disabled />
          </Row>
          <Row gap="md">
            <IconButton
              icon="heart"
              onPress={() => {}}
              accessibilityLabel="Like event"
            />
            <IconButton
              icon="share"
              onPress={() => {}}
              accessibilityLabel="Share event"
            />
            <IconButton
              icon="bell"
              onPress={() => {}}
              accessibilityLabel="Notifications"
            />
          </Row>
        </Stack>

        <Divider />

        {/* Chips */}
        <Stack gap="sm">
          <AppText variant="heading" color={theme.colors.accentStart}>
            3. Chips & Avatars
          </AppText>
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

        {/* Surfaces & Cards */}
        <Stack gap="md">
          <AppText variant="heading" color={theme.colors.accentStart}>
            4. Surfaces & Cards
          </AppText>
          <Surface level="primary" padding="lg">
            <AppText variant="body">Surface Level: Primary</AppText>
          </Surface>
          <Surface level="elevated" padding="lg">
            <AppText variant="body">Surface Level: Elevated</AppText>
          </Surface>
          <Card radius="xl" padding="lg">
            <AppText variant="subheading">Card Primitive (24px Radius)</AppText>
            <AppText variant="body" color={theme.colors.textSecondary}>
              Tonal surface separation with soft borders.
            </AppText>
          </Card>
        </Stack>

        <Divider />

        {/* Form Controls */}
        <Stack gap="md">
          <AppText variant="heading" color={theme.colors.accentStart}>
            5. Form Controls & Validation
          </AppText>
          <DemoForm />
        </Stack>

        <Divider />

        {/* Feedback States */}
        <Stack gap="md">
          <AppText variant="heading" color={theme.colors.accentStart}>
            6. Feedback States
          </AppText>
          <OfflineBanner />
          <LoadingView message="Loading preview component..." />
          <Skeleton height={60} borderRadius="lg" />
          <EmptyState
            title="Empty Preview State"
            description="No items found matching your current filter criteria."
            actionLabel="Reset Filters"
            onAction={() => {}}
          />
          <ErrorState
            title="Error Preview State"
            message="Failed to load mock data response."
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

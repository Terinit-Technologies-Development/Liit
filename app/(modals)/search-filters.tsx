import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../src/components/ui/Screen";
import { AppText } from "../../src/components/ui/AppText";
import { GradientButton } from "../../src/components/ui/GradientButton";
import { SecondaryButton } from "../../src/components/ui/SecondaryButton";
import { IconButton } from "../../src/components/ui/IconButton";
import { Chip } from "../../src/components/ui/Chip";
import { Card } from "../../src/components/ui/Card";
import { SectionHeader } from "../../src/components/ui/SectionHeader";
import {
  DEFAULT_DISCOVERY_FILTERS,
  useDiscoveryStore,
} from "../../src/state/useDiscoveryStore";
import {
  SearchFiltersFormValues,
  searchFiltersSchema,
} from "../../src/domain/discovery/search-filter-schema";
import { discoveryCategories } from "../../src/fixtures/discovery";
import { theme } from "../../src/design-system/theme";

function countActive(values: SearchFiltersFormValues): number {
  let count = 0;
  if (values.category) count++;
  if (values.date !== "any") count++;
  if (values.distanceKm) count++;
  if (values.maxPriceMinor !== null) count++;
  if (values.availabilityOnly) count++;
  if (values.liveOnly) count++;
  return count;
}

export default function SearchFiltersModal() {
  const router = useRouter();
  const currentFilters = useDiscoveryStore((state) => state.filters);
  const setFilters = useDiscoveryStore((state) => state.setFilters);

  const form = useForm<SearchFiltersFormValues>({
    resolver: zodResolver(searchFiltersSchema),
    defaultValues: currentFilters,
  });

  const activeCount = countActive(form.watch());

  const apply = form.handleSubmit((values) => {
    setFilters(values);
    router.back();
  });

  const reset = () => {
    form.reset(DEFAULT_DISCOVERY_FILTERS);
  };

  return (
    <Screen safeAreaEdges={["top", "bottom"]} style={styles.screen}>
      <View style={styles.header}>
        <AppText variant="heading">Search Filters</AppText>
        <IconButton
          icon="close"
          accessibilityLabel="Close filters"
          onPress={() => router.back()}
          variant="surface"
          size="sm"
        />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Date Filter */}
        <Card radius="xl" padding="lg">
          <SectionHeader title="Date & Time" />
          <Controller
            control={form.control}
            name="date"
            render={({ field: { value, onChange } }) => (
              <View style={styles.chipsWrap}>
                {[
                  { id: "any", label: "Anytime" },
                  { id: "today", label: "Today" },
                  { id: "tomorrow", label: "Tomorrow" },
                  { id: "this_weekend", label: "This Weekend" },
                ].map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    selected={value === item.id}
                    onPress={() => onChange(item.id)}
                  />
                ))}
              </View>
            )}
          />
        </Card>

        {/* Distance Filter */}
        <Card radius="xl" padding="lg">
          <SectionHeader
            title="Distance (Metric)"
            subtitle="From Johannesburg City Centre"
          />
          <Controller
            control={form.control}
            name="distanceKm"
            render={({ field: { value, onChange } }) => (
              <View style={styles.chipsWrap}>
                {[
                  { id: null, label: "Any Distance" },
                  { id: 5, label: "Within 5 km" },
                  { id: 10, label: "Within 10 km" },
                  { id: 25, label: "Within 25 km" },
                  { id: 50, label: "Within 50 km" },
                ].map((item) => (
                  <Chip
                    key={String(item.id)}
                    label={item.label}
                    selected={value === item.id}
                    onPress={() => onChange(item.id)}
                  />
                ))}
              </View>
            )}
          />
        </Card>

        {/* Category Filter */}
        <Card radius="xl" padding="lg">
          <SectionHeader title="Category" />
          <Controller
            control={form.control}
            name="category"
            render={({ field: { value, onChange } }) => (
              <View style={styles.chipsWrap}>
                <Chip
                  label="All Categories"
                  selected={value === null}
                  onPress={() => onChange(null)}
                />
                {discoveryCategories.map((cat) => (
                  <Chip
                    key={cat.id}
                    label={cat.name}
                    selected={value === cat.id}
                    onPress={() => onChange(cat.id)}
                  />
                ))}
              </View>
            )}
          />
        </Card>

        {/* Maximum Price Filter */}
        <Card radius="xl" padding="lg">
          <SectionHeader title="Maximum Price (ZAR)" />
          <Controller
            control={form.control}
            name="maxPriceMinor"
            render={({ field: { value, onChange } }) => (
              <View style={styles.chipsWrap}>
                {[
                  { id: null, label: "Any Price" },
                  { id: 0, label: "Free Only" },
                  { id: 20000, label: "Under R200" },
                  { id: 50000, label: "Under R500" },
                ].map((item) => (
                  <Chip
                    key={String(item.id)}
                    label={item.label}
                    selected={value === item.id}
                    onPress={() => onChange(item.id)}
                  />
                ))}
              </View>
            )}
          />
        </Card>

        {/* Toggles */}
        <Card radius="xl" padding="lg">
          <SectionHeader title="Options & Status" />
          <View style={styles.chipsWrap}>
            <Controller
              control={form.control}
              name="availabilityOnly"
              render={({ field: { value, onChange } }) => (
                <Chip
                  label="Tickets Available Only"
                  selected={value}
                  onPress={() => onChange(!value)}
                />
              )}
            />

            <Controller
              control={form.control}
              name="liveOnly"
              render={({ field: { value, onChange } }) => (
                <Chip
                  label="Live Now Only"
                  selected={value}
                  onPress={() => onChange(!value)}
                />
              )}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <View style={styles.footerBtnWrapper}>
          <SecondaryButton label="Reset" onPress={reset} fullWidth />
        </View>
        <View style={styles.footerBtnWrapper}>
          <GradientButton
            testID="filters-apply"
            label={
              activeCount > 0 ? `Apply ${activeCount} Filters` : "Apply Filters"
            }
            onPress={() => apply()}
            fullWidth
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  content: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.md,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surfacePrimary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderSubtle,
    gap: theme.spacing.md,
  },
  footerBtnWrapper: {
    flex: 1,
  },
});

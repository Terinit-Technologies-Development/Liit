import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { Chip } from "../../src/components/ui/Chip";
import { SecondaryButton } from "../../src/components/ui/SecondaryButton";
import { GradientButton } from "../../src/components/ui/GradientButton";
import {
  DEFAULT_MAP_FILTERS,
  MapFiltersFormValues,
  mapFiltersSchema,
} from "../../src/domain/map/map-filter-schema";
import { useMapDiscoveryStore } from "../../src/state/useMapDiscoveryStore";
import { EventCategory } from "../../src/domain/events";
import { theme } from "../../src/design-system/theme";

const CATEGORIES: { id: EventCategory; label: string }[] = [
  { id: "music", label: "Music" },
  { id: "nightlife", label: "Nightlife" },
  { id: "cultural", label: "Cultural" },
  { id: "fashion", label: "Fashion" },
  { id: "art", label: "Art" },
  { id: "food_drink", label: "Food & Drink" },
  { id: "sport", label: "Sport" },
  { id: "networking", label: "Networking" },
  { id: "pop_up", label: "Pop-Up" },
];

const STATUSES: { id: "live" | "available" | "sold_out"; label: string }[] = [
  { id: "live", label: "Live Now" },
  { id: "available", label: "Tickets Available" },
  { id: "sold_out", label: "Sold Out" },
];

const DISTANCES: { id: 5 | 10 | 25 | 50; label: string }[] = [
  { id: 5, label: "5 km" },
  { id: 10, label: "10 km" },
  { id: 25, label: "25 km" },
  { id: 50, label: "50 km" },
];

export default function MapFiltersModal() {
  const router = useRouter();

  const currentFilters = useMapDiscoveryStore((state) => state.filters);
  const setFilters = useMapDiscoveryStore((state) => state.setFilters);

  const form = useForm<MapFiltersFormValues>({
    resolver: zodResolver(mapFiltersSchema),
    defaultValues: currentFilters,
  });

  const apply = form.handleSubmit((values) => {
    setFilters(values);
    router.back();
  });

  return (
    <Screen safeAreaEdges={["top", "bottom"]} style={styles.screen}>
      <AppHeader
        title="Map Filters"
        showBack={false}
        rightAction={{
          label: "Close",
          onPress: () => router.back(),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Categories */}
        <View style={styles.section}>
          <AppText variant="subheading" style={styles.sectionTitle}>
            Categories
          </AppText>
          <Controller
            control={form.control}
            name="categories"
            render={({ field: { value, onChange } }) => (
              <View style={styles.chipGrid}>
                {CATEGORIES.map((cat) => {
                  const selected = value.includes(cat.id);
                  return (
                    <Chip
                      key={cat.id}
                      label={cat.label}
                      active={selected}
                      onPress={() => {
                        onChange(
                          selected
                            ? value.filter((c) => c !== cat.id)
                            : [...value, cat.id],
                        );
                      }}
                    />
                  );
                })}
              </View>
            )}
          />
        </View>

        {/* Statuses */}
        <View style={styles.section}>
          <AppText variant="subheading" style={styles.sectionTitle}>
            Event Status
          </AppText>
          <Controller
            control={form.control}
            name="statuses"
            render={({ field: { value, onChange } }) => (
              <View style={styles.chipGrid}>
                {STATUSES.map((st) => {
                  const selected = value.includes(st.id);
                  return (
                    <Chip
                      key={st.id}
                      label={st.label}
                      active={selected}
                      onPress={() => {
                        onChange(
                          selected
                            ? value.filter((s) => s !== st.id)
                            : [...value, st.id],
                        );
                      }}
                    />
                  );
                })}
              </View>
            )}
          />
        </View>

        {/* Distance */}
        <View style={styles.section}>
          <AppText variant="subheading" style={styles.sectionTitle}>
            Distance Radius
          </AppText>
          <Controller
            control={form.control}
            name="distanceKm"
            render={({ field: { value, onChange } }) => (
              <View style={styles.chipGrid}>
                {DISTANCES.map((dist) => {
                  const selected = value === dist.id;
                  return (
                    <Chip
                      key={dist.id}
                      label={dist.label}
                      active={selected}
                      onPress={() => onChange(selected ? null : dist.id)}
                    />
                  );
                })}
              </View>
            )}
          />
        </View>

        {/* Free Only */}
        <View style={styles.section}>
          <AppText variant="subheading" style={styles.sectionTitle}>
            Pricing
          </AppText>
          <Controller
            control={form.control}
            name="freeOnly"
            render={({ field: { value, onChange } }) => (
              <Chip
                label="Free Events Only"
                active={value}
                onPress={() => onChange(!value)}
              />
            )}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <SecondaryButton
          label="Reset"
          onPress={() => form.reset(DEFAULT_MAP_FILTERS)}
          style={styles.btn}
        />
        <GradientButton
          testID="map-filters-apply"
          label="Apply Filters"
          onPress={apply}
          style={styles.btn}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.xl,
  },
  section: {
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontWeight: "700",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs,
  },
  footer: {
    flexDirection: "row",
    padding: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.borderSubtle,
    backgroundColor: theme.colors.surfacePrimary,
    gap: theme.spacing.md,
  },
  btn: {
    flex: 1,
  },
});

import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../../src/components/ui/Screen";
import { AppHeader } from "../../../src/components/navigation/AppHeader";
import { AppText } from "../../../src/components/ui/AppText";
import { AppButton } from "../../../src/components/ui/AppButton";
import { TextField } from "../../../src/components/forms/TextField";
import { Icon } from "../../../src/design-system/icons/Icon";
import { theme } from "../../../src/design-system/theme";
import { ROUTES } from "../../../src/navigation/routes";
import { Chip } from "../../../src/components/ui/Chip";

export default function CreateEventScreen() {
  const router = useRouter();
  const [isFree, setIsFree] = useState(false);
  const [visibility, setVisibility] = useState<
    "Public" | "Private" | "Unlisted"
  >("Public");
  const [tiers, setTiers] = useState([
    { id: 1, name: "General Admission", price: "25.00", capacity: "100" },
  ]);

  const handleAddTier = () => {
    setTiers([...tiers, { id: Date.now(), name: "", price: "", capacity: "" }]);
  };

  const handleDeleteTier = (id: number) => {
    if (tiers.length > 1) {
      setTiers(tiers.filter((t) => t.id !== id));
    }
  };

  return (
    <Screen style={styles.container}>
      <AppHeader title="Create Event" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.prototypeNotice}>
          <AppText variant="caption" color="textMuted">
            PROTOTYPE — data is not persisted
          </AppText>
        </View>

        {/* Poster / Media section */}
        <AppText variant="heading" style={styles.sectionTitle}>
          Event Media
        </AppText>
        <Pressable
          style={styles.posterUpload}
          onPress={() =>
            Alert.alert("Prototype", "Media upload not available in prototype.")
          }
        >
          <Icon name="add" size="lg" color={theme.colors.textMuted} />
          <AppText
            variant="body"
            color="textMuted"
            style={{ marginTop: theme.spacing.sm }}
          >
            Add Event Poster
          </AppText>
        </Pressable>

        {/* Event Details section */}
        <AppText variant="heading" style={styles.sectionTitle}>
          Event Details
        </AppText>
        <TextField placeholder="Event Title" value="" onChangeText={() => {}} />
        <View style={styles.spacer} />
        <Pressable
          style={styles.pickerField}
          onPress={() => Alert.alert("Prototype", "Category selection.")}
        >
          <AppText variant="body" color="textPrimary">
            Category: Music
          </AppText>
          <Icon name="chevronRight" size="sm" color={theme.colors.textMuted} />
        </Pressable>
        <View style={styles.spacer} />
        <TextField
          placeholder="Description"
          value=""
          onChangeText={() => {}}
          multiline
          style={{ minHeight: 80 }}
        />

        <View style={styles.spacer} />
        <AppText variant="label" style={{ marginBottom: theme.spacing.sm }}>
          Visibility
        </AppText>
        <View style={styles.visibilityRow}>
          {["Public", "Private", "Unlisted"].map((v) => (
            <Chip
              key={v}
              label={v}
              selected={visibility === v}
              onPress={() => setVisibility(v as any)}
            />
          ))}
        </View>

        {/* Date & Time section */}
        <AppText variant="heading" style={styles.sectionTitle}>
          Date & Time
        </AppText>
        <Pressable
          style={styles.pickerField}
          onPress={() => Alert.alert("Prototype", "Select date.")}
        >
          <AppText variant="body" color="textMuted">
            Select start date
          </AppText>
          <Icon name="calendar" size="sm" color={theme.colors.textMuted} />
        </Pressable>
        <View style={styles.spacer} />
        <Pressable
          style={styles.pickerField}
          onPress={() => Alert.alert("Prototype", "Select date.")}
        >
          <AppText variant="body" color="textMuted">
            Select end date
          </AppText>
          <Icon name="calendar" size="sm" color={theme.colors.textMuted} />
        </Pressable>

        {/* Venue section */}
        <AppText variant="heading" style={styles.sectionTitle}>
          Venue
        </AppText>
        <TextField placeholder="Venue Name" value="" onChangeText={() => {}} />
        <View style={styles.spacer} />
        <TextField placeholder="City" value="" onChangeText={() => {}} />

        {/* Ticket Tiers section */}
        <AppText variant="heading" style={styles.sectionTitle}>
          Ticket Tiers
        </AppText>
        <View style={styles.freeEventRow}>
          <AppText variant="body">Free Event</AppText>
          <Switch value={isFree} onValueChange={setIsFree} />
        </View>

        {tiers.map((tier, index) => (
          <View key={tier.id} style={styles.tierCard}>
            <View style={styles.tierHeader}>
              <AppText variant="label">Tier {index + 1}</AppText>
              {tiers.length > 1 && (
                <Pressable onPress={() => handleDeleteTier(tier.id)}>
                  <Icon
                    name="close"
                    size="sm"
                    color={theme.colors.statusDanger}
                  />
                </Pressable>
              )}
            </View>
            <TextField
              placeholder="Tier Name"
              value={tier.name}
              onChangeText={() => {}}
            />
            <View
              style={{
                flexDirection: "row",
                gap: theme.spacing.sm,
                marginTop: theme.spacing.sm,
              }}
            >
              <View style={{ flex: 1 }}>
                <TextField
                  placeholder="Price (ZAR)"
                  value={isFree ? "0" : tier.price}
                  onChangeText={() => {}}
                  editable={!isFree}
                />
              </View>
              <View style={{ flex: 1 }}>
                <TextField
                  placeholder="Capacity"
                  value={tier.capacity}
                  onChangeText={() => {}}
                />
              </View>
            </View>
          </View>
        ))}

        <AppButton
          label="Add Tier"
          variant="secondary"
          onPress={handleAddTier}
          style={{ marginTop: theme.spacing.md }}
        />

        {/* Actions */}
        <View style={styles.actionRow}>
          <AppButton
            label="Save Draft [PROTOTYPE]"
            variant="secondary"
            onPress={() =>
              Alert.alert(
                "Draft Saved",
                "This is a prototype. No data was persisted.",
              )
            }
            style={{ flex: 1 }}
          />
          <AppButton
            label="Publish"
            variant="primary"
            onPress={() =>
              router.push(ROUTES.modals.publishConfirmation as any)
            }
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
  prototypeNotice: { alignItems: "center", marginBottom: theme.spacing.md },
  sectionTitle: { marginTop: theme.spacing.xl, marginBottom: theme.spacing.md },
  posterUpload: {
    height: 200,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderStyle: "dashed",
    borderRadius: theme.radii.lg,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
  },
  spacer: { height: theme.spacing.sm },
  pickerField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
  },
  visibilityRow: { flexDirection: "row", gap: theme.spacing.xs },
  freeEventRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  tierCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.sm,
  },
  tierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.sm,
  },
  actionRow: {
    flexDirection: "row",
    gap: theme.spacing.md,
    marginTop: theme.spacing.xxxl,
  },
});

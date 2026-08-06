import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Screen } from "../../src/components/ui/Screen";
import { AppHeader } from "../../src/components/navigation/AppHeader";
import { AppText } from "../../src/components/ui/AppText";
import { AppButton } from "../../src/components/ui/AppButton";
import { TextField } from "../../src/components/forms/TextField";
import { Chip } from "../../src/components/ui/Chip";
import { Icon } from "../../src/design-system/icons/Icon";
import { theme } from "../../src/design-system/theme";
import { routeBuilders } from "../../src/navigation/routes";
import { useCreatorStore } from "../../src/state/useCreatorStore";
import { useSaveActivationDraftMutation } from "../../src/hooks/creator/useCreatorQueries";

const AVAILABLE_CATEGORIES = [
  "Nightlife",
  "Music & Live Shows",
  "Culture & Heritage",
  "Fashion & Style",
  "Art & Exhibitions",
  "Food & Drink",
];

export default function CreatorActivation() {
  const router = useRouter();
  const { activationDraft, setActivationDraft, setActivationStatus } =
    useCreatorStore();
  const saveDraftMutation = useSaveActivationDraftMutation();

  const [brandName, setBrandName] = useState(
    activationDraft.brandName || "Groove Co. Johannesburg",
  );
  const [bio, setBio] = useState(
    activationDraft.bio ||
      "Curating premier deep house, electronic music & rooftop nightlife experiences in Jozi.",
  );
  const [instagram, setInstagram] = useState(
    activationDraft.instagram || "@grooveco_jhb",
  );
  const [tiktok, setTiktok] = useState(
    activationDraft.tiktok || "@grooveco_jhb",
  );
  const [website, setWebsite] = useState(
    activationDraft.website || "https://grooveco.co.za",
  );
  const [contactEmail, setContactEmail] = useState(
    activationDraft.contactEmail || "events@grooveco.co.za",
  );
  const [contactPreference, setContactPreference] = useState<
    "email" | "whatsapp" | "phone"
  >(activationDraft.contactPreference || "email");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    activationDraft.categories?.length
      ? activationDraft.categories
      : ["Nightlife", "Music & Live Shows"],
  );

  const [errors, setErrors] = useState<{
    brandName?: string;
    bio?: string;
    contactEmail?: string;
    summary?: string;
  }>({});

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const validate = () => {
    const errs: typeof errors = {};
    if (!brandName.trim()) {
      errs.brandName = "Brand/Artist Name is required";
    }
    if (!bio.trim() || bio.trim().length < 10) {
      errs.bio = "Bio must be at least 10 characters long";
    }
    if (
      contactEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())
    ) {
      errs.contactEmail = "Enter a valid contact email address";
    }

    if (Object.keys(errs).length > 0) {
      errs.summary = "Please correct the highlighted errors before continuing.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleActivate = () => {
    if (!validate()) return;

    const draft = {
      brandName: brandName.trim(),
      bio: bio.trim(),
      instagram: instagram.trim(),
      tiktok: tiktok.trim(),
      website: website.trim(),
      contactEmail: contactEmail.trim(),
      contactPreference,
      categories: selectedCategories,
    };

    setActivationDraft(draft);
    setActivationStatus("verification_pending");

    saveDraftMutation.mutate(draft, {
      onSuccess: () => {
        router.push(routeBuilders.creatorVerification() as any);
      },
    });
  };

  return (
    <Screen style={styles.container} testID="creator-activation-screen">
      <AppHeader title="Creator Account Activation" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Prototype Disclosure Banner */}
        <View style={styles.disclosureBanner}>
          <Icon name="info" size="sm" color={theme.colors.accentStart} />
          <AppText
            variant="caption"
            color="textMuted"
            style={styles.disclosureText}
          >
            LIIT PROTOTYPE — no legal identity or KYC verification is performed.
          </AppText>
        </View>

        {/* Intro & Responsibilities */}
        <View style={styles.sectionCard}>
          <AppText
            variant="heading"
            color="textPrimary"
            style={styles.sectionTitle}
          >
            Host Responsibilities
          </AppText>
          <AppText variant="body" color="textMuted" style={styles.bodyText}>
            As a LIIT Event Creator, you agree to:
          </AppText>
          <View style={styles.bulletRow}>
            <Icon name="check" size="xs" color={theme.colors.success} />
            <AppText
              variant="caption"
              color="textPrimary"
              style={styles.bulletText}
            >
              Provide accurate event descriptions, timings, and ticket details.
            </AppText>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="check" size="xs" color={theme.colors.success} />
            <AppText
              variant="caption"
              color="textPrimary"
              style={styles.bulletText}
            >
              Maintain clear communication with attendees for schedule changes.
            </AppText>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="check" size="xs" color={theme.colors.success} />
            <AppText
              variant="caption"
              color="textPrimary"
              style={styles.bulletText}
            >
              Ensure safe venue conditions and comply with South African event
              regulations.
            </AppText>
          </View>
          <View style={styles.bulletRow}>
            <Icon name="check" size="xs" color={theme.colors.success} />
            <AppText
              variant="caption"
              color="textPrimary"
              style={styles.bulletText}
            >
              Honor refund & cancellation commitments for ticket holders.
            </AppText>
          </View>
        </View>

        {/* Profile Image & Cover Placeholder */}
        <View style={styles.avatarSection}>
          <Pressable
            style={styles.avatarPlaceholder}
            onPress={() =>
              Alert.alert(
                "Prototype Media Upload",
                "Profile photo upload is simulated in this prototype.",
              )
            }
          >
            <Icon name="add" size="lg" color={theme.colors.textMuted} />
          </Pressable>
          <AppText
            variant="caption"
            color="textMuted"
            style={{ marginTop: theme.spacing.sm }}
          >
            Add Brand Logo / Profile Photo [PROTOTYPE]
          </AppText>
        </View>

        {/* Form Summary Error */}
        {errors.summary && (
          <View style={styles.errorSummaryBanner}>
            <AppText
              variant="caption"
              style={{ color: theme.colors.destructive }}
            >
              {errors.summary}
            </AppText>
          </View>
        )}

        {/* Controlled Form Fields */}
        <View style={styles.fieldGroup}>
          <AppText variant="label" style={styles.label}>
            Brand / Artist Name *
          </AppText>
          <TextField
            placeholder="Enter your creator or brand name"
            value={brandName}
            onChangeText={(val) => {
              setBrandName(val);
              if (errors.brandName)
                setErrors((prev) => ({ ...prev, brandName: undefined }));
            }}
            error={errors.brandName}
          />
        </View>

        <View style={styles.fieldGroup}>
          <AppText variant="label" style={styles.label}>
            Bio & Creator Description *
          </AppText>
          <TextField
            placeholder="Tell fans and attendees about your events"
            value={bio}
            onChangeText={(val) => {
              setBio(val);
              if (errors.bio)
                setErrors((prev) => ({ ...prev, bio: undefined }));
            }}
            multiline
            style={{ minHeight: 80 }}
            error={errors.bio}
          />
        </View>

        <View style={styles.fieldGroup}>
          <AppText variant="label" style={styles.label}>
            Contact Email
          </AppText>
          <TextField
            placeholder="events@yourbrand.co.za"
            value={contactEmail}
            onChangeText={(val) => {
              setContactEmail(val);
              if (errors.contactEmail)
                setErrors((prev) => ({ ...prev, contactEmail: undefined }));
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.contactEmail}
          />
        </View>

        <View style={styles.fieldGroup}>
          <AppText variant="label" style={styles.label}>
            Contact Preference
          </AppText>
          <View style={styles.chipRow}>
            {(["email", "whatsapp", "phone"] as const).map((pref) => (
              <Chip
                key={pref}
                label={pref.toUpperCase()}
                selected={contactPreference === pref}
                onPress={() => setContactPreference(pref)}
              />
            ))}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <AppText variant="label" style={styles.label}>
            Event Categories / Interests
          </AppText>
          <View style={styles.chipRow}>
            {AVAILABLE_CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                selected={selectedCategories.includes(cat)}
                onPress={() => toggleCategory(cat)}
              />
            ))}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <AppText variant="label" style={styles.label}>
            Instagram Handle (Optional)
          </AppText>
          <TextField
            placeholder="@yourbrand"
            value={instagram}
            onChangeText={setInstagram}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <AppText variant="label" style={styles.label}>
            TikTok or X Handle (Optional)
          </AppText>
          <TextField
            placeholder="@yourbrand"
            value={tiktok}
            onChangeText={setTiktok}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.fieldGroup}>
          <AppText variant="label" style={styles.label}>
            Official Website (Optional)
          </AppText>
          <TextField
            placeholder="https://yourbrand.co.za"
            value={website}
            onChangeText={setWebsite}
            autoCapitalize="none"
          />
        </View>

        {/* Submit CTA */}
        <View style={styles.actionContainer}>
          <AppButton
            label="Continue to Mock Verification"
            onPress={handleActivate}
            loading={saveDraftMutation.isPending}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.canvas },
  content: { padding: theme.spacing.md, paddingBottom: theme.spacing.xxxl * 2 },
  disclosureBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    gap: theme.spacing.sm,
  },
  disclosureText: { flex: 1 },
  sectionCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: { marginBottom: theme.spacing.xs },
  bodyText: { marginBottom: theme.spacing.sm },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 4,
    gap: theme.spacing.xs,
  },
  bulletText: { flex: 1 },
  avatarSection: { alignItems: "center", marginVertical: theme.spacing.md },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceElevated,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderStyle: "dashed",
  },
  errorSummaryBanner: {
    backgroundColor: "rgba(255, 77, 77, 0.1)",
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.destructive,
  },
  fieldGroup: { marginBottom: theme.spacing.md },
  label: { marginBottom: theme.spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs },
  actionContainer: { marginTop: theme.spacing.xl },
});

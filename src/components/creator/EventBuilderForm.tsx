import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Alert, Switch } from "react-native";
import { useRouter } from "expo-router";
import { AppText } from "../ui/AppText";
import { AppButton } from "../ui/AppButton";
import { TextField } from "../forms/TextField";
import { Chip } from "../ui/Chip";
import { Icon } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";
import { routeBuilders } from "../../navigation/routes";
import { useCreatorStore } from "../../state/useCreatorStore";
import { useSaveEventDraftMutation } from "../../hooks/creator/useCreatorQueries";
import { CreatorEventProjection } from "../../domain/creator";
import { EventCategory } from "../../domain/events";

const CATEGORIES: { id: EventCategory; name: string }[] = [
  { id: "nightlife", name: "Nightlife & Clubs" },
  { id: "music", name: "Music & Live Shows" },
  { id: "cultural", name: "Culture & Heritage" },
  { id: "food_drink", name: "Food & Drink" },
  { id: "fashion", name: "Fashion & Style" },
  { id: "art", name: "Art & Exhibitions" },
];

export interface EventTierFormValue {
  id: string;
  name: string;
  priceZar: string;
  capacity: string;
  description?: string;
}

interface EventBuilderFormProps {
  initialData?: Partial<CreatorEventProjection>;
  isEditMode?: boolean;
  onSuccess?: () => void;
}

export function EventBuilderForm({
  initialData,
  isEditMode = false,
}: EventBuilderFormProps) {
  const router = useRouter();
  const saveDraftMutation = useSaveEventDraftMutation();
  const { setIsFormDirty } = useCreatorStore();

  const eventId = initialData?.event?.id || "evt-draft-001";

  const [title, setTitle] = useState(
    initialData?.event?.title || "Midnight Grooves JHB",
  );
  const [category, setCategory] = useState<EventCategory>(
    (initialData?.event?.category as EventCategory) || "nightlife",
  );
  const [description, setDescription] = useState(
    initialData?.event?.description ||
      "An exclusive rooftop nightlife experience bringing together the finest DJs in Gauteng.",
  );
  const [visibility, setVisibility] = useState<"Public" | "Private" | "Unlisted">(
    "Public",
  );
  const [ageGuidance, setAgeGuidance] = useState<"18+" | "21+" | "All Ages">(
    "18+",
  );

  const [startDate, setStartDate] = useState("2026-08-15");
  const [startTime, setStartTime] = useState("18:00");
  const [endDate, setEndDate] = useState("2026-08-16");
  const [endTime, setEndTime] = useState("02:00");

  const [venueName, setVenueName] = useState(
    initialData?.event?.venue?.name || "Braamfontein Rooftop Social",
  );
  const [venueAddress, setVenueAddress] = useState(
    initialData?.event?.venue?.address || "73 Juta Street",
  );
  const [venueSuburb, setVenueSuburb] = useState(
    initialData?.event?.venue?.suburb || "Braamfontein",
  );
  const [city] = useState("Johannesburg");

  const [isFree, setIsFree] = useState(false);
  const [tiers, setTiers] = useState<EventTierFormValue[]>([
    {
      id: "tier_draft_1",
      name: "Early Bird Pass",
      priceZar: "250.00",
      capacity: "200",
      description: "Includes entry before 20:00 SAST",
    },
    {
      id: "tier_draft_2",
      name: "General Admission",
      priceZar: "350.00",
      capacity: "300",
      description: "Standard event pass",
    },
  ]);

  const [posterUploaded, setPosterUploaded] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setIsFormDirty(dirty);
  }, [dirty, setIsFormDirty]);

  const markDirty = () => {
    if (!dirty) setDirty(true);
  };

  const handleAddTier = () => {
    markDirty();
    setTiers([
      ...tiers,
      {
        id: `tier_draft_${tiers.length + 1}`,
        name: `Tier ${tiers.length + 1}`,
        priceZar: isFree ? "0" : "150.00",
        capacity: "100",
      },
    ]);
  };

  const handleDeleteTier = (id: string) => {
    if (tiers.length > 1) {
      markDirty();
      setTiers(tiers.filter((t) => t.id !== id));
    }
  };

  const handleUpdateTier = (
    id: string,
    field: keyof EventTierFormValue,
    val: string,
  ) => {
    markDirty();
    setTiers(
      tiers.map((t) => (t.id === id ? { ...t, [field]: val } : t)),
    );
  };

  const handleFreeToggle = (val: boolean) => {
    markDirty();
    setIsFree(val);
    if (val) {
      setTiers(tiers.map((t) => ({ ...t, priceZar: "0.00" })));
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = "Event Title is required";
    if (!description.trim()) errs.description = "Description is required";
    if (!venueName.trim()) errs.venueName = "Venue Name is required";
    if (!startDate.trim() || !endDate.trim()) errs.schedule = "Start and End dates are required";

    if (new Date(`${startDate}T${startTime}`) >= new Date(`${endDate}T${endTime}`)) {
      errs.schedule = "End time must be after start time";
    }

    tiers.forEach((t, idx) => {
      if (!t.name.trim()) errs[`tier_name_${idx}`] = "Tier name required";
      const capNum = parseInt(t.capacity, 10);
      if (isNaN(capNum) || capNum <= 0) errs[`tier_cap_${idx}`] = "Invalid capacity";
      const priceNum = parseFloat(t.priceZar);
      if (!isFree && (isNaN(priceNum) || priceNum < 0))
        errs[`tier_price_${idx}`] = "Price cannot be negative";
    });

    if (Object.keys(errs).length > 0) {
      errs.summary = "Please fix form validation errors before saving or publishing.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildDraftPayload = (): Partial<CreatorEventProjection> => {
    return {
      event: {
        id: eventId,
        title: title.trim(),
        tagline: description.trim().slice(0, 60),
        description: description.trim(),
        category,
        status: isEditMode ? "published" : "draft",
        host: {
          id: "host-groove-co",
          name: "Groove Co. Johannesburg",
          handle: "@grooveco",
          avatarUrl: "",
          avatarImageKey: "hostGrooveCo",
          isVerified: true,
        },
        venue: {
          id: "ven-braam",
          name: venueName.trim(),
          address: venueAddress.trim(),
          suburb: venueSuburb.trim(),
          city: city.trim(),
          province: "Gauteng",
          latitude: -26.1929,
          longitude: 28.0373,
        },
        occurrence: {
          id: `occ-${eventId}`,
          startTime: `${startDate}T${startTime}:00.000Z`,
          endTime: `${endDate}T${endTime}:00.000Z`,
          doorsOpen: startTime,
        },
        heroImageKey: "eventMidnightGrooves",
        galleryImageKeys: ["eventMidnightGrooves"],
        startingPriceMinor: isFree
          ? 0
          : Math.min(...tiers.map((t) => Math.round(parseFloat(t.priceZar || "0") * 100))),
        currency: "ZAR",
        totalCapacity: tiers.reduce((acc, t) => acc + (parseInt(t.capacity, 10) || 0), 0),
        remainingTickets: tiers.reduce((acc, t) => acc + (parseInt(t.capacity, 10) || 0), 0),
        isSaved: false,
      },
      host: {
        id: "host-groove-co",
        name: "Groove Co. Johannesburg",
        handle: "@grooveco",
        avatarUrl: "",
        avatarImageKey: "hostGrooveCo",
        isVerified: true,
      },
      operationalStatus: isEditMode ? "published" : "draft",
      ticketsSold: initialData?.ticketsSold || 0,
      totalCapacity: tiers.reduce((acc, t) => acc + (parseInt(t.capacity, 10) || 0), 0),
      grossRevenueMinor: initialData?.grossRevenueMinor || 0,
      checkedInCount: initialData?.checkedInCount || 0,
      contentSummary: initialData?.contentSummary || { totalPosts: 0, pinnedCount: 0 },
    };
  };

  const handleSaveDraft = () => {
    const payload = buildDraftPayload();
    saveDraftMutation.mutate(payload, {
      onSuccess: () => {
        setDirty(false);
        setIsFormDirty(false);
        Alert.alert(
          "Draft Saved",
          `Event "${title}" saved as draft in repository store.`,
        );
      },
    });
  };

  const handlePreview = () => {
    const payload = buildDraftPayload();
    saveDraftMutation.mutate(payload, {
      onSuccess: () => {
        setDirty(false);
        setIsFormDirty(false);
        router.push(routeBuilders.creatorEventPreview(eventId) as any);
      },
    });
  };

  const handlePublish = () => {
    if (!validate()) return;
    const payload = buildDraftPayload();
    saveDraftMutation.mutate(payload, {
      onSuccess: () => {
        setDirty(false);
        setIsFormDirty(false);
        router.push(routeBuilders.publishConfirmationModal(eventId) as any);
      },
    });
  };

  return (
    <View style={styles.formContainer} testID="event-builder-form">
      {/* Prototype Notice */}
      <View style={styles.prototypeNotice}>
        <Icon name="info" size="xs" color={theme.colors.accentStart} />
        <AppText variant="caption" color="textMuted" style={{ marginLeft: 6 }}>
          SAST Johannesburg Timezone (UTC+2) • Currency: ZAR (R)
        </AppText>
      </View>

      {/* Errors Summary Banner */}
      {errors.summary && (
        <View style={styles.errorSummaryBanner}>
          <AppText variant="caption" style={{ color: theme.colors.destructive }}>
            {errors.summary}
          </AppText>
        </View>
      )}

      {/* 1. Media Upload Section */}
      <View style={styles.sectionHeader}>
        <AppText variant="heading" color="textPrimary">
          1. Event Media & Poster
        </AppText>
      </View>
      <Pressable
        style={styles.posterUpload}
        onPress={() => {
          markDirty();
          setPosterUploaded(true);
          Alert.alert("Media Upload", "Simulated event cover poster uploaded.");
        }}
      >
        <Icon
          name={posterUploaded ? "check" : "add"}
          size="lg"
          color={posterUploaded ? theme.colors.success : theme.colors.textMuted}
        />
        <AppText variant="body" color={posterUploaded ? "success" : "textMuted"}>
          {posterUploaded
            ? "Event Poster Selected (eventMidnightGrooves)"
            : "Upload Event Poster [PROTOTYPE]"}
        </AppText>
      </Pressable>

      {/* 2. Basic Details Section */}
      <View style={styles.sectionHeader}>
        <AppText variant="heading" color="textPrimary">
          2. Event Details
        </AppText>
      </View>
      <View style={styles.fieldGroup}>
        <AppText variant="label" style={styles.label}>
          Event Title *
        </AppText>
        <TextField
          placeholder="e.g. Midnight Kinetic Grooves"
          value={title}
          onChangeText={(val) => {
            markDirty();
            setTitle(val);
          }}
          error={errors.title}
        />
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="label" style={styles.label}>
          Category
        </AppText>
        <View style={styles.chipRow}>
          {CATEGORIES.map((cat) => (
            <Chip
              key={cat.id}
              label={cat.name}
              selected={category === cat.id}
              onPress={() => {
                markDirty();
                setCategory(cat.id);
              }}
            />
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="label" style={styles.label}>
          Description *
        </AppText>
        <TextField
          placeholder="Detailed line-up, experience, and entry requirements..."
          value={description}
          onChangeText={(val) => {
            markDirty();
            setDescription(val);
          }}
          multiline
          style={{ minHeight: 90 }}
          error={errors.description}
        />
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="label" style={styles.label}>
          Visibility
        </AppText>
        <View style={styles.chipRow}>
          {(["Public", "Private", "Unlisted"] as const).map((v) => (
            <Chip
              key={v}
              label={v}
              selected={visibility === v}
              onPress={() => {
                markDirty();
                setVisibility(v);
              }}
            />
          ))}
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <AppText variant="label" style={styles.label}>
          Age Guidance
        </AppText>
        <View style={styles.chipRow}>
          {(["18+", "21+", "All Ages"] as const).map((age) => (
            <Chip
              key={age}
              label={age}
              selected={ageGuidance === age}
              onPress={() => {
                markDirty();
                setAgeGuidance(age);
              }}
            />
          ))}
        </View>
      </View>

      {/* 3. Schedule Section */}
      <View style={styles.sectionHeader}>
        <AppText variant="heading" color="textPrimary">
          3. Schedule (SAST)
        </AppText>
      </View>
      {errors.schedule && (
        <AppText variant="caption" style={{ color: theme.colors.destructive, marginBottom: 8 }}>
          {errors.schedule}
        </AppText>
      )}
      <View style={styles.rowTwoCol}>
        <View style={{ flex: 1 }}>
          <AppText variant="label" style={styles.label}>
            Start Date
          </AppText>
          <TextField
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={(val) => {
              markDirty();
              setStartDate(val);
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="label" style={styles.label}>
            Start Time
          </AppText>
          <TextField
            placeholder="HH:MM"
            value={startTime}
            onChangeText={(val) => {
              markDirty();
              setStartTime(val);
            }}
          />
        </View>
      </View>
      <View style={[styles.rowTwoCol, { marginTop: theme.spacing.sm }]}>
        <View style={{ flex: 1 }}>
          <AppText variant="label" style={styles.label}>
            End Date
          </AppText>
          <TextField
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChangeText={(val) => {
              markDirty();
              setEndDate(val);
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="label" style={styles.label}>
            End Time
          </AppText>
          <TextField
            placeholder="HH:MM"
            value={endTime}
            onChangeText={(val) => {
              markDirty();
              setEndTime(val);
            }}
          />
        </View>
      </View>

      {/* 4. Venue Section */}
      <View style={styles.sectionHeader}>
        <AppText variant="heading" color="textPrimary">
          4. Venue Location
        </AppText>
      </View>
      <View style={styles.fieldGroup}>
        <AppText variant="label" style={styles.label}>
          Venue Name *
        </AppText>
        <TextField
          placeholder="e.g. Braamfontein Rooftop Social"
          value={venueName}
          onChangeText={(val) => {
            markDirty();
            setVenueName(val);
          }}
          error={errors.venueName}
        />
      </View>
      <View style={styles.rowTwoCol}>
        <View style={{ flex: 1 }}>
          <AppText variant="label" style={styles.label}>
            Street Address
          </AppText>
          <TextField
            placeholder="73 Juta Street"
            value={venueAddress}
            onChangeText={(val) => {
              markDirty();
              setVenueAddress(val);
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="label" style={styles.label}>
            Suburb / Area
          </AppText>
          <TextField
            placeholder="Braamfontein"
            value={venueSuburb}
            onChangeText={(val) => {
              markDirty();
              setVenueSuburb(val);
            }}
          />
        </View>
      </View>

      {/* 5. Ticket Tiers Section */}
      <View style={styles.sectionHeader}>
        <AppText variant="heading" color="textPrimary">
          5. Ticket Tiers & Pricing
        </AppText>
      </View>

      <View style={styles.freeToggleCard}>
        <View style={{ flex: 1 }}>
          <AppText variant="label" color="textPrimary">
            Free Registration Event
          </AppText>
          <AppText variant="caption" color="textMuted">
            Set all ticket tier prices to R 0.00
          </AppText>
        </View>
        <Switch value={isFree} onValueChange={handleFreeToggle} />
      </View>

      {tiers.map((tier, idx) => (
        <View key={tier.id} style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <AppText variant="label" color="textPrimary">
              Tier {idx + 1}: {tier.name || "Untitled"}
            </AppText>
            {tiers.length > 1 && (
              <Pressable
                onPress={() => handleDeleteTier(tier.id)}
                hitSlop={8}
              >
                <Icon name="close" size="sm" color={theme.colors.destructive} />
              </Pressable>
            )}
          </View>

          <View style={{ marginBottom: theme.spacing.sm }}>
            <TextField
              placeholder="Tier Name (e.g. VIP Access)"
              value={tier.name}
              onChangeText={(val) => handleUpdateTier(tier.id, "name", val)}
              error={errors[`tier_name_${idx}`]}
            />
          </View>

          <View style={styles.rowTwoCol}>
            <View style={{ flex: 1 }}>
              <AppText variant="label" style={styles.label}>
                Price (ZAR)
              </AppText>
              <TextField
                placeholder="R 0.00"
                value={isFree ? "0.00" : tier.priceZar}
                onChangeText={(val) => handleUpdateTier(tier.id, "priceZar", val)}
                editable={!isFree}
                keyboardType="numeric"
                error={errors[`tier_price_${idx}`]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label" style={styles.label}>
                Capacity
              </AppText>
              <TextField
                placeholder="100"
                value={tier.capacity}
                onChangeText={(val) => handleUpdateTier(tier.id, "capacity", val)}
                keyboardType="numeric"
                error={errors[`tier_cap_${idx}`]}
              />
            </View>
          </View>
        </View>
      ))}

      <AppButton
        label="+ Add Ticket Tier"
        variant="secondary"
        onPress={handleAddTier}
        style={{ marginTop: theme.spacing.xs }}
      />

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <AppButton
          label="Save Draft"
          variant="secondary"
          onPress={handleSaveDraft}
          loading={saveDraftMutation.isPending}
          style={{ flex: 1 }}
        />
        <AppButton
          label="Preview"
          variant="secondary"
          onPress={handlePreview}
          style={{ flex: 1 }}
        />
        <AppButton
          label="Publish"
          variant="primary"
          onPress={handlePublish}
          style={{ flex: 1 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: { flex: 1 },
  prototypeNotice: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
  },
  errorSummaryBanner: {
    backgroundColor: "rgba(255, 77, 77, 0.1)",
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.destructive,
  },
  sectionHeader: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderSubtle,
    paddingBottom: 4,
  },
  posterUpload: {
    height: 140,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderSubtle,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  fieldGroup: { marginBottom: theme.spacing.md },
  label: { marginBottom: theme.spacing.xs },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: theme.spacing.xs },
  rowTwoCol: { flexDirection: "row", gap: theme.spacing.md },
  freeToggleCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.radii.md,
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
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  actionBar: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xxl,
  },
});

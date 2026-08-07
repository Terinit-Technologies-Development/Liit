import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Alert,
  Switch,
  Modal,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { AppText } from "../ui/AppText";
import { AppButton } from "../ui/AppButton";
import { TextField } from "../forms/TextField";
import { Chip } from "../ui/Chip";
import { Icon } from "../../design-system/icons/Icon";
import { theme } from "../../design-system/theme";
import { routeBuilders } from "../../navigation/routes";
import { useCreatorStore } from "../../state/useCreatorStore";
import { useSaveEventDraftMutation } from "../../hooks/creator/useCreatorQueries";
import { CreatorEventProjection, EventDraft } from "../../domain/creator";
import { EventCategory } from "../../domain/events";
import { toJohannesburgIso } from "../../utils/johannesburg";

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
  description: string;
  salesStart: string;
  salesEnd: string;
  maxPerOrder: string;
  availability: "available" | "selling_fast" | "sold_out";
}

interface EventBuilderFormProps {
  initialData?: Partial<CreatorEventProjection>;
  isEditMode?: boolean;
}

function useSafeNavigation() {
  try {
    return useNavigation<any>();
  } catch {
    // Outside a NavigationContainer (e.g. isolated screen tests) there is no
    // navigator to guard against; the unsaved-changes listeners no-op.
    return undefined;
  }
}

const DEFAULT_TIERS: EventTierFormValue[] = [
  {
    id: "creator-tier-draft-001",
    name: "Early Bird Pass",
    priceZar: "250.00",
    capacity: "200",
    description: "Includes entry before 20:00 SAST",
    salesStart: "2026-08-01",
    salesEnd: "2026-08-15",
    maxPerOrder: "4",
    availability: "available",
  },
  {
    id: "creator-tier-draft-002",
    name: "General Admission",
    priceZar: "350.00",
    capacity: "300",
    description: "Standard event pass",
    salesStart: "2026-08-01",
    salesEnd: "2026-08-15",
    maxPerOrder: "4",
    availability: "available",
  },
];

export function EventBuilderForm({
  initialData,
  isEditMode = false,
}: EventBuilderFormProps) {
  const router = useRouter();
  const navigation = useSafeNavigation();
  const saveDraftMutation = useSaveEventDraftMutation();
  const { setIsFormDirty } = useCreatorStore();

  const eventId = initialData?.event?.id || "evt-draft-001";
  const initialDraft = initialData?.eventDraft;

  const [title, setTitle] = useState(
    initialDraft?.title || initialData?.event?.title || "Midnight Grooves JHB",
  );
  const [category, setCategory] = useState<EventCategory>(
    (initialDraft?.category ||
      initialData?.event?.category ||
      "nightlife") as EventCategory,
  );
  const [description, setDescription] = useState(
    initialDraft?.description ||
      initialData?.event?.description ||
      "An exclusive rooftop nightlife experience bringing together the finest DJs in Gauteng.",
  );
  const [visibility, setVisibility] = useState<
    "Public" | "Private" | "Unlisted"
  >(initialDraft?.visibility || "Public");
  const [ageGuidance, setAgeGuidance] = useState<"18+" | "21+" | "All Ages">(
    initialDraft?.ageGuidance || "18+",
  );

  const [startDate, setStartDate] = useState(
    initialDraft?.startDate || "2026-08-15",
  );
  const [startTime, setStartTime] = useState(
    initialDraft?.startTime || "18:00",
  );
  const [endDate, setEndDate] = useState(initialDraft?.endDate || "2026-08-16");
  const [endTime, setEndTime] = useState(initialDraft?.endTime || "02:00");

  const [venueName, setVenueName] = useState(
    initialDraft?.venueName ||
      initialData?.event?.venue?.name ||
      "Braamfontein Rooftop Social",
  );
  const [venueAddress, setVenueAddress] = useState(
    initialDraft?.venueAddress ||
      initialData?.event?.venue?.address ||
      "73 Juta Street",
  );
  const [venueSuburb, setVenueSuburb] = useState(
    initialDraft?.venueSuburb ||
      initialData?.event?.venue?.suburb ||
      "Braamfontein",
  );
  const [city] = useState(initialDraft?.venueCity || "Johannesburg");

  const [isFree, setIsFree] = useState(initialDraft?.isFree || false);
  const [tiers, setTiers] = useState<EventTierFormValue[]>(
    initialDraft?.tiers?.length
      ? initialDraft.tiers.map((t) => ({
          id: t.id,
          name: t.name,
          priceZar: (t.priceMinor / 100).toFixed(2),
          capacity: String(t.capacity),
          description: t.description || "",
          salesStart: t.salesStart || "",
          salesEnd: t.salesEnd || "",
          maxPerOrder: String(t.maxPerOrder),
          availability: t.availability,
        }))
      : DEFAULT_TIERS,
  );

  const [posterUploaded, setPosterUploaded] = useState(
    initialDraft?.posterUploaded ?? true,
  );
  const [dirty, setDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [guardVisible, setGuardVisible] = useState(false);
  const pendingActionRef = useRef<(() => void) | null>(null);
  const leaveLockRef = useRef(false);
  const dirtyRef = useRef(dirty);

  useEffect(() => {
    setIsFormDirty(dirty);
    dirtyRef.current = dirty;
  }, [dirty, setIsFormDirty]);

  const markDirty = useCallback(() => {
    if (!dirtyRef.current) setDirty(true);
  }, []);

  // Block system/header/back navigation while the form is dirty.
  useEffect(() => {
    const nav = navigation as {
      addListener?: (event: string, cb: (e: any) => void) => () => void;
      dispatch?: (action: unknown) => void;
    };
    if (!nav || typeof nav.addListener !== "function") return;
    const unsub = nav.addListener("beforeRemove", (e: any) => {
      if (!dirtyRef.current || leaveLockRef.current) return;
      if (typeof e.preventDefault === "function") {
        e.preventDefault();
      }
      pendingActionRef.current = () => {
        if (typeof nav.dispatch === "function" && e.data?.action) {
          nav.dispatch(e.data.action);
        } else {
          router.back();
        }
      };
      setGuardVisible(true);
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [navigation, router]);

  // Block leaving the Create/Edit form via the Creator tab bar while dirty.
  useEffect(() => {
    const parent = navigation?.getParent?.() as
      | {
          addListener?: (event: string, cb: (e: any) => void) => () => void;
        }
      | undefined;
    if (!parent || typeof parent.addListener !== "function") return;
    const TAB_NAMES = ["dashboard", "create", "events", "tools", "profile"];
    const unsub = parent.addListener("tabPress", (e: any) => {
      if (!dirtyRef.current || leaveLockRef.current) return;
      if (typeof e.preventDefault === "function") {
        e.preventDefault();
      }
      const target = String(e.target || "");
      const tabName = TAB_NAMES.find((t) => target.includes(t));
      pendingActionRef.current = () => {
        router.navigate(
          tabName
            ? (`/(creator)/${tabName}` as any)
            : ("/(creator)/dashboard" as any),
        );
      };
      setGuardVisible(true);
    });
    return () => {
      if (typeof unsub === "function") unsub();
    };
  }, [navigation, router]);

  const nextTierId = (): string => {
    const seq = tiers.length + 1;
    return `creator-tier-draft-${String(seq).padStart(3, "0")}`;
  };

  const handleAddTier = () => {
    markDirty();
    setTiers([
      ...tiers,
      {
        id: nextTierId(),
        name: `Tier ${tiers.length + 1}`,
        priceZar: isFree ? "0.00" : "150.00",
        capacity: "100",
        description: "",
        salesStart: "",
        salesEnd: "",
        maxPerOrder: "4",
        availability: "available",
      },
    ]);
  };

  const handleDeleteTier = (id: string) => {
    if (tiers.length > 1) {
      markDirty();
      setTiers(tiers.filter((t) => t.id !== id));
    }
  };

  const handleMoveTier = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= tiers.length) return;
    markDirty();
    const next = [...tiers];
    [next[index], next[target]] = [next[target], next[index]];
    setTiers(next);
  };

  const handleUpdateTier = (
    id: string,
    field: keyof EventTierFormValue,
    val: string,
  ) => {
    markDirty();
    setTiers(tiers.map((t) => (t.id === id ? { ...t, [field]: val } : t)));
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
    if (!startDate.trim() || !endDate.trim())
      errs.schedule = "Start and End dates are required";

    if (
      startDate.trim() &&
      endDate.trim() &&
      new Date(`${startDate}T${startTime || "00:00"}`) >=
        new Date(`${endDate}T${endTime || "00:00"}`)
    ) {
      errs.schedule = "End time must be after start time";
    }

    const seenNames = new Set<string>();
    tiers.forEach((t, idx) => {
      const nameKey = `tier_name_${idx}`;
      if (!t.name.trim()) {
        errs[nameKey] = "Tier name required";
      } else {
        const lower = t.name.trim().toLowerCase();
        if (seenNames.has(lower)) {
          errs[nameKey] = "Duplicate tier name";
        }
        seenNames.add(lower);
      }

      if (!t.description.trim()) {
        errs[`tier_desc_${idx}`] = "Tier description required";
      }

      const capNum = parseInt(t.capacity, 10);
      if (isNaN(capNum) || capNum <= 0) {
        errs[`tier_cap_${idx}`] = "Invalid capacity";
      }

      const priceNum = parseFloat(t.priceZar);
      if (isFree) {
        if (!isNaN(priceNum) && priceNum !== 0) {
          errs[`tier_price_${idx}`] =
            "Free event tiers must be priced at R 0.00";
        }
      } else if (isNaN(priceNum) || priceNum < 0) {
        errs[`tier_price_${idx}`] = "Price cannot be negative";
      }

      const maxPerOrder = parseInt(t.maxPerOrder, 10);
      if (isNaN(maxPerOrder) || maxPerOrder <= 0) {
        errs[`tier_max_${idx}`] = "Max per order must be at least 1";
      } else if (!isNaN(capNum) && maxPerOrder > capNum) {
        errs[`tier_max_${idx}`] = "Max per order exceeds tier capacity";
      }

      if (t.salesStart.trim() && t.salesEnd.trim()) {
        if (t.salesEnd < t.salesStart) {
          errs[`tier_sales_${idx}`] = "Sales end before sales start";
        } else if (startDate.trim() && t.salesEnd < startDate) {
          errs[`tier_sales_${idx}`] =
            "Sales end is before the Event start date";
        }
      }
    });

    if (Object.keys(errs).length > 0) {
      errs.summary =
        "Please fix form validation errors before saving or publishing.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildEventDraft = (): EventDraft => ({
    title: title.trim(),
    description: description.trim(),
    category,
    visibility,
    ageGuidance,
    posterUploaded,
    startDate: startDate.trim(),
    startTime: startTime.trim(),
    endDate: endDate.trim(),
    endTime: endTime.trim(),
    venueName: venueName.trim(),
    venueAddress: venueAddress.trim(),
    venueSuburb: venueSuburb.trim(),
    venueCity: city.trim(),
    isFree,
    tiers: tiers.map((t) => ({
      id: t.id,
      name: t.name.trim(),
      description: t.description.trim(),
      priceMinor: isFree
        ? 0
        : Math.round((parseFloat(t.priceZar || "0") || 0) * 100),
      capacity: parseInt(t.capacity, 10) || 0,
      salesStart: t.salesStart.trim(),
      salesEnd: t.salesEnd.trim(),
      maxPerOrder: parseInt(t.maxPerOrder, 10) || 1,
      availability: t.availability,
    })),
  });

  const buildDraftPayload = (): Partial<CreatorEventProjection> => {
    const draft = buildEventDraft();
    const tierPrices = draft.tiers.map((t) => t.priceMinor);
    const totalCapacity = draft.tiers.reduce((acc, t) => acc + t.capacity, 0);
    const startIso = toJohannesburgIso(startDate, startTime);
    const endIso = toJohannesburgIso(endDate, endTime);

    return {
      event: {
        id: eventId,
        title: draft.title,
        tagline: draft.description.slice(0, 60),
        description: draft.description,
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
          name: draft.venueName,
          address: draft.venueAddress,
          suburb: draft.venueSuburb,
          city: draft.venueCity,
          province: "Gauteng",
          latitude: -26.1929,
          longitude: 28.0373,
        },
        occurrence: {
          id: `occ-${eventId}`,
          startTime: startIso,
          endTime: endIso,
          doorsOpen: draft.startTime,
        },
        heroImageKey: "eventMidnightGrooves",
        galleryImageKeys: ["eventMidnightGrooves"],
        startingPriceMinor: draft.isFree ? 0 : Math.min(...tierPrices),
        currency: "ZAR",
        totalCapacity,
        remainingTickets: totalCapacity,
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
      totalCapacity,
      grossRevenueMinor: initialData?.grossRevenueMinor || 0,
      checkedInCount: initialData?.checkedInCount || 0,
      contentSummary: initialData?.contentSummary || {
        totalPosts: 0,
        pinnedCount: 0,
      },
      eventDraft: draft,
    };
  };

  const persistDraft = (
    onSaved?: () => void,
    shouldValidate = false,
  ): boolean => {
    if (shouldValidate && !validate()) return false;
    const payload = buildDraftPayload();
    saveDraftMutation.mutate(payload, {
      onSuccess: () => {
        setDirty(false);
        setIsFormDirty(false);
        onSaved?.();
      },
    });
    return true;
  };

  const handleSaveDraft = () => {
    if (!validate()) return;
    persistDraft(() => {
      Alert.alert(
        "Draft Saved",
        `Event "${title}" saved as draft in repository store.`,
      );
    });
  };

  const handlePreview = () => {
    if (!validate()) return;
    const navigateToPreview = () =>
      router.push(routeBuilders.creatorEventPreview(eventId) as any);
    if (dirty) {
      pendingActionRef.current = navigateToPreview;
      setGuardVisible(true);
    } else {
      persistDraft(navigateToPreview);
    }
  };

  const handlePublish = () => {
    if (!validate()) return;
    const navigateToPublish = () =>
      router.push(routeBuilders.publishConfirmationModal(eventId) as any);
    if (dirty) {
      pendingActionRef.current = navigateToPublish;
      setGuardVisible(true);
    } else {
      persistDraft(navigateToPublish);
    }
  };

  /**
   * Unsaved-changes guard: the pending action is ALWAYS navigation-only —
   * the save happens either in the clean path (persist then navigate) or in
   * the guard's "Save Draft" option. "Discard Changes" never saves.
   */

  const handleGuardContinue = () => {
    setGuardVisible(false);
    pendingActionRef.current = null;
  };

  const handleGuardSaveAndLeave = () => {
    if (!validate()) {
      setGuardVisible(false);
      Alert.alert(
        "Validation Required",
        "Please fix form validation errors before saving.",
      );
      return;
    }
    const action = pendingActionRef.current;
    leaveLockRef.current = true;
    setGuardVisible(false);
    pendingActionRef.current = null;
    persistDraft(() => {
      if (action) action();
    });
  };

  const handleGuardDiscard = () => {
    const action = pendingActionRef.current;
    leaveLockRef.current = true;
    setDirty(false);
    setIsFormDirty(false);
    setGuardVisible(false);
    pendingActionRef.current = null;
    if (action) action();
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
          <AppText
            variant="caption"
            style={{ color: theme.colors.destructive }}
          >
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
        <AppText
          variant="body"
          color={posterUploaded ? "success" : "textMuted"}
        >
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
        <AppText
          variant="caption"
          style={{ color: theme.colors.destructive, marginBottom: 8 }}
        >
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
            Start Time (SAST)
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
            End Time (SAST)
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
        <Switch
          value={isFree}
          onValueChange={handleFreeToggle}
          testID="free-event-toggle"
        />
      </View>

      {tiers.map((tier, idx) => (
        <View key={tier.id} style={styles.tierCard}>
          <View style={styles.tierHeader}>
            <AppText variant="label" color="textPrimary">
              Tier {idx + 1}: {tier.name || "Untitled"}
            </AppText>
            <View style={styles.tierHeaderActions}>
              <Pressable
                onPress={() => handleMoveTier(idx, -1)}
                hitSlop={8}
                testID={`move-tier-up-${tier.id}`}
              >
                <Icon
                  name="chevronUp"
                  size="sm"
                  color={theme.colors.textMuted}
                />
              </Pressable>
              <Pressable
                onPress={() => handleMoveTier(idx, 1)}
                hitSlop={8}
                testID={`move-tier-down-${tier.id}`}
              >
                <Icon
                  name="chevronDown"
                  size="sm"
                  color={theme.colors.textMuted}
                />
              </Pressable>
              {tiers.length > 1 && (
                <Pressable
                  onPress={() => handleDeleteTier(tier.id)}
                  hitSlop={8}
                  testID={`delete-tier-${tier.id}`}
                >
                  <Icon
                    name="close"
                    size="sm"
                    color={theme.colors.destructive}
                  />
                </Pressable>
              )}
            </View>
          </View>

          <View style={{ marginBottom: theme.spacing.sm }}>
            <TextField
              placeholder="Tier Name (e.g. VIP Access)"
              value={tier.name}
              onChangeText={(val) => handleUpdateTier(tier.id, "name", val)}
              error={errors[`tier_name_${idx}`]}
            />
          </View>

          <View style={{ marginBottom: theme.spacing.sm }}>
            <TextField
              placeholder="Tier description (e.g. Includes VIP bar access)"
              value={tier.description}
              onChangeText={(val) =>
                handleUpdateTier(tier.id, "description", val)
              }
              multiline
              style={{ minHeight: 50 }}
              error={errors[`tier_desc_${idx}`]}
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
                onChangeText={(val) =>
                  handleUpdateTier(tier.id, "priceZar", val)
                }
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
                onChangeText={(val) =>
                  handleUpdateTier(tier.id, "capacity", val)
                }
                keyboardType="numeric"
                error={errors[`tier_cap_${idx}`]}
              />
            </View>
          </View>

          <View style={[styles.rowTwoCol, { marginTop: theme.spacing.sm }]}>
            <View style={{ flex: 1 }}>
              <AppText variant="label" style={styles.label}>
                Max per Order
              </AppText>
              <TextField
                placeholder="4"
                value={tier.maxPerOrder}
                onChangeText={(val) =>
                  handleUpdateTier(tier.id, "maxPerOrder", val)
                }
                keyboardType="numeric"
                error={errors[`tier_max_${idx}`]}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label" style={styles.label}>
                Availability
              </AppText>
              <View style={styles.chipRow}>
                {(["available", "selling_fast", "sold_out"] as const).map(
                  (av) => (
                    <Chip
                      key={av}
                      label={av.replace("_", " ").toUpperCase()}
                      selected={tier.availability === av}
                      onPress={() =>
                        handleUpdateTier(tier.id, "availability", av)
                      }
                    />
                  ),
                )}
              </View>
            </View>
          </View>

          <View style={[styles.rowTwoCol, { marginTop: theme.spacing.sm }]}>
            <View style={{ flex: 1 }}>
              <AppText variant="label" style={styles.label}>
                Sales Start (YYYY-MM-DD)
              </AppText>
              <TextField
                placeholder="2026-08-01"
                value={tier.salesStart}
                onChangeText={(val) =>
                  handleUpdateTier(tier.id, "salesStart", val)
                }
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="label" style={styles.label}>
                Sales End (YYYY-MM-DD)
              </AppText>
              <TextField
                placeholder="2026-08-14"
                value={tier.salesEnd}
                onChangeText={(val) =>
                  handleUpdateTier(tier.id, "salesEnd", val)
                }
                error={errors[`tier_sales_${idx}`]}
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
        testID="add-tier-button"
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

      {/* Unsaved Changes Guard */}
      <Modal
        visible={guardVisible}
        transparent
        animationType="fade"
        onRequestClose={handleGuardContinue}
      >
        <View style={styles.guardBackdrop}>
          <View style={styles.guardCard} testID="unsaved-changes-guard">
            <AppText variant="heading" color="textPrimary">
              Unsaved Changes
            </AppText>
            <AppText
              variant="caption"
              color="textMuted"
              style={{ marginTop: 4 }}
            >
              Your Event draft has unsaved changes. What would you like to do?
            </AppText>

            <AppButton
              label="Continue Editing"
              variant="secondary"
              onPress={handleGuardContinue}
              style={{ marginTop: theme.spacing.md }}
              testID="guard-continue-editing"
            />
            <AppButton
              label="Save Draft"
              variant="primary"
              onPress={handleGuardSaveAndLeave}
              loading={saveDraftMutation.isPending}
              style={{ marginTop: theme.spacing.sm }}
              testID="guard-save-draft"
            />
            <AppButton
              label="Discard Changes"
              variant="danger"
              onPress={handleGuardDiscard}
              style={{ marginTop: theme.spacing.sm }}
              testID="guard-discard-changes"
            />
          </View>
        </View>
      </Modal>
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
  tierHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  actionBar: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xxl,
  },
  guardBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: theme.spacing.xl,
  },
  guardCard: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.xl,
    borderRadius: theme.radii.xl,
  },
});

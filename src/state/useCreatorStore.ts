import { create } from "zustand";
import {
  CreatorActivationStatus,
  CreatorActivationDraft,
  PublishSimulationState,
  CreatorEventProjection,
  EventDraft,
  VerificationState,
} from "../domain/creator";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";

interface CreatorStoreState {
  activationStatus: CreatorActivationStatus;
  activationDraft: CreatorActivationDraft;
  activeDraftEvent: Partial<CreatorEventProjection> | null;
  eventDraft: EventDraft | null;
  isFormDirty: boolean;
  publishSimulationState: PublishSimulationState;
  selectedEventFilter: string;
  selectedNotificationCategory: string;
  verificationState: VerificationState;
  completedVerificationItems: string[];

  // Actions
  setActivationStatus: (status: CreatorActivationStatus) => void;
  setActivationDraft: (draft: Partial<CreatorActivationDraft>) => void;
  setActiveDraftEvent: (draft: Partial<CreatorEventProjection> | null) => void;
  setEventDraft: (draft: EventDraft | null) => void;
  setIsFormDirty: (isDirty: boolean) => void;
  setPublishSimulationState: (state: PublishSimulationState) => void;
  setSelectedEventFilter: (filter: string) => void;
  setSelectedNotificationCategory: (category: string) => void;
  setVerificationState: (state: VerificationState) => void;
  setCompletedVerificationItems: (ids: string[]) => void;
  resetCreatorStore: () => void;
}

const INITIAL_ACTIVATION_DRAFT: CreatorActivationDraft = {
  brandName: "",
  bio: "",
  avatarUrl: "",
  coverImageUrl: "",
  instagram: "",
  tiktok: "",
  website: "",
  contactEmail: "",
  contactPreference: "email",
  categories: [],
};

export const useCreatorStore = create<CreatorStoreState>((set) => ({
  activationStatus: "not_started",
  activationDraft: { ...INITIAL_ACTIVATION_DRAFT },
  activeDraftEvent: null,
  eventDraft: null,
  isFormDirty: false,
  publishSimulationState: "review",
  selectedEventFilter: "all",
  selectedNotificationCategory: "all",
  verificationState: "not_started",
  completedVerificationItems: [],

  setActivationStatus: (status) => set({ activationStatus: status }),
  setActivationDraft: (draft) =>
    set((state) => ({
      activationDraft: { ...state.activationDraft, ...draft },
    })),
  setActiveDraftEvent: (draft) => set({ activeDraftEvent: draft }),
  setEventDraft: (draft) => set({ eventDraft: draft }),
  setIsFormDirty: (isDirty) => set({ isFormDirty: isDirty }),
  setPublishSimulationState: (state) => set({ publishSimulationState: state }),
  setSelectedEventFilter: (filter) => set({ selectedEventFilter: filter }),
  setSelectedNotificationCategory: (category) =>
    set({ selectedNotificationCategory: category }),
  setVerificationState: (state) => set({ verificationState: state }),
  setCompletedVerificationItems: (ids) =>
    set({ completedVerificationItems: ids }),

  resetCreatorStore: () => {
    mockCreatorRepository.resetState();
    set({
      activationStatus: "not_started",
      activationDraft: { ...INITIAL_ACTIVATION_DRAFT },
      activeDraftEvent: null,
      eventDraft: null,
      isFormDirty: false,
      publishSimulationState: "review",
      selectedEventFilter: "all",
      selectedNotificationCategory: "all",
      verificationState: "not_started",
      completedVerificationItems: [],
    });
  },
}));

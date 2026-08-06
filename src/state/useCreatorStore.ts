import { create } from "zustand";
import {
  CreatorActivationStatus,
  CreatorActivationDraft,
  PublishSimulationState,
  CreatorEventProjection,
} from "../domain/creator";
import { mockCreatorRepository } from "../repositories/mock/MockCreatorRepository";

interface CreatorStoreState {
  activationStatus: CreatorActivationStatus;
  activationDraft: CreatorActivationDraft;
  activeDraftEvent: Partial<CreatorEventProjection> | null;
  isFormDirty: boolean;
  publishSimulationState: PublishSimulationState;
  selectedEventFilter: string;
  selectedNotificationCategory: string;

  // Actions
  setActivationStatus: (status: CreatorActivationStatus) => void;
  setActivationDraft: (draft: Partial<CreatorActivationDraft>) => void;
  setActiveDraftEvent: (draft: Partial<CreatorEventProjection> | null) => void;
  setIsFormDirty: (isDirty: boolean) => void;
  setPublishSimulationState: (state: PublishSimulationState) => void;
  setSelectedEventFilter: (filter: string) => void;
  setSelectedNotificationCategory: (category: string) => void;
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
  isFormDirty: false,
  publishSimulationState: "review",
  selectedEventFilter: "all",
  selectedNotificationCategory: "all",

  setActivationStatus: (status) => set({ activationStatus: status }),
  setActivationDraft: (draft) =>
    set((state) => ({
      activationDraft: { ...state.activationDraft, ...draft },
    })),
  setActiveDraftEvent: (draft) => set({ activeDraftEvent: draft }),
  setIsFormDirty: (isDirty) => set({ isFormDirty: isDirty }),
  setPublishSimulationState: (state) => set({ publishSimulationState: state }),
  setSelectedEventFilter: (filter) => set({ selectedEventFilter: filter }),
  setSelectedNotificationCategory: (category) =>
    set({ selectedNotificationCategory: category }),

  resetCreatorStore: () => {
    mockCreatorRepository.resetState();
    set({
      activationStatus: "not_started",
      activationDraft: { ...INITIAL_ACTIVATION_DRAFT },
      activeDraftEvent: null,
      isFormDirty: false,
      publishSimulationState: "review",
      selectedEventFilter: "all",
      selectedNotificationCategory: "all",
    });
  },
}));

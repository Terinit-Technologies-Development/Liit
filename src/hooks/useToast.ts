import { create } from "zustand";

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
}

export interface ToastState {
  toast: ToastMessage | null;
  showToast: (
    title: string,
    message: string,
    type?: ToastMessage["type"],
  ) => void;
  hideToast: () => void;
}

export const useToast = create<ToastState>((set) => ({
  toast: null,
  showToast: (title, message, type = "info") => {
    const id = String(Date.now());
    set({ toast: { id, title, message, type } });
    setTimeout(() => {
      set((state) => (state.toast?.id === id ? { toast: null } : state));
    }, 3500);
  },
  hideToast: () => set({ toast: null }),
}));

export function showToast(
  title: string,
  message: string,
  type: ToastMessage["type"] = "info",
) {
  useToast.getState().showToast(title, message, type);
}

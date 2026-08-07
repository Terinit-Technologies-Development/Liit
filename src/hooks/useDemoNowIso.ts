import { demoNowIso, useDemoClockStore } from "../state/useDemoClockStore";

export function useDemoNowIso(): string {
  const offsetMs = useDemoClockStore((state) => state.offsetMs);
  return demoNowIso(offsetMs);
}

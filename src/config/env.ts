/**
 * Typed environment and runtime configuration layer.
 * Frontend-only prototype phase. No secrets or backend credentials.
 */

export interface AppConfig {
  appName: string;
  appVersion: string;
  environment: "development" | "staging" | "production";
  defaultCity: string;
  defaultCurrency: string;
  enableDevControls: boolean;
  mockApiLatencyMs: number;
}

export const envConfig: AppConfig = {
  appName: "LIIT",
  appVersion: "1.0.0-prototype.0",
  environment: (process.env.EXPO_PUBLIC_ENV as any) || "development",
  defaultCity: "Johannesburg",
  defaultCurrency: "ZAR",
  enableDevControls: process.env.EXPO_PUBLIC_ENABLE_DEV_CONTROLS !== "false",
  mockApiLatencyMs: Number(process.env.EXPO_PUBLIC_MOCK_LATENCY) || 300,
};

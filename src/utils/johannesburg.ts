/**
 * Johannesburg (SAST, UTC+2) timezone helpers.
 *
 * The Event Builder collects wall-clock SAST values (e.g. "2026-08-15" and
 * "18:00"). Those values MUST be serialized with the explicit SAST offset so
 * that the stored timestamp stays the Johannesburg clock time and never
 * shifts when re-rendered.
 */

export const SAST_OFFSET = "+02:00";

export const SAST_TIMEZONE_ID = "Africa/Johannesburg";

/**
 * Serialize a user-entered Johannesburg wall-clock date/time with an explicit
 * SAST offset. Never append a UTC "Z" to user-entered clock values.
 */
export const toJohannesburgIso = (date: string, time: string): string => {
  const safeDate = (date || "").trim();
  const safeTime = (time || "").trim();
  if (!safeDate || !safeTime) return "";
  const hhmm = /^\d{2}:\d{2}/.exec(safeTime)?.[0] || safeTime;
  return `${safeDate}T${hhmm}:00${SAST_OFFSET}`;
};

/**
 * Extract the wall-clock hour/minute exactly as stored (the SAST clock),
 * ignoring the machine timezone so "18:00 SAST" never renders as 20:00
 * or 16:00 depending on where the reviewer's machine runs.
 */
export const formatJohannesburgTime = (
  iso: string,
  withSuffix = true,
): string => {
  if (!iso) return "--:--";
  const match = /T(\d{2}):(\d{2})/.exec(iso);
  if (!match) return iso;
  return `${match[1]}:${match[2]}${withSuffix ? " SAST" : ""}`;
};

/**
 * Split a stored Johannesburg timestamp back into form fields
 * ("YYYY-MM-DD" and "HH:MM" wall-clock SAST).
 */
export const splitJohannesburgIso = (
  iso?: string,
): { date: string; time: string } => {
  if (!iso) return { date: "", time: "" };
  const dateMatch = /^(\d{4}-\d{2}-\d{2})/.exec(iso);
  const timeMatch = /T(\d{2}:\d{2})/.exec(iso);
  return {
    date: dateMatch?.[1] || "",
    time: timeMatch?.[1] || "",
  };
};

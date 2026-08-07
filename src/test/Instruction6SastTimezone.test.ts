import {
  toJohannesburgIso,
  formatJohannesburgTime,
  splitJohannesburgIso,
  SAST_OFFSET,
} from "../utils/johannesburg";

describe("LIIT Instruction 6: Johannesburg / SAST Serialization", () => {
  it("serializes a user-entered Johannesburg clock time with the explicit SAST offset", () => {
    const iso = toJohannesburgIso("2026-08-15", "18:00");
    expect(iso).toBe("2026-08-15T18:00:00+02:00");
    expect(iso.endsWith("Z")).toBe(false);
  });

  it("never appends a UTC Z suffix to user-entered SAST clock values", () => {
    const iso = toJohannesburgIso("2026-08-15", "18:00");
    expect(iso.includes("+02:00")).toBe(true);
    expect(iso.includes("T18:00:00" + SAST_OFFSET)).toBe(true);
  });

  it("round-trips: 2026-08-15 18:00 SAST in -> stored offset timestamp -> 18:00 SAST out", () => {
    const input = { date: "2026-08-15", time: "18:00" };
    const stored = toJohannesburgIso(input.date, input.time);
    const shown = formatJohannesburgTime(stored);
    expect(shown).toBe("18:00 SAST");
    expect(shown).not.toBe("20:00 SAST");
    expect(shown).not.toBe("16:00 SAST");
  });

  it("splitJohannesburgIso restores the exact form fields from a stored timestamp", () => {
    const stored = toJohannesburgIso("2026-08-15", "18:00");
    const { date, time } = splitJohannesburgIso(stored);
    expect(date).toBe("2026-08-15");
    expect(time).toBe("18:00");
  });

  it("handles overnight end times without date shift on display", () => {
    const endIso = toJohannesburgIso("2026-08-16", "02:00");
    expect(formatJohannesburgTime(endIso)).toBe("02:00 SAST");
  });

  it("returns safe fallbacks for empty input", () => {
    expect(toJohannesburgIso("", "")).toBe("");
    expect(formatJohannesburgTime("")).toBe("--:--");
  });
});

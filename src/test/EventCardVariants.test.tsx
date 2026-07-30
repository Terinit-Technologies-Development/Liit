import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { EventCard } from "../components/discovery/EventCard";
import { discoveryEvents } from "../fixtures/discovery";

describe("EventCard Variants", () => {
  const sampleEvent = discoveryEvents[0];
  const nowIso = "2026-07-30T20:00:00.000Z";

  it("renders featured variant cleanly", () => {
    const handlePress = jest.fn();
    const { getByText, getByLabelText } = render(
      <EventCard
        event={sampleEvent}
        variant="featured"
        nowIso={nowIso}
        onPress={handlePress}
      />,
    );

    expect(getByText(sampleEvent.title)).toBeDefined();
    const card = getByLabelText(`Open featured event ${sampleEvent.title}`);
    fireEvent.press(card);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it("renders standard variant cleanly", () => {
    const handlePress = jest.fn();
    const { getByText, getByLabelText } = render(
      <EventCard
        event={sampleEvent}
        variant="standard"
        nowIso={nowIso}
        onPress={handlePress}
      />,
    );

    expect(getByText(sampleEvent.title)).toBeDefined();
    const card = getByLabelText(`Open ${sampleEvent.title}`);
    fireEvent.press(card);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it("renders compact variant cleanly", () => {
    const handlePress = jest.fn();
    const { getByText, getByLabelText } = render(
      <EventCard
        event={sampleEvent}
        variant="compact"
        nowIso={nowIso}
        onPress={handlePress}
      />,
    );

    expect(getByText(sampleEvent.title)).toBeDefined();
    const card = getByLabelText(`Open ${sampleEvent.title}`);
    fireEvent.press(card);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });
});

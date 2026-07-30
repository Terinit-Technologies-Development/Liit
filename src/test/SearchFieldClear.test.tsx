import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SearchField } from "../components/forms/SearchField";
import { TextField } from "../components/forms/TextField";

describe("TextField and SearchField Clear Action", () => {
  it("renders rightAction button in TextField when provided", () => {
    const handlePress = jest.fn();
    const { getByLabelText } = render(
      <TextField
        value="Amapiano"
        rightAction={{
          icon: "close",
          accessibilityLabel: "Clear search text",
          onPress: handlePress,
        }}
      />,
    );

    const clearButton = getByLabelText("Clear search text");
    expect(clearButton).toBeDefined();
    fireEvent.press(clearButton);
    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it("renders clear rightAction in SearchField only when text is non-empty", () => {
    const handleClear = jest.fn();
    const { queryByLabelText, getByLabelText, rerender } = render(
      <SearchField value="" onClear={handleClear} />,
    );

    expect(queryByLabelText("Clear search")).toBeNull();

    rerender(<SearchField value="Johannesburg" onClear={handleClear} />);

    const clearButton = getByLabelText("Clear search");
    expect(clearButton).toBeDefined();
    fireEvent.press(clearButton);
    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});

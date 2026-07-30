import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ErrorState } from "../components/ui/ErrorState";

describe("ErrorState Component and Retry Callbacks", () => {
  it("renders title, description, and action button", () => {
    const handleRetry = jest.fn();
    const { getByText, getByTestId } = render(
      <ErrorState
        title="Search did not load"
        description="Try the Johannesburg discovery fixtures again."
        actionLabel="Retry"
        onAction={handleRetry}
      />,
    );

    expect(getByText("Search did not load")).toBeDefined();
    expect(
      getByText("Try the Johannesburg discovery fixtures again."),
    ).toBeDefined();

    const retryBtn = getByTestId("error-state-retry-button");
    fireEvent.press(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});

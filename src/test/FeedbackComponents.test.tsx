import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { LoadingView } from "../components/feedback/LoadingView";
import { EmptyState } from "../components/feedback/EmptyState";
import { ErrorState } from "../components/feedback/ErrorState";

describe("Feedback Components", () => {
  describe("LoadingView", () => {
    it("renders custom loading message", async () => {
      render(<LoadingView message="Loading events..." />);
      expect(screen.getByText("Loading events...")).toBeTruthy();
    });
  });

  describe("EmptyState", () => {
    it("renders title, description and triggers action", async () => {
      const onActionMock = jest.fn();
      render(
        <EmptyState
          title="No Events Found"
          description="Try broadening search filters."
          actionLabel="Clear Filters"
          onAction={onActionMock}
        />,
      );
      expect(screen.getByText("No Events Found")).toBeTruthy();
      expect(screen.getByText("Try broadening search filters.")).toBeTruthy();

      fireEvent.press(screen.getByText("Clear Filters"));
      expect(onActionMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("ErrorState", () => {
    it("renders title, message and triggers retry", async () => {
      const onRetryMock = jest.fn();
      render(
        <ErrorState
          title="Network Failure"
          message="Could not load server response."
          onRetry={onRetryMock}
        />,
      );
      expect(screen.getByText("Network Failure")).toBeTruthy();
      expect(screen.getByText("Could not load server response.")).toBeTruthy();

      fireEvent.press(screen.getByText("Try Again"));
      expect(onRetryMock).toHaveBeenCalledTimes(1);
    });
  });
});

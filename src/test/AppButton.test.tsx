import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { AppButton } from "../components/ui/AppButton";

describe("AppButton Primitive", () => {
  it("renders label correctly", async () => {
    render(<AppButton label="Click Me" onPress={() => {}} />);
    expect(screen.getByText("Click Me")).toBeTruthy();
  });

  it("triggers onPress callback when interactive", async () => {
    const onPressMock = jest.fn();
    render(<AppButton label="Click Me" onPress={onPressMock} />);
    fireEvent.press(screen.getByText("Click Me"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("does not trigger onPress when disabled", async () => {
    const onPressMock = jest.fn();
    render(<AppButton label="Disabled" onPress={onPressMock} disabled />);
    fireEvent.press(screen.getByText("Disabled"));
    expect(onPressMock).not.toHaveBeenCalled();
  });

  it("renders loading state without throwing", async () => {
    render(<AppButton label="Loading" onPress={() => {}} loading />);
    expect(screen.getByRole("button")).toBeTruthy();
  });
});

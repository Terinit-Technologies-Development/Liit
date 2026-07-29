import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { TextField } from "../components/forms/TextField";

describe("TextField Primitive", () => {
  it("renders label and placeholder", async () => {
    render(<TextField label="Username" placeholder="Enter username" />);
    expect(screen.getByText("Username")).toBeTruthy();
    expect(screen.getByPlaceholderText("Enter username")).toBeTruthy();
  });

  it("displays field-level error message", async () => {
    render(<TextField label="Email" error="Invalid email address" />);
    expect(screen.getByText("Invalid email address")).toBeTruthy();
  });

  it("handles text input change", async () => {
    const onChangeMock = jest.fn();
    render(<TextField placeholder="Test Input" onChangeText={onChangeMock} />);
    fireEvent.changeText(screen.getByPlaceholderText("Test Input"), "hello");
    expect(onChangeMock).toHaveBeenCalledWith("hello");
  });
});

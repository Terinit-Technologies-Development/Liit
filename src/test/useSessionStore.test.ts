import { useSessionStore } from "../state/useSessionStore";

describe("useSessionStore", () => {
  beforeEach(() => {
    useSessionStore.setState({
      status: "guest",
      selectedCity: "Johannesburg",
      selectedInterests: ["Music"],
      isLocationGranted: false,
    });
  });

  it("updates selected city correctly", () => {
    useSessionStore.getState().setSelectedCity("Cape Town");
    expect(useSessionStore.getState().selectedCity).toBe("Cape Town");
  });

  it("toggles interest selection", () => {
    useSessionStore.getState().toggleInterest("Art");
    expect(useSessionStore.getState().selectedInterests).toContain("Art");

    useSessionStore.getState().toggleInterest("Art");
    expect(useSessionStore.getState().selectedInterests).not.toContain("Art");
  });

  it("switches between guest and authenticated status", () => {
    useSessionStore.getState().setAuthenticatedUser();
    expect(useSessionStore.getState().status).toBe("authenticated");

    useSessionStore.getState().signOut();
    expect(useSessionStore.getState().status).toBe("unauthenticated");
  });
});

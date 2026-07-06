import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Intercept from "./Intercept";

const renderIntercept = (search = "?app=instagram") =>
  render(
    <MemoryRouter initialEntries={[`/intercept${search}`]}>
      <Intercept />
    </MemoryRouter>
  );

describe("Intercept page", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows app not found for invalid app", () => {
    renderIntercept("?app=nonexistent");
    expect(screen.getByText("App not found")).toBeInTheDocument();
  });

  it("displays the app name", () => {
    renderIntercept("?app=instagram");
    expect(screen.getByText(/Opening Instagram/)).toBeInTheDocument();
    renderIntercept("?app=twitch");
    expect(screen.getByText(/Opening Twitch/)).toBeInTheDocument();
  });

  it("starts with 30 second countdown", () => {
    renderIntercept("?app=instagram");
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("counts down over time", () => {
    renderIntercept("?app=instagram");
    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("shows 'Take a breath' during countdown", () => {
    renderIntercept("?app=instagram");
    expect(screen.getByText("Take a breath…")).toBeInTheDocument();
  });

  it("shows action buttons after 30 seconds", () => {
    renderIntercept("?app=instagram");
    act(() => { vi.advanceTimersByTime(30000); });
    expect(screen.getByText(/Continue to Instagram/)).toBeInTheDocument();
    expect(screen.getByText(/I don't need this right now/)).toBeInTheDocument();
  });

  it("shows encouragement after countdown", () => {
    renderIntercept("?app=instagram");
    act(() => { vi.advanceTimersByTime(30000); });
    expect(screen.getByText(/You paused. That takes strength/)).toBeInTheDocument();
  });

  it("shows home link on invalid app", () => {
    renderIntercept("?app=bogus");
    expect(screen.getByText("Go home")).toBeInTheDocument();
  });

  it("resets timer on visibilitychange in standalone mode", () => {
    // Mock standalone mode
    Object.defineProperty(window.navigator, "standalone", { value: true, writable: true, configurable: true });
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === "(display-mode: standalone)",
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }));

    renderIntercept("?app=instagram");
    // Complete the timer
    act(() => { vi.advanceTimersByTime(30000); });
    expect(screen.getByText("0")).toBeInTheDocument();

    // Simulate returning to foreground
    Object.defineProperty(document, "visibilityState", { value: "visible", writable: true, configurable: true });
    act(() => { document.dispatchEvent(new Event("visibilitychange")); });

    // Timer should reset
    expect(screen.getByText("30")).toBeInTheDocument();
  });
});

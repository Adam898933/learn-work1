import { describe, expect, it } from "vitest";
import { canAccessLearningHub } from "@/lib/learning-entry";

describe("Learning Hub entry", () => {
  it("requires a reload when the website is opened", () => {
    expect(canAccessLearningHub("navigate")).toBe(false);
    expect(canAccessLearningHub(undefined)).toBe(false);
    expect(canAccessLearningHub("back_forward")).toBe(false);
  });
  it("allows access after reloading the page", () => {
    expect(canAccessLearningHub("reload")).toBe(true);
  });
});
import { describe, expect, it } from "vitest";
import { validateCreateIntent } from "../../src/ai/action-guard";

describe("validateCreateIntent", () => {
  it("allows explicit note creation requests", () => {
    expect(() =>
      validateCreateIntent("Create a note about JavaScript Exceptional Handling"),
    ).not.toThrow();
  });

  it("allows save requests", () => {
    expect(() =>
      validateCreateIntent("Save this as a note about React useEffect"),
    ).not.toThrow();
  });

  it("rejects normal questions", () => {
    expect(() => validateCreateIntent("Explain JavaScript Exceptional Handling")).toThrow(
      "Creating a note requires explicit user intent.",
    );
  });

  it("rejects unrelated requests", () => {
    expect(() => validateCreateIntent("Find my React notes")).toThrow(
      "Creating a note requires explicit user intent.",
    );
  });
});

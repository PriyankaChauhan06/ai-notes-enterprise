import { describe, expect, it } from "vitest";
import { calculateModelCost } from "../../src/ai/model-pricing";
import { AIModel } from "../common";

describe("calculateModelCost", () => {
  it(`calculates cost correctly for ${AIModel}`, () => {
    const cost = calculateModelCost(AIModel, 10_000, 2_000);
    expect(cost).toBeCloseTo(0.0065, 10);
  });

  it("returns zero cost when there are no tokens", () => {
    const cost = calculateModelCost(AIModel, 0, 0);
    expect(cost).toBe(0);
  });

  it("throws when pricing is not configured", () => {
    expect(() => calculateModelCost("unknown-model", 100, 100)).toThrow(
      "Pricing not configured for model: unknown-model",
    );
  });

  it("throws when input tokens are negative", () => {
    expect(() => calculateModelCost(AIModel, -100, 200)).toThrow(
      "Token counts cannot be negative",
    );
  });

  it("throws when output tokens are negative", () => {
    expect(() => calculateModelCost(AIModel, 100, -200)).toThrow(
      "Token counts cannot be negative",
    );
  });
});

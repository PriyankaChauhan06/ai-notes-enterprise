import { describe, expect, it } from "vitest";
import { validateToolAccess } from "../../src/ai/guardrail";

describe("validateToolAccess", () => {
  it("allows registered read tools", () => {
    expect(validateToolAccess("search_my_notes")).toBe("read");
    expect(validateToolAccess("get_note")).toBe("read");
  });

  it("allows registered write tools with correct risk", () => {
    expect(validateToolAccess("create_note")).toBe("low_write");
    expect(validateToolAccess("update_note")).toBe("high_write");
    expect(validateToolAccess("delete_note")).toBe("destructive");
  });

  it("rejects unknown tools", () => {
    expect(() => validateToolAccess("drop_database")).toThrow(
      'Tool "drop_database" is not allowed',
    );
  });
});

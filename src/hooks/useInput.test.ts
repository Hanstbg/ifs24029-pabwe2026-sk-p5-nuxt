import { describe, it, expect } from "vitest";
import { useInput } from "./useInput";

describe("useInput", () => {
  it("menerima event dan nilai langsung", () => {
    const [value, onChange] = useInput("a");
    expect(value.value).toBe("a");
    onChange({ target: { value: "b" } });
    expect(value.value).toBe("b");
    onChange("c");
    expect(value.value).toBe("c");
  });
  it("default string kosong", () => {
    expect(useInput()[0].value).toBe("");
  });
});

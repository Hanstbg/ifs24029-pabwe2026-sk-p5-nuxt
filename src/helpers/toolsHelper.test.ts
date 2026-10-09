import { describe, it, expect, vi, beforeEach } from "vitest";
import Swal from "sweetalert2";
import * as t from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("toolsHelper", () => {
  beforeEach(() => vi.clearAllMocks());

  it("dialog success, error, confirm", async () => {
    t.showSuccessDialog("ok");
    t.showErrorDialog("bad");
    (Swal.fire as any).mockResolvedValueOnce({ isConfirmed: true });
    expect(await t.showConfirmDialog("x")).toBe(true);
    expect(Swal.fire).toHaveBeenCalledTimes(3);
  });

  it("formatRupiah & formatDate", () => {
    expect(t.formatRupiah(10000)).toContain("10.000");
    expect(t.formatRupiah("abc")).toContain("0");
    expect(t.formatDate("")).toBe("-");
    expect(t.formatDate("bukan-tanggal")).toBe("-");
    expect(t.formatDate("2026-06-15 12:00:00")).toContain("2026");
    expect(t.formatDate("2026-06-15T12:00:00Z")).toContain("2026");
  });

  it("photoUrl", () => {
    expect(t.photoUrl("")).toBe("");
    expect(t.photoUrl("http://x/y.png")).toBe("http://x/y.png");
    expect(t.photoUrl("/img/a.png")).toBe("https://open-api.delcom.org/img/a.png");
  });
});

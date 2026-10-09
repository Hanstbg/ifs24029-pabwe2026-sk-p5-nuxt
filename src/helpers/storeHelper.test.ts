import { describe, it, expect, vi, beforeEach } from "vitest";
import { runAction } from "./storeHelper";
import { showErrorDialog, showSuccessDialog } from "./toolsHelper";

vi.mock("./toolsHelper", () => ({ showSuccessDialog: vi.fn(), showErrorDialog: vi.fn() }));

describe("runAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mengembalikan response dan menampilkan dialog sukses", async () => {
    const busy = { value: false };
    const res = await runAction(busy, async () => ({ message: "ok" }), { success: true });
    expect(res).toEqual({ message: "ok" });
    expect(showSuccessDialog).toHaveBeenCalledWith("ok");
    expect(busy.value).toBe(false);
  });

  it("flag busy bernilai true selama aksi berjalan", async () => {
    const busy = { value: false };
    let during = false;
    await runAction(busy, async () => { during = busy.value; return {}; });
    expect(during).toBe(true);
  });

  it("success=true tapi tanpa message -> tidak ada dialog, return true bila response kosong", async () => {
    expect(await runAction({ value: false }, async () => undefined, { success: true })).toBe(true);
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });

  it("tanpa opsi success tidak menampilkan dialog sukses", async () => {
    await runAction({ value: false }, async () => ({ message: "ok" }));
    expect(showSuccessDialog).not.toHaveBeenCalled();
  });

  it("menampilkan dialog error dan mengembalikan false saat gagal", async () => {
    const busy = { value: false };
    expect(await runAction(busy, async () => { throw new Error("gagal"); })).toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("gagal");
    expect(busy.value).toBe(false);
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import ChangeModal from "./ChangeModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/cashFlowApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";

vi.mock("../api/cashFlowApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showSuccessDialog: vi.fn(), showErrorDialog: vi.fn() }));

const cf = { id: 9, type: "outflow", source: "loans", label: "cicilan", nominal: 50000, description: "bulan ini" };
const val = (w: any, sel: string) => (w.find(sel).element as HTMLInputElement).value;

async function openWith(cashFlow: any) {
  const ctx = await renderWithProviders(ChangeModal, { props: { show: false, cashFlow } });
  await ctx.wrapper.setProps({ show: true });
  return ctx;
}
const submit = async (wrapper: any) => {
  await wrapper.find("form").trigger("submit");
  await flushPromises();
};

describe("ChangeModal", () => {
  beforeEach(() => vi.resetAllMocks());

  it("tidak merender apa pun saat show=false", async () => {
    const { wrapper } = await renderWithProviders(ChangeModal, { props: { show: false, cashFlow: null } });
    expect(wrapper.find("form").exists()).toBe(false);
  });

  it("mengisi form dari cashFlow saat dibuka", async () => {
    const { wrapper } = await openWith(cf);
    expect(val(wrapper, "#type")).toBe("outflow");
    expect(val(wrapper, "#source")).toBe("loans");
    expect(val(wrapper, "#label")).toBe("cicilan");
    expect(val(wrapper, "#nominal")).toBe("50000");
    expect(val(wrapper, "#description")).toBe("bulan ini");
  });

  it("deskripsi kosong/null menjadi string kosong", async () => {
    const { wrapper } = await openWith({ ...cf, description: null });
    expect(val(wrapper, "#description")).toBe("");
  });

  it("dibuka tanpa cashFlow tidak error", async () => {
    const { wrapper } = await openWith(null);
    expect(wrapper.find("form").exists()).toBe(true);
    expect(val(wrapper, "#label")).toBe("");
  });

  it("ditutup (show=false) tidak mengubah form", async () => {
    const { wrapper } = await openWith(cf);
    await wrapper.setProps({ show: false });
    expect(wrapper.find("form").exists()).toBe(false);
  });

  it("validasi: label kosong dan nominal 0", async () => {
    const { wrapper } = await openWith(cf);
    await wrapper.find("#label").setValue("");
    await submit(wrapper);
    await wrapper.find("#label").setValue("x");
    await wrapper.find("#nominal").setValue("0");
    await submit(wrapper);
    expect(showErrorDialog).toHaveBeenCalledTimes(2);
    expect(api.putCashFlow).not.toHaveBeenCalled();
  });

  it("submit berhasil memanggil putCashFlow dan memancarkan changed + close", async () => {
    vi.mocked(api.putCashFlow).mockResolvedValue({ message: "ok" } as any);
    const { wrapper } = await openWith(cf);
    await wrapper.find("#type").setValue("inflow");
    await wrapper.find("#source").setValue("cash");
    await wrapper.find("#label").setValue("gaji");
    await wrapper.find("#nominal").setValue("75000");
    await wrapper.find("#description").setValue("baru");
    await submit(wrapper);
    expect(api.putCashFlow).toHaveBeenCalledWith(9, { type: "inflow", source: "cash", label: "gaji", nominal: 75000, description: "baru" });
    expect(wrapper.emitted("changed")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("submit gagal tidak memancarkan event", async () => {
    vi.mocked(api.putCashFlow).mockRejectedValue(new Error("gagal"));
    const { wrapper } = await openWith(cf);
    await submit(wrapper);
    expect(wrapper.emitted("changed")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("menutup lewat overlay, tombol X, dan tombol Batal", async () => {
    const { wrapper } = await openWith(cf);
    await wrapper.find(".fixed.inset-0").trigger("click");
    await wrapper.find('button[aria-label="Tutup"]').trigger("click");
    await wrapper.findAll("button").find((b) => b.text() === "Batal")!.trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);
  });
});

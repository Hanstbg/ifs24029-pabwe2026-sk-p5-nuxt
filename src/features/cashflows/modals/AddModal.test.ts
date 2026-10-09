import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import AddModal from "./AddModal.vue";
import { renderWithProviders } from "../../../test-utils";
import * as api from "../api/cashFlowApi";
import { showErrorDialog } from "../../../helpers/toolsHelper";

vi.mock("../api/cashFlowApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showSuccessDialog: vi.fn(), showErrorDialog: vi.fn() }));

const submit = async (wrapper: any) => {
  await wrapper.find("form").trigger("submit");
  await flushPromises();
};

describe("AddModal", () => {
  beforeEach(() => vi.resetAllMocks());

  it("tidak merender apa pun saat show=false", async () => {
    const { wrapper } = await renderWithProviders(AddModal, { props: { show: false } });
    expect(wrapper.find("form").exists()).toBe(false);
  });

  it("form direset setiap kali modal dibuka", async () => {
    const { wrapper } = await renderWithProviders(AddModal, { props: { show: true } });
    await wrapper.find("#label").setValue("sisa");
    await wrapper.find("#type").setValue("outflow");
    await wrapper.setProps({ show: false });
    await wrapper.setProps({ show: true });
    expect((wrapper.find("#label").element as HTMLInputElement).value).toBe("");
    expect((wrapper.find("#type").element as HTMLSelectElement).value).toBe("inflow");
  });

  it("validasi: label kosong", async () => {
    const { wrapper } = await renderWithProviders(AddModal, { props: { show: true } });
    await wrapper.find("#nominal").setValue("100");
    await submit(wrapper);
    expect(showErrorDialog).toHaveBeenCalledWith("Label dan nominal (> 0) wajib diisi");
    expect(api.postCashFlow).not.toHaveBeenCalled();
  });

  it("validasi: nominal 0", async () => {
    const { wrapper } = await renderWithProviders(AddModal, { props: { show: true } });
    await wrapper.find("#label").setValue("gaji");
    await wrapper.find("#nominal").setValue("0");
    await submit(wrapper);
    expect(showErrorDialog).toHaveBeenCalled();
    expect(api.postCashFlow).not.toHaveBeenCalled();
  });

  it("submit berhasil mengirim payload dan memancarkan added + close", async () => {
    vi.mocked(api.postCashFlow).mockResolvedValue({ message: "ok" } as any);
    const { wrapper } = await renderWithProviders(AddModal, { props: { show: true } });
    await wrapper.find("#type").setValue("outflow");
    await wrapper.find("#source").setValue("savings");
    await wrapper.find("#label").setValue("makan");
    await wrapper.find("#nominal").setValue("25000");
    await wrapper.find("#description").setValue("siang");
    await submit(wrapper);
    expect(api.postCashFlow).toHaveBeenCalledWith({ type: "outflow", source: "savings", label: "makan", nominal: 25000, description: "siang" });
    expect(wrapper.emitted("added")).toHaveLength(1);
    expect(wrapper.emitted("close")).toHaveLength(1);
  });

  it("submit gagal tidak memancarkan event", async () => {
    vi.mocked(api.postCashFlow).mockRejectedValue(new Error("gagal"));
    const { wrapper } = await renderWithProviders(AddModal, { props: { show: true } });
    await wrapper.find("#label").setValue("makan");
    await wrapper.find("#nominal").setValue("100");
    await submit(wrapper);
    expect(wrapper.emitted("added")).toBeUndefined();
    expect(wrapper.emitted("close")).toBeUndefined();
  });

  it("menutup lewat overlay, tombol X, dan tombol Batal", async () => {
    const { wrapper } = await renderWithProviders(AddModal, { props: { show: true } });
    await wrapper.find(".fixed.inset-0").trigger("click");
    await wrapper.find('button[aria-label="Tutup"]').trigger("click");
    await wrapper.findAll("button").find((b) => b.text() === "Batal")!.trigger("click");
    expect(wrapper.emitted("close")).toHaveLength(3);
  });
});

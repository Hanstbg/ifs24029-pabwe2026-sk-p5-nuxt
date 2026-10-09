import { describe, it, expect } from "vitest";
import NotFoundPage from "./NotFoundPage.vue";
import { renderWithProviders } from "../../../test-utils";

describe("NotFoundPage", () => {
  it("menampilkan 404 dan tautan kembali", async () => {
    const { wrapper } = await renderWithProviders(NotFoundPage);
    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("tidak ditemukan");
    expect(wrapper.find("a").attributes("href")).toBe("/");
  });
});

import { describe, it, expect } from "vitest";
import App from "./app.vue";
import { renderWithProviders } from "./test-utils";

describe("app.vue", () => {
  it("merender RouterView", async () => {
    const { wrapper } = await renderWithProviders(App);
    expect(wrapper.find('[data-testid="route-stub"]').exists()).toBe(true);
  });
});

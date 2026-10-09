import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createRouter, createMemoryHistory } from "vue-router";
import { routes } from "./routes";

export function createMockPinia() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

export async function renderWithProviders(
  component: any,
  { props = {}, route = "/", pinia = createMockPinia(), global = {} }: any = {}
) {
  const router = createRouter({ history: createMemoryHistory(), routes });
  router.push(route);
  await router.isReady();
  const wrapper = mount(component, { props, global: { plugins: [pinia, router], ...global } });
  return { wrapper, router, pinia };
}

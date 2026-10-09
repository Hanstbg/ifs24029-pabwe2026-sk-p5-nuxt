import { h, type Component } from "vue";
import { mount, flushPromises } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { createMemoryHistory, createRouter, type RouteRecordRaw } from "vue-router";

/** Halaman dummy agar RouterView/RouterLink bisa me-resolve rute apa pun saat testing. */
const Stub = { render: () => h("div", { "data-testid": "route-stub" }) };

export const defaultRoutes: RouteRecordRaw[] = [{ path: "/:pathMatch(.*)*", component: Stub }];

export function createMockPinia() {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

interface RenderOptions {
  props?: Record<string, any>;
  route?: string;
  routes?: RouteRecordRaw[];
  global?: Record<string, any>;
  /** Dijalankan sebelum komponen di-mount (mis. mengisi state store). */
  beforeMount?: (pinia: ReturnType<typeof createPinia>) => void;
}

export async function renderWithProviders(component: Component, options: RenderOptions = {}) {
  const pinia = createMockPinia();
  const router = createRouter({ history: createMemoryHistory(), routes: options.routes ?? defaultRoutes });
  router.push(options.route ?? "/");
  await router.isReady();
  options.beforeMount?.(pinia);

  const wrapper = mount(component, {
    props: options.props,
    global: { plugins: [pinia, router], ...(options.global ?? {}) },
  });
  await flushPromises();
  return { wrapper, pinia, router };
}

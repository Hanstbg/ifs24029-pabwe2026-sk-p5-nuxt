import { createRouter, createWebHistory, type RouterHistory } from "vue-router";
import { getAccessToken } from "./helpers/apiHelper";
import { routes } from "./routes";

/** Guard autentikasi: dipakai middleware Nuxt dan pengujian. */
export function authGuard(to: { meta: Record<string, any> }): string | undefined {
  const loggedIn = !!getAccessToken();
  if (to.meta.auth && !loggedIn) return "/auth/login";
  if (to.meta.guest && loggedIn) return "/";
  return undefined;
}

export function createAppRouter(history: RouterHistory = createWebHistory()) {
  const router = createRouter({ history, routes });
  router.beforeEach((to) => authGuard(to));
  return router;
}

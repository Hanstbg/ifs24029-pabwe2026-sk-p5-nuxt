import { authGuard } from "../router";

export default defineNuxtRouteMiddleware((to) => {
  const target = authGuard(to);
  if (target) return navigateTo(target);
});

import type { RouterConfig } from "@nuxt/schema";
import { routes } from "./routes";

export default {
  routes: () => routes,
} satisfies RouterConfig;

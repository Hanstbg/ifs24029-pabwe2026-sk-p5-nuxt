/// <reference types="vite/client" />
declare const DELCOM_BASEURL: string;

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

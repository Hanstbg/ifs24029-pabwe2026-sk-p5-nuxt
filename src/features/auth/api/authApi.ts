import { apiFetch } from "../../../helpers/apiHelper";

export const postLogin = ({ email, password }) =>
  apiFetch("/auth/login", { method: "POST", body: { email, password }, auth: false });

export const postRegister = ({ name, email, password }) =>
  apiFetch("/auth/register", { method: "POST", body: { name, email, password }, auth: false });

export const postLogout = () => apiFetch("/auth/logout", { method: "POST" });

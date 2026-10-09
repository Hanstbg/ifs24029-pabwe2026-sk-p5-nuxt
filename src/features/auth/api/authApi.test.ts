import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import { postLogin, postLogout, postRegister } from "./authApi";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn().mockResolvedValue({ status: "success" }) }));

describe("authApi", () => {
  beforeEach(() => vi.mocked(apiFetch).mockClear());

  it("postLogin", async () => {
    await postLogin({ email: "a@b.c", password: "123456" });
    expect(apiFetch).toHaveBeenCalledWith("/auth/login", { method: "POST", body: { email: "a@b.c", password: "123456" }, auth: false });
  });

  it("postRegister", async () => {
    await postRegister({ name: "A", email: "a@b.c", password: "123456" });
    expect(apiFetch).toHaveBeenCalledWith("/auth/register", { method: "POST", body: { name: "A", email: "a@b.c", password: "123456" }, auth: false });
  });

  it("postLogout", async () => {
    await postLogout();
    expect(apiFetch).toHaveBeenCalledWith("/auth/logout", { method: "POST" });
  });
});

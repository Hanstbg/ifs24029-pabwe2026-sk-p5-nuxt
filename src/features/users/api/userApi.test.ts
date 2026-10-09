import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import { getMe, getUsers, postPhoto, putMe, putPassword } from "./userApi";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn().mockResolvedValue({ status: "success" }) }));

describe("userApi", () => {
  beforeEach(() => vi.mocked(apiFetch).mockClear());

  it("getUsers", async () => {
    await getUsers();
    expect(apiFetch).toHaveBeenCalledWith("/users");
  });

  it("getMe", async () => {
    await getMe();
    expect(apiFetch).toHaveBeenCalledWith("/users/me");
  });

  it("putMe hanya mengirim name & email", async () => {
    await putMe({ name: "A", email: "a@b.c" });
    expect(apiFetch).toHaveBeenCalledWith("/users/me", { method: "PUT", body: { name: "A", email: "a@b.c" } });
  });

  it("postPhoto mengirim FormData", async () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    await postPhoto(file);
    const [path, opt] = vi.mocked(apiFetch).mock.calls[0] as any;
    expect(path).toBe("/users/me/photo");
    expect(opt.method).toBe("POST");
    expect(opt.body).toBeInstanceOf(FormData);
    expect(opt.body.get("photo")).toBeInstanceOf(File);
  });

  it("putPassword", async () => {
    const body = { password: "lama", new_password: "baru", new_password_confirmation: "baru" };
    await putPassword(body);
    expect(apiFetch).toHaveBeenCalledWith("/users/password", { method: "PUT", body });
  });
});

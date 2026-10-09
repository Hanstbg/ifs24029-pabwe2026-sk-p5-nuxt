import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPinia } from "../../../test-utils";
import { useUsersStore } from "./usersStore";
import * as api from "../api/userApi";

vi.mock("../api/userApi");
vi.mock("../../../helpers/toolsHelper", () => ({ showSuccessDialog: vi.fn(), showErrorDialog: vi.fn() }));

const user = { id: 1, name: "Budi", email: "budi@del.ac.id" };

describe("usersStore", () => {
  let store: ReturnType<typeof useUsersStore>;
  beforeEach(() => {
    vi.resetAllMocks();
    createMockPinia();
    store = useUsersStore();
  });

  it("asyncGetUsers berhasil & gagal", async () => {
    vi.mocked(api.getUsers).mockResolvedValue({ data: { users: [user] } } as any);
    await store.asyncGetUsers();
    expect(store.users).toEqual([user]);
    vi.mocked(api.getUsers).mockRejectedValue(new Error("x"));
    await store.asyncGetUsers();
    expect(store.users).toEqual([user]);
    expect(store.isUsers).toBe(false);
  });

  it("asyncGetProfile berhasil & gagal", async () => {
    vi.mocked(api.getMe).mockResolvedValue({ data: { user } } as any);
    expect(await store.asyncGetProfile()).toBe(true);
    expect(store.profile).toEqual(user);
    vi.mocked(api.getMe).mockRejectedValue(new Error("x"));
    expect(await store.asyncGetProfile()).toBe(false);
  });

  it("asyncChangeProfile memuat ulang profil saat sukses", async () => {
    vi.mocked(api.putMe).mockResolvedValue({ message: "ok" } as any);
    vi.mocked(api.getMe).mockResolvedValue({ data: { user } } as any);
    expect(await store.asyncChangeProfile({ name: "B", email: "e" })).toBe(true);
    expect(api.getMe).toHaveBeenCalledTimes(1);
  });

  it("asyncChangeProfile gagal tidak memuat ulang", async () => {
    vi.mocked(api.putMe).mockRejectedValue(new Error("x"));
    expect(await store.asyncChangeProfile({ name: "B", email: "e" })).toBe(false);
    expect(api.getMe).not.toHaveBeenCalled();
  });

  it("asyncChangePhoto berhasil & gagal", async () => {
    const file = new File(["x"], "a.png");
    vi.mocked(api.postPhoto).mockResolvedValue({ message: "ok" } as any);
    vi.mocked(api.getMe).mockResolvedValue({ data: { user } } as any);
    expect(await store.asyncChangePhoto(file)).toBe(true);
    expect(api.getMe).toHaveBeenCalledTimes(1);
    vi.mocked(api.postPhoto).mockRejectedValue(new Error("x"));
    expect(await store.asyncChangePhoto(file)).toBe(false);
    expect(api.getMe).toHaveBeenCalledTimes(1);
  });

  it("asyncChangePassword berhasil & gagal", async () => {
    const p = { password: "a", new_password: "b", new_password_confirmation: "b" };
    vi.mocked(api.putPassword).mockResolvedValue({ message: "ok" } as any);
    expect(await store.asyncChangePassword(p)).toBe(true);
    vi.mocked(api.putPassword).mockRejectedValue(new Error("x"));
    expect(await store.asyncChangePassword(p)).toBe(false);
  });
});

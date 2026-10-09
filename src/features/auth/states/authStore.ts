import { ref } from "vue";
import { defineStore } from "pinia";
import { postLogin, postRegister, postLogout } from "../api/authApi";
import { getAccessToken, putAccessToken, removeAccessToken } from "../../../helpers/apiHelper";
import { runAction } from "../../../helpers/storeHelper";

export const useAuthStore = defineStore("auth", () => {
  const token = ref(getAccessToken());
  const isAuthLogin = ref(false);
  const isAuthRegister = ref(false);
  const isAuthLogout = ref(false);
  const isLoading = ref(false);

  async function asyncLogin(payload) {
    isAuthLogin.value = false;
    const res = await runAction(isLoading, () => postLogin(payload));
    if (res) {
      token.value = res.data.token;
      putAccessToken(res.data.token);
      isAuthLogin.value = true;
    }
    return isAuthLogin.value;
  }

  async function asyncRegister(payload) {
    isAuthRegister.value = false;
    const res = await runAction(isLoading, () => postRegister(payload), { success: true });
    isAuthRegister.value = !!res;
    return isAuthRegister.value;
  }

  async function asyncLogout() {
    isAuthLogout.value = false;
    // Token lokal selalu dihapus walau request logout gagal.
    await runAction(isLoading, () => postLogout().catch(() => null));
    removeAccessToken();
    token.value = null;
    isAuthLogin.value = false;
    isAuthLogout.value = true;
    return true;
  }

  return { token, isAuthLogin, isAuthRegister, isAuthLogout, isLoading, asyncLogin, asyncRegister, asyncLogout };
});

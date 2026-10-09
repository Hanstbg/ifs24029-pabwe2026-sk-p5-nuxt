import { ref } from "vue";
import { defineStore } from "pinia";
import { getUsers, getMe, putMe, postPhoto, putPassword } from "../api/userApi";
import { runAction } from "../../../helpers/storeHelper";

export const useUsersStore = defineStore("users", () => {
  const users = ref([]);
  const user = ref(null);
  const profile = ref(null);
  const isUsers = ref(false);
  const isProfile = ref(false);
  const isProfileChange = ref(false);
  const isPhotoChange = ref(false);
  const isPasswordChange = ref(false);

  async function asyncGetUsers() {
    const res = await runAction(isUsers, () => getUsers());
    if (res) users.value = res.data.users;
  }

  async function asyncGetProfile() {
    const res = await runAction(isProfile, () => getMe());
    if (res) profile.value = res.data.user;
    return !!res;
  }

  async function asyncChangeProfile(payload) {
    const res = await runAction(isProfileChange, () => putMe(payload), { success: true });
    if (res) await asyncGetProfile();
    return !!res;
  }

  async function asyncChangePhoto(file) {
    const res = await runAction(isPhotoChange, () => postPhoto(file), { success: true });
    if (res) await asyncGetProfile();
    return !!res;
  }

  async function asyncChangePassword(payload) {
    return !!(await runAction(isPasswordChange, () => putPassword(payload), { success: true }));
  }

  return {
    users, user, profile, isUsers, isProfile, isProfileChange, isPhotoChange, isPasswordChange,
    asyncGetUsers, asyncGetProfile, asyncChangeProfile, asyncChangePhoto, asyncChangePassword,
  };
});

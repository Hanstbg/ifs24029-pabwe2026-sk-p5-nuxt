<script setup lang="ts">
import { onMounted, watch } from "vue";
import { useUsersStore } from "../states/usersStore";
import { useInput } from "../../../hooks/useInput";
import { photoUrl, showErrorDialog } from "../../../helpers/toolsHelper";

const store = useUsersStore();
const [name, onName] = useInput("");
const [email, onEmail] = useInput("");
const [password, onPassword] = useInput("");
const [newPassword, onNewPassword] = useInput("");
const [confirm, onConfirm] = useInput("");

watch(() => store.profile, (p) => { if (p) { onName(p.name); onEmail(p.email); } }, { immediate: true });
onMounted(() => store.asyncGetProfile());

const saveProfile = () => store.asyncChangeProfile({ name: name.value, email: email.value });
const changePhoto = (e) => { const f = (e.target as HTMLInputElement).files[0]; if (f) store.asyncChangePhoto(f); };

async function savePassword() {
  if (newPassword.value !== confirm.value) return showErrorDialog("Konfirmasi kata sandi tidak cocok");
  const ok = await store.asyncChangePassword({
    password: password.value, new_password: newPassword.value, new_password_confirmation: confirm.value,
  });
  if (ok) { onPassword(""); onNewPassword(""); onConfirm(""); }
}
</script>

<template>
  <section class="mx-auto max-w-2xl space-y-6">
    <h1 class="text-2xl font-extrabold">Profil Saya</h1>
    <div class="card flex items-center gap-4">
      <img :src="photoUrl(store.profile?.photo)" alt="Foto profil" class="h-20 w-20 rounded-full bg-slate-200 object-cover" />
      <label class="btn-ghost" for="photo">Ganti Foto</label>
      <input id="photo" type="file" accept="image/*" class="hidden" @change="changePhoto" />
    </div>
    <form class="card space-y-4" @submit.prevent="saveProfile">
      <h2 class="font-bold">Data Akun</h2>
      <div><label class="label" for="name">Nama</label><input id="name" class="input" :value="name" @input="onName" /></div>
      <div><label class="label" for="email">Email</label><input id="email" type="email" class="input" :value="email" @input="onEmail" /></div>
      <button class="btn-primary" :disabled="store.isProfileChange">Simpan</button>
    </form>
    <form class="card space-y-4" @submit.prevent="savePassword">
      <h2 class="font-bold">Ubah Kata Sandi</h2>
      <div><label class="label" for="old">Kata Sandi Lama</label><input id="old" type="password" class="input" :value="password" @input="onPassword" /></div>
      <div><label class="label" for="new">Kata Sandi Baru</label><input id="new" type="password" class="input" :value="newPassword" @input="onNewPassword" /></div>
      <div><label class="label" for="confirm">Konfirmasi</label><input id="confirm" type="password" class="input" :value="confirm" @input="onConfirm" /></div>
      <button class="btn-primary" :disabled="store.isPasswordChange">Ubah Kata Sandi</button>
    </form>
  </section>
</template>

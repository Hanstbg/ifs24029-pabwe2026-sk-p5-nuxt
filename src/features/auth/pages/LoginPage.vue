<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { LogIn } from "lucide-vue-next";
import { useAuthStore } from "../states/authStore";
import { useInput } from "../../../hooks/useInput";

const auth = useAuthStore();
const router = useRouter();
const [email, onEmail] = useInput("");
const [password, onPassword] = useInput("");
const error = ref("");

async function submit() {
  error.value = "";
  if (!email.value || !password.value) {
    error.value = "Email dan kata sandi wajib diisi";
    return;
  }
  if (await auth.asyncLogin({ email: email.value, password: password.value })) router.push("/");
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <div>
      <label class="label" for="login-email-input">Alamat Email</label>
      <input id="login-email-input" type="email" class="input" placeholder="nama@email.com" :value="email" @input="onEmail" />
    </div>
    <div>
      <label class="label" for="login-password-input">Kata Sandi</label>
      <input id="login-password-input" type="password" class="input" placeholder="••••••••" :value="password" @input="onPassword" />
    </div>
    <p v-if="error" class="text-sm text-rose-600">{{ error }}</p>
    <button id="login-submit-button" type="submit" class="btn-primary w-full" :disabled="auth.isLoading"><LogIn class="h-4 w-4" /> Masuk Sekarang</button>
  </form>
</template>
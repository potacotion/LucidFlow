<template>
  <div class="login-container">
    <BaseCard>
      <BaseStack gap="base">
        <BaseHeading :level=2 size="xl">Login</BaseHeading>
        <form @submit.prevent="handleLogin">
          <BaseStack gap="base">
            <BaseInput
              v-model="email"
              type="text"
              placeholder="Email Address"
              required
            />
            <BaseInput
              v-model="password"
              type="password"
              placeholder="Password"
              required
            />
            <BaseButton type="submit" :disabled="isLoading">
              <BaseSpinner v-if="isLoading" size="sm" />
              <span v-else>Log In</span>
            </BaseButton>
            <BaseText v-if="error" color="danger" size="sm">
              {{ error }}
            </BaseText>
          </BaseStack>
        </form>
      </BaseStack>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import BaseCard from '@/components/atoms/BaseCard.vue';
import BaseStack from '@/components/atoms/BaseStack.vue';
import BaseInput from '@/components/atoms/BaseInput.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';
import BaseHeading from '@/components/atoms/BaseHeading.vue';
import BaseText from '@/components/atoms/BaseText.vue';
import BaseSpinner from '@/components/atoms/BaseSpinner.vue';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);

async function handleLogin() {
  isLoading.value = true;
  error.value = null;
  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    });
    // The store handles redirection on success
  } catch (err: any) {
    error.value = err.response?.data?.error || 'An unknown error occurred.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--color-bg-secondary);
}

.base-card {
  width: 100%;
  max-width: 400px;
}
</style>

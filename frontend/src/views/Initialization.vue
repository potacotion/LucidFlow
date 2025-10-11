<template>
  <BaseBox class="container">
    <BaseStack gap="base">
      <BaseStack gap="base">
        <BaseHeading :level="2">Welcome to LucidFlow!</BaseHeading>
        <BaseText>
          It looks like this is a new installation. Let's get your instance set up.
        </BaseText>
      </BaseStack>

      <form @submit.prevent="handleSubmit">
        <BaseStack gap="base">
          <!-- Instance Name -->
          <div class="form-item">
            <label for="instanceName">Instance Name</label>
            <BaseInput
              id="instanceName"
              v-model="config.instanceName"
              placeholder="My LucidFlow Instance"
              required
            />
          </div>

          <!-- Language -->
          <div class="form-item">
            <label for="language">Language</label>
            <BaseSelect id="language" v-model="config.language">
              <option v-for="option in languageOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </BaseSelect>
          </div>

          <!-- Theme -->
          <div class="form-item">
            <label for="theme">Default Theme</label>
            <BaseSelect id="theme" v-model="config.theme">
              <option v-for="option in themeOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </BaseSelect>
          </div>

          <!-- Multi-User Mode -->
          <div class="form-item form-item--switch">
            <BaseSwitch id="multiUserMode" v-model="config.multiUserMode" />
            <div class="switch-label">
              <label for="multiUserMode">Enable Multi-User Mode</label>
              <BaseText size="sm" color="secondary">Allow other users to register and collaborate.</BaseText>
            </div>
          </div>

          <BaseButton type="submit" :loading="isSubmitting">
            Save & Continue
          </BaseButton>
        </BaseStack>
      </form>
    </BaseStack>
  </BaseBox>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ConfigService } from '@/api/services/ConfigService';
import { AuthService } from '@/api/services/AuthService';
import { useAuthStore } from '@/stores/auth.store';
import {
  BaseBox, BaseStack, BaseHeading, BaseText, BaseInput,
  BaseButton, BaseSelect, BaseSwitch
} from '@/components/atoms';
import { useToast } from 'vue-toastification';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const isSubmitting = ref(false);
const config = reactive({
  instanceName: 'LucidFlow',
  language: 'en',
  theme: 'light',
  multiUserMode: true,
});

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: '简体中文', value: 'zh-CN' },
];

const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

async function handleSubmit() {
  isSubmitting.value = true;
  try {
    // 1. Save the initial configuration
    await ConfigService.putApiConfigInitialize(config);
    toast.success('Configuration saved!');

    // 2. Handle user creation based on mode
    if (config.multiUserMode) {
      toast.info('You are only one step away from using it, just register an account.');
      router.push('/register');
    } else {
      // Auto-register the built-in admin account
      await AuthService.postApiAuthRegister({
        name: 'Admin',
        email: 'admin@e.com',
        password: 'password',
      });

      // Auto-login
      const { token } = await AuthService.postApiAuthLogin({
        email: 'admin@e.com',
        password: 'password',
      });

      if (token) {
        authStore.setToken(token);
        toast.success('Setup complete! Logged in as Admin.');
        router.push('/');
      } else {
        throw new Error('Failed to retrieve auth token after auto-login.');
      }
    }
  } catch (error) {
    toast.error('An error occurred during setup.');
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.container {
  max-width: 480px;
  margin: 4rem auto;
  padding: 2rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-item--switch {
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.switch-label {
  display: flex;
  flex-direction: column;
}
</style>

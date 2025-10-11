<template>
  <BaseBox class="container">
    <BaseStack gap="base">
      <BaseHeading :level="2">Create Administrator Account</BaseHeading>
      <BaseText>
        As the first user, you will be granted administrative privileges.
      </BaseText>

      <form @submit.prevent="handleSubmit">
        <BaseStack gap="base">
          <BaseInput
            v-model="form.name"
            label="Name"
            placeholder="e.g., Ada Lovelace"
            required
          />
          <BaseInput
            v-model="form.email"
            label="Email Address"
            type="text"
            placeholder="ada@example.com"
            required
          />
          <BaseInput
            v-model="form.password"
            label="Password"
            type="password"
            required
          />

          <BaseButton type="submit" :loading="isSubmitting">
            Create Account
          </BaseButton>
        </BaseStack>
      </form>
    </BaseStack>
  </BaseBox>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { AuthService } from '@/api/services/AuthService';
import { BaseBox, BaseStack, BaseHeading, BaseText, BaseInput, BaseButton } from '@/components/atoms';
import { useToast } from 'vue-toastification';

const router = useRouter();
const toast = useToast();

const isSubmitting = ref(false);
const form = reactive({
  name: '',
  email: '',
  password: '',
});

async function handleSubmit() {
  isSubmitting.value = true;
  try {
    await AuthService.postApiAuthRegister({
      name: form.name,
      email: form.email,
      password: form.password,
    });
    toast.success('Administrator account created! Please log in.');
    router.push('/login');
  } catch (error) {
    toast.error('Failed to create account.');
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
</style>

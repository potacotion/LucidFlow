<template>
  <transition name="fade">
    <div v-if="visible" class="base-confirm__overlay" @click.self="handleCancel">
      <div class="base-confirm__dialog">
        <div class="base-confirm__header">
          <h3 class="base-confirm__title">{{ title }}</h3>
        </div>
        <div class="base-confirm__body">
          <p v-if="message" class="base-confirm__message">{{ message }}</p>
        </div>
        <div class="base-confirm__footer">
          <BaseButton variant="secondary" @click="handleCancel">取消</BaseButton>
          <BaseButton @click="handleConfirm">确认</BaseButton>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
}

defineProps<Props>();
const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.base-confirm__overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.base-confirm__dialog {
  background-color: var(--c-background);
  border-radius: var(--radius-md);
  padding: var(--sp-6);
  width: 90%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
}

.base-confirm__header {
  margin-bottom: var(--sp-4);
}

.base-confirm__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--c-text-primary);
}

.base-confirm__body {
  margin-bottom: var(--sp-6);
}

.base-confirm__message {
  color: var(--c-text-secondary);
}

.base-confirm__footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--sp-3);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

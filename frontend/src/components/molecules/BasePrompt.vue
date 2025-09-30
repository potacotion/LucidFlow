<template>
  <transition name="fade">
    <div v-if="visible" class="base-prompt__overlay" @click.self="handleCancel">
      <div class="base-prompt__dialog">
        <div class="base-prompt__header">
          <h3 class="base-prompt__title">{{ title }}</h3>
        </div>
        <div class="base-prompt__body">
          <p v-if="message" class="base-prompt__message">{{ message }}</p>
          <BaseInput v-model="inputValue" @keydown.enter="handleConfirm" />
        </div>
        <div class="base-prompt__footer">
          <BaseButton variant="secondary" @click="handleCancel">取消</BaseButton>
          <BaseButton @click="handleConfirm">确认</BaseButton>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import BaseInput from '@/components/atoms/BaseInput.vue';
import BaseButton from '@/components/atoms/BaseButton.vue';

interface Props {
  visible: boolean;
  title: string;
  message?: string;
  defaultValue?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['confirm', 'cancel']);

const inputValue = ref('');

watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    inputValue.value = props.defaultValue || '';
  }
});

const handleConfirm = () => {
  emit('confirm', inputValue.value);
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.base-prompt__overlay {
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

.base-prompt__dialog {
  background-color: var(--c-background);
  border-radius: var(--radius-md);
  padding: var(--sp-6);
  width: 90%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
}

.base-prompt__header {
  margin-bottom: var(--sp-4);
}

.base-prompt__title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--c-text-primary);
}

.base-prompt__body {
  margin-bottom: var(--sp-6);
}

.base-prompt__message {
  margin-bottom: var(--sp-3);
  color: var(--c-text-secondary);
}

.base-prompt__footer {
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

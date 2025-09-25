<template>
  <transition name="modal-fade">
    <div v-if="open" class="base-modal__overlay" @click.self="handleOverlayClick">
      <div class="base-modal__container">
        <slot />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch } from 'vue';

interface Props {
  open: boolean;
  closeOnEsc?: boolean;
  closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  closeOnEsc: true,
  closeOnOverlay: true,
});

const emit = defineEmits(['update:open']);

const closeModal = () => {
  emit('update:open', false);
};

const handleOverlayClick = () => {
  if (props.closeOnOverlay) {
    closeModal();
  }
};

const handleEsc = (e: KeyboardEvent) => {
  if (props.closeOnEsc && e.key === 'Escape') {
    closeModal();
  }
};

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    window.addEventListener('keydown', handleEsc);
  } else {
    window.removeEventListener('keydown', handleEsc);
  }
}, { immediate: true });

</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity var(--duration-base);
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.base-modal__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.base-modal__container {
  background: var(--c-background-overlay);
  padding: var(--sp-lg);
  border-radius: var(--radius-lg);
  box-shadow: 0 5px 15px var(--c-shadow-dark);
}
</style>

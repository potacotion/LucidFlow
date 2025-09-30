<template>
  <transition name="modal-fade">
    <div v-if="open" class="base-modal__overlay" @click.self="handleOverlayClick">
      <div class="base-modal__container">
        <header v-if="title || $slots.header" class="base-modal__header">
          <slot name="header">
            <h3 class="base-modal__title">{{ title }}</h3>
          </slot>
          <button class="base-modal__close-btn" @click="closeModal">&times;</button>
        </header>

        <main class="base-modal__body">
          <slot />
        </main>

        <footer v-if="$slots.footer" class="base-modal__footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { watch } from 'vue';

interface Props {
  open: boolean;
  title?: string;
  closeOnEsc?: boolean;
  closeOnOverlay?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
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
  border-radius: var(--radius-lg);
  box-shadow: 0 5px 15px var(--c-shadow-dark);
  width: 500px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
}

.base-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--sp-md) var(--sp-lg);
  border-bottom: 1px solid var(--c-border-base);
}

.base-modal__title {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.base-modal__close-btn {
  border: none;
  background: transparent;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--c-text-secondary);
}

.base-modal__body {
  padding: var(--sp-lg);
  overflow-y: auto;
}

.base-modal__footer {
  padding: var(--sp-md) var(--sp-lg);
  border-top: 1px solid var(--c-border-base);
}
</style>

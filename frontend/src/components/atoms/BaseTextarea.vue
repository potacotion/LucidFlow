<template>
  <div class="base-textarea__wrapper">
    <textarea
      ref="textarea"
      class="base-textarea__inner"
      :value="modelValue"
      :disabled="disabled"
      @input="handleInput"
      v-bind="$attrs"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue';

interface Props {
  modelValue: string;
  disabled?: boolean;
  autoRows?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);
const textarea = ref<HTMLTextAreaElement | null>(null);

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value);
};

const resizeTextarea = () => {
  if (props.autoRows && textarea.value) {
    textarea.value.style.height = 'auto';
    textarea.value.style.height = `${textarea.value.scrollHeight}px`;
  }
};

onMounted(() => {
  nextTick(resizeTextarea);
});

watch(() => props.modelValue, () => {
  nextTick(resizeTextarea);
});
</script>

<style scoped>
.base-textarea__wrapper {
  position: relative;
  display: block;
  width: 100%;
}

.base-textarea__inner {
  display: block;
  width: 100%;
  padding: 5px 15px;
  line-height: 1.5;
  box-sizing: border-box;
  color: var(--c-text-primary);
  background-color: var(--c-background);
  background-image: none;
  border: 1px solid var(--c-border-base);
  border-radius: var(--radius-sm);
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  resize: vertical;
  font-family: inherit;
}

.base-textarea__inner:focus {
  outline: none;
  border-color: var(--c-primary);
}

.base-textarea__inner:disabled {
  background-color: var(--c-fill-light);
  border-color: var(--c-border-light);
  color: var(--c-text-placeholder);
  cursor: not-allowed;
}
</style>

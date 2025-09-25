<template>
  <div :class="['base-select__wrapper', { 'is-disabled': disabled }]">
    <select
      class="base-select__inner"
      :value="modelValue"
      :disabled="disabled"
      @change="handleChange"
      v-bind="$attrs"
    >
      <slot />
    </select>
    <span class="base-select__suffix">
      <i class="fas fa-chevron-down" />
    </span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number;
  disabled?: boolean;
}

defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const handleChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLSelectElement).value);
};
</script>

<style scoped>
.base-select__wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.base-select__inner {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background-color: var(--c-background);
  background-image: none;
  border-radius: var(--radius-sm);
  border: 1px solid var(--c-border-base);
  box-sizing: border-box;
  color: var(--c-text-primary);
  display: inline-block;
  font-size: inherit;
  height: 32px;
  line-height: 32px;
  outline: none;
  padding: 0 30px 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
  cursor: pointer;
}

.base-select__inner:focus {
  outline: none;
  border-color: var(--c-primary);
}

.is-disabled .base-select__inner {
  background-color: var(--c-fill-light);
  border-color: var(--c-border-light);
  color: var(--c-text-placeholder);
  cursor: not-allowed;
}

.base-select__suffix {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--c-text-secondary);
}
</style>

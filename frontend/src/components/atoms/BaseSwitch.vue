<template>
  <label :class="['base-switch', { 'is-disabled': disabled, 'is-checked': modelValue }]">
    <input
      type="checkbox"
      class="base-switch__original"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
    />
    <span class="base-switch__core" />
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  disabled?: boolean;
}

defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const handleChange = (event: Event) => {
  if ((event.target as HTMLInputElement).disabled) return;
  emit('update:modelValue', (event.target as HTMLInputElement).checked);
};
</script>

<style scoped>
.base-switch {
  display: inline-flex;
  align-items: center;
  position: relative;
  font-size: 14px;
  line-height: 20px;
  height: 20px;
  vertical-align: middle;
  cursor: pointer;
}

.base-switch.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.base-switch__original {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  margin: 0;
}

.base-switch__core {
  margin: 0;
  display: inline-block;
  position: relative;
  width: 40px;
  height: 20px;
  border: 1px solid var(--c-border-base);
  outline: none;
  border-radius: 10px;
  box-sizing: border-box;
  background: var(--c-fill-base);
  cursor: pointer;
  transition: border-color var(--duration-base), background-color var(--duration-base);
}

.base-switch__core::after {
  content: "";
  position: absolute;
  top: 1px;
  left: 1px;
  border-radius: 100%;
  transition: all var(--duration-base);
  width: 16px;
  height: 16px;
  background-color: #fff;
}

.is-checked .base-switch__core {
  background-color: var(--c-primary);
  border-color: var(--c-primary);
}

.is-checked .base-switch__core::after {
  left: 100%;
  margin-left: -17px;
}
</style>

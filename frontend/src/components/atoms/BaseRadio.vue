<template>
  <label :class="['base-radio', { 'is-disabled': disabled, 'is-checked': modelValue === label }]">
    <span class="base-radio__input">
      <input
        type="radio"
        class="base-radio__original"
        :value="label"
        :checked="modelValue === label"
        :disabled="disabled"
        @change="handleChange"
      />
      <span class="base-radio__inner" />
    </span>
    <span v-if="$slots.default || label" class="base-radio__label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number;
  label: string | number;
  disabled?: boolean;
}

defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const handleChange = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
};
</script>

<style scoped>
.base-radio {
  color: var(--c-text-regular);
  font-weight: 500;
  line-height: 1;
  position: relative;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
  outline: none;
  font-size: 14px;
  margin-right: 30px;
  user-select: none;
}

.base-radio.is-disabled {
  color: var(--c-text-placeholder);
  cursor: not-allowed;
}

.base-radio__input {
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  display: inline-flex;
  position: relative;
}

.base-radio__original {
  opacity: 0;
  outline: none;
  position: absolute;
  z-index: -1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
}

.base-radio__inner {
  border: 1px solid var(--c-border-base);
  border-radius: 50%;
  width: 14px;
  height: 14px;
  background-color: var(--c-background);
  position: relative;
  cursor: pointer;
  display: inline-block;
  box-sizing: border-box;
  transition: all var(--duration-fast) var(--ease-in-out);
}

.base-radio__inner:after {
  width: 4px;
  height: 4px;
  border-radius: 100%;
  background-color: #fff;
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.15s ease-in;
}

.is-checked .base-radio__inner {
  border-color: var(--c-primary);
  background: var(--c-primary);
}

.is-checked .base-radio__inner:after {
  transform: translate(-50%, -50%) scale(1);
}

.base-radio__label {
  padding-left: 10px;
  line-height: 1;
  font-size: inherit;
}
</style>

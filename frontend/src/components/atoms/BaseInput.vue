<template>
  <div :class="['base-input__wrapper', { 'is-disabled': disabled }]">
    <input
      :type="showPassword ? 'text' : type"
      class="base-input__inner"
      :value="modelValue"
      :disabled="disabled"
      @input="handleInput"
      v-bind="$attrs"
    />
    <span v-if="clearable && modelValue" class="base-input__suffix" @click="clearInput">
      <i class="fas fa-times-circle" />
    </span>
    <span v-if="type === 'password' && togglePassword" class="base-input__suffix" @click="toggleShowPassword">
      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'" />
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  modelValue: string | number;
  type?: 'text' | 'password' | 'number';
  disabled?: boolean;
  clearable?: boolean;
  togglePassword?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
});

const emit = defineEmits(['update:modelValue']);

const showPassword = ref(false);

const handleInput = (event: Event) => {
  emit('update:modelValue', (event.target as HTMLInputElement).value);
};

const clearInput = () => {
  emit('update:modelValue', '');
};

const toggleShowPassword = () => {
  showPassword.value = !showPassword.value;
};

watch(() => props.type, () => {
  showPassword.value = false;
});

</script>

<style scoped>
.base-input__wrapper {
  position: relative;
  display: inline-block;
  width: 100%;
}

.base-input__inner {
  -webkit-appearance: none;
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
  padding: 0 15px;
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}

.base-input__inner:focus {
  outline: none;
  border-color: var(--c-primary);
}

.is-disabled .base-input__inner {
  background-color: var(--c-fill-light);
  border-color: var(--c-border-light);
  color: var(--c-text-placeholder);
  cursor: not-allowed;
}

.base-input__suffix {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: var(--c-text-secondary);
}
</style>

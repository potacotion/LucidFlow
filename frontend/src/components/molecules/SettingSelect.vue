<template>
  <BaseGrid :cols="2" gap="base" class="items-center">
    <BaseText>{{ label }}</BaseText>
    <BaseSelect
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="val => emit('update:modelValue', val)"
    >
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </BaseSelect>
  </BaseGrid>
</template>

<script setup lang="ts">
import { BaseGrid, BaseText, BaseSelect } from '@/components/atoms';

interface Option {
  label: string;
  value: string | number;
}

interface Props {
  modelValue: string | number;
  label: string;
  options: Option[];
  disabled?: boolean;
}

defineProps<Props>();
const emit = defineEmits(['update:modelValue']);
</script>

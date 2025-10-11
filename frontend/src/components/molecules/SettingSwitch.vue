<template>
  <BaseGrid :cols="2" gap="base" class="items-center">
    <BaseText>{{ label }}</BaseText>
    <BaseSwitch
      :model-value="modelValue"
      :disabled="disabled"
      @update:model-value="val => emit('update:modelValue', val)"
    />
  </BaseGrid>
</template>

<script setup lang="ts">
import { BaseGrid, BaseText, BaseSwitch } from '@/components/atoms';

interface Props {
  modelValue: boolean;
  label: string;
  disabled?: boolean;
}

defineProps<Props>();
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="base-tabs">
    <div class="base-tabs__header">
      <slot />
    </div>
    <div class="base-tabs__content">
      <slot name="content" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { provide, ref } from 'vue';

interface Props {
  modelValue: string | number;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

const activeTab = ref(props.modelValue);

provide('activeTab', activeTab);
provide('selectTab', (name: string | number) => {
  activeTab.value = name;
  emit('update:modelValue', name);
});
</script>

<style>
.base-tabs__header {
  display: flex;
  border-bottom: 2px solid var(--c-border-light);
  position: relative;
}
</style>

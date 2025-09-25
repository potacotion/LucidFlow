<template>
  <div
    class="base-tab"
    :class="{ 'is-active': isActive }"
    @click="handleClick"
  >
    {{ label }}
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue';

interface Props {
  name: string | number;
  label: string;
}

const props = defineProps<Props>();

const activeTab = inject<Ref<string | number>>('activeTab');
const selectTab = inject<(name: string | number) => void>('selectTab');

const isActive = computed(() => activeTab?.value === props.name);

const handleClick = () => {
  if (selectTab) {
    selectTab(props.name);
  }
};
</script>

<style scoped>
.base-tab {
  padding: 10px 20px;
  cursor: pointer;
  position: relative;
  font-size: var(--font-size-base);
  color: var(--c-text-secondary);
  transition: color var(--duration-base);
}

.base-tab.is-active {
  color: var(--c-primary);
  font-weight: 500;
}

.base-tab.is-active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--c-primary);
  transition: all var(--duration-base);
}
</style>

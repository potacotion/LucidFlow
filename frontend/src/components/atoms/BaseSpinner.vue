<template>
  <div class="base-spinner" :style="spinnerStyle"></div>
</template>

<script setup lang="ts">
import { computed, type StyleValue } from 'vue';

type Size = 'sm' | 'base' | 'lg';

interface Props {
  size?: Size;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'base',
  color: 'var(--c-primary)',
});

const sizeMap = {
  sm: '20px',
  base: '30px',
  lg: '40px',
};

const spinnerStyle = computed(() => {
  const s = sizeMap[props.size];
  const styles: StyleValue = {
    width: s,
    height: s,
    borderColor: `${props.color} transparent transparent transparent`,
  };
  return styles;
});
</script>

<style scoped>
.base-spinner {
  border-radius: 50%;
  border-width: 3px;
  border-style: solid;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

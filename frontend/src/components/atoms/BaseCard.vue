<template>
  <div class="base-card" :style="cardStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, type StyleValue } from 'vue';

type Shadow = 'base' | 'light' | 'dark' | 'none';
type Radius = 'sm' | 'base' | 'lg' | 'none';
type Padding = 'sm' | 'base' | 'lg' | 'none';

interface Props {
  shadow?: Shadow;
  radius?: Radius;
  padding?: Padding;
}

const props = withDefaults(defineProps<Props>(), {
  shadow: 'light',
  radius: 'base',
  padding: 'base',
});

const cardStyle = computed(() => {
  const styles: StyleValue = {
    boxShadow: props.shadow !== 'none' ? `0 2px 12px 0 var(--c-shadow-${props.shadow})` : 'none',
    borderRadius: props.radius !== 'none' ? `var(--radius-${props.radius})` : '0',
    padding: props.padding !== 'none' ? `var(--sp-${props.padding})` : '0',
  };
  return styles;
});
</script>

<style scoped>
.base-card {
  background-color: var(--c-background);
  border: 1px solid var(--c-border-light);
  transition: all var(--duration-base);
}
</style>

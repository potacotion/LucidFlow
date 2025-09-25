<template>
  <i :class="['base-icon', iconClass]" :style="iconStyles" />
</template>

<script setup lang="ts">
import { computed, type StyleValue } from 'vue';

type Size = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

interface Props {
  icon: string;
  size?: Size;
  color?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'base',
});

const iconClass = computed(() => {
  // Assuming Font Awesome is used, e.g., 'fas fa-user'
  return props.icon;
});

const getSizeValue = (size: Size) => {
  return `var(--font-size-${size})`;
}

const iconStyles = computed(() => {
  const styles: StyleValue = {
    fontSize: getSizeValue(props.size),
    color: props.color || 'currentColor',
    width: getSizeValue(props.size),
    height: getSizeValue(props.size),
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  return styles;
});
</script>

<style scoped>
.base-icon {
  transition: color var(--duration-base);
}
</style>

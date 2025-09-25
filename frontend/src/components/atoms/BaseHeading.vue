<template>
  <component :is="tag" class="base-heading" :style="headingStyles">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs, type StyleValue } from 'vue';

type Level = 1 | 2 | 3 | 4 | 5 | 6;
type Color = 'primary' | 'regular' | 'secondary' | 'placeholder' | 'danger' | 'warning' | 'success' | 'info';

interface Props {
  level?: Level;
  color?: Color | string;
}

const props = withDefaults(defineProps<Props>(), {
  level: 1,
  color: 'primary',
});

const attrs = useAttrs();

const tag = computed(() => `h${props.level}`);

const getColorValue = (color: string) => {
  const colorMap: Record<Color, string> = {
    primary: 'var(--c-text-primary)',
    regular: 'var(--c-text-regular)',
    secondary: 'var(--c-text-secondary)',
    placeholder: 'var(--c-text-placeholder)',
    danger: 'var(--c-danger)',
    warning: 'var(--c-warning)',
    success: 'var(--c-success)',
    info: 'var(--c-info)',
  };
  return colorMap[color as Color] || color;
}

const headingStyles = computed(() => {
  const styles: StyleValue = {
    fontSize: `var(--font-size-h${props.level})`,
    color: getColorValue(props.color),
    fontWeight: 'bold',
    margin: 0,
  };

  return { ...styles, ...(attrs.style as object) };
});
</script>

<style scoped>
.base-heading {
  transition: color var(--duration-base);
}
</style>

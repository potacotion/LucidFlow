<template>
  <component :is="tag" class="base-text" :style="textStyles">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs, type StyleValue } from 'vue';

type Size = 'xs' | 'sm' | 'base' | 'lg' | 'xl';
type Color = 'primary' | 'regular' | 'secondary' | 'placeholder' | 'danger' | 'warning' | 'success' | 'info';
type Weight = 'normal' | 'bold' | 'bolder' | 'lighter' | number;

interface Props {
  tag?: string;
  size?: Size;
  color?: Color | string;
  weight?: Weight;
  lineHeight?: number | string;
  truncate?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  tag: 'span',
  size: 'base',
  color: 'regular',
});

const attrs = useAttrs();

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

const textStyles = computed(() => {
  const styles: StyleValue = {
    fontSize: `var(--font-size-${props.size})`,
    color: getColorValue(props.color),
    fontWeight: props.weight,
    lineHeight: props.lineHeight,
  };

  if (props.truncate) {
    styles.overflow = 'hidden';
    styles.textOverflow = 'ellipsis';
    styles.whiteSpace = 'nowrap';
  }

  return { ...styles, ...(attrs.style as object) };
});
</script>

<style scoped>
.base-text {
  transition: color var(--duration-base);
}
</style>

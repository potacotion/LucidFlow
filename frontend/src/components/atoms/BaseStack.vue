<template>
  <div class="base-stack" :style="stackStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs, type StyleValue } from 'vue';

type Spacing = 'xxs' | 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | 'xxl' | 'none';
type Direction = 'row' | 'column';
type Align = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
type Justify = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';

interface Props {
  /** @deprecated use `gap` instead */
  spacing?: Spacing;
  gap?: Spacing;
  padding?: Spacing;
  direction?: Direction;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  direction: 'column',
  gap: 'base',
  padding: 'none',
  wrap: false,
});

const attrs = useAttrs();

const getSpacingValue = (spacing?: Spacing) => {
  if (!spacing || spacing === 'none') return '0';
  return `var(--sp-${spacing})`;
};

const stackStyles = computed(() => {
  const styles: StyleValue = {
    display: 'flex',
    flexDirection: props.direction,
    // `spacing` is kept for backward compatibility. `gap` is preferred.
    gap: getSpacingValue(props.spacing || props.gap),
    padding: getSpacingValue(props.padding),
    alignItems: props.align,
    justifyContent: props.justify,
    flexWrap: props.wrap ? 'wrap' : 'nowrap',
  };

  return { ...styles, ...(attrs.style as object) };
});
</script>

<template>
  <div class="base-grid" :style="gridStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs, type StyleValue } from 'vue';

type Spacing = 'xxs' | 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | 'xxl' | 'none';
type Align = 'start' | 'center' | 'end' | 'stretch' | 'baseline';
type Justify = 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';

interface Props {
  gap?: Spacing;
  colGap?: Spacing;
  rowGap?: Spacing;
  cols?: number | string;
  rows?: number | string;
  align?: Align;
  justify?: Justify;
}

const props = defineProps<Props>();
const attrs = useAttrs();

const getSpacingValue = (spacing?: Spacing) => {
  if (!spacing || spacing === 'none') return '0';
  return `var(--sp-${spacing})`;
};

const getTemplateValue = (value?: number | string) => {
  if (typeof value === 'number') {
    return `repeat(${value}, minmax(0, 1fr))`;
  }
  return value;
}

const gridStyles = computed(() => {
  const styles: StyleValue = {
    display: 'grid',
    gap: getSpacingValue(props.gap),
    gridColumnGap: getSpacingValue(props.colGap),
    gridRowGap: getSpacingValue(props.rowGap),
    alignItems: props.align,
    justifyItems: props.justify,
    gridTemplateColumns: getTemplateValue(props.cols),
    gridTemplateRows: getTemplateValue(props.rows),
  };

  return { ...styles, ...(attrs.style as object) };
});
</script>

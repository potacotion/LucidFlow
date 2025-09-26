<template>
  <div :class="boxClasses" :style="boxStyles">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';

type Spacing = 'xxs' | 'xs' | 'sm' | 'base' | 'md' | 'lg' | 'xl' | 'xxl' | 'none';
type Radius = 'sm' | 'base' | 'lg' | 'circle' | 'none';

interface Props {
  p?: Spacing;
  px?: Spacing;
  py?: Spacing;
  pt?: Spacing;
  pr?: Spacing;
  pb?: Spacing;
  pl?: Spacing;
  m?: Spacing;
  mx?: Spacing;
  my?: Spacing;
  mt?: Spacing;
  mr?: Spacing;
  mb?: Spacing;
  ml?: Spacing;
  radius?: Radius;
  bg?: string; // e.g., 'var(--c-background-overlay)'
  shadow?: string; // e.g., 'var(--c-shadow-base)'
}

const props = defineProps<Props>();
const attrs = useAttrs();

const getSpacingValue = (spacing?: Spacing) => {
  if (!spacing || spacing === 'none') return '0';
  return `var(--sp-${spacing})`;
};

const getRadiusValue = (radius?: Radius) => {
  if (!radius || radius === 'none') return '0';
  return `var(--radius-${radius})`;
};

const boxStyles = computed(() => {
  const styles: Record<string, string> = {};

  if (props.p) styles.padding = getSpacingValue(props.p);
  if (props.px) {
    styles.paddingLeft = getSpacingValue(props.px);
    styles.paddingRight = getSpacingValue(props.px);
  }
  if (props.py) {
    styles.paddingTop = getSpacingValue(props.py);
    styles.paddingBottom = getSpacingValue(props.py);
  }
  if (props.pt) styles.paddingTop = getSpacingValue(props.pt);
  if (props.pr) styles.paddingRight = getSpacingValue(props.pr);
  if (props.pb) styles.paddingBottom = getSpacingValue(props.pb);
  if (props.pl) styles.paddingLeft = getSpacingValue(props.pl);

  if (props.m) styles.margin = getSpacingValue(props.m);
  if (props.mx) {
    styles.marginLeft = getSpacingValue(props.mx);
    styles.marginRight = getSpacingValue(props.mx);
  }
  if (props.my) {
    styles.marginTop = getSpacingValue(props.my);
    styles.marginBottom = getSpacingValue(props.my);
  }
  if (props.mt) styles.marginTop = getSpacingValue(props.mt);
  if (props.mr) styles.marginRight = getSpacingValue(props.mr);
  if (props.mb) styles.marginBottom = getSpacingValue(props.mb);
  if (props.ml) styles.marginLeft = getSpacingValue(props.ml);

  if (props.radius) styles.borderRadius = getRadiusValue(props.radius);
  if (props.bg) styles.backgroundColor = props.bg;
  if (props.shadow) styles.boxShadow = props.shadow;

  return { ...styles, ...(attrs.style as object) };
});

const boxClasses = computed(() => ['base-box', attrs.class]);
</script>

<style scoped>
.base-box {
  box-sizing: border-box;
}
</style>

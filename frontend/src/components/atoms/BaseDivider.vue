<template>
  <div
    class="base-divider"
    :class="[`base-divider--${direction}`]"
  ></div>
</template>

<script setup lang="ts">
type Direction = 'horizontal' | 'vertical';

interface Props {
  direction?: Direction;
}

withDefaults(defineProps<Props>(), {
  direction: 'horizontal',
});
</script>

<style scoped>
.base-divider {
  background-color: var(--c-border);
}

.base-divider--horizontal {
  display: block;
  height: 1px;
  width: 100%;
  margin: 24px 0;
}

.base-divider--vertical {
  display: inline-block;
  width: 1px;
  height: 1em;
  margin: 0 8px;
  vertical-align: middle;
  position: relative;
}
</style>

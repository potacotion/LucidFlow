<template>
  <div class="base-badge">
    <slot />
    <sup
      v-if="!hidden"
      class="base-badge__content"
      :class="{ 'is-dot': dot }"
    >
      {{ content }}
    </sup>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  value?: number | string;
  max?: number;
  dot?: boolean;
  hidden?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  max: 99,
});

const content = computed(() => {
  if (props.dot) return '';
  if (typeof props.value === 'number' && props.value > props.max) {
    return `${props.max}+`;
  }
  return props.value;
});
</script>

<style scoped>
.base-badge {
  position: relative;
  display: inline-block;
  vertical-align: middle;
}

.base-badge__content {
  background-color: var(--c-danger);
  border-radius: 10px;
  color: #fff;
  display: inline-flex;
  font-size: 12px;
  height: 18px;
  line-height: 18px;
  padding: 0 6px;
  text-align: center;
  white-space: nowrap;
  border: 1px solid var(--c-background);
  position: absolute;
  top: 0;
  right: 10px;
  transform: translateY(-50%) translateX(100%);
}

.base-badge__content.is-dot {
  height: 8px;
  width: 8px;
  padding: 0;
  right: 5px;
  border-radius: 50%;
}
</style>

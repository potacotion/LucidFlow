<template>
  <div class="base-tooltip" @mouseenter="show" @mouseleave="hide">
    <slot />
    <transition name="fade">
      <div v-if="visible" class="base-tooltip__popper" :style="popperStyle">
        {{ content }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, type StyleValue } from 'vue';

type Placement = 'top' | 'bottom' | 'left' | 'right';

interface Props {
  content: string;
  placement?: Placement;
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'top',
});

const visible = ref(false);

const show = () => {
  visible.value = true;
};
const hide = () => {
  visible.value = false;
};

const popperStyle = computed(() => {
  const styles: StyleValue = {};
  // A simple implementation. A real one would need a library like Popper.js for robustness.
  switch (props.placement) {
    case 'bottom':
      styles.top = '100%';
      styles.left = '50%';
      styles.transform = 'translateX(-50%)';
      break;
    case 'left':
      styles.top = '50%';
      styles.right = '100%';
      styles.transform = 'translateY(-50%)';
      break;
    case 'right':
      styles.top = '50%';
      styles.left = '100%';
      styles.transform = 'translateY(-50%)';
      break;
    case 'top':
    default:
      styles.bottom = '100%';
      styles.left = '50%';
      styles.transform = 'translateX(-50%)';
      break;
  }
  return styles;
});
</script>

<style scoped>
.base-tooltip {
  position: relative;
  display: inline-block;
}

.base-tooltip__popper {
  position: absolute;
  z-index: 100;
  padding: 8px 12px;
  background-color: var(--c-text-primary);
  color: var(--c-background);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-fast);
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

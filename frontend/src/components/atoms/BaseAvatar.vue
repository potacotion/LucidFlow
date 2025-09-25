<template>
  <span :class="['base-avatar', `base-avatar--${size}`]" :style="avatarStyle">
    <img v-if="src" :src="src" @error="handleError" />
    <span v-else-if="$slots.default" class="base-avatar__text">
      <slot />
    </span>
  </span>
</template>

<script setup lang="ts">
import { ref, computed, type StyleValue } from 'vue';

type Size = 'sm' | 'md' | 'lg';

interface Props {
  size?: Size;
  src?: string;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
});

const hasError = ref(false);

const handleError = () => {
  hasError.value = true;
};

const sizeMap = {
  sm: '32px',
  md: '40px',
  lg: '48px',
};

const avatarStyle = computed(() => {
  const s = sizeMap[props.size];
  const styles: StyleValue = {
    width: s,
    height: s,
    lineHeight: s,
  };
  return styles;
});
</script>

<style scoped>
.base-avatar {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: var(--c-fill-light);
  color: var(--c-text-secondary);
  font-size: 14px;
  overflow: hidden;
  vertical-align: middle;
}

.base-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.base-avatar__text {
  transform: scale(0.9);
}
</style>

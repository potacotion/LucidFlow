<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue';

type Size = 'sm' | 'base' | 'lg' | 'xl';

interface Props {
  size?: Size;
  disabled?: boolean;
  round?: boolean;
  circle?: boolean;
  square?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'base',
});
</script>

<template>
  <BaseButton
    v-bind="{ ...props, ...$attrs }"
    variant="text"
    class="immersive-button"
  >
    <slot />
  </BaseButton>
</template>

<style scoped>
.immersive-button {
  color: var(--c-text-primary);
  transition: color 150ms ease-in-out, background-color 150ms ease-in-out;
  /* border: 1px solid var(--c-border-base); */
}

.immersive-button:hover,
.immersive-button:focus {
  color: var(--c-primary);
}


</style>

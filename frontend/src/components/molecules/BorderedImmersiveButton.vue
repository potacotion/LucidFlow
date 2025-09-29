<script setup lang="ts">
import ImmersiveButton from '@/components/molecules/ImmersiveButton.vue';

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
  <ImmersiveButton
    v-bind="{ ...props, ...$attrs }"
    class="bordered-immersive-button"
  >
    <slot />
  </ImmersiveButton>
</template>

<style scoped>
.bordered-immersive-button {
  border: 1px solid var(--c-border-base);
  border-radius: var(--radius-base);
  padding: 6px 10px;
}

.bordered-immersive-button:hover,
.bordered-immersive-button:focus {
  /* background-color: var(--c-fill-lighter); */
  border-color: var(--c-border-base);
}
</style>

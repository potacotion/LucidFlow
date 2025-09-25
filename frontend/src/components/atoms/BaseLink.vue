<template>
  <component
    :is="tag"
    class="base-link"
    :class="[`base-link--${variant}`]"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info';

interface Props {
  as?: 'a' | 'router-link';
  variant?: Variant;
}

const props = withDefaults(defineProps<Props>(), {
  as: 'a',
  variant: 'primary',
});

const tag = computed(() => {
  return props.as === 'router-link' ? RouterLink : 'a';
});

</script>

<style scoped>
.base-link {
  cursor: pointer;
  text-decoration: none;
  transition: color var(--duration-base);
}

.base-link:hover {
  text-decoration: underline;
}

.base-link--primary {
  color: var(--c-primary);
}
.base-link--secondary {
  color: var(--c-text-secondary);
}
.base-link--success {
  color: var(--c-success);
}
.base-link--warning {
  color: var(--c-warning);
}
.base-link--danger {
  color: var(--c-danger);
}
.base-link--info {
  color: var(--c-info);
}
</style>

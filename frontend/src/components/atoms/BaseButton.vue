<template>
  <button :class="buttonClasses" v-tooltip="tooltip" v-bind="$attrs">
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'text';
type Size = 'sm' | 'base' | 'lg' | 'xl';

interface Props {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  plain?: boolean;
  round?: boolean;
  circle?: boolean;
  square?: boolean;
  tooltip?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'base',
  tooltip: '',
});

const buttonClasses = computed(() => [
  'base-button',
  `base-button--${props.variant}`,
  `base-button--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-plain': props.plain,
    'is-round': props.round,
    'is-circle': props.circle,
    'is-square': props.square,
  },
]);
</script>

<style scoped>
.base-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  height: 32px;
  white-space: nowrap;
  cursor: pointer;
  color: var(--c-text-primary);
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin: 0;
  transition: 0.1s;
  font-weight: 500;
  user-select: none;
  vertical-align: middle;
  -webkit-appearance: none;
  border: 1px solid var(--c-border-base);
  background-color: var(--c-background);
  padding: 8px 15px;
  font-size: var(--font-size-base);
  border-radius: var(--radius-sm);
}

.base-button:hover,
.base-button:focus {
  opacity: 0.8;
}

.base-button:active {
  opacity: 1;
}

/* Sizes */
/* Default size for circle/square */
.base-button.is-circle,
.base-button.is-square {
    width: 32px;
    padding: 0;
}

.base-button--xl {
  height: 48px;
  padding: 14px 22px;
  font-size: var(--font-size-xl);
}
.base-button--xl.is-circle,
.base-button--xl.is-square {
    width: 48px;
    padding: 0;
}

.base-button--lg {
  height: 40px;
  padding: 12px 19px;
  font-size: var(--font-size-lg);
}
.base-button--lg.is-circle,
.base-button--lg.is-square {
  width: 40px;
  padding: 0;
}

.base-button--sm {
  height: 24px;
  padding: 5px 11px;
  font-size: var(--font-size-xs);
}
.base-button--sm.is-circle,
.base-button--sm.is-square {
  width: 24px;
  padding: 0;
}

/* Variants */
.base-button--primary {
  color: #fff;
  background-color: var(--c-primary);
  border-color: var(--c-primary);
}
.base-button--secondary {
  color: var(--c-primary);
  background-color: var(--c-fill-light);
  border-color: var(--c-border-light);
}
.base-button--success {
  color: #fff;
  background-color: var(--c-success);
  border-color: var(--c-success);
}
.base-button--warning {
  color: #fff;
  background-color: var(--c-warning);
  border-color: var(--c-warning);
}
.base-button--danger {
  color: #fff;
  background-color: var(--c-danger);
  border-color: var(--c-danger);
}
.base-button--info {
  color: #fff;
  background-color: var(--c-info);
  border-color: var(--c-info);
}
.base-button--text {
  border-color: transparent;
  background-color: transparent;
  padding-left: 0;
  padding-right: 0;
}
.base-button--text:hover,
.base-button--text:focus {
  color: var(--c-primary);
  border-color: transparent;
  background-color: transparent;
}


/* Disabled */
.is-disabled,
.is-disabled:hover {
  color: var(--c-text-placeholder);
  cursor: not-allowed;
  background-image: none;
  background-color: var(--c-fill-light);
  border-color: var(--c-border-light);
  opacity: 1;
}

/* Round */
.is-round {
  border-radius: var(--radius-circle);
}

/* Circle */
.is-circle {
  border-radius: 50%;
}

/* Square */
.is-square {
  border-radius: 0;
}
</style>

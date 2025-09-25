<template>

  <router-view/>

</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';

// Initialize the theme
useTheme();
</script>

<style>
#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>

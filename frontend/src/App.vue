<template>

  <router-view/>

</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useConfigStore } from '@/stores/config.store';

// Initialize the theme
useTheme();

const configStore = useConfigStore();

onMounted(() => {
  configStore.fetchConfig();
});
</script>

<style>
#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>

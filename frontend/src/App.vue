<template>

  <router-view/>

</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useTheme } from '@/composables/useTheme';
import { useConfigStore } from '@/stores/config.store';
import { useNodeStore } from '@/stores/node.store';

// Initialize the theme
useTheme();

const configStore = useConfigStore();
const nodeStore = useNodeStore();

onMounted(() => {
  configStore.fetchConfig();
  nodeStore.fetchAllNodeDefinitions();
});
</script>

<style>
#app {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}
</style>

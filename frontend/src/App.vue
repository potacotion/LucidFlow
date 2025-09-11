<template>

  <router-view/>

</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar.vue';
function test() {
  console.log('测试按钮点击')
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

#app {
  height: 100vh;
}
</style>

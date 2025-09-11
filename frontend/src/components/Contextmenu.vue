<template>
  <!-- 遮罩层：点空白关闭 -->
  <div
    v-if="visible"
    class="ctx-mask"
    @click="close"
    @contextmenu.prevent
  >
    <!-- 菜单本体 -->
    <div
      class="ctx-body"
      :style="{ left: x + 'px', top: y + 'px' }"
      @click.stop
    >
      <slot :close="close" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean; x: number; y: number }>()
const emit = defineEmits<{ (e: 'update:visible', v: boolean): void }>()
const close = () => emit('update:visible', false)
</script>

<style scoped>
.ctx-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
}
.ctx-body {
  position: absolute;
  background: #fff;
  border: 1px solid #e4e4e4;
  border-radius: 4px;
  padding: 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>

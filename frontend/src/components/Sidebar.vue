<template>
  <!-- template 部分和 style 部分与上一版完全相同，无需改动 -->
  <i
    class="fa-solid fa-angle-right"
    :class="{
      'fixed-circle': true,
      'rotated': isSidebarOpen,
      'open-style': isSidebarOpen,
      'closed-style': !isSidebarOpen
    }"
    :style="{ left: buttonLeft }"
    @click="toggleStatus"
  ></i>

  <div class="sidebar-content" :style="{ width: barwidth }">
    <slot />
  </div>
</template>

<script setup lang="ts">
// Script 部分与原版完全相同，无需改动
import { ref, computed } from 'vue';

const SIDEBAR_WIDTH = '30vw';
const BUTTON_WIDTH_PX = 36; // 按钮的宽度 (单位：像素)
const BUTTON_OFFSET_CLOSED = '12px'; // 关闭时按钮的偏移量

const isSidebarOpen = ref(false);

const barwidth = computed(() => {
  return isSidebarOpen.value ? SIDEBAR_WIDTH : '0';
});

const buttonLeft = computed(() => {
  if (isSidebarOpen.value) {
    return `calc(${SIDEBAR_WIDTH} - ${BUTTON_WIDTH_PX + 12 }px)`;
  } else {
    return BUTTON_OFFSET_CLOSED;
  }
});

function toggleStatus() {
  isSidebarOpen.value = !isSidebarOpen.value;
}
</script>

<style scoped>
/* --- 改动部分开始 --- */

.fixed-circle {
  position: fixed;
  top: 12px;
  z-index: 9999;
  width: 36px;
  height: 36px;
  line-height: 36px;
  text-align: center;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
  /* 扩展了 transition 属性，使其包含背景和颜色的平滑过渡 */
  transition: left .35s ease, transform .35s ease, background-color .35s ease, color .35s ease;
}

/* 新增：关闭状态的样式 (白色背景, 灰色图标) */
.fixed-circle.closed-style {
  background: #ffffff;
  color: #333; /* 灰色 */
  box-shadow: 0 2px 6px rgba(0,0,0,.2);
}

/* 新增：展开状态的样式 (背景透明, 灰色图标) */
.fixed-circle.open-style {
  background: transparent;
  color: #808080; /* 灰色 */
  box-shadow: none; /* 展开后移除阴影 */
}

/* --- 改动部分结束 --- */

.fixed-circle.rotated {
  transform: rotate(180deg);
}

.sidebar-content {
  position: fixed;
  padding-top: 48px;
  top: 0px;
  left: 0px;
  height: 100vh;
  z-index: 9998;
  background: whitesmoke;
  overflow: hidden;
  transition: width .35s ease;
}

.sidebar-content h2,
.sidebar-content ul {
  opacity: 0;
  transition: opacity .2s ease-in-out;
}

.sidebar-content[style*="width: 20vw"] h2,
.sidebar-content[style*="width: 20vw"] ul {
  opacity: 1;
  transition-delay: .2s;
}
</style>

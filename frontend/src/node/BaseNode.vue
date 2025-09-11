<template>
  <div class="base-node">

    <div class="title">{{ data.label || 'Node' }}</div>
    <div class="ports">
      <div class="col-input">
        <span v-for="(p, i) in input" :key="'in-' + i" class="text-port-input">
          {{ p.name }}:{{ p.data }}
          <Handle :id="'in-' + p.name" type="target" :position="Position.Left"
            :style="{ backgroundColor: stringToColor(p.name).hsl }" :is-valid-connection="isValidConnection" />
        </span>
      </div>

      <div class="col-output">
        <span v-for="(p, i) in output" :key="'out-' + i" class="text-port-output">
          {{ p.name }}:{{ p.data }}
          <Handle :id="'out-' + p.name" type="source" :position="Position.Right"
            :style="{ backgroundColor: stringToColor(p.name).hsl }" :is-valid-connection="isValidConnection" />
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
// 从新位置导入
import { stringToColor } from '@/utils/color' // <-- 路径根据你的项目结构调整

interface Port {
  name: string
  data: any
}
interface NodeData {
  label?: string
  input?: Port[]
  output?: Port[]
}

const props = defineProps<{ data: NodeData }>()

const input = props.data.input || []
const output = props.data.output || []

// `stringToColor` 函数已经移走

import type { ValidConnectionFunc } from '@vue-flow/core'

const isValidConnection: ValidConnectionFunc = (connection) => {
  if (connection.source === connection.target) return false

  const srcKey = connection.sourceHandle?.replace(/^out-/, '')
  const tgtKey = connection.targetHandle?.replace(/^in-/, '')

  return srcKey === tgtKey
}
</script>

<style scoped>
/* ========= 最外层节点外壳 ========= */
.base-node {
  display: flex;
  flex-direction: column;
  padding: 0;
  min-width: 160px;
  border-radius: 12px;
  overflow: hidden;
  /* border: 1px solid #414141; */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  background-color: white;
}

/* ========= 标题区 ========= */
.title {
  padding: 8px 12px;
  background: #fafafa;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
}

/* ========= 端口区 ========= */
.ports {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 12px 16px;
}

/* ========= 左列 / 右列 ========= */
.col-input,
.col-output {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  flex: 1;
}

/* ========= 单个端口行 ========= */
.text-port-input,
.text-port-output {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  padding-left: 10px;
  padding-right: 10px;
}

/* ========= 文字颜色 ========= */
.text-port-input {
  color: #333;
}

.text-port-output {
  color: #333;
}

/* 👇 注意：Vue Flow 的 Handle 默认样式可能会覆盖你的颜色，
   如果颜色不生效，可以加上 !important 来提高优先级。 */
.vue-flow__handle {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  border: 1px solid white !important;
}
</style>

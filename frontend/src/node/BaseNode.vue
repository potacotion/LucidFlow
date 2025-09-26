<template>
  <div class="base-node">
    <div class="title">{{ data.label || 'Node' }}</div>

    <div class="ports-container">
      <!-- Control Flow Ports -->
      <div v-if="hasControlPorts" class="ports ports-control">
        <div class="col-input">
          <span v-for="(p, i) in controlInputs" :key="'in-ctrl-' + i" class="text-port-input">
            {{ p.name }}
            <Handle :id="'in-' + p.name + '-' + p.dataType" type="target" :position="Position.Left"
              :style="{ backgroundColor: stringToColor(p.dataType).hsl }" :is-valid-connection="isValidConnection" />
          </span>
        </div>
        <div class="col-output">
          <span v-for="(p, i) in controlOutputs" :key="'out-ctrl-' + i" class="text-port-output">
            {{ p.name }}
            <Handle :id="'out-' + p.name + '-' + p.dataType" type="source" :position="Position.Right"
              :style="{ backgroundColor: stringToColor(p.dataType).hsl }" :is-valid-connection="isValidConnection" />
          </span>
        </div>
      </div>

      <!-- Divider -->
      <div v-if="hasControlPorts && hasDataPorts" class="divider"></div>

      <!-- Data Flow Ports -->
      <div v-if="hasDataPorts" class="ports ports-data">
        <div class="col-input">
          <span v-for="(p, i) in dataInputs" :key="'in-data-' + i" class="text-port-input">
            {{ p.name }}:{{ p.data }}
            <Handle :id="'in-' + p.name + '-' + p.dataType" type="target" :position="Position.Left"
              :style="{ backgroundColor: stringToColor(p.dataType).hsl }" :is-valid-connection="isValidConnection" />
          </span>
        </div>
        <div class="col-output">
          <span v-for="(p, i) in dataOutputs" :key="'out-data-' + i" class="text-port-output">
            {{ p.name }}:{{ p.data }}
            <Handle :id="'out-' + p.name + '-' + p.dataType" type="source" :position="Position.Right"
              :style="{ backgroundColor: stringToColor(p.dataType).hsl }" :is-valid-connection="isValidConnection" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
// 从新位置导入
import { stringToColor } from '@/utils/color' // <-- 路径根据你的项目结构调整

interface Port {
  name: string
  type: string // control or data
  dataType: string
  data: any
}
interface NodeData {
  label?: string
  input?: Port[]
  output?: Port[]
}

const props = defineProps<{ data: NodeData }>()

const controlInputs = computed(() => (props.data.input || []).filter(p => p.type === 'control'))
const dataInputs = computed(() => (props.data.input || []).filter(p => p.type === 'data'))
const controlOutputs = computed(() => (props.data.output || []).filter(p => p.type === 'control'))
const dataOutputs = computed(() => (props.data.output || []).filter(p => p.type === 'data'))

const hasControlPorts = computed(() => controlInputs.value.length > 0 || controlOutputs.value.length > 0)
const hasDataPorts = computed(() => dataInputs.value.length > 0 || dataOutputs.value.length > 0)

// `stringToColor` 函数已经移走

import type { ValidConnectionFunc } from '@vue-flow/core'

const isValidConnection: ValidConnectionFunc = (connection) => {
  // 确保不是连接到同一个节点
  if (connection.source === connection.target) return false

  const sourceHandle = connection.sourceHandle || ''
  const targetHandle = connection.targetHandle || ''

  // 确保连接方向是 source -> target
  if (!sourceHandle.startsWith('out-') || !targetHandle.startsWith('in-')) {
    return false
  }

  // 提取并比较数据类型
  const sourceDataType = sourceHandle.split('-').pop()
  const targetDataType = targetHandle.split('-').pop()

  return sourceDataType === targetDataType && sourceDataType !== undefined
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
  box-shadow: 0 0 10px var(--c-shadow-dark);
  background-color: var(--c-background);
}

/* ========= 标题区 ========= */
.title {
  padding: 8px 12px;
  background: var(--c-fill-lighter);
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid var(--c-border-base);
}

/* ========= 端口区 ========= */
.ports-container {
  display: flex;
  flex-direction: column;
}

.ports {
  display: flex;
  align-items: stretch;
  gap: 12px;
  padding: 12px 16px;
}

.divider {
  height: 1px;
  background-color: var(--c-border-light);
  margin: 0 8px;
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
  color: var(--c-text-primary);
}

.text-port-output {
  color: var(--c-text-primary);
}

/* 👇 注意：Vue Flow 的 Handle 默认样式可能会覆盖你的颜色，
   如果颜色不生效，可以加上 !important 来提高优先级。 */
.vue-flow__handle {
  width: 8px !important;
  height: 8px !important;
  border-radius: 50% !important;
  border: 1px solid var(--c-background) !important;
}
</style>

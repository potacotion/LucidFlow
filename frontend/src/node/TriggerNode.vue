<template>
  <div class="base-node" :class="{ 'node-running': isRunning }">
    <div class="title">
      <span>{{ data.label || 'Node' }}</span>
      <BaseIcon
        icon="fa-solid fa-play"
        class="execute-button"
        @click.stop="triggerWorkflow"
      />
    </div>

    <div class="ports-container">
      <!-- Control Flow Ports -->
      <div v-if="hasControlPorts" class="ports ports-control">
        <div class="col-input">
          <span v-for="p in controlInputs" :key="p.name" class="text-port-input">
            <Handle :id="`${p.name}-${id}`" type="target" :position="Position.Left" />
            {{ p.label }}
          </span>
        </div>
        <div class="col-output">
          <span v-for="p in controlOutputs" :key="p.name" class="text-port-output">
            {{ p.label }}
            <Handle :id="`${p.name}-${id}`" type="source" :position="Position.Right" />
          </span>
        </div>
      </div>

      <!-- Divider -->
      <div v-if="hasControlPorts && hasDataPorts" class="divider"></div>

      <!-- Data Flow Ports -->
      <div v-if="hasDataPorts" class="ports ports-data">
        <div class="col-input">
          <span v-for="p in dataInputs" :key="p.name" class="text-port-input">
            <Handle
              :id="`${p.name}-${id}`"
              type="target"
              :position="Position.Left"
              :style="{ backgroundColor: stringToColor(p.dataType || 'any').hsl }"
            />
            {{ p.label }}
          </span>
        </div>
        <div class="col-output">
          <span v-for="p in dataOutputs" :key="p.name" class="text-port-output">
            {{ p.label }}
            <Handle
              :id="`${p.name}-${id}`"
              type="source"
              :position="Position.Right"
              :style="{ backgroundColor: stringToColor(p.dataType || 'any').hsl }"
            />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { stringToColor } from '@/utils/color'
import BaseIcon from '@/components/atoms/BaseIcon.vue'
import type { PortDefinition } from '@/types/workflow'
import { useWorkflowStore } from '@/stores/workflow.store';

interface NodeData {
  label?: string
  input?: PortDefinition[]
  output?: PortDefinition[]
}

const workflowStore = useWorkflowStore()
const isRunning = computed(() => workflowStore.isNodeRunning(props.id))

// Vue Flow injects the node's id as a prop
const props = defineProps<{
  id: string,
  data: NodeData
}>()

const controlInputs = computed(() => (props.data.input || []).filter(p => p.type === 'control'))
const dataInputs = computed(() => (props.data.input || []).filter(p => p.type === 'data'))
const controlOutputs = computed(() => (props.data.output || []).filter(p => p.type === 'control'))
const dataOutputs = computed(() => (props.data.output || []).filter(p => p.type === 'data'))

const hasControlPorts = computed(() => controlInputs.value.length > 0 || controlOutputs.value.length > 0)
const hasDataPorts = computed(() => dataInputs.value.length > 0 || dataOutputs.value.length > 0)

function triggerWorkflow() {
  workflowStore.startExecutionFromNode(props.id);
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
  box-shadow: 0 0 10px var(--c-shadow-dark);
  background-color: var(--c-background);
  --c-primary-rgb: 52, 152, 219;
  border: 2px solid transparent; /* Add transparent border for smooth transition */
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--c-primary-rgb), 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--c-primary-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--c-primary-rgb), 0);
  }
}

.node-running {
  border-color: var(--c-primary);
  animation: pulse 1.5s infinite;
}

/* ========= 标题区 ========= */
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--c-fill-lighter);
  font-weight: 600;
  border-bottom: 1px solid var(--c-border-base);
}

.execute-button {
  color: var(--c-text-placeholder);
  cursor: pointer;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease-in-out;
}

.execute-button:hover {
  color: var(--c-text-primary);
  background-color: var(--c-fill-light);
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

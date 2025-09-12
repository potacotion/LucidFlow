<template>
  <Sidebar>
    <button @click="test">测试按钮</button>
  </Sidebar>
  <VueFlow :nodes="nodes" :edges="edges" class="main-vueflow">
      <Background />

      <template #node-basenode="basenodeProps">
        <basenode v-bind="basenodeProps" />
      </template>
    </VueFlow>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'

import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'

// these components are only shown as examples of how to use a custom node or edge
// you can find many examples of how to create these custom components in the examples page of the docs
import basenode from '@/node/BaseNode.vue'
import { stringToColor } from './utils/color'

const { onConnect, addEdges, project, addNodes } = useVueFlow()

onConnect((connection) => {
  // 守卫子句：如果 sourceHandle 不存在（为 null 或 undefined），则不创建这条边。
  if (!connection.sourceHandle) {
    console.warn('Connection ignored: source handle is missing.', connection)
    return // 提前退出函数
  }

  // --- 只有在 sourceHandle 确定是字符串后，代码才会执行到这里 ---

  // TypeScript 现在知道 connection.sourceHandle 在这里一定是一个 string
  const portName = connection.sourceHandle.replace(/^out-/, '')
  const color = stringToColor(portName).hsl

  const newEdge = {
    ...connection,
    style: {
      stroke: color,
      strokeWidth: 2.5,
    },
    animated: true,
  }

  addEdges(newEdge)
})

// these are our nodes
const nodes = ref<Node[]>([


  {
    id: '1',
    type: 'basenode',
    position: { x: 300, y: 300 },
    data: {
      label: 'My Base Node',
      input: [{ name: 'in1', data: 'data1' }, { name: 'in2', data: 'data2' }],
      output: [{ name: 'out1', data: 'data3' }],
    },

  },
  {
    id: '2',
    type: 'basenode',
    position: { x: 350, y: 350 },
    data: {
      label: 'My Base Node',
      input: [{ name: 'out1', data: 'data1' }, { name: 'llm', data: 'data2' }],
      output: [{ name: 'out1', data: 'data3' }],
    },

  },
])


const edges = ref<Edge[]>([
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    sourceHandle: 'out-out1',
    targetHandle: 'in-out1',
    style: {
      stroke: stringToColor('out1').hsl,
      strokeWidth: 2.5,
    },
    animated: true,
  },
])


import Sidebar from './components/Sidebar.vue';
function test() {
  console.log('测试按钮点击')

  console.log({"nodes": nodes.value, "edges": edges.value})
}
</script>

<style scoped>
.main-vueflow {
  background-color: #FAFAFA;
}
</style>

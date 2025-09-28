<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseStack from '@/components/atoms/BaseStack.vue'
import BaseText from '@/components/atoms/BaseText.vue'
import { NodeDefinitionsService, type NodeDefinition } from '@/api'
import { useWorkflowStore } from '@/stores/workflow.store'
import { BaseToast } from '@/services/toast'
import BaseTreeView from '@/components/molecules/BaseTreeView.vue'
import { buildTreeFromPath } from '@/utils/tree.utils'
import type { TreeNode } from '@/components/molecules/types'

const nodeTree = ref<TreeNode[]>([])
const workflowStore = useWorkflowStore()

onMounted(async () => {
  try {
    const definitions = await NodeDefinitionsService.getApiNodeDefinitions()

    // Filter out definitions with no type and build the tree
    const validDefinitions = definitions.filter(def => def.type);
    nodeTree.value = buildTreeFromPath(
      validDefinitions,
      (item) => item.type!, // We can now safely use non-null assertion
      (item, part) => item.label || part
    )

    // Populate the central store with the fetched definitions
    const definitionsMap = Object.fromEntries(definitions.map(def => [def.type, def]))
    workflowStore.nodeDefinitions = definitionsMap

  } catch (error) {
    BaseToast.error('Failed to fetch node definitions.')
    console.error('Failed to fetch node definitions:', error)
  }
})

const onDragStart = (event: DragEvent, definition: NodeDefinition) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(definition))
    event.dataTransfer.effectAllowed = 'copy'
  }
}

// Drag start is now handled by BaseTreeItem, we just pass the event up
const handleNodeDragStart = (event: DragEvent, node: TreeNode) => {
  // The node from tree is the full NodeDefinition object
  onDragStart(event, node as NodeDefinition);
}

</script>

<template>
  <div class="node-palette">
    <BaseStack vertical spacing="sm" padding="base">
      <BaseText as="h3" size="lg" :weight="600">Nodes</BaseText>
      <BaseTreeView :nodes="nodeTree" @node-drag-start="handleNodeDragStart" />
    </BaseStack>
  </div>
</template>

<style scoped>
.node-palette {
  height: 100%;
  overflow-y: auto;
  background-color: var(--c-fill-light);
  box-shadow: var(--shadow-base);
  border-right: 1px solid var(--c-border-base);
  width: 280px;
}
/* Scoped styles for this component */
</style>

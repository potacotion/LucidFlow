<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseStack from '@/components/atoms/BaseStack.vue'
import BaseText from '@/components/atoms/BaseText.vue'
import type { NodeDefinition } from '@/api'
import BaseTreeView from '@/components/molecules/BaseTreeView.vue'
import type { TreeNode } from '@/components/molecules/types'
import { useNodeStore, getNodeBaseType } from '@/stores/node.store'
import { buildTreeFromPath } from '@/utils/tree.utils'
import BaseTabs from '@/components/atoms/BaseTabs.vue'
import BaseTab from '@/components/atoms/BaseTab.vue'

const nodeStore = useNodeStore()
const activeTab = ref('latest')

// --- Tree for "All Versions" Tab ---
const allVersionsNodeTree = computed<TreeNode[]>(() => {
  // 1. Create a flat list of "base" nodes. Each base node represents the latest
  //    version but carries all its versions in a `versions` property.
  const nodeBases = Object.values(nodeStore.groupedNodeDefinitions).map(group => {
    const latestVersion = group[0]; // Groups are pre-sorted
    const baseType = getNodeBaseType(latestVersion.type!);
    return {
      ...latestVersion, // Drags as the latest version
      id: baseType,     // Unique ID for the tree is the base type
      label: latestVersion.label!,
      isDraggable: true,
      versions: group, // Attach all versions for later processing
    };
  });

  // 2. Build the folder structure from the flat list using the base type as the path.
  const tree = buildTreeFromPath(
    nodeBases,
    item => getNodeBaseType(item.type!),
    item => item.label!
  );

  // 3. Post-process the generated tree to attach version children to the leaf nodes.
  function processNode(node: TreeNode & { versions?: NodeDefinition[] }) {
    // If it's a leaf node that has multiple versions, create children for them.
    if (node.versions && node.versions.length > 1) {
      node.children = node.versions.map(versionDef => ({
        ...versionDef,
        id: versionDef.type!, // Child ID is the full versioned type
        label: `v${versionDef.version}`,
        isDraggable: true,
        children: [] // Version nodes are always leaves
      }));
    }
    // If it's a folder (has children but wasn't a version group), recurse.
    if (node.children && !node.versions) {
      node.children.forEach(processNode);
    }
  }

  tree.forEach(processNode);

  return tree;
});

// --- Tree for "Latest" Tab ---
const latestNodeTree = computed<TreeNode[]>(() => {
  // First, map the raw definitions to TreeNode objects, ensuring each node
  // has a unique ID based on its full versioned type. This is crucial for
  // both Vue's reactivity (v-for key) and for drag-and-drop.
  const nodesAsTreeNodes: TreeNode[] = nodeStore.latestNodeDefinitions.map(def => ({
    ...def,
    id: def.type!, // The unique ID must be the full versioned type.
    label: def.label!,
    isDraggable: true,
  }));

  // Now, build the tree using the base type for the folder path, but passing
  // the fully-formed TreeNode objects.
  return buildTreeFromPath(
    nodesAsTreeNodes,
    item => getNodeBaseType(item.type!), // Use base type for folder structure.
    item => item.label!                  // Use item's label for the node name.
  );
});

// --- Final Tree based on Active Tab ---
const nodeTree = computed(() => {
  return activeTab.value === 'latest' ? latestNodeTree.value : allVersionsNodeTree.value;
});

// Fetch latest definitions when the tab is activated
watch(activeTab, (newTab) => {
  if (newTab === 'latest') {
    nodeStore.fetchLatestNodeDefinitions();
  }
}, { immediate: true });


const onDragStart = (event: DragEvent, definition: NodeDefinition) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('application/json', JSON.stringify(definition))
    event.dataTransfer.effectAllowed = 'copy'
  }
}

const handleNodeDragStart = (event: DragEvent, node: TreeNode) => {
  onDragStart(event, node as NodeDefinition);
}
</script>

<template>
  <div class="node-palette">
    <BaseStack vertical spacing="sm" padding="base">
      <BaseText as="h3" size="lg" :weight="600">Nodes</BaseText>
      <BaseTabs v-model="activeTab">
        <BaseTab name="latest" label="Latest" />
        <BaseTab name="all" label="All Versions" />
      </BaseTabs>
      <div class="tree-view-container">
        <BaseTreeView :nodes="nodeTree" @node-drag-start="handleNodeDragStart" />
      </div>
    </BaseStack>
  </div>
</template>

<style scoped>
.node-palette {
  height: 100%;
  overflow: hidden; /* Prevent double scrollbars */
  display: flex;
  flex-direction: column;
  background-color: var(--c-fill-light);
  box-shadow: var(--shadow-base);
  border-right: 1px solid var(--c-border-base);
  width: 280px;
}

.tree-view-container {
  flex-grow: 1;
  overflow-y: auto; /* Enable scrolling only for the tree */
}
</style>

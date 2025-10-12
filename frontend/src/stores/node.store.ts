import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { NodeDefinitionsService, type NodeDefinition } from '@/api';
import { BaseToast } from '@/services/toast';
import { groupBy } from 'lodash-es';
import { compare } from 'semver';
import semver from 'semver';

// Helper to get the base type without version
export const getNodeBaseType = (type: string) => {
  if (!type) return '';
  const lastSlash = type.lastIndexOf('/');
  if (lastSlash === -1) return type; // Should not happen with versioned types
  // Check if the last part is a version number
  const lastPart = type.substring(lastSlash + 1);
  if (semver.valid(lastPart)) {
    return type.substring(0, lastSlash);
  }
  return type; // Fallback for unversioned types if any
};


export const useNodeStore = defineStore('node', () => {
  // --- STATE ---

  /**
   * Stores ALL node definitions (all versions) fetched from the API.
   * This is the main source of truth for node definitions.
   * Fetched once on application startup.
   */
  const allNodeDefinitions = ref<NodeDefinition[]>([]);

  /**
   * Stores only the LATEST versions of node definitions.
   * Fetched on-demand for the "Latest" tab in the node palette.
   */
  const latestNodeDefinitions = ref<NodeDefinition[]>([]);


  // --- GETTERS / COMPUTED ---

  /**
   * A map of ALL node definitions, where keys are the full node type
   * (e.g., "data/constant/1.0.0") and values are the definitions.
   * Used for quickly looking up a specific version of a node.
   */
  const nodeDefinitionsMap = computed(() => {
    return Object.fromEntries(allNodeDefinitions.value.map(def => [def.type, def]));
  });

  /**
   * Groups ALL node definitions by their base type (e.g., "data/constant").
   * The versions within each group are sorted from newest to oldest.
   * Used for the "All Versions" tab in the node palette.
   */
  const groupedNodeDefinitions = computed(() => {
    const grouped = groupBy(allNodeDefinitions.value, def => getNodeBaseType(def.type!));
    // Sort each group by version descending
    for (const key in grouped) {
      grouped[key].sort((a, b) => compare(b.version!, a.version!));
    }
    return grouped;
  });

  // --- ACTIONS ---

  /**
   * Fetches ALL node definitions (all versions) from the backend.
   * This should be called once when the application starts to ensure
   * workflows with older node versions can be rendered correctly.
   */
  async function fetchAllNodeDefinitions() {
    try {
      // Assuming the new service method is getApiAllNodeDefinitions
      const definitions = await NodeDefinitionsService.getApiAllNodeDefinitions();
      allNodeDefinitions.value = definitions.filter(def => def.type && def.version);
    } catch (error) {
      BaseToast.error('Failed to fetch all node definitions.');
      console.error('Failed to fetch all node definitions:', error);
    }
  }

  /**
   * Fetches only the LATEST version of each node definition.
   * This is called when the user switches to the "Latest" tab
   * in the Node Palette for a cleaner view.
   */
  async function fetchLatestNodeDefinitions() {
    // Avoid re-fetching if already populated
    if (latestNodeDefinitions.value.length > 0) return;
    try {
      const definitions = await NodeDefinitionsService.getApiNodeDefinitions();
      latestNodeDefinitions.value = definitions.filter(def => def.type);
    } catch (error) {
      BaseToast.error('Failed to fetch latest node definitions.');
      console.error('Failed to fetch latest node definitions:', error);
    }
  }


  /**
   * Gets a specific node definition by its full type identifier.
   * @param type - The full type of the node (e.g., "data/constant/1.0.0").
   */
  const getDefinitionByType = (type: string) => {
    return nodeDefinitionsMap.value[type];
  };


  return {
    // State
    allNodeDefinitions,
    latestNodeDefinitions,
    // Computed (Getters)
    nodeDefinitionsMap,
    groupedNodeDefinitions,
    // Actions
    fetchAllNodeDefinitions,
    fetchLatestNodeDefinitions,
    getDefinitionByType,
  };
});

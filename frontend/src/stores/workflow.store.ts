import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { NodeInstance, Edge, NodeDefinition, PortDefinition } from '@/types/workflow';
import { useUIStore } from './ui.store';

// Helper function to generate a unique ID
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const useWorkflowStore = defineStore('workflow', () => {
  // --- STATE ---

  const nodes = ref<NodeInstance[]>([]);
  const edges = ref<Edge[]>([]);

  // A repository of all available node blueprints.
  // In a real app, this would likely be fetched from an API.
  const nodeDefinitions = ref<Record<string, NodeDefinition>>({});


  // --- GETTERS / COMPUTED ---

  const uiStore = useUIStore();

  /**
   * Gets the currently selected NodeInstance object based on the ID in the UI store.
   */
  const selectedNode = computed(() => {
    if (!uiStore.selectedNodeId) {
      return null;
    }
    return nodes.value.find(node => node.id === uiStore.selectedNodeId) ?? null;
  });

  /**
   * Gets the NodeDefinition for the currently selected node.
   */
  const selectedNodeDefinition = computed(() => {
    if (!selectedNode.value) {
      return null;
    }
    return nodeDefinitions.value[selectedNode.value.type] ?? null;
  });


  // --- ACTIONS ---

  /**
   * Adds a new node to the canvas based on a definition.
   * @param type - The type of the node to add (e.g., "logic/if").
   * @param position - The initial position of the node on the canvas.
   */
  function addNode(type: string, position: { x: number; y: number }) {
    const definition = nodeDefinitions.value[type];
    if (!definition) {
      console.error(`Node definition for type "${type}" not found.`);
      return;
    }

    const newNode: NodeInstance = {
      id: generateId('node'),
      type: definition.type,
      label: definition.label,
      position,
      // Deep copy ports and properties to the instance
      ports: JSON.parse(JSON.stringify(definition.ports)),
      propertyValues: definition.properties
        ? Object.fromEntries(definition.properties.map(p => [p.name, p.defaultValue]))
        : {},
    };

    nodes.value.push(newNode);
  }

  /**
   * Updates the properties of a specific node instance.
   * @param nodeId - The ID of the node to update.
   * @param newValues - An object with the properties to update.
   */
  function updateNodeProperties(nodeId: string, newValues: { [key: string]: any }) {
    const node = nodes.value.find(n => n.id === nodeId);
    if (node) {
      if (!node.propertyValues) {
        node.propertyValues = {};
      }
      Object.assign(node.propertyValues, newValues);
    }
  }

  /**
   * Updates the entire ports array for a given node instance.
   * Also removes any edges connected to the ports that are being removed.
   * @param nodeId The ID of the node to update.
   * @param newPorts The new array of PortDefinition objects.
   */
  function updateNodePorts(nodeId: string, newPorts: PortDefinition[]) {
    const node = nodes.value.find(n => n.id === nodeId);
    if (!node) return;

    const oldPortNames = new Set(node.ports.map(p => p.name));
    const newPortNames = new Set(newPorts.map(p => p.name));

    // Find ports that are in the old set but not in the new set
    const removedPortNames = [...oldPortNames].filter(name => !newPortNames.has(name));

    if (removedPortNames.length > 0) {
      const removedPortNamesSet = new Set(removedPortNames);

      // Filter out edges connected to the removed ports
      edges.value = edges.value.filter(edge => {
        const isSourceConnected = edge.source.nodeId === nodeId && removedPortNamesSet.has(edge.source.portName);
        const isTargetConnected = edge.target.nodeId === nodeId && removedPortNamesSet.has(edge.target.portName);
        return !isSourceConnected && !isTargetConnected;
      });
    }

    // Finally, update the node's ports
    node.ports = newPorts;
  }

  // TODO: Add actions for adding/removing edges, deleting nodes, etc.


  return {
    // State
    nodes,
    edges,
    nodeDefinitions,
    // Computed
    selectedNode,
    selectedNodeDefinition,
    // Actions
    addNode,
    updateNodeProperties,
    updateNodePorts,
  };
});

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { NodeInstance, Edge, NodeDefinition, PortDefinition } from '@/types/workflow';
import { useUIStore } from './ui.store';
import type { Connection } from '@vue-flow/core';
import { BaseToast } from '@/services/toast';

// Helper function to generate a unique ID
const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

export const useWorkflowStore = defineStore('workflow', () => {
  // --- STATE ---

  const nodes = ref<NodeInstance[]>([]);
  const edges = ref<Edge[]>([]);
  const currentWorkflowId = ref<string | null>(null);
  const currentWorkflowName = ref<string | null>(null);

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

  /**
   * A generic action to add a pre-validated edge.
   * @param connection - The connection object.
   * @param dataType - The optional data type for this connection.
   */
  function addEdge(connection: Connection, dataType?: string) {
    if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
      return; // Safeguard.
    }
    const sourcePortName = connection.sourceHandle.replace(`-${connection.source}`, '');
    const targetPortName = connection.targetHandle.replace(`-${connection.target}`, '');

    const newEdge: Edge = {
      id: generateId('edge'),
      source: { nodeId: connection.source, portName: sourcePortName },
      target: { nodeId: connection.target, portName: targetPortName },
      ...(dataType && { dataType }), // Conditionally add dataType if it exists
    };
    edges.value.push(newEdge);
  }

  /**
   * Validates a potential connection and adds it if valid. Handles control and data flows.
   * @param connection - The connection object from Vue Flow.
   */
  function validateAndAddEdge(connection: Connection) {
    // Validation 0: A node cannot connect to itself.
    if (connection.source === connection.target) {
      BaseToast.warning("Invalid connection: A node cannot connect to itself.");
      return;
    }

    if (!connection.source || !connection.target || !connection.sourceHandle || !connection.targetHandle) {
      console.error("Invalid connection object received:", connection);
      return;
    }

    const sourceNode = nodes.value.find(n => n.id === connection.source);
    const targetNode = nodes.value.find(n => n.id === connection.target);
    if (!sourceNode || !targetNode) {
      BaseToast.error("Connection failed: Node not found.");
      return;
    }

    const sourcePortName = connection.sourceHandle.replace(`-${connection.source}`, '');
    const targetPortName = connection.targetHandle.replace(`-${connection.target}`, '');

    const sourcePort = sourceNode.ports.find(p => p.name === sourcePortName);
    const targetPort = targetNode.ports.find(p => p.name === targetPortName);

    if (!sourcePort || !targetPort) {
      BaseToast.error("Connection failed: Port not found.");
      return;
    }

    // Validation 1: Connection direction must be out -> in
    if (sourcePort.direction !== 'out' || targetPort.direction !== 'in') {
      BaseToast.warning("Invalid connection: Ports must connect from an output to an input.");
      return;
    }

    // Validation 2: Port types (control/data) must match
    if (sourcePort.type !== targetPort.type) {
      BaseToast.warning(`Invalid connection: Cannot connect a '${sourcePort.type}' port to a '${targetPort.type}' port.`);
      return;
    }

    // Handle based on port type
    if (sourcePort.type === 'data') {
      // If either port is of type 'any', allow the connection
      if (sourcePort.dataType === 'any' || targetPort.dataType === 'any') {
        addEdge(connection, sourcePort.dataType);
        return;
      }

      // Data ports require matching, existing data types
      if (!sourcePort.dataType || !targetPort.dataType) {
        BaseToast.error("Connection failed: Data port is missing a data type.");
        return;
      }
      if (sourcePort.dataType !== targetPort.dataType) {
        BaseToast.warning(`Invalid connection: Data types do not match ('${sourcePort.dataType}' to '${targetPort.dataType}').`);
        return;
      }
      // Data connection is valid, add edge with data type
      addEdge(connection, sourcePort.dataType);
    } else {
      // Control connection is valid, add edge without data type
      addEdge(connection);
    }
  }

  /**
   * Removes a list of edges from the workflow.
   * @param edgeIdsToRemove - An array of edge IDs to remove.
   */
  function removeEdges(edgeIdsToRemove: string[]) {
    const idsToRemove = new Set(edgeIdsToRemove);
    edges.value = edges.value.filter(edge => !idsToRemove.has(edge.id));
  }

  /**
   * Removes a list of nodes and any connected edges from the workflow.
   * @param nodeIdsToRemove - An array of node IDs to remove.
   */
  function removeNodes(nodeIdsToRemove: string[]) {
    const idsToRemove = new Set(nodeIdsToRemove);

    // Remove the nodes
    nodes.value = nodes.value.filter(node => !idsToRemove.has(node.id));

    // Remove any edges connected to the removed nodes
    edges.value = edges.value.filter(edge => !idsToRemove.has(edge.source.nodeId) && !idsToRemove.has(edge.target.nodeId));

    // If the currently selected node was deleted, hide the config panel
    if (uiStore.selectedNodeId && idsToRemove.has(uiStore.selectedNodeId)) {
      uiStore.hideConfigPanel();
    }
  }


  /**
   * Loads a complete workflow into the store, replacing the current state.
   * @param workflow The workflow object to load.
   */
  function loadWorkflow(workflow: any) {
    // TODO: Add proper validation for the incoming workflow object
    if (workflow && workflow.graph) {
      nodes.value = workflow.graph.nodes || [];
      edges.value = workflow.graph.edges || [];
    } else {
      nodes.value = [];
      edges.value = [];
    }
    currentWorkflowId.value = workflow.id;
    currentWorkflowName.value = workflow.name;
    uiStore.hideConfigPanel(); // Hide panel after loading
  }

  /**
   * Clears the current workflow from the editor.
   */
  function unloadWorkflow() {
    nodes.value = [];
    edges.value = [];
    currentWorkflowId.value = null;
    currentWorkflowName.value = null;
    uiStore.hideConfigPanel();
  }

  /**
   * A computed property that represents the current state as a serializable workflow object.
   * Returns null if there's no active workflow ID (useful for 'Save' vs 'Save As' logic).
   */
  const currentWorkflowData = computed(() => {
    // This object always reflects the current canvas state.
    const data = {
      nodes: nodes.value,
      edges: edges.value,
      name: currentWorkflowName.value,
      id: currentWorkflowId.value,
    };

    // We return it regardless of whether it has an ID.
    // The component using it will decide what to do.
    return data;
  });


  return {
    // State
    nodes,
    edges,
    nodeDefinitions,
    currentWorkflowId,
    currentWorkflowName,
    // Computed
    selectedNode,
    selectedNodeDefinition,
    currentWorkflowData,
    // Actions
    addNode,
    updateNodeProperties,
    updateNodePorts,
    addEdge,
    removeEdges,
    removeNodes,
    validateAndAddEdge,
    loadWorkflow,
    unloadWorkflow,
  };
});

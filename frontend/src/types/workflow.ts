/**
 * This file defines the core data structures used within the LucidFlow frontend application.
 * These types are based on the master design documents and provide a strict, type-safe model
 * for manipulating workflow graphs, nodes, and their properties. They are distinct from the
 * auto-generated API types and serve as the single source of truth for the application's state.
 */

// --- Port and Property Definitions ---

/**
 * Defines a single input or output port on a Node.
 * This structure is used in both NodeDefinition and NodeInstance.
 */
export type PortDefinition = {
  name: string;
  label: string;
  type: 'control' | 'data';
  direction: 'in' | 'out';
  dataMode?: 'batch' | 'stream';
  dataType?: string;
  defaultValue?: any;
};

/**
 * Defines a configurable property of a Node, used to generate the UI in the config panel.
 */
export type PropertyDefinition = {
  name: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'slider' | 'textarea' | 'code';
  defaultValue: any;
  description?: string;
  options?: { label: string; value: any }[]; // For 'select' type
  min?: number;   // For 'number' or 'slider'
  max?: number;   // For 'number' or 'slider'
  step?: number;  // For 'number' or 'slider'
  language?: string; // For 'code' type
};

// --- Node Blueprint ---

/**
 * The "blueprint" for a node type. It defines the node's identity,
 * behavior, and interface. It is static and shared across all instances.
 */
export type NodeDefinition = {
  type: string;
  label: string;
  description?: string;
  archetype: 'action' | 'pure' | 'branch' | 'merge' | 'fork' | 'join' | 'loop' | 'compound';
  ports: PortDefinition[];
  properties?: PropertyDefinition[];
  /**
   * Optional configuration for UI-driven dynamic ports.
   */
  dynamicPorts?: {
    canAdd: { in?: boolean; out?: boolean };
    portTemplate: Partial<PortDefinition> & { namePrefix: string; labelPrefix: string };
  };
};


// --- Graph Instance Structures ---

/**
 * Represents a connection between two nodes in the graph.
 */
export interface Edge {
  id: string;
  source: {
    nodeId: string;
    portName: string;
  };
  target: {
    nodeId:string;
    portName: string;
  };
  dataType?: string; // Optional: The type of data flowing through, for validation and styling
}

/**
 * Represents an instance of a node on the canvas.
 * This is the single source of truth for a node's state and structure.
 */
export interface NodeInstance {
  id: string;
  type: string;
  label?: string;
  position: { x: number; y: number };
  propertyValues?: { [propertyName: string]: any };
  /**
   * [CRITICAL] Defines all ports for this specific instance, including dynamic ones.
   * This is the definitive source of the node's structure.
   */
  ports: PortDefinition[];
  subgraph?: {
    nodes: NodeInstance[];
    edges: Edge[];
  };
}

/**
 * Represents the entire workflow graph structure.
 */
export interface Graph {
  nodes: NodeInstance[];
  edges: Edge[];
}


/**
 * Represents a complete workflow document, including its metadata and graph.
 */
export interface Workflow {
  id: string;
  name: string;
  description?: string;
  graph: Graph;
  folderId?: string;
}

/**
 * Represents a folder in the file hierarchy, which can contain other folders and workflows.
 */
export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  children: Folder[];
  workflows: Workflow[];
}

export interface NodeMeta {
  label: string;
  isStartNode?: boolean;
  params?: { [key: string]: any };
}

export interface WorkflowNode {
  id: string;
  type: string; // e.g., 'manualInput', 'template', 'llmPrompt', 'output', 'code'
  position: { x: number; y: number };
  data: any; // Node-specific data
  meta?: NodeMeta;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface Workflow {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}
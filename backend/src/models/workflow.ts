// 核心工作流节点接口 (原始定义)
export interface WorkflowNode {  
    nodes: Node[];
    edges: Edge[];
    discription?: string;  // 工作流描述
    name?: string;         // 工作流名称
    version?: string;      // 工作流版本
}

export interface Edge {
  edgeid: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;   // 纯文本即可
  animated: boolean;
  style?: object;   // 样式对象  
}

export interface Node {
  nodeid: string;
  type: string;
  data: object;
  position: { x: number; y: number };
  style?: object|null;   // 样式对象
  run:any; 
}

export class Workflow {
    static transformFrontendData(frontendData: any): WorkflowNode {
        const nodes: Node[] = frontendData.nodes.map((node: any) => ({
            nodeid: node.id,
            type: node.type,
            data: node.data,
            position: node.position,
            style: node.style || null,
            run: null, // 或根据需要设置默认值
        }));

        const edges: Edge[] = frontendData.edges.map((edge: any) => ({
            edgeid: edge.id || Math.random().toString(36).substring(2, 15),
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle || null,
            targetHandle: edge.targetHandle || null,
            label: edge.label || '',
            animated: edge.animated || false,
            style: edge.style || {},
        }));

        const workflowData: WorkflowNode = {
            nodes,
            edges,
            name: frontendData.name || 'Untitled Workflow',
            discription: frontendData.discription || '',
            version: frontendData.version || '1.0.0',
        };
        return workflowData;
    }
}
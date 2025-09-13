// 核心工作流节点接口 (原始定义)
/**
 * @swagger
 * components:
 *   schemas:
 *     WorkflowNode:
 *       type: object
 *       required:
 *         - nodes
 *         - edges
 *       properties:
 *         nodes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Node'
 *         edges:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Edge'
 *         discription:
 *           type: string
 *           description: 工作流描述
 *         name:
 *           type: string
 *           description: 工作流名称
 *         version:
 *           type: string
 *           description: 工作流版本
 */
export interface WorkflowNode {
    nodes: Node[];
    edges: Edge[];
    discription?: string;  // 工作流描述
    name?: string;         // 工作流名称
    version?: string;      // 工作流版本
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Edge:
 *       type: object
 *       required:
 *         - edgeid
 *         - source
 *         - target
 *         - animated
 *       properties:
 *         edgeid:
 *           type: string
 *         source:
 *           type: string
 *         target:
 *           type: string
 *         sourceHandle:
 *           type: string
 *           nullable: true
 *         targetHandle:
 *           type: string
 *           nullable: true
 *         label:
 *           type: string
 *           description: 边上的标签，纯文本即可
 *         animated:
 *           type: boolean
 *         style:
 *           type: object
 *           description: 样式对象
 */
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

/**
 * @swagger
 * components:
 *   schemas:
 *     Node:
 *       type: object
 *       required:
 *         - nodeid
 *         - type
 *         - data
 *         - position
 *         - run
 *       properties:
 *         nodeid:
 *           type: string
 *         type:
 *           type: string
 *         data:
 *           type: object
 *           description: 节点数据，具体结构取决于节点类型
 *         position:
 *           type: object
 *           properties:
 *             x:
 *               type: number
 *             y:
 *               type: number
 *           required:
 *             - x
 *             - y
 *         style:
 *           type: object
 *           nullable: true
 *           description: 样式对象
 *         run:
 *           type: object
 *           description: 运行相关的数据或函数
 */
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
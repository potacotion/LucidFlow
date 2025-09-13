import { WorkflowNode, Node, Edge } from '@src/models/workflow';
import { executeNodeCode } from '@src/common/util/executeNodeCode';

export class DagEngine {
    private readonly nodes: Map<string, Node>;
    private readonly edges: Edge[];
    private readonly adj: Map<string, string[]>;
    private readonly inDegree: Map<string, number>;

    constructor(workflow: WorkflowNode) {
        this.nodes = new Map(workflow.nodes.map(n => [n.nodeid, n]));
        this.edges = workflow.edges;
        this.adj = new Map();
        this.inDegree = new Map();

        this.buildGraph();
    }

    private buildGraph(): void {
        for (const node of this.nodes.values()) {
            this.adj.set(node.nodeid, []);
            this.inDegree.set(node.nodeid, 0);
        }

        for (const edge of this.edges) {
            this.adj.get(edge.source)?.push(edge.target);
            this.inDegree.set(edge.target, (this.inDegree.get(edge.target) || 0) + 1);
        }
    }

    public async run(): Promise<Map<string, any>> {
        const queue: string[] = [];
        const results = new Map<string, any>();

        for (const [nodeId, degree] of this.inDegree.entries()) {
            if (degree === 0) {
                queue.push(nodeId);
            }
        }

        while (queue.length > 0) {
            const nodeId = queue.shift()!;
            const node = this.nodes.get(nodeId);

            if (!node) {
                throw new Error(`Node with id ${nodeId} not found`);
            }
            
            // 收集所有前驱节点的输出作为当前节点的输入
            const parentResults = this.edges
                .filter(edge => edge.target === nodeId)
                .map(edge => results.get(edge.source));
            
            // 注入上下文并执行
            const result = await executeNodeCode(node, { parentResults });
            results.set(nodeId, result);

            const neighbors = this.adj.get(nodeId) || [];
            for (const neighbor of neighbors) {
                this.inDegree.set(neighbor, (this.inDegree.get(neighbor) || 0) - 1);
                if (this.inDegree.get(neighbor) === 0) {
                    queue.push(neighbor);
                }
            }
        }
        
        if (results.size !== this.nodes.size) {
            throw new Error("Cycle detected in the graph or some nodes are unreachable.");
        }

        return results;
    }
}
import { Node } from '@src/models/workflow';
import vm from 'vm';

/**
 * Executes the code associated with a workflow node in a sandboxed environment.
 * @param node The node to execute.
 * @param context The execution context, containing results from parent nodes.
 * @returns The result of the executed code.
 */
export async function executeNodeCode(node: Node, context: object): Promise<any> {
    if (!node.run || typeof node.run !== 'string' || node.run.trim() === '') {
        // If there's no code to run, return null or a default value.
        return null;
    }

    // Create a secure sandbox for the execution.
    const sandbox = {
        ...context,
        console: {
            log: (...args: any[]) => {
                // You can expand this to log to a file or a database.
                console.log(`[Node ${node.nodeid}]:`, ...args);
            }
        },
        // You can add more whitelisted modules here, e.g., 'axios'.
    };

    // Create a new V8 context.
    vm.createContext(sandbox);

    try {
        const script = new vm.Script(`
            (async () => {
                ${node.run}
            })();
        `);
        
        // Execute the script in the sandboxed context.
        const result = await script.runInContext(sandbox, { timeout: 5000 }); // 5-second timeout
        return result;
    } catch (error) {
        console.error(`Error executing node ${node.nodeid}:`, error);
        throw new Error(`Execution failed for node ${node.nodeid}: ${(error as Error).message}`);
    }
}
import { NodeInstance, NodeDefinition, Logger } from '@src/models/workflow';
import { NODE_DEFINITIONS } from './node-definitions';

/**
 * A simple logger implementation that proxies to the console.
 * In a real application, this could be replaced with a more robust logger (e.g., Winston).
 */
const consoleLogger: Logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args),
  debug: (message: string, ...args: any[]) => console.debug(`[DEBUG] ${message}`, ...args),
};

function getNodeDefinition(nodeType: string): NodeDefinition {
    const definition = NODE_DEFINITIONS.get(nodeType);
    if (!definition) {
      throw new Error(`Node definition not found for type: ${nodeType}`);
    }
    return definition;
}
  

/**
 * Executes the business logic of a single node.
 *
 * @param node The instance of the node to execute.
 * @param inputs The resolved data inputs from upstream nodes.
 * @returns A promise that resolves to the node's output data.
 */
export async function executeNodeLogic(
  node: NodeInstance,
  inputs: { [key: string]: any }
): Promise<{ [key: string]: any }> {
  
  const definition = getNodeDefinition(node.type);

  // Prepare parameters for the run function
  const params = node.propertyValues || {};
  const logger = consoleLogger; // Use the simple console logger for now

  try {
    const outputs = await definition.run({
      input: inputs,
      params: params,
      logger: logger,
    });
    return outputs;
  } catch (error) {
    logger.error(`Error executing node ${node.id} (${node.type}):`, error);
    // In case of an error, we might want to propagate it or return a specific error structure.
    // For now, re-throwing is a simple way to halt execution.
    throw error;
  }
}
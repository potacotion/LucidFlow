import { NODE_DEFINITIONS } from './node-definitions';
import { NodeDefinition } from '@src/models/workflow';

function getAll(): NodeDefinition[] {
  return Array.from(NODE_DEFINITIONS.values());
}

export default {
  getAll,
} as const;
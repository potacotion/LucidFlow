import NodeRegistry from './node-definitions';
import { NodeDefinition } from '@src/models/workflow';

function getAll(): NodeDefinition[] {
  return NodeRegistry.getAllLatestDefinitions();
}

export default {
  getAll,
} as const;
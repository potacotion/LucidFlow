import NodeRegistry from './node-definitions';
import { NodeDefinition } from '@src/models/workflow';

function getAll(): NodeDefinition[] {
  return NodeRegistry.getAllLatestDefinitions();
}

function getAllWithVersions(): NodeDefinition[] {
  return NodeRegistry.getAllDefinitions();
}

export default {
  getAll,
  getAllWithVersions,
} as const;
import { NodeDefinition } from '@src/models/workflow';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from 'jet-logger';

// 使用嵌套Map来存储节点定义：Map<NodeType, Map<Version, NodeDefinition>>
type RegistryMap = Map<string, Map<string, NodeDefinition>>;

/**
 * 负责动态加载、注册和检索所有版本化节点定义的单例类。
 */
export class NodeRegistry {
  private static instance: NodeRegistry;
  private registry: RegistryMap = new Map();
  private isInitialized = false;

  private constructor() {}

  /**
   * 获取 NodeRegistry 的单例实例。
   */
  public static getInstance(): NodeRegistry {
    if (!NodeRegistry.instance) {
      NodeRegistry.instance = new NodeRegistry();
    }
    return NodeRegistry.instance;
  }

  /**
   * 初始化注册表，扫描并加载所有节点定义。
   * 这个方法应该在应用启动时被调用一次。
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('NodeRegistry has already been initialized.');
      return;
    }

    logger.info('Initializing NodeRegistry...');

    const nodesDir = path.join(__dirname, 'nodes');

    await this.loadNodesFromDirectory(nodesDir);
    this.isInitialized = true;
    logger.info(`NodeRegistry initialized. Loaded ${this.registry.size} node types.`);
  }

  /**
   * 递归扫描指定目录，加载所有 *.node.ts 文件。
   * @param directory 要扫描的目录路径。
   */
  private async loadNodesFromDirectory(directory: string): Promise<void> {
    const entries = await fs.promises.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await this.loadNodesFromDirectory(fullPath);
      } else if (entry.name === 'index.ts') { // 查找 index.ts 而不是 *.node.ts
        // 假设 index.ts 存在于 .../node-type/version/ 目录中
        await this.loadNodeDefinition(fullPath);
      }
    }
  }

  /**
   * 加载单个节点定义文件并将其注册。
   * @param filePath 节点定义文件的绝对路径。
   */
  private async loadNodeDefinition(filePath: string): Promise<void> {
    try {
      // backend/src/services/nodes/math/add/1.0.0/index.ts
      //                         |---- relative part ----|
      const nodesBaseDir = path.join(__dirname, 'nodes');
      const relativePath = path.relative(nodesBaseDir, filePath);

      // 'math/add/1.0.0/index.ts'
      const parts = relativePath.split(path.sep);

      if (parts.length < 4) { // 需要至少4部分: category, name, version, index.ts
        logger.warn(`Skipping invalid node definition path: ${relativePath}`);
        return;
      }

      parts.pop(); // 移除 'index.ts'
      const versionStr = parts.pop(); // '1.0.0'
      const nodeName = parts.pop(); // 'add'
      const category = parts.join('/'); // 'math'
      const nodeType = `${category}/${nodeName}`; // 'math/add'
      
      if (!versionStr || !nodeName || !category) {
        logger.warn(`Could not parse node type and version from path: ${relativePath}`);
        return;
      }

      const module = await import(filePath);
      const definition = module.default as NodeDefinition;

      // 验证定义是否基本有效
      if (!definition || definition.type !== nodeType || definition.version !== versionStr) {
        logger.err(`Mismatch in node definition:
              - Path implies type "${nodeType}", version "${versionStr}".
              - File defines type "${definition.type}", version "${definition.version}".
              - File path: ${filePath}`);
        return;
      }

      this.register(nodeType, versionStr, definition);
    } catch (error) {
      logger.err(`Failed to load node definition from ${filePath}`, error);
    }
  }

  /**
   * 将一个节点定义注册到注册表中。
   * @param type 节点类型 (e.g., 'math/add')。
   * @param version 节点的语义化版本 (e.g., '1.0.0')。
   * @param definition NodeDefinition 对象。
   */
  public register(type: string, version: string, definition: NodeDefinition): void {
    if (!this.registry.has(type)) {
      this.registry.set(type, new Map());
    }
    const versionMap = this.registry.get(type)!;
    if (versionMap.has(version)) {
      logger.warn(`Overwriting node definition for ${type}@${version}.`);
    }
    versionMap.set(version, definition);
    logger.info(`Registered node: ${type}@${version}`);
  }

  /**
   * 根据类型和版本精确查找一个节点定义。
   * @param type 节点类型。
   * @param version 节点的语义化版本。
   * @returns 匹配的 NodeDefinition，如果未找到则返回 undefined。
   */
  public getDefinition(type: string, version: string): NodeDefinition | undefined {
    const versionMap = this.registry.get(type);
    if (!versionMap) {
      logger.warn(`Node type "${type}" not found in registry.`);
      return undefined;
    }
    const definition = versionMap.get(version);
    if (!definition) {
      logger.warn(`Node version "${version}" for type "${type}" not found.`);
      // TODO: 在这里可以添加版本回退逻辑，例如查找最新的兼容版本。
    }
    return definition;
  }

  /**
   * 获取指定节点类型的所有可用版本。
   * @param type 节点类型。
   * @returns 一个包含所有版本字符串的数组，如果类型不存在则返回空数组。
   */
  public getAvailableVersions(type: string): string[] {
    const versionMap = this.registry.get(type);
    return versionMap ? Array.from(versionMap.keys()) : [];
  }
  
  /**
   * 获取所有已注册的节点定义，主要用于发送给前端UI。
   * 这通常会返回每个节点类型的最新版本。
   * @returns 一个包含最新版本 NodeDefinition 的数组。
   */
  public getAllLatestDefinitions(): NodeDefinition[] {
    const latestDefinitions: NodeDefinition[] = [];
    for (const versionMap of this.registry.values()) {
      // 假设版本号可以按字符串正确排序来找到最新版本
      // 对于语义化版本，需要一个更健壮的排序，但简单字符串排序通常可行
      const latestVersion = Array.from(versionMap.keys()).sort().pop();
      if (latestVersion) {
        latestDefinitions.push(versionMap.get(latestVersion)!);
      }
    }
    return latestDefinitions;
  }
}

export default NodeRegistry.getInstance();
/**
 * 节点类型的“蓝图”，定义了身份、行为与接口。
 * 对所有实例而言是静态、只读、共享的。
 */
export type NodeDefinition = {
  /** 类型的唯一标识 (e.g., "openai/gpt4", "logic/if") */
  type: string;

  /** UI上展示的名称 (e.g., "GPT-4", "If Condition") */
  label: string;

  /** 详细描述 */
  description?: string;

  /**
   * [核心] 节点的基本行为原型，指导引擎如何调度。
   * 这是所有节点都必须声明的核心属性。
   */
  archetype: 'action' |   // 普通执行节点
             'stream-action' | // 流式执行节点
             'pure' |     // 纯数据转换
             'branch' |   // 控制流分支 (If, Switch)
             'merge' |    // 控制流合并 (OR logic)
             'fork' |     // 并行分叉
             'join' |     // 并行同步 (AND logic)
             'loop' |     // 循环 (For Each, While)
             'compound';  // 包含子图的容器

  /** 按顺序定义节点的所有输入/输出端口 */
  ports: PortDefinition[];

  /** 定义节点的可配置属性，UI将据此生成配置面板。*/
  properties?: PropertyDefinition[];

  /**
   * [可选] 为UI提供动态端口的配置规则。
   * 如果存在此属性，UI将允许用户通过特定操作（如点击按钮）来添加端口。
   */
  dynamicPorts?: {
    /** 指示是否允许添加入端口或出端口 */
    canAdd: { in?: boolean; out?: boolean };
    /** 当用户在UI上添加新端口时，以此为模板创建新的 PortDefinition */
    portTemplate: Partial<PortDefinition> & { namePrefix: string; labelPrefix: string };
  };

  /**
   * [核心] 节点的执行函数，在沙箱环境中执行节点的核心逻辑
   */
  run: (params: {
    input: { [portName: string]: any };
    params: { [propertyName: string]: any };
    logger: Logger;
  }) => Promise<{ [portName: string]: any }>;

  /**
   * [新增] 节点的语义化版本 (e.g., "1.0.0", "1.2.5")。
   * - MAJOR 版本：当发生不兼容的 API 变更时（如增删端口、修改核心逻辑）。
   * - MINOR 版本：当以向后兼容的方式添加新功能时。
   * - PATCH 版本：当进行向后兼容的错误修复时。
   */
  version: string;
};

/**
 * 日志记录器接口
 */
export interface Logger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

/**
 * 定义 NodeDefinition 上的单个输入或输出端口。
 */
export type PortDefinition = {
  /** 机器可读名称 (e.g., "prompt", "condition", "truePath") */
  name: string;

  /** UI上展示的标签 (e.g., "Prompt", "Condition", "True") */
  label: string;

  /** 端口类别：'control' 用于执行流，'data' 用于数据流 */
  type: 'control' | 'data';

  /** 端口方向 */
  direction: 'in' | 'out';

  /**
   * [新增] 'data' 端口的数据处理模式。
   * 'batch': (默认) 一次性、完整的数据。
   * 'stream': 连续的数据块流，以 'done' 或 'error' 信号结束。
   */
  dataMode?: 'batch' | 'stream';

  /** 'data' 端口期望的数据类型 (e.g., "string", "number", "llm-chunk") */
  dataType?: string;

  /** 'data' 输入端口的默认值 (通常仅用于 'batch' 模式) */
  defaultValue?: any;
};

/**
 * 在 'stream' 模式端口之间传递的数据包。
 */
export type StreamPacket<T = any> = {
  type: 'data' | 'done' | 'error';
  data?: T;
  error?: Error;
  streamId?: string; // 可选，用于标识特定流
};

/**
 * 定义节点的一个可配置属性（Property）。
 * 这份定义将直接用于在UI中生成对应的配置控件。
 */
export type PropertyDefinition = {
  /**
   * 机器可读名称，在同一节点内唯一。
   * @example "model", "temperature", "code"
   */
  name: string;

  /**
   * 在 UI 上展示的标签。
   * @example "Model", "Temperature", "JavaScript Code"
   */
  label: string;

  /**
   * [核心] 指定在UI中渲染此属性时使用的控件类型。
   */
  type: 'string' |      // 渲染为单行文本输入框
        'number' |      // 渲染为数字输入框
        'boolean' |     // 渲染为复选框 (checkbox) 或开关 (toggle)
        'select' |      // 渲染为下拉选择框
        'slider' |      // 渲染为滑块
        'textarea' |    // 渲染为多行文本区域
        'code';         // 渲染为带语法高亮的代码编辑器

  /**
   * 属性的默认值。
   */
  defaultValue: any;

  /**
   * 详细描述，用于工具提示或帮助信息。
   */
  description?: string;

  // --- 以下是特定控件类型的附加配置 ---

  /**
   * for type: 'select'
   * 定义下拉框的选项。
   */
  options?: { label: string; value: any }[];

  /**
   * for type: 'number' | 'slider'
   * 定义数字的最小值、最大值和步长。
   */
  min?: number;
  max?: number;
  step?: number;
  
  /**
   * for type: 'code'
   * 定义代码编辑器的语言。
   * @example "javascript", "python", "json"
   */
  language?: string;
};

export type Edge = {
  /**
   * 该连线自身的唯一标识。
   * @example "edge_12345"
   */
  id: string;

  /**
   * 连线的起点，必须是 'out' 端口。
   */
  source: {
    nodeId: string;   // 源 NodeInstance 的 `id`
    portName: string; // 源 PortDefinition 的 `name`
  };

  /**
   * 连线的终点，必须是 'in' 端口。
   */
  target: {
    nodeId: string;   // 目标 NodeInstance 的 `id`
    portName: string; // 目标 PortDefinition 的 `name`
  };
};

/**
 * 表示一个包含节点和边的图结构。
 */
export type Graph = {
  nodes: NodeInstance[];
  edges: Edge[];
};

export interface NodeInstance {
  /**
   * 在整个工作流中全局唯一的ID，e.g., "node_1a2b3c"
   */
  id: string;

  /**
   * 节点的类型，关联到唯一的 NodeDefinition, e.g., "control/forEach"
   */
  type: string;

  /**
   * [新增] 此节点实例创建时所使用的 NodeDefinition 的语义化版本。
   * 这确保了即使节点定义更新，旧的工作流也能以创建时的行为来执行。
   */
  version: string;

  /**
   * 用户可自定义的节点标签
   */
  label?: string;

  /**
   * 在画布上的位置
   */
  position: { x: number; y: number };

  /**
   * [新增] 存储此实例的所有端口，包括静态和动态添加的。
   * 这会覆盖 NodeDefinition 中的端口定义。
   */
  ports?: PortDefinition[];

  /**
   * 存储所有用户配置的值。
   * key 对应 PropertyDefinition.name。
   * - 对于 'compound' 节点, 此处可存放端口映射 (portMappings)。
   *   e.g., { "portMappings": { "inputs": [...], "outputs": [...] } }
   */
  propertyValues?: { [propertyName: string]: any };

  /**
   * [核心] 存放子图（或循环体）的定义。
   * - 对于 'compound' 节点, 它代表被封装的子图。其与外部的接口通过 `propertyValues` 中的 `portMappings` 定义。
   * - 对于 'loop' 节点, 它代表循环体。循环变量 (item, index) 由引擎在运行时注入上下文，子图内节点可通过表达式 (e.g., `{{context.loop.item}}`) 访问。
   * - 对于其他节点, 此属性为 null 或 undefined。
   */
  subgraph?: Graph;
}
/**
 * 表示一个完整的工作流，包含元数据和图结构。
 */
export type Workflow = {
  id: string;
  name: string;
  description?: string;
  graph: Graph;
  folderId?: string;
};

export type Folder = {
  id: string;
  name: string;
  parentId?: string;
  children: Folder[];
  workflows: Workflow[];
};
export interface ISubscription {
  unsubscribe: () => void;
}

export interface ISubscriber {
  onData: (portName: string, data: any) => void;
  onError: (portName: string, error: Error) => void;
  onDone: (portName: string) => void;
}

export interface ISubscribable {
  subscribe(subscriber: ISubscriber): ISubscription;
}

export function isSubscribable(value: any): value is ISubscribable {
    return value && typeof value.subscribe === 'function';
}

export type NodeStatus = 'success' | 'error' | 'running';

export interface EngineHooks {
  onNodeStart: (nodeId: string, archetype: string) => void;
  onNodeEnd: (nodeId: string, status: NodeStatus) => void;
}
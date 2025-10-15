export type Signal = {
  nodeId: string;
  portName: string;
  // 'control' signals trigger execution, 'data' signals carry data payloads.
  dataType: 'control' | 'data';
  data?: any;
};

export type NodeOutput = {
  [portName: string]: any;
};

export type JoinState = {
  expected: number;
  received: number;
};
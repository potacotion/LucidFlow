/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Node = {
    nodeid: string;
    type: string;
    /**
     * 节点数据，具体结构取决于节点类型
     */
    data: Record<string, any>;
    position: {
        'x': number;
        'y': number;
    };
    /**
     * 样式对象
     */
    style?: Record<string, any> | null;
    /**
     * 运行相关的数据或函数
     */
    run: Record<string, any>;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Edge } from './Edge';
import type { Node } from './Node';
export type WorkflowNode = {
    nodes: Array<Node>;
    edges: Array<Edge>;
    /**
     * 工作流描述
     */
    discription?: string;
    /**
     * 工作流名称
     */
    name?: string;
    /**
     * 工作流版本
     */
    version?: string;
};


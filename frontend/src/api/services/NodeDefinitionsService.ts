/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { NodeDefinition } from '../models/NodeDefinition';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class NodeDefinitionsService {
    /**
     * 获取所有节点定义
     * @returns NodeDefinition 成功获取节点定义列表
     * @throws ApiError
     */
    public static getApiNodeDefinitions(): CancelablePromise<Array<NodeDefinition>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/node-definitions',
        });
    }
}

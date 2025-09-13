/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { WorkflowNode } from '../models/WorkflowNode';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WorkflowsService {
    /**
     * 创建工作流
     * @param requestBody
     * @returns WorkflowNode 成功创建工作流
     * @throws ApiError
     */
    public static postApiWorkflowsAdd(
        requestBody: WorkflowNode,
    ): CancelablePromise<WorkflowNode> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/workflows/add',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `创建工作流失败`,
            },
        });
    }
    /**
     * 获取所有工作流
     * @returns WorkflowNode 成功获取工作流列表
     * @throws ApiError
     */
    public static getApiWorkflows(): CancelablePromise<Array<WorkflowNode>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/workflows',
            errors: {
                500: `获取工作流失败`,
            },
        });
    }
    /**
     * 获取单个工作流
     * @param id 工作流 ID
     * @returns WorkflowNode 成功获取工作流
     * @throws ApiError
     */
    public static getApiWorkflows1(
        id: number,
    ): CancelablePromise<WorkflowNode> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/workflows/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `工作流未找到`,
                500: `获取工作流失败`,
            },
        });
    }
    /**
     * 更新工作流
     * @param id 工作流 ID
     * @param requestBody
     * @returns WorkflowNode 成功更新工作流
     * @throws ApiError
     */
    public static putApiWorkflows(
        id: number,
        requestBody: WorkflowNode,
    ): CancelablePromise<WorkflowNode> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/workflows/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                500: `更新工作流失败`,
            },
        });
    }
    /**
     * 删除工作流
     * @param id 工作流 ID
     * @returns void
     * @throws ApiError
     */
    public static deleteApiWorkflows(
        id: number,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/workflows/{id}',
            path: {
                'id': id,
            },
            errors: {
                500: `删除工作流失败`,
            },
        });
    }
    /**
     * 执行工作流
     * @param id 工作流 ID
     * @returns any 工作流执行成功
     * @throws ApiError
     */
    public static postApiWorkflowsRun(
        id: number,
    ): CancelablePromise<{
        message?: string;
        /**
         * 工作流执行结果
         */
        results?: Record<string, any>;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/workflows/{id}/run',
            path: {
                'id': id,
            },
            errors: {
                404: `工作流未找到`,
                500: `执行工作流失败`,
            },
        });
    }
}

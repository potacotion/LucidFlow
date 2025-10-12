/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Folder } from '../models/Folder';
import type { Workflow } from '../models/Workflow';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class WorkflowsService {
    /**
     * Get all workflows
     * @returns Folder A tree structure of folders and workflows.
     * @throws ApiError
     */
    public static getApiWorkflows(): CancelablePromise<Array<Folder>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/workflows',
        });
    }
    /**
     * Create a new workflow
     * @param requestBody
     * @returns any The created workflow.
     * @throws ApiError
     */
    public static postApiWorkflows(
        requestBody: Workflow,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/workflows',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get a single workflow by ID
     * @param id
     * @returns any A single workflow.
     * @throws ApiError
     */
    public static getApiWorkflows1(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/workflows/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Update a workflow
     * @param id
     * @param requestBody
     * @returns any The updated workflow.
     * @throws ApiError
     */
    public static putApiWorkflows(
        id: string,
        requestBody: Workflow,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/workflows/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a workflow
     * @param id
     * @returns any Workflow deleted successfully.
     * @throws ApiError
     */
    public static deleteApiWorkflows(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/workflows/{id}',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Run a workflow
     * @param id
     * @returns any The ID for the workflow execution run.
     * @throws ApiError
     */
    public static postApiWorkflowsRun(
        id: string,
    ): CancelablePromise<{
        runId?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/workflows/{id}/run',
            path: {
                'id': id,
            },
        });
    }
    /**
     * Trigger a workflow with a specific tag and optional initial data.
     * @param id
     * @param requestBody
     * @returns any The ID for the workflow execution run.
     * @throws ApiError
     */
    public static postApiWorkflowsTrigger(
        id: string,
        requestBody: {
            /**
             * The unique tag of the trigger node to start execution from.
             */
            triggerTag?: string;
            /**
             * Optional initial data to pass to the trigger node.
             */
            initialData?: Record<string, any>;
        },
    ): CancelablePromise<{
        runId?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/workflows/{id}/trigger',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Missing triggerTag in request body.`,
                404: `Workflow or unique trigger node not found.`,
            },
        });
    }
}

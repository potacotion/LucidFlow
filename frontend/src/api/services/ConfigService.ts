/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ConfigService {
    /**
     * Retrieve the full configuration for the current user
     * @returns any A merged configuration object (global + user)
     * @throws ApiError
     */
    public static getApiConfig(): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/config',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Update user-specific settings
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static putApiConfigUser(
        requestBody: Record<string, any>,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/config/user',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
    /**
     * Update global system settings (Admin only)
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static putApiConfigGlobal(
        requestBody: Record<string, any>,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/config/global',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
            },
        });
    }
}

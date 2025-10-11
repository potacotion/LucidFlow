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
    /**
     * Check if the system needs to be initialized (i.e., has no users)
     * @returns any Returns a boolean indicating if initialization is needed.
     * @throws ApiError
     */
    public static getApiConfigNeedsInitialization(): CancelablePromise<{
        needsInitialization?: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/config/needs-initialization',
        });
    }
    /**
     * Initialize global system settings (only if no users exist)
     * @param requestBody
     * @returns void
     * @throws ApiError
     */
    public static putApiConfigInitialize(
        requestBody: Record<string, any>,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/config/initialize',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden, users already exist in the system`,
            },
        });
    }
    /**
     * Check if the system is in multi-user mode
     * @returns any Returns a boolean indicating if multi-user mode is enabled.
     * @throws ApiError
     */
    public static getApiConfigIsMultiUser(): CancelablePromise<{
        isMultiUser?: boolean;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/config/is-multi-user',
        });
    }
}

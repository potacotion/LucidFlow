/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UsersService {
    /**
     * Assign a role to a user
     * @param userId
     * @param requestBody
     * @returns any Role assigned successfully
     * @throws ApiError
     */
    public static postApiUsersRoles(
        userId: number,
        requestBody: {
            roleId?: number;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/{userId}/roles',
            path: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                403: `Forbidden`,
            },
        });
    }
    /**
     * Remove a role from a user
     * @param userId
     * @param roleId
     * @returns any Role removed successfully
     * @throws ApiError
     */
    public static deleteApiUsersRoles(
        userId: number,
        roleId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/users/{userId}/roles/{roleId}',
            path: {
                'userId': userId,
                'roleId': roleId,
            },
            errors: {
                403: `Forbidden`,
            },
        });
    }
}

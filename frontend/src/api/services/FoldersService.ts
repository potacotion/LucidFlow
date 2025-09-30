/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Folder } from '../models/Folder';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FoldersService {
    /**
     * Create a new folder
     * @param requestBody
     * @returns Folder The created folder.
     * @throws ApiError
     */
    public static postApiFolders(
        requestBody: {
            name?: string;
            parentId?: string;
        },
    ): CancelablePromise<Folder> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/folders',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Delete a folder
     * @param id
     * @returns void
     * @throws ApiError
     */
    public static deleteApiFolders(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/folders/{id}',
            path: {
                'id': id,
            },
            errors: {
                404: `Folder not found.`,
                409: `Cannot delete a non-empty folder.`,
            },
        });
    }
}

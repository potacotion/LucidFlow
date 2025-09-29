/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserLoginDto } from '../models/UserLoginDto';
import type { UserRegisterDto } from '../models/UserRegisterDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Register a new user
     * @param requestBody
     * @returns any User created successfully.
     * @throws ApiError
     */
    public static postApiAuthRegister(
        requestBody: UserRegisterDto,
    ): CancelablePromise<{
        id?: number;
        name?: string;
        email?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/register',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                409: `User with this email already exists.`,
            },
        });
    }
    /**
     * Log in a user
     * @param requestBody
     * @returns any Login successful.
     * @throws ApiError
     */
    public static postApiAuthLogin(
        requestBody: UserLoginDto,
    ): CancelablePromise<{
        token?: string;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/auth/login',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Invalid email or password.`,
            },
        });
    }
}

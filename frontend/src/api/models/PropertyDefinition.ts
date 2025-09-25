/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PropertyDefinition = {
    name?: string;
    label?: string;
    type?: PropertyDefinition.type;
    defaultValue?: Record<string, any>;
    description?: string;
    options?: Array<{
        label?: string;
        value?: Record<string, any>;
    }>;
    min?: number;
    max?: number;
    step?: number;
    language?: string;
};
export namespace PropertyDefinition {
    export enum type {
        STRING = 'string',
        NUMBER = 'number',
        BOOLEAN = 'boolean',
        SELECT = 'select',
        SLIDER = 'slider',
        TEXTAREA = 'textarea',
        CODE = 'code',
    }
}


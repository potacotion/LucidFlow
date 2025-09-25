/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PortDefinition } from './PortDefinition';
import type { PropertyDefinition } from './PropertyDefinition';
export type NodeDefinition = {
    type?: string;
    label?: string;
    description?: string;
    archetype?: NodeDefinition.archetype;
    ports?: Array<PortDefinition>;
    properties?: Array<PropertyDefinition>;
};
export namespace NodeDefinition {
    export enum archetype {
        ACTION = 'action',
        PURE = 'pure',
        BRANCH = 'branch',
        MERGE = 'merge',
        FORK = 'fork',
        JOIN = 'join',
        LOOP = 'loop',
        COMPOUND = 'compound',
    }
}


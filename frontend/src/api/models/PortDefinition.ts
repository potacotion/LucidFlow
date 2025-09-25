/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type PortDefinition = {
    name?: string;
    label?: string;
    type?: PortDefinition.type;
    direction?: PortDefinition.direction;
    dataMode?: PortDefinition.dataMode;
    dataType?: string;
    defaultValue?: Record<string, any>;
};
export namespace PortDefinition {
    export enum type {
        CONTROL = 'control',
        DATA = 'data',
    }
    export enum direction {
        IN = 'in',
        OUT = 'out',
    }
    export enum dataMode {
        BATCH = 'batch',
        STREAM = 'stream',
    }
}


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Workflow } from './Workflow';
export type Folder = {
    id?: string;
    name?: string;
    parentId?: string | null;
    children?: Array<Folder>;
    workflows?: Array<Workflow>;
};


/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Edge = {
    edgeid: string;
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    /**
     * 边上的标签，纯文本即可
     */
    label?: string;
    animated: boolean;
    /**
     * 样式对象
     */
    style?: Record<string, any>;
};


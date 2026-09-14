interface FFMethodInfo {
    signature: string;
    description: string;
    returns?: string;
    example?: string;
}
interface FFClassInfo {
    name: string;
    description: string;
    category: string;
    installation: string;
    methods: FFMethodInfo[];
    properties?: FFMethodInfo[];
    notes?: string[];
}
export declare const FF_CLASS_INFO: Record<string, FFClassInfo>;
export declare const FF_CATEGORIES: {
    name: string;
    description: string;
    classes: string[];
}[];
export declare function formatFFClassInfo(className: string): string;
export {};
//# sourceMappingURL=focusframework-data.d.ts.map
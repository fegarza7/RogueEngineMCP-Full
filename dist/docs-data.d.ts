/**
 * Rogue Engine Documentation Data
 * Embedded documentation for MCP documentation tools
 */
export declare const CATEGORIES: {
    name: string;
    classes: string[];
}[];
export interface DecoratorInfo {
    name: string;
    syntax: string;
    description: string;
    propertyType: string;
    example: string;
}
export declare const DECORATORS: DecoratorInfo[];
export interface LifecycleMethod {
    name: string;
    description: string;
    whenCalled: string;
    example?: string;
}
export declare const LIFECYCLE: LifecycleMethod[];
export interface PropertyInfo {
    name: string;
    type: string;
    description: string;
    readonly?: boolean;
}
export interface MethodInfo {
    name: string;
    signature: string;
    description: string;
    example?: string;
}
export interface ClassInfo {
    name: string;
    description: string;
    access?: string;
    properties: PropertyInfo[];
    methods: MethodInfo[];
    staticMethods?: MethodInfo[];
    events?: MethodInfo[];
    example?: string;
}
export declare const CLASS_INFO: Record<string, ClassInfo>;
export interface SearchResult {
    className: string;
    section: string;
    content: string;
    relevance: number;
}
export declare function searchDocs(query: string): SearchResult[];
export declare function formatClassInfo(className: string): string;
export declare function formatDecorators(): string;
export declare function formatLifecycle(): string;
export declare function formatCategories(): string;
export declare function formatSearchResults(results: SearchResult[]): string;
//# sourceMappingURL=docs-data.d.ts.map
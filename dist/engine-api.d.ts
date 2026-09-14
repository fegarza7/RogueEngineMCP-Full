export interface PropertyInfo {
    name: string;
    type: string;
    description: string;
    readonly?: boolean;
    static?: boolean;
    inheritedFrom?: string;
    deprecated?: string;
}
export interface MethodInfo {
    name: string;
    signature: string;
    description: string;
    signatures?: string[];
    example?: string;
    static?: boolean;
    inheritedFrom?: string;
    deprecated?: string;
}
export interface ClassInfo {
    name: string;
    description: string;
    kind?: 'class' | 'component' | 'singleton' | 'functions';
    group?: string;
    baseClass?: string;
    access?: string;
    properties: PropertyInfo[];
    methods: MethodInfo[];
    staticProperties?: PropertyInfo[];
    staticMethods?: MethodInfo[];
    example?: string;
}
export interface DecoratorInfo {
    name: string;
    syntax: string;
    description: string;
    propertyType?: string;
    example?: string;
}
export interface EngineApi {
    schemaVersion: number;
    generatedAt: string;
    engineProjectVersion?: number;
    sourceProject: string;
    counts: Record<string, number>;
    classes: Record<string, ClassInfo>;
    components: Record<string, ClassInfo>;
    functionGroups: Record<string, ClassInfo>;
    decorators: DecoratorInfo[];
    types: {
        name: string;
        description: string;
    }[];
}
/** Engine classes + singletons + function groups, curated. Keyed by name. */
export declare const ENGINE_CLASSES: Record<string, ClassInfo>;
/** Built-in components (Character, UIButton, AudioPlayer, ...), curated. */
export declare const BUILTIN_COMPONENTS: Record<string, ClassInfo>;
/** Every prop decorator, including the list and map forms. */
export declare const ENGINE_DECORATORS: DecoratorInfo[];
export declare const ENGINE_TYPES: {
    name: string;
    description: string;
}[];
export declare const ENGINE_META: {
    generatedAt: string;
    engineProjectVersion: number | undefined;
    sourceProject: string;
    counts: Record<string, number>;
};
/** Footer so an agent can tell which engine version it is reading. */
export declare function metaFooter(): string;
//# sourceMappingURL=engine-api.d.ts.map
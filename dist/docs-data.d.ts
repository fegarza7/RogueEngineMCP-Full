/**
 * Public data surface for the documentation tools.
 *
 * This used to be ~950 lines of hand-transcribed API data, which is how it went
 * 7 months stale and ended up teaching RE.Runtime.clock (removed from the
 * engine). It is now a thin merge layer over:
 *
 *   data/engine-api.json   generated from the engine's shipped .d.ts files
 *   src/curated/*          hand-written examples, gotchas, lifecycle
 *
 * Every export below is unchanged in name and shape, so index.ts and the format
 * functions keep working. Regenerate the data with:
 *   npm run extract -- --project <path-to-RogueEngine-project>
 */
import { BUILTIN_COMPONENTS, ENGINE_META, metaFooter, type ClassInfo, type PropertyInfo, type MethodInfo, type DecoratorInfo } from './engine-api.js';
import { LIFECYCLE, type LifecycleMethod } from './curated/lifecycle.js';
export type { ClassInfo, PropertyInfo, MethodInfo, DecoratorInfo, LifecycleMethod };
export { LIFECYCLE, ENGINE_META, metaFooter, BUILTIN_COMPONENTS };
/** Engine API classes, singletons and function groups. */
export declare const CLASS_INFO: Record<string, ClassInfo>;
/** All prop decorators, including the list.* / map.* forms. */
export declare const DECORATORS: DecoratorInfo[];
/** Every documented symbol name, for tool enums. Derived — never hand-listed. */
export declare const CLASS_NAMES: string[];
export declare const COMPONENT_NAMES: string[];
export declare const CATEGORIES: {
    name: string;
    classes: string[];
}[];
export interface SearchResult {
    className: string;
    section: string;
    content: string;
    relevance: number;
}
export declare function searchDocs(query: string): SearchResult[];
export declare function formatClassInfo(className: string): string;
export declare function formatComponentInfo(name: string): string;
export declare function formatComponentList(group?: string, search?: string): string;
export declare function formatDecorators(): string;
export declare function formatLifecycle(): string;
export declare function formatCategories(): string;
export declare function formatSearchResults(results: SearchResult[]): string;
//# sourceMappingURL=docs-data.d.ts.map
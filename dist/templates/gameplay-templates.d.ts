/**
 * @file gameplay-templates.ts
 * @purpose Template generators for gameplay-related components
 */
export interface PickingSystemOptions {
    name: string;
    selectableTag: string;
}
export declare function generatePickingSystemTemplate(options: PickingSystemOptions): string;
export interface PrefabSpawnerOptions {
    name: string;
    spawnOnStart: boolean;
}
export declare function generatePrefabSpawnerTemplate(options: PrefabSpawnerOptions): string;
export interface ObjectPoolOptions {
    name: string;
    initialSize: number;
    autoGrow: boolean;
}
export declare function generateObjectPoolTemplate(options: ObjectPoolOptions): string;
export interface TagFilterOptions {
    name: string;
}
export declare function generateTagFilterTemplate(options: TagFilterOptions): string;
//# sourceMappingURL=gameplay-templates.d.ts.map
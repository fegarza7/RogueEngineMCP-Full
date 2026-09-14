/**
 * Hand-written RogueEngine foot-guns: things that compile, look right, and are
 * wrong. Not derivable from a .d.ts, so they live here permanently.
 *
 * Scope is deliberately GENERAL-PURPOSE RogueEngine knowledge — true for any
 * project. Project-specific conventions do not belong in this repo.
 */
export interface Gotcha {
    id: string;
    topic: 'assets' | 'performance' | 'raycasting' | 'models' | 'audio' | 'lifecycle' | 'api';
    title: string;
    detail: string;
    wrong?: string;
    right?: string;
}
export declare const GOTCHAS: Gotcha[];
export declare function formatGotchas(topic?: string): string;
//# sourceMappingURL=gotchas.d.ts.map
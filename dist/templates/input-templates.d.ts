/**
 * @file input-templates.ts
 * @purpose Template generators for input-related components
 */
export interface PlayerControllerOptions {
    name: string;
    includeJump: boolean;
    inputStyle: 'direct' | 'action-based';
}
export declare function generatePlayerControllerTemplate(options: PlayerControllerOptions): string;
//# sourceMappingURL=input-templates.d.ts.map
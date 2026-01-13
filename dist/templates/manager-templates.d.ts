/**
 * @file manager-templates.ts
 * @purpose Template generators for manager-type components
 */
export interface AudioManagerOptions {
    name: string;
    trackCount: number;
}
export declare function generateAudioManagerTemplate(options: AudioManagerOptions): string;
export interface EventManagerOptions {
    name: string;
}
export declare function generateEventManagerTemplate(options: EventManagerOptions): string;
export interface GameManagerOptions {
    name: string;
    includeSceneManagement: boolean;
}
export declare function generateGameManagerTemplate(options: GameManagerOptions): string;
//# sourceMappingURL=manager-templates.d.ts.map
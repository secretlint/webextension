/**
 * @title Setting
 */
export type SettingSchema = {
    /**
     * @title Enable Console Integration
     * @default true
     */
    enableConsoleIntegration: boolean;
    /**
     * @title Slice Content before
     * @default 32
     */
    sliceBefore: number;
    /**
     * @title Slice Content after
     * @default 32
     */
    sliceAfter: number;
};

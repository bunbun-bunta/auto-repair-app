export declare const AppConfig: {
    readonly APP_NAME: "Auto Repair Manager";
    readonly APP_VERSION: "1.0.0";
    readonly IS_DEVELOPMENT: boolean;
    readonly WINDOW: {
        readonly MIN_WIDTH: 1200;
        readonly MIN_HEIGHT: 800;
        readonly DEFAULT_WIDTH: 1400;
        readonly DEFAULT_HEIGHT: 900;
        readonly SHOW: false;
    };
    readonly EXPORT: {
        readonly MAX_FILE_SIZE: number;
        readonly SUPPORTED_FORMATS: readonly ["xlsx", "csv", "pdf"];
    };
};
export declare const loadEnvironmentConfig: () => {
    DATABASE_ENCRYPTION_KEY: string;
    LOG_LEVEL: string;
    DEBUG_MODE: boolean;
};

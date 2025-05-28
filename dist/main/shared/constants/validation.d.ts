export declare const VALIDATION_RULES: {
    readonly CUSTOMER_NAME: {
        readonly MIN_LENGTH: 1;
        readonly MAX_LENGTH: 100;
    };
    readonly VEHICLE_NUMBER: {
        readonly MIN_LENGTH: 4;
        readonly MAX_LENGTH: 20;
        readonly PATTERN: RegExp;
    };
    readonly STAFF_NAME: {
        readonly MIN_LENGTH: 1;
        readonly MAX_LENGTH: 50;
    };
    readonly EMAIL: {
        readonly PATTERN: RegExp;
    };
};
export declare const ERROR_MESSAGES: {
    readonly REQUIRED: "必須項目です";
    readonly INVALID_FORMAT: "形式が正しくありません";
    readonly INVALID_EMAIL: "メールアドレスの形式が正しくありません";
    readonly INVALID_DATE: "日付の形式が正しくありません";
    readonly DATE_RANGE_ERROR: "終了日時は開始日時より後に設定してください";
    readonly DATABASE_ERROR: "データベースエラーが発生しました";
    readonly NETWORK_ERROR: "ネットワークエラーが発生しました";
};

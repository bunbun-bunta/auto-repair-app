"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateApiHeaders = exports.generateGoogleAuthUrl = exports.GoogleConfig = void 0;
// src/shared/config/google.ts
const app_1 = require("./app");
exports.GoogleConfig = {
    // OAuth 2.0 設定
    OAUTH: {
        CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
        CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
        REDIRECT_URI: 'http://localhost:3000/auth/callback',
        SCOPES: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/userinfo.profile',
        ],
    },
    // Calendar API設定
    CALENDAR_API: {
        VERSION: 'v3',
        BASE_URL: 'https://www.googleapis.com/calendar/v3',
        TIMEOUT: 10000,
        RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
    },
    // 同期設定
    SYNC: {
        INTERVAL: 5 * 60 * 1000,
        BATCH_SIZE: 50,
        MAX_EVENTS_PER_REQUEST: 250,
        TIME_ZONE: 'Asia/Tokyo',
    },
    // 認証トークン設定
    TOKEN: {
        STORAGE_KEY: 'google_auth_tokens',
        REFRESH_THRESHOLD: 5 * 60 * 1000,
        MAX_REFRESH_ATTEMPTS: 3,
    },
    // エラーハンドリング設定
    ERROR_HANDLING: {
        QUOTA_EXCEEDED_RETRY_AFTER: 60 * 1000,
        RATE_LIMIT_RETRY_AFTER: 100,
        MAX_CONSECUTIVE_ERRORS: 5,
    },
};
// Google OAuth URLを生成
const generateGoogleAuthUrl = (state) => {
    const params = new URLSearchParams({
        client_id: exports.GoogleConfig.OAUTH.CLIENT_ID,
        redirect_uri: exports.GoogleConfig.OAUTH.REDIRECT_URI,
        scope: exports.GoogleConfig.OAUTH.SCOPES.join(' '),
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent',
        ...(state && { state }),
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};
exports.generateGoogleAuthUrl = generateGoogleAuthUrl;
// APIリクエストヘッダーを生成
const generateApiHeaders = (accessToken) => {
    return {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': `${app_1.AppConfig.APP_NAME}/${app_1.AppConfig.APP_VERSION}`,
    };
};
exports.generateApiHeaders = generateApiHeaders;
//# sourceMappingURL=google.js.map
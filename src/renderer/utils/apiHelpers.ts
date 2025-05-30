// src/renderer/utils/apiHelpers.ts
import { ApiResponse } from '@shared/types';

/**
 * APIレスポンスが成功かどうかを型安全に判定
 */
export function isSuccessResponse<T>(
    response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } {
    return response.success === true && response.data !== undefined;
}

/**
 * APIレスポンスからエラーメッセージを取得
 */
export function getErrorMessage(response: ApiResponse<any>): string {
    if (response.error) {
        return response.error;
    }
    if (response.message) {
        return response.message;
    }
    return '不明なエラーが発生しました';
}

/**
 * システム情報が有効かどうかを判定
 */
export function isValidSystemInfo(systemInfo: any): boolean {
    return (
        systemInfo &&
        typeof systemInfo === 'object' &&
        systemInfo.version !== undefined &&
        systemInfo.paths !== undefined
    );
}

/**
 * APIレスポンスのデータを安全に取得
 */
export function getResponseData<T>(response: ApiResponse<T>): T | null {
    if (isSuccessResponse(response)) {
        return response.data;
    }
    return null;
}

/**
 * APIエラーをコンソールにログ出力
 */
export function logApiError(
    operation: string,
    response: ApiResponse<any>
): void {
    if (!response.success) {
        console.error(`[API Error] ${operation}:`, {
            error: response.error,
            message: response.message,
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * 非同期API呼び出しのラッパー
 */
export async function safeApiCall<T>(
    apiCall: () => Promise<ApiResponse<T>>,
    operation: string = 'API call'
): Promise<ApiResponse<T>> {
    try {
        const response = await apiCall();

        if (!response.success) {
            logApiError(operation, response);
        }

        return response;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[API Error] ${operation} failed:`, error);

        return {
            success: false,
            error: errorMessage
        };
    }
}
// src/renderer/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { ApiResponse } from '../../shared/types';

export interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export interface UseApiActions<T> {
    execute: (...args: any[]) => Promise<T | null>;
    reset: () => void;
}

export function useApi<T = any>(
    apiFunction: (...args: any[]) => Promise<ApiResponse<T>>
): UseApiState<T> & UseApiActions<T> {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(async (...args: any[]): Promise<T | null> => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const response = await apiFunction(...args);

            if (response.success && response.data) {
                setState({
                    data: response.data,
                    loading: false,
                    error: null,
                });
                return response.data;
            } else {
                setState({
                    data: null,
                    loading: false,
                    error: response.error || 'Unknown error occurred',
                });
                return null;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setState({
                data: null,
                loading: false,
                error: errorMessage,
            });
            return null;
        }
    }, [apiFunction]);

    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
        });
    }, []);

    return {
        ...state,
        execute,
        reset,
    };
}
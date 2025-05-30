// src/renderer/components/common/DynamicSelect.tsx
import React, { useState, useEffect, useCallback } from 'react';

export interface DynamicSelectOption {
    value: string;
    label: string;
    usageCount?: number;
}

export interface DynamicSelectProps {
    // 基本プロパティ
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    style?: React.CSSProperties;

    // 動的機能
    options: DynamicSelectOption[];
    allowCustomInput?: boolean;
    onCreateNew?: (newValue: string) => Promise<boolean>;

    // 表示設定
    showUsageCount?: boolean;
    maxDisplayOptions?: number;

    // ラベル
    label?: string;
    errorMessage?: string;
}

export const DynamicSelect: React.FC<DynamicSelectProps> = ({
    value,
    onChange,
    placeholder = '選択してください',
    disabled = false,
    required = false,
    style,
    options,
    allowCustomInput = true,
    onCreateNew,
    showUsageCount = false,
    maxDisplayOptions = 50,
    label,
    errorMessage,
}) => {
    const [isCustomInput, setIsCustomInput] = useState(false);
    const [customValue, setCustomValue] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    // 使用頻度順でソートされたオプション
    const sortedOptions = [...options]
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, maxDisplayOptions);

    // 現在の値が既存のオプションにあるかチェック
    const isExistingOption = options.some(option => option.value === value);

    // カスタム入力モードの切り替え
    const handleToggleCustomInput = useCallback(() => {
        if (isCustomInput) {
            // カスタム入力モードを終了
            setIsCustomInput(false);
            setCustomValue('');
        } else {
            // カスタム入力モードを開始
            setIsCustomInput(true);
            setCustomValue(value);
        }
    }, [isCustomInput, value]);

    // プルダウンでの選択
    const handleSelectChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;

        if (selectedValue === '__custom__') {
            setIsCustomInput(true);
            setCustomValue(value);
        } else {
            onChange(selectedValue);
        }
    }, [onChange, value]);

    // カスタム入力の変更
    const handleCustomInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setCustomValue(newValue);
        onChange(newValue);
    }, [onChange]);

    // カスタム入力の確定（新規作成）
    const handleCreateNew = useCallback(async () => {
        if (!customValue.trim() || !onCreateNew) return;

        setIsCreating(true);
        try {
            const success = await onCreateNew(customValue.trim());
            if (success) {
                setIsCustomInput(false);
                setCustomValue('');
            }
        } catch (error) {
            console.error('新規作成エラー:', error);
        } finally {
            setIsCreating(false);
        }
    }, [customValue, onCreateNew]);

    // Enterキーでの新規作成
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isCreating) {
            handleCreateNew();
        }
    }, [handleCreateNew, isCreating]);

    return (
        <div style={{ marginBottom: '16px', ...style }}>
            {/* ラベル */}
            {label && (
                <label style={{
                    display: 'block',
                    marginBottom: '4px',
                    fontWeight: 'bold',
                    color: '#333'
                }}>
                    {label}
                    {required && <span style={{ color: '#f44336', marginLeft: '4px' }}>*</span>}
                </label>
            )}

            {/* メイン入力エリア */}
            <div style={{ position: 'relative' }}>
                {isCustomInput ? (
                    // カスタム入力モード
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                            type="text"
                            value={customValue}
                            onChange={handleCustomInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder={`新しい${label || '項目'}を入力`}
                            disabled={disabled || isCreating}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '16px',
                                backgroundColor: disabled ? '#f5f5f5' : 'white'
                            }}
                        />

                        {allowCustomInput && onCreateNew && (
                            <button
                                type="button"
                                onClick={handleCreateNew}
                                disabled={!customValue.trim() || disabled || isCreating}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#4caf50',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: disabled || isCreating ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    opacity: disabled || isCreating ? 0.6 : 1
                                }}
                            >
                                {isCreating ? '作成中...' : '✓ 追加'}
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={handleToggleCustomInput}
                            disabled={disabled}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: '#757575',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: disabled ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            ← 選択
                        </button>
                    </div>
                ) : (
                    // プルダウン選択モード
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                            value={isExistingOption ? value : ''}
                            onChange={handleSelectChange}
                            disabled={disabled}
                            required={required}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '16px',
                                backgroundColor: disabled ? '#f5f5f5' : 'white'
                            }}
                        >
                            <option value="">{placeholder}</option>
                            {sortedOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                    {showUsageCount && option.usageCount ? ` (${option.usageCount}回)` : ''}
                                </option>
                            ))}
                            {allowCustomInput && (
                                <option value="__custom__">--- 新規入力 ---</option>
                            )}
                        </select>

                        {allowCustomInput && (
                            <button
                                type="button"
                                onClick={handleToggleCustomInput}
                                disabled={disabled}
                                style={{
                                    padding: '8px 12px',
                                    backgroundColor: '#2196f3',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: disabled ? 'not-allowed' : 'pointer',
                                    fontSize: '14px'
                                }}
                            >
                                ✏️ 新規
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* 現在の値が既存オプションにない場合の表示 */}
            {!isCustomInput && value && !isExistingOption && (
                <div style={{
                    marginTop: '4px',
                    padding: '4px 8px',
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#856404'
                }}>
                    ⚠️ 「{value}」は登録されていない項目です
                </div>
            )}

            {/* エラーメッセージ */}
            {errorMessage && (
                <div style={{
                    marginTop: '4px',
                    color: '#f44336',
                    fontSize: '12px'
                }}>
                    {errorMessage}
                </div>
            )}

            {/* 使用頻度表示（デバッグ用） */}
            {showUsageCount && options.length > 0 && (
                <div style={{
                    marginTop: '4px',
                    fontSize: '12px',
                    color: '#666'
                }}>
                    {options.length}件のオプション（使用頻度順で表示）
                </div>
            )}
        </div>
    );
};
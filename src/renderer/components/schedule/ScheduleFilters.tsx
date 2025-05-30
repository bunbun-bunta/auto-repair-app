// src/renderer/components/schedule/ScheduleFilters.tsx
import React, { useState } from 'react';
import { ScheduleSearchParams } from '@shared/types';

const BUSINESS_CATEGORIES = [
    '修理', '点検', '車検', '納車', '引取り', '相談', 'その他'
] as const;

const BILLING_STATUS = [
    '未請求', '請求済み', '入金済み', 'キャンセル'
] as const;

interface ScheduleFiltersProps {
    onSearch: (params: ScheduleSearchParams) => void;
    staffList: any[];
}

export const ScheduleFilters: React.FC<ScheduleFiltersProps> = ({ onSearch, staffList }) => {
    const [filters, setFilters] = useState<ScheduleSearchParams>({});

    const handleFilterChange = (key: keyof ScheduleSearchParams, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onSearch(newFilters);
    };

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>検索・フィルター</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {/* キーワード検索 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        キーワード検索
                    </label>
                    <input
                        type="text"
                        placeholder="顧客名、車種、業務詳細で検索"
                        value={filters.keyword || ''}
                        onChange={(e) => handleFilterChange('keyword', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                {/* 期間開始 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        期間開始
                    </label>
                    <input
                        type="date"
                        value={filters.startDate || ''}
                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                {/* 期間終了 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        期間終了
                    </label>
                    <input
                        type="date"
                        value={filters.endDate || ''}
                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                {/* 業務カテゴリ */}
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        業務カテゴリ
                    </label>
                    <select
                        value={filters.businessCategories?.[0] || ''}
                        onChange={(e) => handleFilterChange('businessCategories', e.target.value ? [e.target.value] : [])}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}
                    >
                        <option value="">すべて</option>
                        {BUSINESS_CATEGORIES.map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>

                {/* 請求状況 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        請求状況
                    </label>
                    <select
                        value={filters.billingStatuses?.[0] || ''}
                        onChange={(e) => handleFilterChange('billingStatuses', e.target.value ? [e.target.value] : [])}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}
                    >
                        <option value="">すべて</option>
                        {BILLING_STATUS.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {/* 担当者 */}
                <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                        担当者
                    </label>
                    <select
                        value={filters.staffIds?.[0] || ''}
                        onChange={(e) => handleFilterChange('staffIds', e.target.value ? [parseInt(e.target.value)] : [])}
                        style={{
                            width: '100%',
                            padding: '8px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '6px',
                            fontSize: '14px'
                        }}
                    >
                        <option value="">すべて</option>
                        {staffList.map((staff: any) => (
                            <option key={staff.id} value={staff.id}>{staff.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* クリアボタン */}
            <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <button
                    onClick={() => {
                        setFilters({});
                        onSearch({});
                    }}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#757575',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🔄 フィルタークリア
                </button>
            </div>
        </div>
    );
};
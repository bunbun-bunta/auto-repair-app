// src/renderer/components/schedule/ScheduleCard.tsx
import React from 'react';
import { Schedule } from '@shared/types';

interface ScheduleCardProps {
    schedule: Schedule;
    onEdit: (schedule: Schedule) => void;
    onDelete: (schedule: Schedule) => void;
    onComplete: (schedule: Schedule) => void;
    onBillingUpdate: (schedule: Schedule) => void;
    staffName?: string;
    staffColor?: string;
}

export const ScheduleCard: React.FC<ScheduleCardProps> = ({ 
    schedule, 
    onEdit, 
    onDelete, 
    onComplete, 
    onBillingUpdate,
    staffName,
    staffColor 
}) => {
    const formatDateTime = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    };

    const isCompleted = !!schedule.actualEndDatetime;

    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '20px',
            margin: '12px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderLeft: `5px solid ${staffColor || '#1976d2'}`,
            opacity: isCompleted ? 0.8 : 1
        }}>
            {/* 予定基本情報 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px' }}>
                        {schedule.customerName}
                        {isCompleted && <span style={{ color: '#4caf50', fontSize: '14px', marginLeft: '8px' }}>✓ 完了</span>}
                    </h3>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>
                        <strong>車種:</strong> {schedule.vehicleType || '未設定'}
                    </p>
                    <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>
                        <strong>担当:</strong> {staffName || 'Unknown'}
                    </p>
                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        <strong>業務:</strong> {schedule.businessCategory}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                        background: schedule.billingStatus === '入金済み' ? '#4caf50' :
                            schedule.billingStatus === '請求済み' ? '#2196f3' :
                            schedule.billingStatus === 'キャンセル' ? '#f44336' : '#ff9800',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>
                        {schedule.billingStatus}
                    </span>
                </div>
            </div>

            {/* 日時情報 */}
            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '14px', color: '#666' }}>開始予定: </span>
                        <strong style={{ color: '#333' }}>{formatDateTime(schedule.startDatetime)}</strong>
                    </div>
                    {schedule.endDatetime && (
                        <div>
                            <span style={{ fontSize: '14px', color: '#666' }}>終了予定: </span>
                            <strong style={{ color: '#333' }}>{formatDateTime(schedule.endDatetime)}</strong>
                        </div>
                    )}
                </div>
                {isCompleted && (
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>実際の終了: </span>
                        <strong style={{ color: '#4caf50' }}>{formatDateTime(schedule.actualEndDatetime!)}</strong>
                    </div>
                )}
            </div>

            {/* 詳細情報 */}
            {(schedule.vehicleNumber || schedule.contactInfo || schedule.businessDetail || schedule.notes) && (
                <div style={{ marginBottom: '16px' }}>
                    {schedule.vehicleNumber && (
                        <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                            <strong>車両番号:</strong> {schedule.vehicleNumber}
                        </p>
                    )}
                    {schedule.contactInfo && (
                        <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                            <strong>連絡先:</strong> {schedule.contactInfo}
                        </p>
                    )}
                    {schedule.businessDetail && (
                        <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                            <strong>業務詳細:</strong> {schedule.businessDetail}
                        </p>
                    )}
                    {schedule.notes && (
                        <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                            <strong>備考:</strong> {schedule.notes}
                        </p>
                    )}
                </div>
            )}

            {/* アクションボタン */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => onEdit(schedule)}
                    style={{
                        background: '#2196f3',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    ✏️ 編集
                </button>
                
                {!isCompleted && (
                    <button
                        onClick={() => onComplete(schedule)}
                        style={{
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        ✓ 完了
                    </button>
                )}

                <button
                    onClick={() => onBillingUpdate(schedule)}
                    style={{
                        background: '#ff9800',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    💰 請求
                </button>

                <button
                    onClick={() => onDelete(schedule)}
                    style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    🗑️ 削除
                </button>
            </div>
        </div>
    );
};
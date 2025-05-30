// src/renderer/components/ScheduleManager.tsx
import React, { useState, useCallback } from 'react';
import { useSchedule } from '../hooks/useSchedule';
import { useStaff } from '../hooks/useStaff';
import { Schedule, ScheduleFormData } from '@shared/types';
import { ScheduleCard } from './schedule/ScheduleCard';
import { ScheduleForm } from './schedule/ScheduleForm';
import { ScheduleFilters } from './schedule/ScheduleFilters';

export const ScheduleManager: React.FC = () => {
    const {
        scheduleList,
        loading,
        error,
        todaySchedules,
        loadScheduleList,
        searchSchedules,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        completeSchedule,
        updateBillingStatus,
        clearError,
    } = useSchedule();

    const { staffList } = useStaff();

    const [showForm, setShowForm] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

    // スタッフ情報をマップ化
    const staffMap = staffList.reduce((map, staff) => {
        map[staff.id!] = staff;
        return map;
    }, {} as Record<number, any>);

    // 新規作成
    const handleCreate = useCallback(() => {
        setEditingSchedule(null);
        setShowForm(true);
    }, []);

    // 編集
    const handleEdit = useCallback((schedule: Schedule) => {
        setEditingSchedule(schedule);
        setShowForm(true);
    }, []);

    // 保存
    const handleSave = useCallback(async (data: ScheduleFormData): Promise<boolean> => {
        if (editingSchedule) {
            return await updateSchedule(editingSchedule.id!, data);
        } else {
            return await createSchedule(data);
        }
    }, [editingSchedule, updateSchedule, createSchedule]);

    // 削除
    const handleDelete = useCallback(async (schedule: Schedule) => {
        if (!schedule.id) return;

        if (window.confirm(`「${schedule.customerName}」の予定を削除してもよろしいですか？`)) {
            await deleteSchedule(schedule.id);
        }
    }, [deleteSchedule]);

    // 完了処理
    const handleComplete = useCallback(async (schedule: Schedule) => {
        if (!schedule.id) return;

        const now = new Date().toISOString();
        await completeSchedule(schedule.id, now);
    }, [completeSchedule]);

    // 請求状況更新
    const handleBillingUpdate = useCallback(async (schedule: Schedule) => {
        if (!schedule.id) return;

        const newStatus = window.prompt(
            `請求状況を選択してください:\n\n1. 未請求\n2. 請求済み\n3. 入金済み\n4. キャンセル`,
            '1'
        );

        const statusMap: Record<string, any> = {
            '1': '未請求',
            '2': '請求済み',
            '3': '入金済み',
            '4': 'キャンセル'
        };

        if (newStatus && statusMap[newStatus]) {
            await updateBillingStatus(schedule.id, statusMap[newStatus]);
        }
    }, [updateBillingStatus]);

    const today = new Date().toLocaleDateString('ja-JP');

    return (
        <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* ヘッダー */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1 style={{ margin: 0, color: '#333' }}>予定管理</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={loadScheduleList}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#757575',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                        disabled={loading}
                    >
                        {loading ? '更新中...' : '🔄 更新'}
                    </button>
                    <button
                        onClick={handleCreate}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}
                    >
                        ➕ 新規予定登録
                    </button>
                </div>
            </div>

            {/* エラー表示 */}
            {error && (
                <div style={{
                    backgroundColor: '#ffebee',
                    border: '1px solid #f44336',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ color: '#c62828' }}>{error}</span>
                    <button
                        onClick={clearError}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#c62828',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* ダッシュボード情報 */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {/* 今日の予定 */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#1976d2' }}>📅 今日の予定 ({today})</h3>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                        {todaySchedules.length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                        件の予定があります
                    </div>
                </div>

                {/* 全体統計 */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#4caf50' }}>📊 全体統計</h3>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                        {scheduleList.length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                        総予定数
                    </div>
                </div>

                {/* 完了済み */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#ff9800' }}>✅ 完了済み</h3>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                        {scheduleList.filter(s => s.actualEndDatetime).length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                        完了した予定
                    </div>
                </div>

                {/* 未完了 */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#f44336' }}>⏰ 未完了</h3>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
                        {scheduleList.filter(s => !s.actualEndDatetime).length}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                        未完了の予定
                    </div>
                </div>
            </div>

            {/* 検索フィルター */}
            <ScheduleFilters onSearch={searchSchedules} staffList={staffList} />

            {/* 予定一覧 */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
                    予定一覧 ({scheduleList.length}件)
                </h2>

                {loading && scheduleList.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666'
                    }}>
                        <div style={{ fontSize: '18px', marginBottom: '8px' }}>📊</div>
                        <div>読み込み中...</div>
                    </div>
                ) : scheduleList.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                        <div style={{ fontSize: '18px', marginBottom: '8px' }}>
                            予定が登録されていません
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            最初の予定を登録してください
                        </div>
                        <button
                            onClick={handleCreate}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            ➕ 最初の予定を登録
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(500px, 1fr))',
                        gap: '16px'
                    }}>
                        {scheduleList.map((schedule: Schedule) => {
                            const staff = staffMap[schedule.staffId];
                            return (
                                <ScheduleCard
                                    key={schedule.id}
                                    schedule={schedule}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onComplete={handleComplete}
                                    onBillingUpdate={handleBillingUpdate}
                                    staffName={staff?.name}
                                    staffColor={staff?.displayColor}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* 予定フォームダイアログ */}
            {showForm && (
                <ScheduleForm
                    schedule={editingSchedule}
                    onSave={handleSave}
                    onCancel={() => setShowForm(false)}
                    staffList={staffList}
                />
            )}
        </div>
    );
};
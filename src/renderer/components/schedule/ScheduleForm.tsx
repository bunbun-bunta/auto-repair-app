// src/renderer/components/schedule/ScheduleForm.tsx
import React, { useState } from 'react';
import { Schedule, ScheduleFormData } from '@shared/types';

const BUSINESS_CATEGORIES = [
    '修理', '点検', '車検', '納車', '引取り', '相談', 'その他'
] as const;

const BILLING_STATUS = [
    '未請求', '請求済み', '入金済み', 'キャンセル'
] as const;

interface ScheduleFormProps {
    schedule?: Schedule | null;
    onSave: (data: ScheduleFormData) => Promise<boolean>;
    onCancel: () => void;
    staffList: any[];
}

export const ScheduleForm: React.FC<ScheduleFormProps> = ({ schedule, onSave, onCancel, staffList }) => {
    const [formData, setFormData] = useState<ScheduleFormData>({
        customerName: schedule?.customerName || '',
        vehicleType: schedule?.vehicleType || '',
        vehicleNumber: schedule?.vehicleNumber || '',
        contactInfo: schedule?.contactInfo || '',
        staffId: schedule?.staffId || (staffList.length > 0 ? staffList[0].id : 0),
        startDatetime: schedule?.startDatetime || '',
        endDatetime: schedule?.endDatetime || '',
        businessCategory: schedule?.businessCategory || BUSINESS_CATEGORIES[0],
        businessDetail: schedule?.businessDetail || '',
        billingStatus: schedule?.billingStatus || '未請求',
        notes: schedule?.notes || '',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.customerName.trim()) {
            alert('顧客名は必須です');
            return;
        }
        if (!formData.startDatetime) {
            alert('開始日時は必須です');
            return;
        }
        if (formData.staffId === 0) {
            alert('担当者を選択してください');
            return;
        }

        setSaving(true);
        const success = await onSave(formData);
        setSaving(false);

        if (success) {
            onCancel();
        }
    };

    const generateEndDatetime = () => {
        if (formData.startDatetime) {
            const start = new Date(formData.startDatetime);
            const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
            const endString = end.toISOString().slice(0, 16);
            setFormData(prev => ({ ...prev, endDatetime: endString }));
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '30px',
                borderRadius: '12px',
                width: '600px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto'
            }}>
                <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
                    {schedule ? '予定編集' : '新規予定登録'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                顧客名 *
                            </label>
                            <input
                                type="text"
                                value={formData.customerName}
                                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                車種
                            </label>
                            <input
                                type="text"
                                value={formData.vehicleType}
                                onChange={(e) => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                車両番号
                            </label>
                            <input
                                type="text"
                                value={formData.vehicleNumber}
                                onChange={(e) => setFormData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                            />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                連絡先
                            </label>
                            <input
                                type="text"
                                value={formData.contactInfo}
                                onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                担当者 *
                            </label>
                            <select
                                value={formData.staffId}
                                onChange={(e) => setFormData(prev => ({ ...prev, staffId: parseInt(e.target.value) }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                                required
                            >
                                <option value={0}>担当者を選択</option>
                                {staffList.map(staff => (
                                    <option key={staff.id} value={staff.id}>{staff.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                業務カテゴリ *
                            </label>
                            <select
                                value={formData.businessCategory}
                                onChange={(e) => setFormData(prev => ({ ...prev, businessCategory: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                                required
                            >
                                {BUSINESS_CATEGORIES.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                開始日時 *
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.startDatetime}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDatetime: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                                required
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                終了日時
                                <button
                                    type="button"
                                    onClick={generateEndDatetime}
                                    style={{
                                        marginLeft: '8px',
                                        padding: '2px 8px',
                                        fontSize: '12px',
                                        backgroundColor: '#e3f2fd',
                                        border: '1px solid #2196f3',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    +2時間
                                </button>
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.endDatetime}
                                onChange={(e) => setFormData(prev => ({ ...prev, endDatetime: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                請求状況
                            </label>
                            <select
                                value={formData.billingStatus}
                                onChange={(e) => setFormData(prev => ({ ...prev, billingStatus: e.target.value as any }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                            >
                                {BILLING_STATUS.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                業務詳細
                            </label>
                            <input
                                type="text"
                                value={formData.businessDetail}
                                onChange={(e) => setFormData(prev => ({ ...prev, businessDetail: e.target.value }))}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                            />
                        </div>

                        <div style={{ gridColumn: 'span 2' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                備考
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '16px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                padding: '10px 20px',
                                border: '1px solid #ddd',
                                backgroundColor: 'white',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                            disabled={saving}
                        >
                            キャンセル
                        </button>
                        <button
                            type="submit"
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                            disabled={saving}
                        >
                            {saving ? '保存中...' : (schedule ? '更新' : '登録')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// src/renderer/components/StaffManager.tsx - インポートエラー修正版
import React, { useState, useCallback } from 'react';
import { useStaff } from '../hooks/useStaff';
import { Staff, StaffFormData } from '@shared/types';

// 一時的にここで定数を定義（インポートエラー回避）
const EVENT_COLORS = [
    '#FF6B6B',  // 赤系
    '#4ECDC4',  // 青緑系
    '#45B7D1',  // 青系
    '#96CEB4',  // 緑系
    '#FFEAA7',  // 黄系
    '#DDA0DD',  // 紫系
    '#98D8C8',  // 水色系
    '#F7DC6F'   // 黄緑系
] as const;

// シンプルなスタッフカードコンポーネント
interface StaffCardProps {
    staff: Staff;
    onEdit: (staff: Staff) => void;
    onDelete: (staff: Staff) => void;
    onOAuthUpdate: (staff: Staff) => void;
}

const StaffCard: React.FC<StaffCardProps> = ({ staff, onEdit, onDelete, onOAuthUpdate }) => {
    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '12px',
            padding: '20px',
            margin: '12px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s'
        }}>
            {/* スタッフ基本情報 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: staff.displayColor || '#1976d2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '18px'
                }}>
                    {staff.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', color: '#333', fontSize: '18px' }}>
                        {staff.name}
                    </h3>
                    <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                        {staff.email || 'メールアドレス未設定'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                        background: staff.permissionLevel === '管理者' ? '#1976d2' : '#757575',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>
                        {staff.permissionLevel}
                    </span>
                </div>
            </div>

            {/* OAuth認証状態 */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px'
            }}>
                <span style={{ fontSize: '14px', color: '#666' }}>
                    Google認証状態:
                </span>
                <span style={{
                    background: staff.oauthStatus === '認証済み' ? '#4caf50' :
                        staff.oauthStatus === 'エラー' ? '#f44336' :
                            staff.oauthStatus === '期限切れ' ? '#ff9800' : '#9e9e9e',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                }}>
                    {staff.oauthStatus}
                </span>
            </div>

            {/* アクションボタン */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => onEdit(staff)}
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
                <button
                    onClick={() => onOAuthUpdate(staff)}
                    style={{
                        background: '#ff9800',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                    disabled={!staff.email}
                >
                    🔐 認証
                </button>
                <button
                    onClick={() => onDelete(staff)}
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

// シンプルなスタッフフォームコンポーネント
interface StaffFormProps {
    staff?: Staff | null;
    onSave: (data: StaffFormData) => Promise<boolean>;
    onCancel: () => void;
}

const StaffFormDialog: React.FC<StaffFormProps> = ({ staff, onSave, onCancel }) => {
    const [formData, setFormData] = useState<StaffFormData>({
        name: staff?.name || '',
        displayColor: staff?.displayColor || EVENT_COLORS[0],
        email: staff?.email || '',
        oauthStatus: staff?.oauthStatus || '未認証',
        permissionLevel: staff?.permissionLevel || '一般',
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('スタッフ名は必須です');
            return;
        }

        setSaving(true);
        const success = await onSave(formData);
        setSaving(false);

        if (success) {
            onCancel(); // 成功時は閉じる
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
                width: '500px',
                maxWidth: '90vw'
            }}>
                <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
                    {staff ? 'スタッフ編集' : '新規スタッフ登録'}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                            スタッフ名 *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '16px'
                            }}
                        />
                        <small style={{ color: '#666' }}>Googleカレンダー連携で使用</small>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                            表示色
                        </label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {EVENT_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, displayColor: color }))}
                                    style={{
                                        width: '40px',
                                        height: '40px',
                                        backgroundColor: color,
                                        border: formData.displayColor === color ? '3px solid #333' : '1px solid #ddd',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                            権限レベル
                        </label>
                        <select
                            value={formData.permissionLevel}
                            onChange={(e) => setFormData(prev => ({ ...prev, permissionLevel: e.target.value as any }))}
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #ddd',
                                borderRadius: '6px',
                                fontSize: '16px'
                            }}
                        >
                            <option value="一般">一般</option>
                            <option value="管理者">管理者</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
                            {saving ? '保存中...' : (staff ? '更新' : '登録')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// メインのスタッフ管理コンポーネント
export const StaffManager: React.FC = () => {
    const {
        staffList,
        loading,
        error,
        statistics,
        loadStaffList,
        createStaff,
        updateStaff,
        deleteStaff,
        updateOAuthStatus,
        checkDependencies,
        clearError,
    } = useStaff();

    const [showForm, setShowForm] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    // 新規作成
    const handleCreate = useCallback(() => {
        setEditingStaff(null);
        setShowForm(true);
    }, []);

    // 編集
    const handleEdit = useCallback((staff: Staff) => {
        setEditingStaff(staff);
        setShowForm(true);
    }, []);

    // 保存
    const handleSave = useCallback(async (data: StaffFormData): Promise<boolean> => {
        if (editingStaff) {
            return await updateStaff(editingStaff.id!, data);
        } else {
            return await createStaff(data);
        }
    }, [editingStaff, updateStaff, createStaff]);

    // 削除
    const handleDelete = useCallback(async (staff: Staff) => {
        if (!staff.id) return;

        // 依存関係をチェック
        const dependencies = await checkDependencies(staff.id);

        if (dependencies?.hasSchedules) {
            alert(`「${staff.name}」には${dependencies.scheduleCount}件の予定が関連付けられているため削除できません。`);
            return;
        }

        if (window.confirm(`「${staff.name}」を削除してもよろしいですか？`)) {
            await deleteStaff(staff.id);
        }
    }, [deleteStaff, checkDependencies]);

    // OAuth認証更新
    const handleOAuthUpdate = useCallback(async (staff: Staff) => {
        if (!staff.email) {
            alert('メールアドレスが設定されていません');
            return;
        }

        if (!staff.id) return;

        // 実際のOAuth認証は後で実装、今は状態を「認証済み」に更新
        await updateOAuthStatus(staff.id, '認証済み');
    }, [updateOAuthStatus]);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* ヘッダー */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1 style={{ margin: 0, color: '#333' }}>スタッフ管理</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={loadStaffList}
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
                        ➕ 新規登録
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

            {/* 統計情報 */}
            {statistics && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    marginBottom: '30px'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1976d2' }}>
                            {statistics.totalCount}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>総スタッフ数</div>
                    </div>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#9c27b0' }}>
                            {statistics.adminCount}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>管理者</div>
                    </div>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>
                            {statistics.authenticatedCount}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>認証済み</div>
                    </div>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ff9800' }}>
                            {statistics.pendingAuthCount}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>未認証</div>
                    </div>
                </div>
            )}

            {/* スタッフ一覧 */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
                    スタッフ一覧 ({staffList.length}名)
                </h2>

                {loading && staffList.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666'
                    }}>
                        <div style={{ fontSize: '18px', marginBottom: '8px' }}>📊</div>
                        <div>読み込み中...</div>
                    </div>
                ) : staffList.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                        <div style={{ fontSize: '18px', marginBottom: '8px' }}>
                            スタッフが登録されていません
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            最初のスタッフを登録してください
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
                            ➕ 最初のスタッフを登録
                        </button>
                    </div>
                ) : (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                        gap: '16px'
                    }}>
                        {staffList.map((staff: Staff) => (
                            <StaffCard
                                key={staff.id}
                                staff={staff}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onOAuthUpdate={handleOAuthUpdate}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* スタッフフォームダイアログ */}
            {showForm && (
                <StaffFormDialog
                    staff={editingStaff}
                    onSave={handleSave}
                    onCancel={() => setShowForm(false)}
                />
            )}
        </div>
    );
};
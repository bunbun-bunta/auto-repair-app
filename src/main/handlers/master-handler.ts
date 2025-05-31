// src/renderer/components/MasterManager.tsx - 完全版マスタデータ管理画面
import React, { useState, useCallback } from 'react';
import { useMaster } from '../hooks/useMaster';
import { VehicleType, Customer, BusinessCategory } from '@shared/types';

// マスタタイプの定義
type MasterType = 'vehicleTypes' | 'customers' | 'businessCategories';

// マスタデータカードのプロパティ
interface MasterDataCardProps {
    item: VehicleType | Customer | BusinessCategory;
    type: MasterType;
    onEdit: (item: any) => void;
    onDelete: (item: any) => void;
}

// マスタデータカードコンポーネント
const MasterDataCard: React.FC<MasterDataCardProps> = ({ item, type, onEdit, onDelete }) => {
    const formatLastUsed = (lastUsedAt?: string) => {
        if (!lastUsedAt) return '未使用';
        const date = new Date(lastUsedAt);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    const getTypeSpecificInfo = () => {
        switch (type) {
            case 'customers':
                const customer = item as Customer;
                return customer.contactInfo ? (
                    <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                        📞 {customer.contactInfo}
                    </p>
                ) : null;
            
            case 'businessCategories':
                const category = item as BusinessCategory;
                return (
                    <>
                        {category.estimatedDuration && (
                            <p style={{ margin: '4px 0', color: '#666', fontSize: '14px' }}>
                                ⏱️ 推定時間: {category.estimatedDuration}分
                            </p>
                        )}
                    </>
                );
            
            default:
                return null;
        }
    };

    return (
        <div style={{
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '16px' }}>
                        {type === 'businessCategories' && (item as BusinessCategory).icon && (
                            <span style={{ marginRight: '8px' }}>{(item as BusinessCategory).icon}</span>
                        )}
                        {item.name}
                    </h4>
                    {getTypeSpecificInfo()}
                </div>
            </div>

            {/* 使用統計 */}
            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '8px',
                borderRadius: '4px',
                marginBottom: '12px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                    <span>使用回数: <strong>{item.usageCount || 0}回</strong></span>
                    <span>最終使用: {formatLastUsed(item.lastUsedAt)}</span>
                </div>
            </div>

            {/* アクションボタン */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                {(type === 'customers' || type === 'businessCategories') && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(item);
                        }}
                        style={{
                            background: '#2196f3',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                        }}
                    >
                        ✏️ 編集
                    </button>
                )}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                    }}
                    style={{
                        background: '#f44336',
                        color: 'white',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                    }}
                >
                    🗑️ 削除
                </button>
            </div>
        </div>
    );
};

// マスタデータフォームのプロパティ
interface MasterDataFormProps {
    type: MasterType;
    item?: any | null;
    onSave: (data: any) => Promise<boolean>;
    onCancel: () => void;
}

// マスタデータフォームコンポーネント
const MasterDataForm: React.FC<MasterDataFormProps> = ({ type, item, onSave, onCancel }) => {
    const [formData, setFormData] = useState(() => ({
        name: item?.name || '',
        contactInfo: item?.contactInfo || '',
        icon: item?.icon || '',
        estimatedDuration: item?.estimatedDuration || '',
    }));
    const [saving, setSaving] = useState(false);

    const getTitle = () => {
        const typeNames = {
            vehicleTypes: '車種',
            customers: '顧客',
            businessCategories: '業務カテゴリ'
        };
        return `${item ? '編集' : '新規登録'} - ${typeNames[type]}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('名前は必須です');
            return;
        }

        setSaving(true);
        try {
            const success = await onSave(formData);
            if (success) {
                onCancel();
            }
        } catch (error) {
            console.error('保存エラー:', error);
        } finally {
            setSaving(false);
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
                width: '400px',
                maxWidth: '90vw'
            }}>
                <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
                    {getTitle()}
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* 名前 */}
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                            名前 *
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

                    {/* 顧客の場合：連絡先 */}
                    {type === 'customers' && (
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                連絡先
                            </label>
                            <input
                                type="text"
                                value={formData.contactInfo}
                                onChange={(e) => setFormData(prev => ({ ...prev, contactInfo: e.target.value }))}
                                placeholder="電話番号やメールアドレス"
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '6px',
                                    fontSize: '16px'
                                }}
                            />
                        </div>
                    )}

                    {/* 業務カテゴリの場合：アイコンと推定時間 */}
                    {type === 'businessCategories' && (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                    アイコン
                                </label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                                    placeholder="🔧 (絵文字など)"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                                    推定作業時間（分）
                                </label>
                                <input
                                    type="number"
                                    value={formData.estimatedDuration}
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        estimatedDuration: parseInt(e.target.value) || '' 
                                    }))}
                                    placeholder="60"
                                    min="0"
                                    max="480"
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '16px'
                                    }}
                                />
                            </div>
                        </>
                    )}

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
                            {saving ? '保存中...' : (item ? '更新' : '登録')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// メインのマスタ管理コンポーネント
export const MasterManager: React.FC = () => {
    const {
        vehicleTypes,
        customers,
        businessCategories,
        loading,
        error,
        createVehicleType,
        deleteVehicleType,
        createCustomer,
        updateCustomer,
        deleteCustomer,
        createBusinessCategory,
        updateBusinessCategory,
        deleteBusinessCategory,
        clearError,
        loadAllMasterData,
    } = useMaster();

    const [activeTab, setActiveTab] = useState<MasterType>('vehicleTypes');
    const [showForm, setShowForm] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // タブ情報
    const tabs = [
        { key: 'vehicleTypes', label: '車種マスタ', icon: '🚗', count: vehicleTypes.length },
        { key: 'customers', label: '顧客マスタ', icon: '👥', count: customers.length },
        { key: 'businessCategories', label: '業務カテゴリ', icon: '📋', count: businessCategories.length },
    ] as const;

    // 新規作成
    const handleCreate = useCallback(() => {
        setEditingItem(null);
        setShowForm(true);
    }, []);

    // 編集
    const handleEdit = useCallback((item: any) => {
        setEditingItem(item);
        setShowForm(true);
    }, []);

    // 削除
    const handleDelete = useCallback(async (item: any) => {
        if (!item.id) return;

        const itemName = item.name;
        if (window.confirm(`「${itemName}」を削除してもよろしいですか？`)) {
            let success = false;

            switch (activeTab) {
                case 'vehicleTypes':
                    success = await deleteVehicleType(item.id);
                    break;
                case 'customers':
                    success = await deleteCustomer(item.id);
                    break;
                case 'businessCategories':
                    success = await createBusinessCategory(formData.name, formData.icon, formData.estimatedDuration);
                    break;
            }
        }

        if (success) {
            setShowForm(false);
            setEditingItem(null);
        }

        return success;
    }, [activeTab, editingItem, createVehicleType, createCustomer, createBusinessCategory, updateCustomer, updateBusinessCategory]);

    // 現在のデータを取得
    const getCurrentData = () => {
        switch (activeTab) {
            case 'vehicleTypes':
                return vehicleTypes;
            case 'customers':
                return customers;
            case 'businessCategories':
                return businessCategories;
            default:
                return [];
        }
    };

    // フォームを閉じる
    const handleCloseForm = useCallback(() => {
        setShowForm(false);
        setEditingItem(null);
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* ヘッダー */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
            }}>
                <h1 style={{ margin: 0, color: '#333' }}>マスタデータ管理</h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={loadAllMasterData}
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

            {/* 統計カード */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                marginBottom: '30px'
            }}>
                {tabs.map((tab) => (
                    <div key={tab.key} style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        border: activeTab === tab.key ? '2px solid #1976d2' : '1px solid #e0e0e0',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                    onClick={() => setActiveTab(tab.key as MasterType)}
                    onMouseEnter={(e) => {
                        if (activeTab !== tab.key) {
                            e.currentTarget.style.borderColor = '#1976d2';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (activeTab !== tab.key) {
                            e.currentTarget.style.borderColor = '#e0e0e0';
                        }
                    }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>{tab.icon}</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1976d2', marginBottom: '4px' }}>
                            {tab.count}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666' }}>{tab.label}</div>
                    </div>
                ))}
            </div>

            {/* タブナビゲーション */}
            <div style={{
                borderBottom: '1px solid #ddd',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', gap: '0' }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key as MasterType)}
                            style={{
                                padding: '12px 24px',
                                border: 'none',
                                backgroundColor: activeTab === tab.key ? '#e3f2fd' : 'transparent',
                                color: activeTab === tab.key ? '#1976d2' : '#666',
                                borderBottom: activeTab === tab.key ? '2px solid #1976d2' : '2px solid transparent',
                                cursor: 'pointer',
                                fontSize: '16px',
                                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
                            {tab.label}
                            <span style={{
                                backgroundColor: activeTab === tab.key ? '#1976d2' : '#999',
                                color: 'white',
                                borderRadius: '12px',
                                padding: '2px 8px',
                                fontSize: '12px',
                                minWidth: '20px',
                                textAlign: 'center'
                            }}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* コンテンツエリア */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                {loading && getCurrentData().length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666'
                    }}>
                        <div style={{ fontSize: '18px', marginBottom: '8px' }}>📊</div>
                        <div>読み込み中...</div>
                    </div>
                ) : getCurrentData().length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                            {tabs.find(tab => tab.key === activeTab)?.icon}
                        </div>
                        <div style={{ fontSize: '18px', marginBottom: '8px' }}>
                            {tabs.find(tab => tab.key === activeTab)?.label}が登録されていません
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            最初のデータを登録してください
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
                            ➕ 最初のデータを登録
                        </button>
                    </div>
                ) : (
                    <div>
                        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
                            {tabs.find(tab => tab.key === activeTab)?.label} ({getCurrentData().length}件)
                        </h3>

                        {/* データ一覧 */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '16px'
                        }}>
                            {getCurrentData().map((item: any) => (
                                <MasterDataCard
                                    key={item.id}
                                    item={item}
                                    type={activeTab}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* フォームダイアログ */}
            {showForm && (
                <MasterDataForm
                    type={activeTab}
                    item={editingItem}
                    onSave={handleFormSubmit}
                    onCancel={handleCloseForm}
                />
            )}
        </div>
    );
}; await deleteBusinessCategory(item.id);
                    break;
            }

            if (success) {
                console.log(`${itemName} を削除しました`);
            }
        }
    }, [activeTab, deleteVehicleType, deleteCustomer, deleteBusinessCategory]);

    // フォーム送信
    const handleFormSubmit = useCallback(async (formData: any): Promise<boolean> => {
        let success = false;

        if (editingItem) {
            // 更新
            switch (activeTab) {
                case 'customers':
                    success = await updateCustomer(editingItem.id, formData);
                    break;
                case 'businessCategories':
                    success = await updateBusinessCategory(editingItem.id, formData);
                    break;
            }
        } else {
            // 新規作成
            switch (activeTab) {
                case 'vehicleTypes':
                    success = await createVehicleType(formData.name);
                    break;
                case 'customers':
                    success = await createCustomer(formData.name, formData.contactInfo);
                    break;
                case 'businessCategories':
                    success =
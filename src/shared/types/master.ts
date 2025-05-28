// マスタデータの基本型
export interface MasterData {
    id?: number;
    name: string;                  // 名前
    displayOrder?: number;         // 表示順序
    usageCount?: number;           // 使用回数
    lastUsedAt?: string;           // 最終使用日
    isActive?: boolean;            // 有効/無効
    createdAt?: string;
    updatedAt?: string;
}

// 各マスタデータの型（基本型を継承）
export interface VehicleType extends MasterData { }

export interface Customer extends MasterData {
    contactInfo?: string;          // 連絡先
    lastServiceDate?: string;      // 最終サービス日
}

export interface BusinessCategory extends MasterData {
    icon?: string;                 // アイコン
    estimatedDuration?: number;    // 推定作業時間（分）
}
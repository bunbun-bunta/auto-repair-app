// 予定データの型定義
export interface Schedule {
    id?: number;                    // ID（自動生成されるので?付き）
    customerName: string;           // 顧客名（必須）
    vehicleType?: string;           // 車種（任意）
    vehicleNumber?: string;         // 車両番号（任意）
    contactInfo?: string;           // 連絡先（任意）
    staffId: number;               // 担当者ID（必須）
    startDatetime: string;         // 開始日時（必須）
    endDatetime?: string;          // 終了日時（任意）
    actualStartDatetime?: string;  // 実際の開始日時（任意）
    actualEndDatetime?: string;    // 実際の終了日時（任意）
    businessCategory: string;      // 業務カテゴリ（必須）
    businessDetail?: string;       // 業務詳細（任意）
    billingStatus: BillingStatus;  // 請求状況（必須）
    notes?: string;                // 備考（任意）
    googleEventId?: string;        // GoogleカレンダーID（任意）
    createdAt?: string;            // 作成日時（自動）
    updatedAt?: string;            // 更新日時（自動）
}

// フォーム用のデータ型（IDと日時を除外）
export interface ScheduleFormData extends Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'> { }

// 検索条件の型
export interface ScheduleSearchParams {
    keyword?: string;              // キーワード検索
    staffIds?: number[];           // 担当者で絞り込み
    businessCategories?: string[]; // 業務カテゴリで絞り込み
    billingStatuses?: BillingStatus[]; // 請求状況で絞り込み
    startDate?: string;            // 期間開始日
    endDate?: string;              // 期間終了日
    sortBy?: 'startDatetime' | 'customerName' | 'staffId'; // 並び順
    sortOrder?: 'asc' | 'desc';    // 昇順・降順
    page?: number;                 // ページ番号
    limit?: number;                // 1ページの件数
}

// 請求状況の選択肢
export type BillingStatus = '未請求' | '請求済み' | '入金済み' | 'キャンセル';
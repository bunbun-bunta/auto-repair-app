// 担当者データの型定義
export interface Staff {
    id?: number;
    name: string;                  // 担当者名
    displayColor: string;          // 表示色（カレンダー用）
    email?: string;                // メールアドレス
    oauthStatus: OAuthStatus;      // Google認証状況
    permissionLevel: PermissionLevel; // 権限レベル
    createdAt?: string;
    updatedAt?: string;
}

export interface StaffFormData extends Omit<Staff, 'id' | 'createdAt' | 'updatedAt'> { }

export type OAuthStatus = '未認証' | '認証済み' | '期限切れ' | 'エラー';
export type PermissionLevel = '管理者' | '一般';
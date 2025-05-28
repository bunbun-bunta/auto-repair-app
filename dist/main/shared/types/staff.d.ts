export interface Staff {
    id?: number;
    name: string;
    displayColor: string;
    email?: string;
    oauthStatus: OAuthStatus;
    permissionLevel: PermissionLevel;
    createdAt?: string;
    updatedAt?: string;
}
export interface StaffFormData extends Omit<Staff, 'id' | 'createdAt' | 'updatedAt'> {
}
export type OAuthStatus = '未認証' | '認証済み' | '期限切れ' | 'エラー';
export type PermissionLevel = '管理者' | '一般';

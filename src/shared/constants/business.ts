// 業務関連の定数
export const BUSINESS_CATEGORIES = {
    REPAIR: '修理',
    INSPECTION: '点検',
    VEHICLE_INSPECTION: '車検',
    DELIVERY: '納車',
    PICKUP: '引取り',
    CONSULTATION: '相談',
    OTHER: 'その他',
} as const;

export const BILLING_STATUS = {
    UNBILLED: '未請求',
    BILLED: '請求済み',
    PAID: '入金済み',
    CANCELLED: 'キャンセル',
} as const;

export const PERMISSION_LEVELS = {
    ADMIN: '管理者',
    GENERAL: '一般',
} as const;
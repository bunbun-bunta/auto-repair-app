"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMISSION_LEVELS = exports.BILLING_STATUS = exports.BUSINESS_CATEGORIES = void 0;
// 業務関連の定数
exports.BUSINESS_CATEGORIES = {
    REPAIR: '修理',
    INSPECTION: '点検',
    VEHICLE_INSPECTION: '車検',
    DELIVERY: '納車',
    PICKUP: '引取り',
    CONSULTATION: '相談',
    OTHER: 'その他',
};
exports.BILLING_STATUS = {
    UNBILLED: '未請求',
    BILLED: '請求済み',
    PAID: '入金済み',
    CANCELLED: 'キャンセル',
};
exports.PERMISSION_LEVELS = {
    ADMIN: '管理者',
    GENERAL: '一般',
};
//# sourceMappingURL=business.js.map
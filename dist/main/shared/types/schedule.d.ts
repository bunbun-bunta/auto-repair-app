export interface Schedule {
    id?: number;
    customerName: string;
    vehicleType?: string;
    vehicleNumber?: string;
    contactInfo?: string;
    staffId: number;
    startDatetime: string;
    endDatetime?: string;
    actualStartDatetime?: string;
    actualEndDatetime?: string;
    businessCategory: string;
    businessDetail?: string;
    billingStatus: BillingStatus;
    notes?: string;
    googleEventId?: string;
    createdAt?: string;
    updatedAt?: string;
}
export interface ScheduleFormData extends Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'> {
}
export interface ScheduleSearchParams {
    keyword?: string;
    staffIds?: number[];
    businessCategories?: string[];
    billingStatuses?: BillingStatus[];
    startDate?: string;
    endDate?: string;
    sortBy?: 'startDatetime' | 'customerName' | 'staffId';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
}
export type BillingStatus = '未請求' | '請求済み' | '入金済み' | 'キャンセル';

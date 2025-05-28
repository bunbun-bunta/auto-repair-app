// src/shared/types/api.ts
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// IPC通信で使用するチャンネル定義
export interface IpcChannels {
    // テスト・システム系
    'test:connection': () => Promise<ApiResponse<{
        status: string;
        timestamp: string;
        message: string;
    }>>;

    'app:getVersion': () => Promise<ApiResponse<{
        version: string;
        name: string;
    }>>;

    'app:getPath': () => Promise<ApiResponse<{
        userData: string;
        documents: string;
        temp: string;
    }>>;

    'notification:show': (title: string, body: string) => Promise<ApiResponse<{
        shown: boolean;
        message: string;
    }>>;

    // 将来的に追加される予定の型定義
    /*
    // Schedule
    'schedule:getAll': (params: ScheduleSearchParams) => Promise<PaginatedResponse<Schedule>>;
    'schedule:getById': (id: number) => Promise<ApiResponse<Schedule>>;
    'schedule:create': (data: ScheduleFormData) => Promise<ApiResponse<Schedule>>;
    'schedule:update': (id: number, data: Partial<ScheduleFormData>) => Promise<ApiResponse<Schedule>>;
    'schedule:delete': (id: number) => Promise<ApiResponse<void>>;
    
    // Staff
    'staff:getAll': () => Promise<ApiResponse<Staff[]>>;
    'staff:create': (data: StaffFormData) => Promise<ApiResponse<Staff>>;
    'staff:update': (id: number, data: Partial<StaffFormData>) => Promise<ApiResponse<Staff>>;
    'staff:delete': (id: number) => Promise<ApiResponse<void>>;
    
    // Master
    'master:getVehicleTypes': () => Promise<ApiResponse<VehicleType[]>>;
    'master:getCustomers': () => Promise<ApiResponse<Customer[]>>;
    'master:getBusinessCategories': () => Promise<ApiResponse<BusinessCategory[]>>;
    'master:updateUsage': (type: string, name: string) => Promise<ApiResponse<void>>;
    
    // Export
    'export:calendar': (config: ExportConfig) => Promise<ApiResponse<string>>;
    
    // Google Calendar
    'google:authenticate': (staffId: number) => Promise<ApiResponse<void>>;
    'google:syncEvent': (scheduleId: number) => Promise<ApiResponse<void>>;
    */
}

export type IpcChannel = keyof IpcChannels;
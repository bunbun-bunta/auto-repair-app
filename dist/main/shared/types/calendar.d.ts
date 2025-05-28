export interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    resource: any;
    color?: string;
    textColor?: string;
    borderColor?: string;
}
export interface CalendarViewConfig {
    view: 'month' | 'week' | 'day';
    date: Date;
    showWeekends: boolean;
    startHour: number;
    endHour: number;
}
export interface ExportConfig {
    format: 'calendar' | 'list' | 'summary';
    year: number;
    month: number;
    includeCompleted: boolean;
    includeUnbilled: boolean;
    staffIds?: number[];
}

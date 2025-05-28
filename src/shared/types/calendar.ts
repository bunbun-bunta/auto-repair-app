// カレンダー関連の型定義
export interface CalendarEvent {
    id: string;                    // イベントID
    title: string;                 // タイトル
    start: Date;                   // 開始日時
    end: Date;                     // 終了日時
    resource: any;                 // 関連データ（予定データなど）
    color?: string;                // 背景色
    textColor?: string;            // 文字色
    borderColor?: string;          // 枠線色
}

// カレンダー表示設定
export interface CalendarViewConfig {
    view: 'month' | 'week' | 'day'; // 表示モード
    date: Date;                     // 表示する日付
    showWeekends: boolean;          // 週末表示
    startHour: number;              // 表示開始時間
    endHour: number;                // 表示終了時間
}

// Excel出力設定
export interface ExportConfig {
    format: 'calendar' | 'list' | 'summary'; // 出力形式
    year: number;                   // 年
    month: number;                  // 月
    includeCompleted: boolean;      // 完了済みを含める
    includeUnbilled: boolean;       // 未請求を含める
    staffIds?: number[];            // 対象担当者
}
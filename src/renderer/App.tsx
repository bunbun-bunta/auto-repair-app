// src/renderer/App.tsx (本格的なスタッフ管理システム版)
import React, { useState, useEffect } from 'react';
import { StaffManager } from './components/StaffManager';

// ナビゲーションタブの定義
type NavigationTab = 'dashboard' | 'staff' | 'schedule' | 'calendar' | 'settings';

interface NavigationItem {
  id: NavigationTab;
  label: string;
  icon: string;
  description: string;
  available: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'ダッシュボード',
    icon: '📊',
    description: '概要と統計情報',
    available: true
  },
  {
    id: 'staff',
    label: 'スタッフ管理',
    icon: '👥',
    description: '担当者の登録・編集',
    available: true
  },
  {
    id: 'schedule',
    label: '予定管理',
    icon: '📅',
    description: '予定の登録・編集',
    available: false // 未実装
  },
  {
    id: 'calendar',
    label: 'カレンダー',
    icon: '🗓️',
    description: 'カレンダー表示',
    available: false // 未実装
  },
  {
    id: 'settings',
    label: '設定',
    icon: '⚙️',
    description: 'アプリケーション設定',
    available: false // 未実装
  }
];

// ダッシュボードコンポーネント
const Dashboard: React.FC = () => {
  const [systemInfo, setSystemInfo] = useState<any>(null);

  useEffect(() => {
    // システム情報を取得
    const loadSystemInfo = async () => {
      try {
        if (window.electronAPI?.getAppVersion) {
          const versionInfo = await window.electronAPI.getAppVersion();
          const pathInfo = await window.electronAPI.getAppPath();

          setSystemInfo({
            version: versionInfo,
            paths: pathInfo
          });
        }
      } catch (error) {
        console.error('システム情報取得エラー:', error);
      }
    };

    loadSystemInfo();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ margin: '0 0 30px 0', color: '#333' }}>ダッシュボード</h1>

      {/* ウェルカムメッセージ */}
      <div style={{
        backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '30px',
        borderRadius: '12px',
        marginBottom: '30px'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>🚗 自動車業務管理システム</h2>
        <p style={{ margin: '0', opacity: 0.9 }}>
          スタッフ管理、予定管理、カレンダー表示、Googleカレンダー連携を統合したシステムです
        </p>
      </div>

      {/* 機能状況 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>✅ 実装済み機能</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
            <li>Electronアプリケーション基盤</li>
            <li>IPC通信システム</li>
            <li>SQLiteデータベース</li>
            <li>スタッフ管理機能</li>
            <li>基本的なUI/UX</li>
          </ul>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🚧 開発予定</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#666' }}>
            <li>予定管理機能</li>
            <li>カレンダー表示</li>
            <li>Googleカレンダー連携</li>
            <li>Excel出力機能</li>
            <li>分析・統計機能</li>
          </ul>
        </div>

        {systemInfo && (
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>ℹ️ システム情報</h3>
            <div style={{ fontSize: '14px', color: '#666' }}>
              <p style={{ margin: '5px 0' }}>
                <strong>アプリ:</strong> {systemInfo.version?.data?.name || 'N/A'}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>バージョン:</strong> {systemInfo.version?.data?.version || 'N/A'}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>データフォルダ:</strong><br />
                <code style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                  {systemInfo.paths?.data?.userData || 'N/A'}
                </code>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* クイックアクション */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🚀 クイックアクション</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔄 アプリを再読み込み
          </button>
          <button
            onClick={() => {
              if (window.electronAPI?._debug) {
                window.electronAPI._debug.listChannels();
              }
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff9800',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            🔍 デバッグ情報を表示
          </button>
        </div>
      </div>
    </div>
  );
};

// メインアプリケーション
const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('dashboard');
  const [isElectronReady, setIsElectronReady] = useState(false);

  // Electron環境の初期化確認
  useEffect(() => {
    const checkElectronReadiness = () => {
      if (window.electronAPI) {
        setIsElectronReady(true);
        console.log('✅ Electron環境準備完了');
      } else {
        console.log('⚠️ Electron環境未準備 - 3秒後に再確認');
        setTimeout(checkElectronReadiness, 3000);
      }
    };

    checkElectronReadiness();
  }, []);

  // コンテンツをレンダリング
  const renderContent = () => {
    if (!isElectronReady) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '400px',
          color: '#666'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚡</div>
          <div style={{ fontSize: '18px', marginBottom: '10px' }}>
            Electronアプリケーションを初期化中...
          </div>
          <div style={{ fontSize: '14px' }}>
            しばらくお待ちください
          </div>
        </div>
      );
    }

    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'staff':
        return <StaffManager />;
      case 'schedule':
        return (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📅</div>
            <h2>予定管理機能</h2>
            <p>この機能は現在開発中です</p>
          </div>
        );
      case 'calendar':
        return (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🗓️</div>
            <h2>カレンダー表示機能</h2>
            <p>この機能は現在開発中です</p>
          </div>
        );
      case 'settings':
        return (
          <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚙️</div>
            <h2>設定機能</h2>
            <p>この機能は現在開発中です</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* サイドバーナビゲーション */}
      <div style={{
        width: '250px',
        backgroundColor: 'white',
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* ロゴ */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #eee',
          textAlign: 'center'
        }}>
          <h2 style={{
            margin: 0,
            color: '#333',
            fontSize: '18px'
          }}>
            🚗 Auto Repair<br />Manager
          </h2>
        </div>

        {/* ナビゲーションメニュー */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => item.available && setCurrentTab(item.id)}
              style={{
                width: '100%',
                padding: '12px 20px',
                border: 'none',
                backgroundColor: currentTab === item.id ? '#e3f2fd' : 'transparent',
                color: item.available ? (currentTab === item.id ? '#1976d2' : '#666') : '#ccc',
                textAlign: 'left',
                cursor: item.available ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '14px',
                borderLeft: currentTab === item.id ? '3px solid #1976d2' : '3px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: currentTab === item.id ? 'bold' : 'normal' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>
                  {item.description}
                </div>
              </div>
              {!item.available && (
                <span style={{ marginLeft: 'auto', fontSize: '12px' }}>🚧</span>
              )}
            </button>
          ))}
        </nav>

        {/* フッター */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #eee',
          fontSize: '12px',
          color: '#999',
          textAlign: 'center'
        }}>
          v1.0.0 | Electron App
        </div>
      </div>

      {/* メインコンテンツ */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default App;
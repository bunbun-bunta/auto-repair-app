// src/renderer/App.tsx（修正版 - 段階的テスト用）
import React, { useState } from 'react';
import { Staff } from './types/basic';

const SimpleStaffCard = ({ staff }: { staff: Staff }) => (
  <div style={{
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    margin: '8px 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: staff.displayColor || '#1976d2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold'
      }}>
        {staff.name.charAt(0)}
      </div>
      <div>
        <h3 style={{ margin: '0 0 4px 0', color: '#333' }}>{staff.name}</h3>
        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>{staff.email || '未設定'}</p>
      </div>
    </div>
    <div style={{ marginTop: '12px', fontSize: '12px' }}>
      <span style={{
        background: staff.permissionLevel === '管理者' ? '#1976d2' : '#ccc',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px',
        marginRight: '8px'
      }}>
        {staff.permissionLevel}
      </span>
      <span style={{
        background: staff.oauthStatus === '認証済み' ? '#4caf50' : '#ff9800',
        color: 'white',
        padding: '2px 8px',
        borderRadius: '12px'
      }}>
        {staff.oauthStatus}
      </span>
    </div>
  </div>
);

const App: React.FC = () => {
  // テスト用のダミーデータ
  const [testStaff] = useState<Staff[]>([
    {
      id: 1,
      name: '田中太郎',
      email: 'tanaka@example.com',
      displayColor: '#FF6B6B',
      permissionLevel: '管理者',
      oauthStatus: '認証済み'
    },
    {
      id: 2,
      name: '佐藤花子',
      email: 'sato@example.com',
      displayColor: '#4ECDC4',
      permissionLevel: '一般',
      oauthStatus: '未認証'
    },
    {
      id: 3,
      name: '山田次郎',
      email: '',
      displayColor: '#45B7D1',
      permissionLevel: '一般',
      oauthStatus: '未認証'
    }
  ]);

  const [connectionTest, setConnectionTest] = useState<string>('未テスト');

  const testElectronConnection = async () => {
    try {
      setConnectionTest('テスト中...');
      
      // 詳細なデバッグ情報を出力
      console.log('=== IPC通信デバッグ開始 ===');
      console.log('window.electronAPI:', window.electronAPI);
      console.log('typeof window.electronAPI:', typeof window.electronAPI);
      
      if (window.electronAPI) {
        console.log('electronAPI methods:', Object.keys(window.electronAPI));
        
        // 複数のテスト方法を試行
        console.log('テスト1: 基本的なinvoke呼び出し');
        const result1 = await window.electronAPI.invoke('system:test:connection');
        console.log('テスト1結果:', result1);
        
        console.log('テスト2: 専用メソッド呼び出し');
        const result2 = await window.electronAPI.testConnection();
        console.log('テスト2結果:', result2);
        
        console.log('テスト3: バージョン情報取得');
        const result3 = await window.electronAPI.getAppVersion();
        console.log('テスト3結果:', result3);
        
        setConnectionTest(`✅ 接続成功 (${new Date().toLocaleTimeString()})`);
      } else {
        console.log('window.electronAPI が undefined です');
        console.log('利用可能なwindowプロパティ:', Object.keys(window));
        setConnectionTest('⚠️ Electron APIが利用できません（ブラウザモード）');
      }
      
      console.log('=== IPC通信デバッグ終了 ===');
    } catch (error) {
      setConnectionTest('❌ 接続エラー');
      console.error('Electron API テストエラー:', error);
      
      // TypeScript対応：error は unknown 型なので型安全にアクセス
      if (error instanceof Error) {
        console.error('エラーの詳細:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('未知のエラー型:', error);
      }
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      {/* ヘッダー */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>
          🚗 自動車業務管理システム
        </h1>
        <p style={{ margin: '0', opacity: '0.9' }}>
          Auto Repair Manager v1.0.0
        </p>
      </div>

      {/* ステータスカード */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '24px'
      }}>
        {/* システム状態 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>🔧 システム状態</h3>
          <p>✅ フロントエンド: 動作中</p>
          <p>🔌 Electron接続: {connectionTest}</p>
          <button 
            onClick={testElectronConnection}
            style={{
              background: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            接続テスト実行
          </button>
        </div>

        {/* 統計情報 */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#333' }}>📊 スタッフ統計</h3>
          <p>👥 総スタッフ数: {testStaff.length}名</p>
          <p>👑 管理者: {testStaff.filter(s => s.permissionLevel === '管理者').length}名</p>
          <p>✅ 認証済み: {testStaff.filter(s => s.oauthStatus === '認証済み').length}名</p>
        </div>
      </div>

      {/* スタッフ一覧 */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ margin: '0', color: '#333' }}>👨‍💼 スタッフ一覧</h3>
          <button style={{
            background: '#4caf50',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}>
            ➕ 新規登録
          </button>
        </div>
        
        {testStaff.map(staff => (
          <SimpleStaffCard key={staff.id} staff={staff} />
        ))}
      </div>

      {/* フッター */}
      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        padding: '16px',
        color: '#666',
        fontSize: '14px'
      }}>
        <p>🚀 開発モード | Node.js環境: {typeof process !== 'undefined' ? process.env.NODE_ENV : 'ブラウザ'}</p>
      </div>
    </div>
  );
};

export default App;
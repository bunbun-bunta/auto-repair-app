import { Database } from 'sqlite3';
import { migration001Initial } from './001_initial';
import { migration002AddIndexes } from './002_add_indexes';

// マイグレーション定義
export interface Migration {
  id: number;
  name: string;
  up: (db: Database) => Promise<void>;
  down: (db: Database) => Promise<void>;
}

// 全マイグレーションの配列
export const migrations: Migration[] = [
  migration001Initial,
  migration002AddIndexes,
];

// マイグレーション管理クラス
export class MigrationManager {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  // マイグレーション実行
  async runMigrations(): Promise<void> {
    try {
      // マイグレーション管理テーブルを作成
      await this.createMigrationTable();

      // 実行済みマイグレーションを取得
      const executedMigrations = await this.getExecutedMigrations();

      // 未実行のマイグレーションを実行
      for (const migration of migrations) {
        if (!executedMigrations.includes(migration.id)) {
          console.log(`マイグレーション実行中: ${migration.name}`);
          await migration.up(this.db);
          await this.recordMigration(migration.id, migration.name);
          console.log(`マイグレーション完了: ${migration.name}`);
        }
      }

      console.log('全マイグレーションが完了しました');
    } catch (error) {
      console.error('マイグレーションエラー:', error);
      throw error;
    }
  }

  // マイグレーション管理テーブルを作成
  private createMigrationTable(): Promise<void> {
    return new Promise((resolve, reject) => {
      const sql = `
        CREATE TABLE IF NOT EXISTS migrations (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  // 実行済みマイグレーションを取得
  private getExecutedMigrations(): Promise<number[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT id FROM migrations ORDER BY id',
        (err, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows.map(row => row.id));
        }
      );
    });
  }

  // マイグレーション実行記録
  private recordMigration(id: number, name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO migrations (id, name) VALUES (?, ?)',
        [id, name],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}
// src/main/database/repositories/base-repository.ts
import { Database } from 'sqlite3';
import { ApiResponse, PaginatedResponse } from '../../../shared/types';

export abstract class BaseRepository<T extends { id?: number }> {
    protected db: Database;
    protected tableName: string;

    constructor(db: Database, tableName: string) {
        this.db = db;
        this.tableName = tableName;
    }

    protected async executeQuery<R = any>(
        sql: string,
        params: any[] = []
    ): Promise<R[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as R[]);
                }
            });
        });
    }

    protected async executeQuerySingle<R = any>(
        sql: string,
        params: any[] = []
    ): Promise<R | null> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as R || null);
                }
            });
        });
    }

    protected async executeUpdate(
        sql: string,
        params: any[] = []
    ): Promise<{ changes: number; lastID: number }> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes, lastID: this.lastID });
                }
            });
        });
    }

    async getAll(): Promise<ApiResponse<T[]>> {
        try {
            const rows = await this.executeQuery<T>(`SELECT * FROM ${this.tableName} ORDER BY id DESC`);
            return { success: true, data: rows };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    async getById(id: number): Promise<ApiResponse<T>> {
        try {
            const row = await this.executeQuerySingle<T>(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
            if (!row) {
                return { success: false, error: 'Record not found' };
            }
            return { success: true, data: row };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    async create(data: Omit<T, 'id'>): Promise<ApiResponse<T>> {
        try {
            const fields = Object.keys(data);
            const placeholders = fields.map(() => '?').join(', ');
            const values = Object.values(data);

            const sql = `
        INSERT INTO ${this.tableName} (${fields.join(', ')}) 
        VALUES (${placeholders})
      `;

            const result = await this.executeUpdate(sql, values);
            const created = await this.getById(result.lastID);

            return created;
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    async update(id: number, data: Partial<Omit<T, 'id'>>): Promise<ApiResponse<T>> {
        try {
            const fields = Object.keys(data);
            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const values = [...Object.values(data), id];

            const sql = `
        UPDATE ${this.tableName} 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `;

            await this.executeUpdate(sql, values);
            const updated = await this.getById(id);

            return updated;
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    async delete(id: number): Promise<ApiResponse<void>> {
        try {
            const result = await this.executeUpdate(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);

            if (result.changes === 0) {
                return { success: false, error: 'Record not found' };
            }

            return { success: true };
        } catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}
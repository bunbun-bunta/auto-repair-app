// src/main/database/repositories/master-repository.ts
import { Database } from 'sqlite3';
import { BaseRepository } from './base-repository';
import { VehicleType, Customer, BusinessCategory, ApiResponse } from '../../../shared/types';

export class MasterRepository {
    private db: Database;

    constructor(db: Database) {
        this.db = db;
    }

    // ===== 車種マスタ =====

    /**
     * 車種一覧を使用頻度順で取得
     */
    async getVehicleTypes(): Promise<ApiResponse<VehicleType[]>> {
        try {
            const query = `
                SELECT * FROM vehicle_types 
                WHERE is_active = 1 
                ORDER BY usage_count DESC, display_order ASC, name ASC
            `;

            const rows = await this.executeQuery<VehicleType>(query);
            return { success: true, data: rows };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '車種一覧の取得に失敗しました'
            };
        }
    }

    /**
     * 車種を作成
     */
    async createVehicleType(name: string): Promise<ApiResponse<VehicleType>> {
        try {
            // 重複チェック
            const existing = await this.executeQuerySingle<VehicleType>(
                'SELECT * FROM vehicle_types WHERE name = ? AND is_active = 1',
                [name]
            );

            if (existing) {
                return {
                    success: false,
                    error: 'この車種は既に登録されています'
                };
            }

            // 新規作成
            const result = await this.executeUpdate(
                `INSERT INTO vehicle_types (name, display_order, usage_count, is_active, created_at, updated_at) 
                 VALUES (?, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [name]
            );

            const created = await this.executeQuerySingle<VehicleType>(
                'SELECT * FROM vehicle_types WHERE id = ?',
                [result.lastID]
            );

            return { success: true, data: created! };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '車種の作成に失敗しました'
            };
        }
    }

    /**
     * 車種の使用回数を増加
     */
    async incrementVehicleTypeUsage(name: string): Promise<ApiResponse<void>> {
        try {
            await this.executeUpdate(
                `UPDATE vehicle_types 
                 SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE name = ? AND is_active = 1`,
                [name]
            );

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '車種使用回数の更新に失敗しました'
            };
        }
    }

    // ===== 顧客マスタ =====

    /**
     * 顧客一覧を使用頻度順で取得
     */
    async getCustomers(): Promise<ApiResponse<Customer[]>> {
        try {
            const query = `
                SELECT * FROM customers 
                WHERE is_active = 1 
                ORDER BY usage_count DESC, display_order ASC, name ASC
            `;

            const rows = await this.executeQuery<Customer>(query);
            return { success: true, data: rows };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '顧客一覧の取得に失敗しました'
            };
        }
    }

    /**
     * 顧客を作成
     */
    async createCustomer(name: string, contactInfo?: string): Promise<ApiResponse<Customer>> {
        try {
            // 重複チェック
            const existing = await this.executeQuerySingle<Customer>(
                'SELECT * FROM customers WHERE name = ? AND is_active = 1',
                [name]
            );

            if (existing) {
                return {
                    success: false,
                    error: 'この顧客は既に登録されています'
                };
            }

            // 新規作成
            const result = await this.executeUpdate(
                `INSERT INTO customers (name, contact_info, display_order, usage_count, is_active, created_at, updated_at) 
                 VALUES (?, ?, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [name, contactInfo || null]
            );

            const created = await this.executeQuerySingle<Customer>(
                'SELECT * FROM customers WHERE id = ?',
                [result.lastID]
            );

            return { success: true, data: created! };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '顧客の作成に失敗しました'
            };
        }
    }

    /**
     * 顧客の使用回数を増加
     */
    async incrementCustomerUsage(name: string): Promise<ApiResponse<void>> {
        try {
            await this.executeUpdate(
                `UPDATE customers 
                 SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE name = ? AND is_active = 1`,
                [name]
            );

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '顧客使用回数の更新に失敗しました'
            };
        }
    }

    /**
     * 顧客情報を更新
     */
    async updateCustomer(id: number, data: Partial<Customer>): Promise<ApiResponse<Customer>> {
        try {
            const fields = Object.keys(data).filter(key => key !== 'id');
            if (fields.length === 0) {
                return {
                    success: false,
                    error: '更新するデータがありません'
                };
            }

            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const values = [...fields.map(field => (data as any)[field]), id];

            await this.executeUpdate(
                `UPDATE customers SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                values
            );

            const updated = await this.executeQuerySingle<Customer>(
                'SELECT * FROM customers WHERE id = ?',
                [id]
            );

            return { success: true, data: updated! };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '顧客情報の更新に失敗しました'
            };
        }
    }

    // ===== 業務カテゴリマスタ =====

    /**
     * 業務カテゴリ一覧を使用頻度順で取得
     */
    async getBusinessCategories(): Promise<ApiResponse<BusinessCategory[]>> {
        try {
            const query = `
                SELECT * FROM business_categories 
                WHERE is_active = 1 
                ORDER BY usage_count DESC, display_order ASC, name ASC
            `;

            const rows = await this.executeQuery<BusinessCategory>(query);
            return { success: true, data: rows };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '業務カテゴリ一覧の取得に失敗しました'
            };
        }
    }

    /**
     * 業務カテゴリを作成
     */
    async createBusinessCategory(
        name: string,
        icon?: string,
        estimatedDuration?: number
    ): Promise<ApiResponse<BusinessCategory>> {
        try {
            // 重複チェック
            const existing = await this.executeQuerySingle<BusinessCategory>(
                'SELECT * FROM business_categories WHERE name = ? AND is_active = 1',
                [name]
            );

            if (existing) {
                return {
                    success: false,
                    error: 'この業務カテゴリは既に登録されています'
                };
            }

            // 新規作成
            const result = await this.executeUpdate(
                `INSERT INTO business_categories (name, icon, estimated_duration, display_order, usage_count, is_active, created_at, updated_at) 
                 VALUES (?, ?, ?, 0, 0, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
                [name, icon || null, estimatedDuration || null]
            );

            const created = await this.executeQuerySingle<BusinessCategory>(
                'SELECT * FROM business_categories WHERE id = ?',
                [result.lastID]
            );

            return { success: true, data: created! };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '業務カテゴリの作成に失敗しました'
            };
        }
    }

    /**
     * 業務カテゴリの使用回数を増加
     */
    async incrementBusinessCategoryUsage(name: string): Promise<ApiResponse<void>> {
        try {
            await this.executeUpdate(
                `UPDATE business_categories 
                 SET usage_count = usage_count + 1, last_used_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                 WHERE name = ? AND is_active = 1`,
                [name]
            );

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '業務カテゴリ使用回数の更新に失敗しました'
            };
        }
    }

    /**
     * 業務カテゴリ情報を更新
     */
    async updateBusinessCategory(id: number, data: Partial<BusinessCategory>): Promise<ApiResponse<BusinessCategory>> {
        try {
            const fields = Object.keys(data).filter(key => key !== 'id');
            if (fields.length === 0) {
                return {
                    success: false,
                    error: '更新するデータがありません'
                };
            }

            const setClause = fields.map(field => `${field} = ?`).join(', ');
            const values = [...fields.map(field => (data as any)[field]), id];

            await this.executeUpdate(
                `UPDATE business_categories SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
                values
            );

            const updated = await this.executeQuerySingle<BusinessCategory>(
                'SELECT * FROM business_categories WHERE id = ?',
                [id]
            );

            return { success: true, data: updated! };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '業務カテゴリ情報の更新に失敗しました'
            };
        }
    }

    // ===== マスタ削除（論理削除） =====

    /**
     * 車種を削除（論理削除）
     */
    async deleteVehicleType(id: number): Promise<ApiResponse<void>> {
        try {
            await this.executeUpdate(
                'UPDATE vehicle_types SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [id]
            );

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '車種の削除に失敗しました'
            };
        }
    }

    /**
     * 顧客を削除（論理削除）
     */
    async deleteCustomer(id: number): Promise<ApiResponse<void>> {
        try {
            await this.executeUpdate(
                'UPDATE customers SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [id]
            );

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '顧客の削除に失敗しました'
            };
        }
    }

    /**
     * 業務カテゴリを削除（論理削除）
     */
    async deleteBusinessCategory(id: number): Promise<ApiResponse<void>> {
        try {
            await this.executeUpdate(
                'UPDATE business_categories SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [id]
            );

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : '業務カテゴリの削除に失敗しました'
            };
        }
    }

    // ===== ヘルパーメソッド =====

    private async executeQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as T[]);
                }
            });
        });
    }

    private async executeQuerySingle<T>(sql: string, params: any[] = []): Promise<T | null> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as T || null);
                }
            });
        });
    }

    private async executeUpdate(sql: string, params: any[] = []): Promise<{ changes: number; lastID: number }> {
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
}
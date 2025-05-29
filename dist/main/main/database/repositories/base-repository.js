"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
class BaseRepository {
    constructor(db, tableName) {
        this.db = db;
        this.tableName = tableName;
    }
    async executeQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    async executeQuerySingle(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row || null);
                }
            });
        });
    }
    async executeUpdate(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve({ changes: this.changes, lastID: this.lastID });
                }
            });
        });
    }
    async getAll() {
        try {
            const rows = await this.executeQuery(`SELECT * FROM ${this.tableName} ORDER BY id DESC`);
            return { success: true, data: rows };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async getById(id) {
        try {
            const row = await this.executeQuerySingle(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
            if (!row) {
                return { success: false, error: 'Record not found' };
            }
            return { success: true, data: row };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async create(data) {
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
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async update(id, data) {
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
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    async delete(id) {
        try {
            const result = await this.executeUpdate(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
            if (result.changes === 0) {
                return { success: false, error: 'Record not found' };
            }
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=base-repository.js.map
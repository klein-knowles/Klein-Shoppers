const { randomUUID } = require("crypto");
const pool = require("../config/database");

const columns = `
    id AS _id, title, description, category, product_id AS productId, product_name AS productName,
    video_type AS videoType, filename, original_name AS originalName, mime_type AS mimeType,
    video_url AS videoUrl, stream_url AS streamUrl, embed_url AS embedUrl, file_size AS size,
    uploaded_by AS uploadedBy, is_active AS isActive, views,
    created_at AS createdAt, updated_at AS updatedAt
`;

function mapRow(row) {
    if (!row) return null;
    if (typeof row.uploadedBy === "string") {
        try { row.uploadedBy = JSON.parse(row.uploadedBy); } catch { row.uploadedBy = null; }
    }
    if (row.createdAt) row.createdAt = new Date(row.createdAt).toISOString();
    if (row.updatedAt) row.updatedAt = new Date(row.updatedAt).toISOString();
    return new VideoDocument(row);
}

class VideoDocument {
    constructor(data) { Object.assign(this, data); }

    async save() {
        await pool.execute(
            "UPDATE videos SET views = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            [Number(this.views || 0), this.isActive === false ? 0 : 1, this._id]
        );
        return this;
    }

    async deleteOne() {
        await pool.execute("DELETE FROM videos WHERE id = ?", [this._id]);
    }
}

class VideoQuery {
    constructor(filter = {}, single = false) {
        this.filter = filter;
        this.single = single;
        this.limitValue = null;
        this.skipValue = 0;
        this.sortValue = null;
    }

    sort(value) { this.sortValue = value; return this; }
    limit(value) { this.limitValue = Number(value); return this; }
    skip(value) { this.skipValue = Number(value); return this; }

    async exec() {
        const fields = { _id: "id", filename: "filename", isActive: "is_active", productId: "product_id", category: "category" };
        const clauses = [];
        const values = [];
        for (const [key, value] of Object.entries(this.filter)) {
            if (value === undefined || value === null || value === "") continue;
            const column = fields[key];
            if (!column) continue;
            clauses.push(`\`${column}\` = ?`);
            values.push(key === "isActive" ? (value ? 1 : 0) : value);
        }

        let sql = `SELECT ${columns} FROM videos`;
        if (clauses.length) sql += ` WHERE ${clauses.join(" AND ")}`;
        const order = this.sortValue && this.sortValue.createdAt < 0 ? "DESC" : "ASC";
        sql += ` ORDER BY created_at ${order}`;
        if (this.limitValue && Number.isFinite(this.limitValue)) {
            sql += " LIMIT ?";
            values.push(Math.max(0, Math.min(this.limitValue, 100)));
            if (this.skipValue > 0) {
                sql += " OFFSET ?";
                values.push(this.skipValue);
            }
        }

        const [rows] = await pool.execute(sql, values);
        if (this.single) return mapRow(rows[0]);
        return rows.map(mapRow);
    }

    then(resolve, reject) { return this.exec().then(resolve, reject); }
    catch(reject) { return this.exec().catch(reject); }
}

module.exports = {
    async create(data) {
        const id = randomUUID();
        await pool.execute(`
            INSERT INTO videos (
                id, title, description, category, product_id, product_name, video_type,
                filename, original_name, mime_type, video_url, stream_url, embed_url,
                file_size, uploaded_by, is_active, views
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
        `, [
            id, data.title, data.description || "", data.category || "general", data.productId || null,
            data.productName || null, data.videoType || "upload", data.filename || null,
            data.originalName || null, data.mimeType || null, data.videoUrl || null, data.streamUrl || null,
            data.embedUrl || null, data.size || null, JSON.stringify(data.uploadedBy || null)
        ]);
        return mapRow({ ...data, _id: id, views: 0, isActive: true, createdAt: new Date(), updatedAt: new Date() });
    },

    find(filter) { return new VideoQuery(filter); },

    findById(id) { return new VideoQuery({ _id: id }, true); },

    async countDocuments(filter = {}) {
        const fields = { filename: "filename", isActive: "is_active", productId: "product_id", category: "category" };
        const clauses = [];
        const values = [];
        for (const [key, value] of Object.entries(filter)) {
            if (value === undefined || value === null || value === "" || !fields[key]) continue;
            clauses.push(`\`${fields[key]}\` = ?`);
            values.push(key === "isActive" ? (value ? 1 : 0) : value);
        }
        const [rows] = await pool.execute(
            `SELECT COUNT(*) AS total FROM videos${clauses.length ? ` WHERE ${clauses.join(" AND ")}` : ""}`,
            values
        );
        return Number(rows[0].total);
    }
};

const pool = require('../config/database');

class Content {
    // ========== PAGES ==========
    static async getPageBySlug(slug) {
        const [rows] = await pool.execute(
            'SELECT * FROM cms_pages WHERE slug = ? AND status = ?',
            [slug, 'published']
        );
        return rows[0];
    }

    static async getAllPages() {
        const [rows] = await pool.execute(
            'SELECT id, slug, title, status, updated_at FROM cms_pages ORDER BY updated_at DESC'
        );
        return rows;
    }

    static async getPageById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM cms_pages WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async savePage(id, data) {
        if (id) {
            await pool.execute(
                'UPDATE cms_pages SET title = ?, content = ?, meta_description = ?, status = ? WHERE id = ?',
                [data.title, data.content, data.meta_description, data.status, id]
            );
        } else {
            const [result] = await pool.execute(
                'INSERT INTO cms_pages (slug, title, content, meta_description, status) VALUES (?, ?, ?, ?, ?)',
                [data.slug, data.title, data.content, data.meta_description, data.status || 'draft']
            );
            return result.insertId;
        }
    }

    static async deletePage(id) {
        await pool.execute('DELETE FROM cms_pages WHERE id = ?', [id]);
    }

    // ========== BLOG ==========
    static async getBlogPosts(page = 1, limit = 10, category = null) {
        let query = 'SELECT id, title, slug, excerpt, featured_image, category, published_at FROM cms_blog WHERE status = ?';
        const params = ['published'];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY published_at DESC LIMIT ? OFFSET ?';
        params.push(limit, (page - 1) * limit);

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async getBlogBySlug(slug) {
        const [rows] = await pool.execute(
            'SELECT * FROM cms_blog WHERE slug = ? AND status = ?',
            [slug, 'published']
        );
        return rows[0];
    }

    static async getAllBlogPosts() {
        const [rows] = await pool.execute(
            'SELECT id, title, slug, category, status, published_at FROM cms_blog ORDER BY created_at DESC'
        );
        return rows;
    }

    static async getBlogById(id) {
        const [rows] = await pool.execute('SELECT * FROM cms_blog WHERE id = ?', [id]);
        return rows[0];
    }

    static async saveBlogPost(id, data) {
        if (id) {
            await pool.execute(
                'UPDATE cms_blog SET title = ?, content = ?, excerpt = ?, featured_image = ?, category = ?, tags = ?, status = ? WHERE id = ?',
                [data.title, data.content, data.excerpt, data.featured_image, data.category, data.tags, data.status, id]
            );
        } else {
            const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const [result] = await pool.execute(
                'INSERT INTO cms_blog (title, slug, content, excerpt, featured_image, category, tags, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [data.title, slug, data.content, data.excerpt, data.featured_image, data.category, data.tags, data.status || 'draft']
            );
            return result.insertId;
        }
    }

    static async deleteBlogPost(id) {
        await pool.execute('DELETE FROM cms_blog WHERE id = ?', [id]);
    }

    // ========== FAQ ==========
    static async getFAQs(category = null) {
        let query = 'SELECT * FROM cms_faq WHERE status = ?';
        const params = ['published'];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY sort_order ASC';
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    static async getAllFAQs() {
        const [rows] = await pool.execute(
            'SELECT * FROM cms_faq ORDER BY category, sort_order'
        );
        return rows;
    }

    static async saveFAQ(id, data) {
        if (id) {
            await pool.execute(
                'UPDATE cms_faq SET question = ?, answer = ?, category = ?, sort_order = ?, status = ? WHERE id = ?',
                [data.question, data.answer, data.category, data.sort_order, data.status, id]
            );
        } else {
            await pool.execute(
                'INSERT INTO cms_faq (question, answer, category, sort_order, status) VALUES (?, ?, ?, ?, ?)',
                [data.question, data.answer, data.category, data.sort_order, data.status || 'published']
            );
        }
    }

    static async deleteFAQ(id) {
        await pool.execute('DELETE FROM cms_faq WHERE id = ?', [id]);
    }
}

module.exports = Content;
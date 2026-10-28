const Content = require('../models/Content');

// ========== PUBLIC PAGES ==========
exports.getPage = async (req, res) => {
    try {
        const page = await Content.getPageBySlug(req.params.slug);
        if (!page) {
            return res.status(404).json({ success: false, message: 'Page not found' });
        }
        res.json({ success: true, page });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ========== ADMIN: PAGES ==========
exports.getAllPages = async (req, res) => {
    try {
        const pages = await Content.getAllPages();
        res.json({ success: true, pages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.savePage = async (req, res) => {
    try {
        const id = req.params.id || null;
        await Content.savePage(id, req.body);
        res.json({ success: true, message: 'Page saved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deletePage = async (req, res) => {
    try {
        await Content.deletePage(req.params.id);
        res.json({ success: true, message: 'Page deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ========== BLOG ==========
exports.getBlogPosts = async (req, res) => {
    try {
        const page = req.query.page || 1;
        const category = req.query.category;
        const posts = await Content.getBlogPosts(page, 10, category);
        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getBlogPost = async (req, res) => {
    try {
        const post = await Content.getBlogBySlug(req.params.slug);
        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }
        res.json({ success: true, post });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllBlogPosts = async (req, res) => {
    try {
        const posts = await Content.getAllBlogPosts();
        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.saveBlogPost = async (req, res) => {
    try {
        const id = req.params.id || null;
        await Content.saveBlogPost(id, req.body);
        res.json({ success: true, message: 'Post saved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteBlogPost = async (req, res) => {
    try {
        await Content.deleteBlogPost(req.params.id);
        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ========== FAQ ==========
exports.getFAQs = async (req, res) => {
    try {
        const faqs = await Content.getFAQs(req.query.category);
        res.json({ success: true, faqs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getAllFAQs = async (req, res) => {
    try {
        const faqs = await Content.getAllFAQs();
        res.json({ success: true, faqs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.saveFAQ = async (req, res) => {
    try {
        const id = req.params.id || null;
        await Content.saveFAQ(id, req.body);
        res.json({ success: true, message: 'FAQ saved successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteFAQ = async (req, res) => {
    try {
        await Content.deleteFAQ(req.params.id);
        res.json({ success: true, message: 'FAQ deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
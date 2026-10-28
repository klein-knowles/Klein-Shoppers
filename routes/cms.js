const express = require('express');
const router = express.Router();
const cmsController = require('../controllers/cmsController');
const auth = require('../middleware/auth');

// Public routes
router.get('/page/:slug', cmsController.getPage);
router.get('/blog', cmsController.getBlogPosts);
router.get('/blog/:slug', cmsController.getBlogPost);
router.get('/faq', cmsController.getFAQs);

// Admin routes (protected)
router.get('/admin/pages', auth, cmsController.getAllPages);
router.post('/admin/page', auth, cmsController.savePage);
router.post('/admin/page/:id', auth, cmsController.savePage);
router.delete('/admin/page/:id', auth, cmsController.deletePage);

router.get('/admin/blog', auth, cmsController.getAllBlogPosts);
router.post('/admin/blog', auth, cmsController.saveBlogPost);
router.post('/admin/blog/:id', auth, cmsController.saveBlogPost);
router.delete('/admin/blog/:id', auth, cmsController.deleteBlogPost);

router.get('/admin/faq', auth, cmsController.getAllFAQs);
router.post('/admin/faq', auth, cmsController.saveFAQ);
router.post('/admin/faq/:id', auth, cmsController.saveFAQ);
router.delete('/admin/faq/:id', auth, cmsController.deleteFAQ);

module.exports = router;
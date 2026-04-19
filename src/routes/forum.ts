import express from 'express';
import { ForumModel } from '../models/Forum.js';
import { isAuthenticated } from '../middlewares/auth.js';

const router = express.Router();

router.get('/forum', async (req, res) => {
    const categories = ForumModel.getCategories();
    res.render('forum/index', { categories, activeMenu: 'forum' });
});

router.get('/forum/category/:id', async (req, res) => {
    const categoryId = parseInt(req.params.id);
    const category = ForumModel.findCategoryById(categoryId);
    if (!category) return res.status(404).render('error', { message: 'Catégorie non trouvée' });

    const topics = ForumModel.getTopicsByCategory(categoryId);
    res.render('forum/category', { category, topics, activeMenu: 'forum' });
});

router.get('/forum/topic/new/:categoryId', isAuthenticated, (req, res) => {
    const categoryId = parseInt(req.params.categoryId);
    res.render('forum/topic-new', { categoryId, activeMenu: 'forum' });
});

router.post('/forum/topic/new', isAuthenticated, async (req, res) => {
    const userId = (req.session as any).userId;
    const { categoryId, title, content } = req.body;

    const topicId = ForumModel.createTopic({
        categoryId: parseInt(categoryId),
        userId,
        title,
        content
    });

    res.redirect(`/forum/topic/${topicId}`);
});

router.get('/forum/topic/:id', async (req, res) => {
    const topicId = parseInt(req.params.id);
    const topic = ForumModel.findTopicById(topicId);
    if (!topic) return res.status(404).render('error', { message: 'Sujet non trouvé' });

    ForumModel.incrementTopicViews(topicId);
    const replies = ForumModel.getReplies(topicId);
    res.render('forum/topic', { topic, replies, activeMenu: 'forum' });
});

router.post('/forum/topic/:id/reply', isAuthenticated, async (req, res) => {
    const topicId = parseInt(req.params.id);
    const userId = (req.session as any).userId;
    const { content } = req.body;

    ForumModel.createReply({
        topicId,
        userId,
        content
    });

    res.redirect(`/forum/topic/${topicId}`);
});

router.post('/forum/reply/:id/report', isAuthenticated, async (req, res) => {
    const replyId = parseInt(req.params.id);
    const userId = (req.session as any).userId;
    const { reason } = req.body;

    ForumModel.reportReply(replyId, userId, reason);
    res.json({ success: true });
});

export default router;

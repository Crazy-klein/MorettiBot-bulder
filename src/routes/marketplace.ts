import express from 'express';
import multer from 'multer';
import path from 'path';
import sharp from 'sharp';
import fs from 'fs-extra';
import { MarketplaceModel } from '../models/Marketplace.js';
import { isAuthenticated } from '../middlewares/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/logos');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get('/marketplace', async (req, res) => {
  const bots = MarketplaceModel.findAllApproved();
  res.render('marketplace/index', { bots, activeMenu: 'marketplace' });
});

router.get('/marketplace/submit', isAuthenticated, (req, res) => {
  res.render('marketplace/submit', { activeMenu: 'marketplace' });
});

router.post('/marketplace/submit', isAuthenticated, upload.single('logo'), async (req, res) => {
  const userId = (req.session as any).userId;
  const { name, description, commandCount, downloadType, downloadUrl, price } = req.body;

  try {
    let logoPath = '';
    if ((req as any).file) {
      const file = (req as any).file;
      const outputPath = file.path.replace(path.extname(file.path), '-thumb.webp');
      await sharp(file.path)
        .resize(300, 300)
        .webp()
        .toFile(outputPath);
      
      logoPath = '/uploads/logos/' + path.basename(outputPath);
      // Supprimer l'original
      await fs.remove(file.path);
    }

    MarketplaceModel.createBot({
      userId,
      name,
      description,
      logo: logoPath,
      commandCount: parseInt(commandCount),
      downloadType,
      downloadUrl,
      price: parseFloat(price) || 0,
      status: 'pending'
    });

    res.render('marketplace/submit-success', { activeMenu: 'marketplace' });
  } catch (error) {
    logger.error(error);
    res.status(500).render('error', { message: 'Erreur lors de la soumission' });
  }
});

router.get('/marketplace/:id', async (req, res) => {
  const botId = parseInt(req.params.id);
  const bot = MarketplaceModel.findById(botId);
  if (!bot || bot.status !== 'approved') return res.status(404).render('error', { message: 'Bot non trouvé' });

  const reviews = MarketplaceModel.getReviews(botId);
  res.render('marketplace/detail', { bot, reviews, activeMenu: 'marketplace' });
});

router.post('/marketplace/:id/review', isAuthenticated, async (req, res) => {
    const botId = parseInt(req.params.id);
    const userId = (req.session as any).userId;
    const { rating, comment } = req.body;

    MarketplaceModel.addReview({
        botId,
        userId,
        rating: parseInt(rating),
        comment
    });

    res.redirect(`/marketplace/${botId}`);
});

export default router;

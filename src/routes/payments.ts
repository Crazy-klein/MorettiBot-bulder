import express from 'express';
import { PaymentService } from '../services/paymentService.js';
import { SubscriptionModel } from '../models/Subscription.js';
import { isAuthenticated } from '../middlewares/auth.js';
import logger from '../utils/logger.js';

const router = express.Router();

router.get('/payment/plans', (req, res) => {
    res.render('payment/plans', { activeMenu: 'subscription' });
});

router.post('/api/payment/initialize', isAuthenticated, async (req, res) => {
    const { provider, planId } = req.body;
    const userId = (req.session as any).userId;

    // Définition des plans
    const plans: any = {
        'pro_monthly': { amount: 5000, currency: 'XOF', name: 'Pro Mensuel', days: 30 },
        'pro_yearly': { amount: 50000, currency: 'XOF', name: 'Pro Annuel', days: 365 },
    };

    const plan = plans[planId];
    if (!plan) return res.status(400).json({ success: false, message: 'Plan invalide' });

    try {
        const paymentProvider = PaymentService.getProvider(provider);
        const result = await paymentProvider.initializePayment(userId, plan.amount, plan.currency, { planId });

        if (result.success && result.transactionId) {
            PaymentService.saveTransaction(userId, plan.amount, plan.currency, provider, result.transactionId, planId);
            res.json(result);
        } else {
            res.status(500).json({ success: false, message: result.message || 'Erreur initialisation' });
        }
    } catch (error: any) {
        logger.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/payment/success', isAuthenticated, (req, res) => {
    // Dans un cas réel, on vérifierait le statut du paiement ici ou via webhook
    res.render('payment/success', { activeMenu: 'subscription' });
});

router.get('/payment/cancel', isAuthenticated, (req, res) => {
    res.render('payment/cancel', { activeMenu: 'subscription' });
});

// Mock Webhook pour démo
router.post('/api/payment/webhook/:provider', async (req, res) => {
    const { provider } = req.params;
    const payload = req.body;
    
    logger.info(`Webhook reçu pour ${provider}: ${JSON.stringify(payload)}`);
    
    // Logique de mise à jour d'abonnement
    // Normalement on extrait le transactionId du payload
    const transactionId = payload.transaction_id || payload.id;
    
    if (transactionId) {
        // 1. Marquer transaction comme complétée
        PaymentService.completeTransaction(transactionId);
        
        // 2. Mettre à jour l'abonnement
        // Recherche de la transaction pour avoir le userId et le planId
        // db.prepare(...)
        
        // Simulation:
        // SubscriptionModel.update(userId, { plan: 'pro', status: 'active', endDate: ... });
    }

    res.sendStatus(200);
});

export default router;

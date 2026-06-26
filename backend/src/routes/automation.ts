import { Router } from 'express';
import { evaluateAutomation } from '../services/evaluateAutomation.js';

export const automationRouter = Router();

automationRouter.post('/api/automation/evaluate-whatsapp-message', async (req, res) => {
  try {
    const result = await evaluateAutomation(req.body, req.header('x-api-key') || undefined);
    res.json(result);
  } catch (error) {
    res.status(500).json({ shouldReply: false, reason: 'error' });
  }
});

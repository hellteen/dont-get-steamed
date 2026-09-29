import express from 'express';
import { db } from '../db';

const router = express.Router();

// POST /api/feedback
router.post('/', (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'Пожалуйста, заполните текст рефлексии' });
  }

  const trimmed = message.trim();
  if (trimmed.length > 400) {
    return res.status(400).json({ error: 'Длина отзыва не может превышать 400 символов' });
  }

  try {
    const numericUserId = parseInt(userId, 10);
    const feedback = db.saveFeedback(numericUserId, trimmed);

    res.json({
      success: true,
      message: 'Твой отзыв успешно сохранен! Ты прошел большой путь 🚀',
      feedback,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Ошибка сохранения отзыва:', error.message);
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
  }
});

// GET /api/feedback
router.get('/', (_req, res) => {
  try {
    const feedbacks = db.getFeedbacks();
    res.json({ success: true, feedbacks });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
  }
});

export default router;

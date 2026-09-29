import express from 'express';
import { db } from '../db';

const router = express.Router();

// POST /api/survey
router.post('/', (req, res) => {
  const { userId, answers } = req.body;

  if (!userId || !answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Нет данных для сохранения ответов анкеты' });
  }

  try {
    const numericUserId = parseInt(userId, 10);
    const user = db.getUserById(numericUserId);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден в системе' });
    }

    // Check if user already took the survey (prevent retaking)
    const existingAnket = db.getAnketByUserId(numericUserId);
    if (existingAnket) {
      return res.status(400).json({
        error: 'Вы уже заполнили вводную анкету! Повторное прохождение опроса запрещено.',
        alreadyCompleted: true,
        anket: existingAnket,
      });
    }

    // Sanitize string answers
    const cleanAnswers: Record<string, string> = {};
    for (let i = 1; i <= 15; i++) {
      const key = `q${i}`;
      cleanAnswers[key] = (answers[key] || '').trim();
    }

    const savedRecord = db.saveAnket(numericUserId, cleanAnswers);

    return res.json({
      success: true,
      message: 'Анкета успешно сохранена!',
      anket: savedRecord,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Ошибка сохранения анкеты:', error.message);
    return res.status(500).json({ error: 'Ошибка сервера при сохранении анкеты: ' + error.message });
  }
});

// GET /api/survey/:userId
router.get('/:userId', (req, res) => {
  try {
    const numericUserId = parseInt(req.params.userId, 10);
    const anket = db.getAnketByUserId(numericUserId);

    if (!anket) {
      return res.status(404).json({ error: 'Анкета не найдена', exists: false });
    }

    return res.json({ success: true, anket, exists: true });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Ошибка получения анкеты:', error.message);
    return res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

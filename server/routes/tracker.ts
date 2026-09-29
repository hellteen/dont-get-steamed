import express from 'express';
import { db } from '../db';
import { TrackerRecord } from '../../src/types';

const router = express.Router();

// GET /api/tracker/:userId
router.get('/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const user = db.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const records = db.getTrackerRecords(userId);
    const totalCompleted = records.length;
    const isFinished = totalCompleted >= 25;

    // Detect if today is already marked by comparing client local date YYYY-MM-DD
    const clientDate = (req.query.clientDate as string) || new Date().toISOString().split('T')[0];
    let isTodayMarked = false;
    let todayRecord: TrackerRecord | null = null;

    if (records.length > 0) {
      const lastRecord = records[records.length - 1];
      const lastDateStr = lastRecord.client_date || new Date(lastRecord.marked_at).toISOString().split('T')[0];
      if (lastDateStr === clientDate) {
        isTodayMarked = true;
        todayRecord = lastRecord;
      }
    }

    // Active day number:
    // If today is marked, current day is totalCompleted
    // If today is not marked, current day is totalCompleted + 1
    const currentDay = Math.min(25, isTodayMarked ? totalCompleted : totalCompleted + 1);

    // Detect missed days if user had past marks
    let daysMissed = 0;
    if (records.length > 0 && !isFinished) {
      const lastMark = records[records.length - 1];
      const lastDate = new Date(lastMark.marked_at).getTime();
      const now = Date.now();
      const diffHours = (now - lastDate) / (1000 * 60 * 60);

      // If more than 36 hours passed since last mark
      if (diffHours >= 36) {
        daysMissed = Math.min(25, Math.floor(diffHours / 24));
      }
    }

    const cleanCount = records.filter((r) => r.status === 'Успех').length;
    const relapseCount = records.filter((r) => r.status === 'Срыв').length;

    // Days since registration
    const regDate = new Date(user.created_at);
    const diffTime = Math.max(0, Date.now() - regDate.getTime());
    const daysSinceReg = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    res.json({
      success: true,
      records,
      currentDay,
      totalCompleted,
      isFinished,
      isTodayMarked,
      todayRecord,
      canCheckInToday: !isFinished && !isTodayMarked,
      cleanCount,
      relapseCount,
      startDate: user.created_at,
      daysSinceReg,
      daysMissed,
      lastMarkedAt: records.length > 0 ? records[records.length - 1].marked_at : null,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Ошибка получения данных трекера:', error.message);
    res.status(500).json({ error: 'Ошибка сервера при загрузке трекера: ' + error.message });
  }
});

// POST /api/tracker
router.post('/', (req, res) => {
  const { userId, status, triggerReason, clientDate } = req.body;

  if (!userId || !status) {
    return res.status(400).json({ error: 'Не переданы обязательные данные (userId, status)' });
  }

  if (status !== 'Успех' && status !== 'Срыв') {
    return res.status(400).json({ error: 'Недопустимый статус отметки (разрешено: Успех, Срыв)' });
  }

  try {
    const numericUserId = parseInt(userId, 10);
    const user = db.getUserById(numericUserId);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const record = db.addTrackerMark(numericUserId, status, triggerReason, clientDate);
    const updatedRecords = db.getTrackerRecords(numericUserId);
    const isFinished = updatedRecords.length >= 25;

    res.json({
      success: true,
      message: status === 'Успех' ? 'День успешно зачтен! Серия продолжается 🔥' : 'Срыв зафиксирован. Серия НЕ сгорает!',
      record,
      totalCompleted: updatedRecords.length,
      isFinished,
      isTodayMarked: true,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Ошибка записи в трекер:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// POST /api/tracker/reset
router.post('/reset', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'Нет userId' });
  }
  try {
    const numericUserId = parseInt(userId, 10);
    db.resetTrackerForUser(numericUserId);
    res.json({ success: true, message: 'Прогресс трекера успешно сброшен' });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

export default router;

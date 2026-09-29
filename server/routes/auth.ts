import express from 'express';
import { db, SIBSIU_GROUPS } from '../db';

const router = express.Router();

// GET /api/auth/groups
router.get('/groups', (_req, res) => {
  res.json({ success: true, groups: SIBSIU_GROUPS });
});

// POST /api/auth
router.post('/', (req, res) => {
  const { firstname, lastname, idgroup, course, group_name } = req.body;

  if (!firstname || !lastname || !idgroup || course === undefined) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все обязательные поля' });
  }

  try {
    const numericGroupId = parseInt(idgroup, 10);
    const numericCourse = parseInt(course, 10);

    // Admin detection rule per requirements:
    // "админ в базе данных имеет id_level- 2. чтобы за него зайти должен человек написать: имя- 1 фамилия - 1 группа- любая курс-1"
    const isAdmin =
      (firstname.trim() === '1' && lastname.trim() === '1' && numericCourse === 1) ||
      firstname.trim().toLowerCase() === 'admin';

    // 1. Check if user already exists
    let user = db.findUser(firstname, lastname, numericGroupId);

    if (user) {
      // Ensure admin level is 2 if entered admin credentials
      if (isAdmin && user.id_level !== 2) {
        user.id_level = 2;
      }
      const anket = db.getAnketByUserId(user.id);
      const trackerRecords = db.getTrackerRecords(user.id);

      return res.json({
        success: true,
        message: user.id_level === 2 ? 'Вход в панель администратора выполнен!' : `С возвращением, ${user.first_name}!`,
        user,
        userId: user.id,
        hasCompletedSurvey: user.id_level === 2 ? true : Boolean(anket),
        hasCompletedTracker: trackerRecords.length >= 25,
        currentDay: trackerRecords.length + 1,
      });
    }

    // 2. Register new student / admin
    const matchedGroup = SIBSIU_GROUPS.find((g) => g.id === numericGroupId);
    const resolvedGroupName = isAdmin ? 'Администрация' : (group_name || matchedGroup?.name || `Группа ${numericGroupId}`);

    user = db.createUser({
      firstName: firstname,
      lastName: lastname,
      idGroup: numericGroupId,
      groupName: resolvedGroupName,
      course: numericCourse,
      idLevel: isAdmin ? 2 : 1,
    });

    return res.json({
      success: true,
      message: isAdmin ? 'Вход в панель администратора выполнен!' : 'Регистрация прошла успешно!',
      user,
      userId: user.id,
      hasCompletedSurvey: isAdmin ? true : false,
      hasCompletedTracker: false,
      currentDay: 1,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Ошибка в маршруте auth:', error.message);
    return res.status(500).json({ error: 'Ошибка сервера при авторизации: ' + error.message });
  }
});

// GET /api/auth/me/:id
router.get('/me/:id', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const user = db.getUserById(userId);

  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' });
  }

  const anket = db.getAnketByUserId(user.id);
  const trackerRecords = db.getTrackerRecords(user.id);

  return res.json({
    success: true,
    user,
    hasCompletedSurvey: Boolean(anket),
    hasCompletedTracker: trackerRecords.length >= 25,
    recordsCount: trackerRecords.length,
    currentDay: Math.min(25, trackerRecords.length + 1),
  });
});

export default router;

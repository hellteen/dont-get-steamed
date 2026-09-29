import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { User, TrackerRecord, AnketRecord, FeedbackRecord, AdminStats } from '../src/types';

interface DatabaseSchema {
  users: User[];
  ankets: AnketRecord[];
  trackers: TrackerRecord[];
  feedbacks: FeedbackRecord[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Predefined SibSIU Groups
export const SIBSIU_GROUPS = [
  { id: 1, name: 'ПИМЦ-262', department: 'Прикладная информатика' },
  { id: 2, name: 'ПИТЭ-26', department: 'Прикладная информатика в экономике' },
  { id: 3, name: 'ПИС-26', department: 'Программная инженерия' },
  { id: 4, name: 'ПИСЭ-26', department: 'Программная инженерия' },
  { id: 5, name: 'ИС-21', department: 'Информационные системы' },
  { id: 6, name: 'ИС-22', department: 'Информационные системы' },
  { id: 7, name: 'Менеджмент', department: 'Экономика и управление' },
];

function seedDatabase(): DatabaseSchema {
  const users: User[] = [
    {
      id: 1,
      first_name: '1',
      last_name: '1',
      id_group: 1,
      group_name: 'Администрация',
      course: 1,
      id_level: 2, // Admin (id_level = 2, вход: имя 1, фамилия 1, курс 1)
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 2,
      first_name: 'Артем',
      last_name: 'Волков',
      id_group: 1,
      group_name: 'ПИМЦ-262',
      course: 2,
      id_level: 1,
      created_at: new Date(Date.now() - 26 * 86400000).toISOString(),
    },
    {
      id: 3,
      first_name: 'София',
      last_name: 'Морозова',
      id_group: 3,
      group_name: 'ПИС-26',
      course: 1,
      id_level: 1,
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 4,
      first_name: 'Илья',
      last_name: 'Кузнецов',
      id_group: 2,
      group_name: 'ПИТЭ-26',
      course: 3,
      id_level: 1,
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
    {
      id: 5,
      first_name: 'Дарья',
      last_name: 'Смирнова',
      id_group: 5,
      group_name: 'ИС-21',
      course: 2,
      id_level: 1,
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
  ];

  const ankets: AnketRecord[] = [
    {
      id: 1,
      id_user: 2,
      submitted_at: new Date(Date.now() - 26 * 86400000).toISOString(),
      answers: {
        q1: '19–20',
        q2: '14–16 лет',
        q3: '1–3 года',
        q4: 'Каждый день',
        q5: 'За компанию с друзьями; Из-за стресса / учёбы',
        q6: 'На переменах между парами; Когда нервничаю',
        q7: 'Раздражение',
        q8: 'Скорее вредно',
        q9: 'Пробовал(а) несколько раз',
        q10: 'Зависимость / ломка; Стресс',
        q11: 'Отрицательно, но не запрещают',
        q12: 'Точно участвовал(а)',
      },
    },
    {
      id: 2,
      id_user: 3,
      submitted_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      answers: {
        q1: '17–18',
        q2: '17–18 лет',
        q3: 'От месяца до полугода',
        q4: 'Несколько раз в день',
        q5: 'Просто стало интересно',
        q6: 'В компании друзей; Перед сном',
        q7: 'Лёгкое желание',
        q8: 'Скорее вредно',
        q9: 'Бросаю прямо сейчас',
        q10: 'Компания друзей',
        q11: 'Ругают, просят бросить',
        q12: 'Скорее да, если не будет давления',
      },
    },
    {
      id: 3,
      id_user: 4,
      submitted_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      answers: {
        q1: '21–23',
        q2: '17–18 лет',
        q3: 'Больше 3 лет',
        q4: 'Практически не выпускаю из рук',
        q5: 'Из-за стресса / учёбы',
        q6: 'Во время учёбы / зубрёжки; На переменах между парами',
        q7: 'Сильную тягу, не могу сосредоточиться',
        q8: 'Нет, это так же опасно',
        q9: 'Пробовал(а) несколько раз',
        q10: 'Зависимость / ломка; Стресс',
        q11: 'Не знают',
        q12: 'Точно участвовал(а)',
      },
    },
    {
      id: 4,
      id_user: 5,
      submitted_at: new Date(Date.now() - 8 * 86400000).toISOString(),
      answers: {
        q1: '19–20',
        q2: '14–16 лет',
        q3: 'От полугода до года',
        q4: 'Несколько раз в день',
        q5: 'За компанию с друзьями',
        q6: 'На переменах между парами; Просто по привычке',
        q7: 'Тревогу',
        q8: 'Скорее вредно',
        q9: 'Пробовал(а) один раз',
        q10: 'Компания друзей; Не знаю, с чего начать',
        q11: 'Отрицательно, но не запрещают',
        q12: 'Скорее да, если не будет давления',
      },
    },
  ];

  // Fill tracker records for Артем (25/25 completed, 1 relapse)
  const trackers: TrackerRecord[] = [];
  for (let day = 1; day <= 25; day++) {
    trackers.push({
      id: trackers.length + 1,
      user_id: 2,
      date_number: day,
      status: day === 15 ? 'Срыв' : 'Успех',
      marked_at: new Date(Date.now() - (26 - day) * 86400000).toISOString(),
    });
  }

  // Fill tracker records for София (19 days completed, 0 relapses)
  for (let day = 1; day <= 19; day++) {
    trackers.push({
      id: trackers.length + 1,
      user_id: 3,
      date_number: day,
      status: 'Успех',
      marked_at: new Date(Date.now() - (20 - day) * 86400000).toISOString(),
    });
  }

  // Fill tracker records for Илья (14 days, 2 relapses)
  for (let day = 1; day <= 14; day++) {
    trackers.push({
      id: trackers.length + 1,
      user_id: 4,
      date_number: day,
      status: day === 3 || day === 9 ? 'Срыв' : 'Успех',
      marked_at: new Date(Date.now() - (15 - day) * 86400000).toISOString(),
    });
  }

  // Fill tracker records for Дарья (7 days, clean)
  for (let day = 1; day <= 7; day++) {
    trackers.push({
      id: trackers.length + 1,
      user_id: 5,
      date_number: day,
      status: 'Успех',
      marked_at: new Date(Date.now() - (8 - day) * 86400000).toISOString(),
    });
  }

  const feedbacks: FeedbackRecord[] = [
    {
      id: 1,
      user_id: 2,
      student_name: 'Артем Волков',
      group_name: 'ПИМЦ-262',
      course: 2,
      message: 'Очень помогло то, что срыв на 15-й день не сжег весь стрик! Раньше во всех приложениях сразу сгорал весь прогресс и опускались руки. Тут я просто понял, что триггером была сессия, собрался и дошел до 25 дня. Дышать стало в разы легче.',
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      clean_days: 24,
      relapse_days: 1,
    },
  ];

  return { users, ankets, trackers, feedbacks };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error('Error reading database file, resetting to initial seed:', err);
    }
    const seed = seedDatabase();
    this.save(seed);
    return seed;
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing to database file:', err);
    }
  }

  // --- User Operations ---
  public findUser(firstName: string, lastName: string, idGroup: number): User | undefined {
    return this.data.users.find(
      (u) =>
        u.first_name.trim().toLowerCase() === firstName.trim().toLowerCase() &&
        u.last_name.trim().toLowerCase() === lastName.trim().toLowerCase() &&
        u.id_group === idGroup
    );
  }

  public getUserById(id: number): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getAllUsers(): User[] {
    return this.data.users;
  }

  public createUser(params: {
    firstName: string;
    lastName: string;
    idGroup: number;
    groupName?: string;
    course: number;
    idLevel?: number;
  }): User {
    const nextId = this.data.users.length > 0 ? Math.max(...this.data.users.map((u) => u.id)) + 1 : 1;
    const defaultGroupName = SIBSIU_GROUPS.find((g) => g.id === params.idGroup)?.name || params.groupName || `Группа-${params.idGroup}`;

    const newUser: User = {
      id: nextId,
      first_name: params.firstName.trim(),
      last_name: params.lastName.trim(),
      id_group: params.idGroup,
      group_name: params.groupName || defaultGroupName,
      course: params.course,
      id_level: params.idLevel || 1,
      created_at: new Date().toISOString(),
    };

    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // --- Anket Operations ---
  public getAnketByUserId(userId: number): AnketRecord | undefined {
    return this.data.ankets.find((a) => a.id_user === userId);
  }

  public saveAnket(userId: number, answers: Record<string, string>): AnketRecord {
    const existingIndex = this.data.ankets.findIndex((a) => a.id_user === userId);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      this.data.ankets[existingIndex].answers = answers;
      this.data.ankets[existingIndex].submitted_at = now;
      this.save();
      return this.data.ankets[existingIndex];
    } else {
      const nextId = this.data.ankets.length > 0 ? Math.max(...this.data.ankets.map((a) => a.id)) + 1 : 1;
      const newAnket: AnketRecord = {
        id: nextId,
        id_user: userId,
        submitted_at: now,
        answers,
      };
      this.data.ankets.push(newAnket);
      this.save();
      return newAnket;
    }
  }

  // --- Tracker Operations ---
  public getTrackerRecords(userId: number): TrackerRecord[] {
    return this.data.trackers
      .filter((t) => t.user_id === userId)
      .sort((a, b) => a.date_number - b.date_number);
  }

  public addTrackerMark(
    userId: number,
    status: 'Успех' | 'Срыв',
    triggerReason?: string,
    clientDate?: string
  ): TrackerRecord {
    const user = this.getUserById(userId);
    if (!user) {
      throw new Error('Пользователь не найден');
    }

    const userRecords = this.getTrackerRecords(userId);
    const nextDayNumber = userRecords.length + 1;

    if (nextDayNumber > 25) {
      throw new Error('25-дневная программа уже полностью завершена!');
    }

    const now = new Date();
    const todayDateStr = clientDate || now.toISOString().split('T')[0];

    // Enforce 1 check-in per calendar day: cannot skip days in a single sitting
    if (userRecords.length > 0) {
      const lastRecord = userRecords[userRecords.length - 1];
      const lastDateStr = lastRecord.client_date || new Date(lastRecord.marked_at).toISOString().split('T')[0];

      if (lastDateStr === todayDateStr) {
        throw new Error('Отметка за сегодня уже зафиксирована. Следующий день откроется в 00:00 (завтра)!');
      }
    }

    const nextId = this.data.trackers.length > 0 ? Math.max(...this.data.trackers.map((t) => t.id || 0)) + 1 : 1;
    const newRecord: TrackerRecord = {
      id: nextId,
      user_id: userId,
      date_number: nextDayNumber,
      status,
      marked_at: now.toISOString(),
      client_date: todayDateStr,
      trigger_reason: triggerReason,
    };

    this.data.trackers.push(newRecord);
    this.save();
    return newRecord;
  }

  public resetTrackerForUser(userId: number): void {
    this.data.trackers = this.data.trackers.filter((t) => t.user_id !== userId);
    this.data.feedbacks = this.data.feedbacks.filter((f) => f.user_id !== userId);
    this.save();
  }

  // --- Feedback Operations ---
  public saveFeedback(userId: number, message: string): FeedbackRecord {
    const user = this.getUserById(userId);
    const records = this.getTrackerRecords(userId);
    const cleanDays = records.filter((r) => r.status === 'Успех').length;
    const relapseDays = records.filter((r) => r.status === 'Срыв').length;

    const nextId = this.data.feedbacks.length > 0 ? Math.max(...this.data.feedbacks.map((f) => f.id)) + 1 : 1;
    const feedback: FeedbackRecord = {
      id: nextId,
      user_id: userId,
      student_name: user ? `${user.first_name} ${user.last_name}` : 'Студент',
      group_name: user ? user.group_name : 'СибГИУ',
      course: user ? user.course : 1,
      message: message.trim().slice(0, 400),
      created_at: new Date().toISOString(),
      clean_days: cleanDays,
      relapse_days: relapseDays,
    };

    this.data.feedbacks.push(feedback);
    this.save();
    return feedback;
  }

  public getFeedbacks(): FeedbackRecord[] {
    return [...this.data.feedbacks].reverse();
  }

  // --- Admin Analytics ---
  public getAdminStats(): AdminStats {
    const students = this.data.users.filter((u) => u.id_level === 1);
    const completedSurveys = this.data.ankets.length;

    // Trackers
    const userTrackerCounts = new Map<number, { total: number; success: number; fails: number }>();
    this.data.trackers.forEach((t) => {
      const current = userTrackerCounts.get(t.user_id) || { total: 0, success: 0, fails: 0 };
      current.total += 1;
      if (t.status === 'Успех') current.success += 1;
      if (t.status === 'Срыв') current.fails += 1;
      userTrackerCounts.set(t.user_id, current);
    });

    let completedTrackers = 0;
    let activeTrackers = 0;
    let totalCheckins = 0;
    let totalSuccess = 0;
    let totalRelapses = 0;

    userTrackerCounts.forEach((val) => {
      if (val.total >= 25) completedTrackers += 1;
      else if (val.total > 0) activeTrackers += 1;
      totalCheckins += val.total;
      totalSuccess += val.success;
      totalRelapses += val.fails;
    });

    const successRate = totalCheckins > 0 ? Math.round((totalSuccess / totalCheckins) * 100) : 100;

    // Group Summary
    const groupsMap = new Map<string, { count: number; completedSurvey: number; totalDays: number }>();
    students.forEach((s) => {
      const gName = s.group_name || 'Не указана';
      const cur = groupsMap.get(gName) || { count: 0, completedSurvey: 0, totalDays: 0 };
      cur.count += 1;
      if (this.data.ankets.some((a) => a.id_user === s.id)) {
        cur.completedSurvey += 1;
      }
      const days = userTrackerCounts.get(s.id)?.total || 0;
      cur.totalDays += days;
      groupsMap.set(gName, cur);
    });

    const groupsSummary = Array.from(groupsMap.entries()).map(([groupName, val]) => ({
      groupName,
      studentsCount: val.count,
      completedSurvey: val.completedSurvey,
      avgDaysCompleted: val.count > 0 ? Math.round((val.totalDays / val.count) * 10) / 10 : 0,
    }));

    // Question stats (q1 to q12)
    const questionStats: AdminStats['questionStats'] = [];
    for (let i = 1; i <= 12; i++) {
      const qKey = `q${i}`;
      const counts: Record<string, number> = {};

      this.data.ankets.forEach((a) => {
        const ans = a.answers[qKey];
        if (ans) {
          // split multiple choices separated by ';'
          const parts = ans.split(';').map((p) => p.trim());
          parts.forEach((p) => {
            if (p) {
              const cleanPart = p.startsWith('Другое:') ? 'Свой вариант (Другое)' : p;
              counts[cleanPart] = (counts[cleanPart] || 0) + 1;
            }
          });
        }
      });

      questionStats.push({
        questionId: qKey,
        questionText: `Вопрос ${i}`,
        answersCounts: counts,
      });
    }

    return {
      totalStudents: students.length,
      completedSurveys,
      activeTrackers,
      completedTrackers,
      totalCheckins,
      successRate,
      totalRelapses,
      totalFeedbacks: this.data.feedbacks.length,
      groupsSummary,
      recentFeedbacks: this.getFeedbacks(),
      questionStats,
    };
  }

  // --- Export utilities ---
  public exportExcelAnketsBuffer(): Buffer {
    const wb = XLSX.utils.book_new();

    const questionLabels = [
      'q1: Возраст',
      'q2: Возраст начала парения',
      'q3: Стаж парения',
      'q4: Частота использования',
      'q5: Причины начала',
      'q6: Ситуации курения',
      'q7: Ощущения без вейпа',
      'q8: Оценка вреда',
      'q9: Опыт отказа',
      'q10: Главные трудности',
      'q11: Отношение близких',
      'q12: Готовность к участию в трекере',
    ];

    const headers = [
      'ID студента',
      'Имя',
      'Фамилия',
      'Группа',
      'Курс',
      'Дата и время прохождения',
      ...questionLabels,
    ];

    const dataRows = this.data.ankets.map((a) => {
      const user = this.getUserById(a.id_user);
      const row: (string | number)[] = [
        a.id_user,
        user?.first_name || '',
        user?.last_name || '',
        user?.group_name || '',
        user?.course || '',
        new Date(a.submitted_at).toLocaleString('ru-RU'),
      ];
      for (let i = 1; i <= 12; i++) {
        row.push(a.answers[`q${i}`] || '');
      }
      return row;
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    // Set readable column widths in Excel
    ws['!cols'] = [
      { wch: 14 },
      { wch: 16 },
      { wch: 16 },
      { wch: 16 },
      { wch: 8 },
      { wch: 22 },
      ...questionLabels.map(() => ({ wch: 32 })),
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Анкеты студентов (q1-q12)');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  public exportExcelFeedbacksBuffer(): Buffer {
    const wb = XLSX.utils.book_new();
    const headers = ['ID отзыва', 'Студент', 'Группа', 'Курс', 'Чистых дней', 'Дней со срывами', 'Дата сдачи', 'Отзыв о программе'];
    const dataRows = this.data.feedbacks.map((f) => [
      f.id,
      f.student_name,
      f.group_name,
      f.course,
      f.clean_days,
      f.relapse_days,
      new Date(f.created_at).toLocaleString('ru-RU'),
      f.message,
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
    ws['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 16 }, { wch: 8 }, { wch: 14 }, { wch: 16 }, { wch: 22 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Отзывы студентов');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  public exportExcelAnkets(): string {
    return this.exportCsvSurveys();
  }

  public exportCsvSurveys(): string {
    const questionLabels = [
      'q1: Возраст',
      'q2: Возраст начала парения',
      'q3: Стаж парения',
      'q4: Частота использования',
      'q5: Причины начала',
      'q6: Ситуации курения',
      'q7: Ощущения без вейпа',
      'q8: Оценка вреда',
      'q9: Опыт отказа',
      'q10: Главные трудности',
      'q11: Отношение близких',
      'q12: Готовность к участию в трекере',
    ];

    const headers = [
      'id_user',
      'Имя',
      'Фамилия',
      'Группа',
      'Курс',
      'Дата прохождения',
      ...questionLabels,
    ];

    const rows = this.data.ankets.map((a) => {
      const user = this.getUserById(a.id_user);
      const row = [
        a.id_user,
        `"${(user?.first_name || '').replace(/"/g, '""')}"`,
        `"${(user?.last_name || '').replace(/"/g, '""')}"`,
        `"${(user?.group_name || '').replace(/"/g, '""')}"`,
        user?.course || '',
        `"${new Date(a.submitted_at).toLocaleString('ru-RU')}"`,
      ];
      for (let i = 1; i <= 12; i++) {
        const ans = (a.answers[`q${i}`] || '').replace(/"/g, '""');
        row.push(`"${ans}"`);
      }
      return row.join(';');
    });

    return '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  }

  public exportCsvFeedbacks(): string {
    const headers = ['ID', 'Студент', 'Группа', 'Курс', 'Чистых дней', 'Срывов', 'Дата', 'Отзыв'];
    const rows = this.data.feedbacks.map((f) => [
      f.id,
      `"${f.student_name}"`,
      `"${f.group_name}"`,
      f.course,
      f.clean_days,
      f.relapse_days,
      `"${new Date(f.created_at).toLocaleDateString('ru-RU')}"`,
      `"${f.message.replace(/"/g, '""')}"`,
    ]);
    return '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  }

  // Clear all student test data, questionnaires, trackers, and feedbacks, keeping only admin accounts
  public clearDatabase(): void {
    // Retain only admin users (id_level === 2)
    let admins = this.data.users.filter((u) => u.id_level === 2);
    if (admins.length === 0) {
      admins = [
        {
          id: 1,
          first_name: '1',
          last_name: '1',
          id_group: 1,
          group_name: 'Администрация',
          course: 1,
          id_level: 2,
          created_at: new Date().toISOString(),
        },
      ];
    }

    this.data = {
      users: admins,
      ankets: [],
      trackers: [],
      feedbacks: [],
    };
    this.save();
  }
}

export const db = new Database();

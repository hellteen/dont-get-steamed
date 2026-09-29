import express from 'express';
import fs from 'fs';
import path from 'path';
import { db } from '../db';
import { isMsSqlConnected } from '../mssql';

const router = express.Router();

// GET /api/admin/overview
router.get('/overview', (_req, res) => {
  try {
    const stats = db.getAdminStats();
    res.json({
      success: true,
      stats,
      isMsSqlConnected: isMsSqlConnected(),
      databaseMode: isMsSqlConnected() ? 'MS SQL Server (порт 1433)' : 'Локальное хранилище данных (data/db.json)',
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/students
router.get('/students', (_req, res) => {
  try {
    const allUsers = db.getAllUsers();
    const students = allUsers.filter((u) => u.id_level === 1);

    const detailedStudents = students.map((s) => {
      const anket = db.getAnketByUserId(s.id);
      const trackerRecords = db.getTrackerRecords(s.id);
      const cleanCount = trackerRecords.filter((t) => t.status === 'Успех').length;
      const relapseCount = trackerRecords.filter((t) => t.status === 'Срыв').length;

      return {
        id: s.id,
        first_name: s.first_name,
        last_name: s.last_name,
        group_name: s.group_name,
        course: s.course,
        created_at: s.created_at,
        hasCompletedSurvey: Boolean(anket),
        daysCompleted: trackerRecords.length,
        cleanCount,
        relapseCount,
        isFinished: trackerRecords.length >= 25,
      };
    });

    res.json({ success: true, students: detailedStudents });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/export-excel/anket
router.get('/export-excel/anket', (_req, res) => {
  try {
    const buffer = db.exportExcelAnketsBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="anket_students_q1_q12.xlsx"');
    res.send(buffer);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/export-excel/feedbacks
router.get('/export-excel/feedbacks', (_req, res) => {
  try {
    const buffer = db.exportExcelFeedbacksBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="feedbacks_students.xlsx"');
    res.send(buffer);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/export-csv/surveys
router.get('/export-csv/surveys', (_req, res) => {
  try {
    const buffer = db.exportExcelAnketsBuffer();
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="anket_students_q1_q12.xlsx"');
    res.send(buffer);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/export-csv/feedbacks
router.get('/export-csv/feedbacks', (_req, res) => {
  try {
    const csv = db.exportCsvFeedbacks();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="sibsiu_vape_feedbacks.csv"');
    res.send(csv);
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/export-sql
router.get('/export-sql', (_req, res) => {
  try {
    const sqlPath = path.join(process.cwd(), 'database', 'mssql_schema.sql');
    if (fs.existsSync(sqlPath)) {
      const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
      res.setHeader('Content-Type', 'application/sql; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="mssql_schema_sibsiu.sql"');
      res.send(sqlContent);
    } else {
      res.status(404).json({ error: 'SQL файл схемы не найден' });
    }
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

// POST /api/admin/clear-database
router.post('/clear-database', (_req, res) => {
  try {
    db.clearDatabase();
    res.json({
      success: true,
      message: 'База данных успешно очищена от всех тестовых анкет, трекеров и отзывов.',
    });
  } catch (err: unknown) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
});

export default router;

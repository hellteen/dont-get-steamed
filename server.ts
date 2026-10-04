import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

import authRoutes from './server/routes/auth';
import surveyRoutes from './server/routes/survey';
import trackerRoutes from './server/routes/tracker';
import feedbackRoutes from './server/routes/feedback';
import adminRoutes from './server/routes/admin';
import { initMsSql } from './server/mssql';
import { db } from './server/db';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Attempt connection to user's MS SQL Server on port 1433 (with safe fallback)
  initMsSql().catch(() => {});

  // Initialize Cloud PostgreSQL if DATABASE_URL is configured (Render, Supabase, Neon)
  await db.initPostgres().catch(() => {});

  // Middlewares
  app.use(cors());
  app.use(express.json());

  // Mount API routes FIRST
  app.use('/api/auth', authRoutes);
  app.use('/api/survey', surveyRoutes);
  app.use('/api/tracker', trackerRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/admin', adminRoutes);

  // Health / test route
  app.get('/api/test', (_req, res) => {
    res.json({
      status: 'ok',
      message: 'Анти-Вейп Трекер СибГИУ (25 дней) API работает штатно',
      timestamp: new Date().toISOString(),
    });
  });

  // Vite middleware in dev or static dist in production
  const isProduction = process.env.NODE_ENV === 'production' || (process.argv[1] && process.argv[1].endsWith('.cjs'));
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ Сервер запущен на порту ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});

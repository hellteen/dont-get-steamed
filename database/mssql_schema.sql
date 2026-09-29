-- ====================================================================
-- Скрипт создания базы данных и таблиц для MS SQL Server (СибГИУ)
-- Проект: Мобильный веб-трекер отказа от вейпа «Не запарься»
-- Версия: 25 дней серии (без обнуления при срыве)
-- ====================================================================

-- 1. Создание базы данных (если не существует)
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'tracker')
BEGIN
    CREATE DATABASE tracker;
END
GO

USE tracker;
GO

-- 2. Таблица пользователей [user]
-- Хранит профиль студента, группу, курс и роль (1 - студент, 2 - преподаватель/администратор)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user')
BEGIN
    CREATE TABLE [dbo].[user] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [first_name] NVARCHAR(100) NOT NULL,
        [last_name] NVARCHAR(100) NOT NULL,
        [id_group] INT NOT NULL,              -- Числовой ID группы
        [group_name] NVARCHAR(100) NULL,      -- Название группы: ПИМЦ-262, ПИТЭ-26, ПИС-26, ИС-21, ИС-22, Менеджмент
        [course] INT NOT NULL,                -- 1, 2, 3, 4
        [id_level] INT NOT NULL DEFAULT 1,    -- 1 = Студент, 2 = Преподаватель/Куратор
        [created_at] DATETIME2 NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX IX_user_login ON [dbo].[user]([first_name], [last_name], [id_group]);
END
GO

-- 3. Таблица анкет вводного опроса [anket]
-- Хранит ответы на 12 вопросов (q1–q12). Варианты «Другое: ...» сохраняются полностью.
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'anket')
BEGIN
    CREATE TABLE [dbo].[anket] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [id_user] INT NOT NULL,
        [q1] NVARCHAR(MAX) NULL,
        [q2] NVARCHAR(MAX) NULL,
        [q3] NVARCHAR(MAX) NULL,
        [q4] NVARCHAR(MAX) NULL,
        [q5] NVARCHAR(MAX) NULL,
        [q6] NVARCHAR(MAX) NULL,
        [q7] NVARCHAR(MAX) NULL,
        [q8] NVARCHAR(MAX) NULL,
        [q9] NVARCHAR(MAX) NULL,
        [q10] NVARCHAR(MAX) NULL,
        [q11] NVARCHAR(MAX) NULL,
        [q12] NVARCHAR(MAX) NULL,
        [submitted_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_anket_user FOREIGN KEY ([id_user]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE
    );
    CREATE INDEX IX_anket_user ON [dbo].[anket]([id_user]);
END
GO

-- 4. Таблица отметок прогресса трекера [tracker]
-- 25-дневная серия. Статусы: 'Успех' / 'Срыв'. При срыве серия не обнуляется!
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'tracker')
BEGIN
    CREATE TABLE [dbo].[tracker] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [user_id] INT NOT NULL,
        [date_number] INT NOT NULL,            -- Номер дня серии от 1 до 25
        [status] NVARCHAR(50) NOT NULL,        -- 'Успех' или 'Срыв'
        [marked_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_tracker_user FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE,
        CONSTRAINT UQ_tracker_user_day UNIQUE ([user_id], [date_number])
    );
    CREATE INDEX IX_tracker_user ON [dbo].[tracker]([user_id], [date_number]);
END
GO

-- 5. Таблица финальных отзывов и рефлексии [feedback]
-- Заполняется после прохождения 25 дней (до 400 символов)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'feedback')
BEGIN
    CREATE TABLE [dbo].[feedback] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [user_id] INT NOT NULL,
        [message] NVARCHAR(400) NOT NULL,
        [created_at] DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_feedback_user FOREIGN KEY ([user_id]) REFERENCES [dbo].[user]([id]) ON DELETE CASCADE
    );
    CREATE INDEX IX_feedback_user ON [dbo].[feedback]([user_id]);
END
GO

-- 6. Демонстрационный администратор для преподавателя / куратора СибГИУ
IF NOT EXISTS (SELECT * FROM [dbo].[user] WHERE [first_name] = N'Куратор' AND [last_name] = N'СибГИУ')
BEGIN
    INSERT INTO [dbo].[user] ([first_name], [last_name], [id_group], [group_name], [course], [id_level])
    VALUES (N'Куратор', N'СибГИУ', 999, N'Кафедра ПИ', 0, 2);
END
GO

PRINT N'✅ База данных и таблицы MS SQL успешно созданы и готовы к работе!';

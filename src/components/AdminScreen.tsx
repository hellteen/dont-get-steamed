import React, { useState, useEffect } from 'react';
import { AdminStats, FeedbackRecord } from '../types';
import { SURVEY_QUESTIONS } from '../data/questions';
import { sounds } from '../utils/audio';
import {
  Users,
  FileSpreadsheet,
  Download,
  BarChart3,
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Flame,
  GraduationCap,
  Trash2,
} from 'lucide-react';

interface AdminScreenProps {
  onBackToApp: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBackToApp }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'students' | 'feedbacks'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('Все');
  const [selectedQuestionId, setSelectedQuestionId] = useState('q4');
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleClearDatabase = async () => {
    try {
      setClearing(true);
      const res = await fetch('/api/admin/clear-database', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        sounds.success();
        setShowClearModal(false);
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to clear database:', err);
    } finally {
      setClearing(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [resStats, resStudents] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/students'),
      ]);

      const dataStats = await resStats.json();
      const dataStudents = await resStudents.json();

      if (dataStats.success) {
        setStats(dataStats.stats);
      }
      if (dataStudents.success) setStudents(dataStudents.students);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.group_name && s.group_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchGroup = selectedGroupFilter === 'Все' || s.group_name === selectedGroupFilter;
    return matchSearch && matchGroup;
  });

  const uniqueGroups = ['Все', ...Array.from(new Set(students.map((s) => s.group_name).filter(Boolean)))];

  // Active question stats
  const activeQDef = SURVEY_QUESTIONS.find((q) => q.id === selectedQuestionId) || SURVEY_QUESTIONS[3];
  const activeQStats = stats?.questionStats.find((q) => q.questionId === selectedQuestionId);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4">
      {/* Top Banner */}
      <div className="bg-[#111417] border border-[#ff4b16]/30 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#ff4b16]/15 border border-[#ff4b16]/40 flex items-center justify-center text-[#ff4b16]">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white font-display">
                Панель администратора
              </h2>
              <span className="text-[10px] text-zinc-400 font-mono-code">
                Проект «Не запарься» • Мониторинг студентов СибГИУ
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.click();
              fetchAdminData();
            }}
            className="w-8 h-8 rounded-lg bg-[#171b1f] border border-[#232b31] flex items-center justify-center text-zinc-400 hover:text-white transition-all"
            title="Обновить данные"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Primary Excel Export Button (.xlsx) */}
        <a
          href="/api/admin/export-excel/anket"
          download="anket_students_q1_q12.xlsx"
          onClick={() => sounds.success()}
          className="w-full py-2.5 px-3 mb-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
          <span>Скачать анкеты в Excel (.xlsx, q1–q12)</span>
        </a>

        {/* Secondary Export Action Bar */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px]">
          <a
            href="/api/admin/export-excel/feedbacks"
            download="feedbacks_students.xlsx"
            onClick={() => sounds.click()}
            className="p-2 rounded-xl bg-[#171b1f] border border-[#232b31] hover:border-emerald-500 text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Отзывы (.xlsx)</span>
          </a>

          <a
            href="/api/admin/export-sql"
            download="sibsiu_vape_tracker_mssql.sql"
            onClick={() => sounds.click()}
            className="p-2 rounded-xl bg-[#171b1f] border border-[#232b31] hover:border-[#ff4b16] text-zinc-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#ff4b16]" />
            <span>MS SQL (.sql)</span>
          </a>

          <button
            onClick={() => {
              sounds.softNotice();
              setShowClearModal(true);
            }}
            className="p-2 rounded-xl bg-[#171b1f] border border-[#232b31] hover:border-rose-500 text-zinc-400 hover:text-rose-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            title="Очистить тестовые анкеты и сбросить БД"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Очистить БД</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#111417] border border-[#1f262b] rounded-2xl text-[11px] font-bold">
        <button
          onClick={() => {
            sounds.click();
            setActiveTab('overview');
          }}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'overview' ? 'bg-[#16f0c2] text-black shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Сводка
        </button>

        <button
          onClick={() => {
            sounds.click();
            setActiveTab('questions');
          }}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'questions' ? 'bg-[#16f0c2] text-black shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Опрос 1-12
        </button>

        <button
          onClick={() => {
            sounds.click();
            setActiveTab('students');
          }}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'students' ? 'bg-[#16f0c2] text-black shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Студенты ({students.length})
        </button>

        <button
          onClick={() => {
            sounds.click();
            setActiveTab('feedbacks');
          }}
          className={`py-2 rounded-xl transition-all ${
            activeTab === 'feedbacks' ? 'bg-[#16f0c2] text-black shadow' : 'text-zinc-400 hover:text-white'
          }`}
        >
          Отзывы ({stats?.totalFeedbacks || 0})
        </button>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-3 animate-fade-in">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#111417] border border-[#1f262b] rounded-2xl p-3.5">
              <span className="text-[10px] uppercase font-mono-code text-zinc-500 block mb-1">
                Всего студентов
              </span>
              <div className="text-2xl font-black text-white font-mono-code">
                {stats.totalStudents}
              </div>
              <div className="text-[10px] text-[#16f0c2] mt-0.5">
                {stats.completedSurveys} заполнили анкету
              </div>
            </div>

            <div className="bg-[#111417] border border-[#1f262b] rounded-2xl p-3.5">
              <span className="text-[10px] uppercase font-mono-code text-zinc-500 block mb-1">
                Успешных дней
              </span>
              <div className="text-2xl font-black text-[#16f0c2] font-mono-code">
                {stats.successRate}%
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                {stats.totalRelapses} срывов зафиксировано
              </div>
            </div>

            <div className="bg-[#111417] border border-[#1f262b] rounded-2xl p-3.5">
              <span className="text-[10px] uppercase font-mono-code text-zinc-500 block mb-1">
                В процессе трекера
              </span>
              <div className="text-2xl font-black text-[#ffb347] font-mono-code">
                {stats.activeTrackers}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                отмечаются прямо сейчас
              </div>
            </div>

            <div className="bg-[#111417] border border-[#1f262b] rounded-2xl p-3.5">
              <span className="text-[10px] uppercase font-mono-code text-zinc-500 block mb-1">
                Финишировали 25 дней
              </span>
              <div className="text-2xl font-black text-white font-mono-code">
                {stats.completedTrackers}
              </div>
              <div className="text-[10px] text-zinc-400 mt-0.5">
                полный курс перезагрузки
              </div>
            </div>
          </div>

          {/* Groups Breakdown */}
          <div className="bg-[#111417] border border-[#1f262b] rounded-3xl p-4 shadow-xl">
            <h3 className="text-xs font-bold text-white mb-3 flex items-center justify-between">
              <span>Статистика по группам СибГИУ</span>
              <span className="text-[10px] font-mono-code text-[#16f0c2]">Студенты</span>
            </h3>

            <div className="space-y-2">
              {stats.groupsSummary.map((grp) => (
                <div
                  key={grp.groupName}
                  className="p-2.5 bg-[#171b1f] border border-[#22282e] rounded-xl flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{grp.groupName}</span>
                    <span className="text-[10px] text-zinc-400">
                      Сдали анкету: {grp.completedSurvey} / {grp.studentsCount}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono-code font-bold text-[#16f0c2]">
                      {grp.avgDaysCompleted} дн.
                    </span>
                    <span className="text-[9px] text-zinc-500 block">средняя серия</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTION-BY-QUESTION ANALYTICS */}
      {activeTab === 'questions' && (
        <div className="space-y-3 animate-fade-in">
          {/* Question Selector Carousel */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
            {SURVEY_QUESTIONS.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => {
                  sounds.click();
                  setSelectedQuestionId(q.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono-code shrink-0 border transition-all ${
                  selectedQuestionId === q.id
                    ? 'bg-[#16f0c2] text-black font-extrabold border-[#16f0c2]'
                    : 'bg-[#111417] text-zinc-400 border-[#1f262b] hover:text-white'
                }`}
              >
                В{idx + 1}
              </button>
            ))}
          </div>

          {/* Active Question Breakdown */}
          <div className="bg-[#111417] border border-[#1f262b] rounded-3xl p-5 shadow-xl">
            <span className="text-[10px] font-mono-code text-[#16f0c2] uppercase tracking-wider block mb-1">
              Вопрос {SURVEY_QUESTIONS.findIndex((q) => q.id === selectedQuestionId) + 1} из {SURVEY_QUESTIONS.length}
            </span>
            <h3 className="text-xs font-bold text-white mb-4 leading-snug">
              {activeQDef.text}
            </h3>

            {/* Answer Bars */}
            <div className="space-y-3">
              {activeQDef.options.map((opt) => {
                const count = activeQStats?.answersCounts[opt] || 0;
                const totalAnswers = stats?.completedSurveys || 1;
                const pct = Math.round((count / totalAnswers) * 100);

                return (
                  <div key={opt} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-300 text-[11px] max-w-[240px] truncate">{opt}</span>
                      <span className="font-mono-code text-[11px] font-bold text-[#16f0c2]">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#171b1f] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#16f0c2] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Any custom other answers */}
              {activeQStats &&
                Object.entries(activeQStats.answersCounts)
                  .filter(([k]) => !activeQDef.options.includes(k))
                  .map(([customAns, count]) => {
                    const totalAnswers = stats?.completedSurveys || 1;
                    const pct = Math.round((count / totalAnswers) * 100);
                    return (
                      <div key={customAns} className="space-y-1 pt-1 border-t border-[#1f262b]">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-zinc-400 text-[11px] italic truncate max-w-[240px]">
                            {customAns}
                          </span>
                          <span className="font-mono-code text-[11px] text-[#ffb347]">
                            {count} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-[#171b1f] h-2 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#ffb347] rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STUDENTS LIST */}
      {activeTab === 'students' && (
        <div className="space-y-3 animate-fade-in">
          {/* Search & Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по имени или группе..."
                className="w-full bg-[#111417] border border-[#1f262b] focus:border-[#16f0c2] rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-zinc-500 outline-none"
              />
            </div>

            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="bg-[#111417] border border-[#1f262b] rounded-xl px-2.5 py-2 text-xs text-zinc-300 outline-none cursor-pointer"
            >
              {uniqueGroups.map((g) => (
                <option key={g} value={g} className="bg-[#111417]">
                  {g}
                </option>
              ))}
            </select>
          </div>

          {/* Students List */}
          <div className="space-y-2">
            {filteredStudents.length === 0 ? (
              <div className="p-6 text-center text-xs text-zinc-500 bg-[#111417] rounded-2xl border border-[#1f262b]">
                Студенты не найдены
              </div>
            ) : (
              filteredStudents.map((s) => {
                const isExpanded = expandedStudentId === s.id;
                return (
                  <div
                    key={s.id}
                    className="bg-[#111417] border border-[#1f262b] hover:border-[#2a343b] rounded-2xl overflow-hidden transition-all text-xs"
                  >
                    <div
                      onClick={() => {
                        sounds.click();
                        setExpandedStudentId(isExpanded ? null : s.id);
                      }}
                      className="p-3 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">
                            {s.first_name} {s.last_name}
                          </span>
                          {s.isFinished && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#16f0c2]/20 text-[#16f0c2] font-mono-code font-bold">
                              {s.relapseCount > 0
                                ? `ФИНИШ (${s.cleanCount} чистых, ${s.relapseCount} ${s.relapseCount === 1 ? 'срыв' : 'срыва'})`
                                : 'ФИНИШ 25/25'}
                            </span>
                          )}
                          {s.hasCompletedSurvey && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono-code">
                              q1–q12 ✓
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          {s.group_name} • {s.course} курс • {s.hasCompletedSurvey ? 'Нажми для просмотра анкеты' : 'Опрос не сдан'}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono-code font-black text-[#16f0c2]">
                          {s.cleanCount}/25 чистых
                        </span>
                        <div className="text-[9px] text-zinc-500">
                          {s.relapseCount > 0 ? `срывов: ${s.relapseCount}` : 'без срывов'}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Survey Answers View */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-[#1f262b] bg-[#0d1012] space-y-2 text-[11px]">
                        <div className="text-[10px] font-bold text-[#16f0c2] uppercase tracking-wider mb-1">
                          Ответы студента в анкете (q1–q12):
                        </div>
                        {s.anket ? (
                          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                            {SURVEY_QUESTIONS.map((q, idx) => (
                              <div key={q.id} className="p-2 bg-[#14181b] rounded-lg border border-[#1f262b]">
                                <div className="text-zinc-400 text-[10px] mb-0.5">
                                  Вопрос {idx + 1}: {q.text}
                                </div>
                                <div className="text-white font-medium text-[11px]">
                                  {s.anket[q.id] || '— не ответил —'}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 bg-[#14181b] rounded-lg text-zinc-500 text-center">
                            Студент еще не проходил анкету
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RECENT FEEDBACKS */}
      {activeTab === 'feedbacks' && (
        <div className="space-y-2.5 animate-fade-in">
          {stats?.recentFeedbacks.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500 bg-[#111417] rounded-2xl border border-[#1f262b]">
              Пока нет отправленных отзывов
            </div>
          ) : (
            stats?.recentFeedbacks.map((f) => (
              <div
                key={f.id}
                className="p-4 bg-[#111417] border border-[#1f262b] rounded-2xl space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{f.student_name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#171b1f] text-[#16f0c2] font-mono-code">
                      {f.group_name}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono-code">
                    {new Date(f.created_at).toLocaleDateString('ru-RU')}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed italic bg-[#171b1f] p-3 rounded-xl border border-[#22282e]">
                  «{f.message}»
                </p>

                <div className="flex items-center justify-between text-[10px] text-zinc-500">
                  <span>Серия: 25 дней</span>
                  <span className="text-[#16f0c2]">
                    Чистых дней: {f.clean_days} (срывов: {f.relapse_days})
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Confirmation Modal for Clearing Database */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111417] border border-[#232b31] rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-500 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-white">
                Очистить базу данных?
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Будут удалены все тестовые анкеты, отметки трекеров и отзывы студентов. Аккаунт администратора сохранится. База данных станет абсолютно чистой для старта реального опроса.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                disabled={clearing}
                className="py-2.5 px-3 rounded-xl bg-[#171b1f] border border-[#232b31] text-zinc-300 font-bold text-xs hover:text-white transition-all"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleClearDatabase}
                disabled={clearing}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-950/40 transition-all flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{clearing ? 'Очищаю...' : 'Да, удалить'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

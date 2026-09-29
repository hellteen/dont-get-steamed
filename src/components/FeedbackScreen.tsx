import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { User, TrackerRecord } from '../types';
import { sounds } from '../utils/audio';
import { Trophy, Send, Sparkles, CheckCircle2, RotateCcw, Award } from 'lucide-react';

interface FeedbackScreenProps {
  user: User;
  records: TrackerRecord[];
  onFinishReviewed: () => void;
  onResetTracker: () => void;
}

export const FeedbackScreen: React.FC<FeedbackScreenProps> = ({
  user,
  records = [],
  onFinishReviewed,
  onResetTracker,
}) => {
  const [actualRecords, setActualRecords] = useState<TrackerRecord[]>(records);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  // Fetch actual user tracker records on mount to guarantee fresh & accurate data
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const clientDate = new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/tracker/${user.id}?clientDate=${clientDate}`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.records)) {
          setActualRecords(data.records);
        }
      } catch (err) {
        console.error('Error fetching tracker in FeedbackScreen:', err);
      }
    };
    fetchLatest();
  }, [user.id]);

  const cleanDays = actualRecords.filter((r) => r.status === 'Успех').length;
  const relapseDays = actualRecords.filter((r) => r.status === 'Срыв').length;
  const totalDays = actualRecords.length || 25;

  useEffect(() => {
    // Fire celebratory confetti on mount
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16f0c2', '#ff4b16', '#ffb347', '#ffffff'],
      });
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorNotice('Пожалуйста, напиши пару слов о своих впечатлениях');
      return;
    }

    setSubmitting(true);
    setErrorNotice('');
    sounds.click();

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ошибка отправки отзыва');
      }

      sounds.success();
      setSubmitted(true);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorNotice(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 animate-fade-in">
      {/* Trophy Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#ffb347]/20 via-[#16f0c2]/20 to-transparent border border-[#16f0c2]/40 flex items-center justify-center text-[#16f0c2] mb-3 shadow-xl shadow-[#16f0c2]/10 animate-bounce">
          <Trophy className="w-10 h-10 text-[#ffb347]" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16f0c2]/10 border border-[#16f0c2]/30 text-xs font-mono-code text-[#16f0c2] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {relapseDays > 0
              ? `${cleanDays} ИЗ ${totalDays} ЧИСТЫХ ДНЕЙ (${relapseDays} ${relapseDays === 1 ? 'срыв' : relapseDays < 5 ? 'срыва' : 'срывов'})`
              : '25 ИЗ 25 ЧИСТЫХ ДНЕЙ'}
          </span>
        </div>
        <h2 className="text-2xl font-black text-white font-display">
          {relapseDays > 0 ? `Финиш: ${cleanDays} чистых дней` : 'Твой чистый финиш'}
        </h2>
      </div>

      {/* Main Narrative Card */}
      <div className="bg-[#111417] border border-[#1f262b] rounded-3xl p-5 shadow-2xl mb-4 relative overflow-hidden">
        {relapseDays === 0 ? (
          <div className="text-xs text-zinc-300 leading-relaxed space-y-3">
            <p className="text-sm font-bold text-white">
              25 из 25 чистых дней. Двадцать пять дней назад ты взял паузу.
            </p>
            <p>
              Не «бросил навсегда», а просто перестал парить день за днём. Тело уже другое: лёгкие чище, вкус ярче, сон глубже.
            </p>
            <p>
              Тяга ещё может вернуться в стрессе, в компании, в пятницу вечером. Это нормально. Главное ты знаешь, что можешь не парить. Один день. Потом ещё один.
            </p>
            <div className="p-3 bg-[#16f0c2]/10 border border-[#16f0c2]/30 rounded-2xl text-center">
              <span className="text-xs font-black text-[#16f0c2] uppercase tracking-wider block">
                Ты не «бросающий». Ты уже не паришь.
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-zinc-300 leading-relaxed space-y-3">
            <p className="text-sm font-bold text-white">
              Календарь пройден: {cleanDays} из 25 чистых дней!
            </p>
            <p>
              Были срывы ({relapseDays} {relapseDays === 1 ? 'день' : relapseDays < 5 ? 'дня' : 'дней'}). Но самое главное: ты не ушёл и не бросил, серия не обнулилась, а <strong>{cleanDays} {cleanDays === 1 ? 'чистый день' : cleanDays < 5 ? 'чистых дня' : 'чистых дней'}</strong> — это огромный реальный результат.
            </p>
            <p>
              Ты уже не тот, кто начинал: тело чище, привычка слабее, и ты знаешь свои триггеры в лицо.
            </p>
            <div className="p-3 bg-[#ffb347]/10 border border-[#ffb347]/30 rounded-2xl text-center">
              <span className="text-xs font-bold text-[#ffb347] block">
                Дальше сам. Хочешь продолжай трек. Хочешь просто живи без пара.
              </span>
            </div>
          </div>
        )}

        {/* Stats Pill */}
        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[#1f262b]">
          <div className="bg-[#171b1f] p-2.5 rounded-xl border border-[#222930] text-center">
            <div className="text-lg font-black text-[#16f0c2] font-mono-code">{cleanDays}</div>
            <div className="text-[10px] text-zinc-400">Чистых дней</div>
          </div>
          <div className="bg-[#171b1f] p-2.5 rounded-xl border border-[#222930] text-center">
            <div className="text-lg font-black text-[#ff4b16] font-mono-code">{relapseDays}</div>
            <div className="text-[10px] text-zinc-400">Зафиксировано срывов</div>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <div className="bg-[#111417] border border-[#1f262b] rounded-3xl p-5 shadow-2xl">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#16f0c2]" />
          Итоговая рефлексия (до 400 символов)
        </h3>
        <p className="text-[11px] text-zinc-400 mb-3">
          Как изменилось самочувствие? Что помогло больше всего? Твой опыт анонимно поможет другим студентам СибГИУ.
        </p>

        {submitted ? (
          <div className="p-4 bg-[#16f0c2]/10 border border-[#16f0c2]/30 rounded-2xl text-center">
            <CheckCircle2 className="w-8 h-8 text-[#16f0c2] mx-auto mb-2" />
            <h4 className="text-xs font-bold text-white mb-1">Отзыв сохранён!</h4>
            <p className="text-[11px] text-zinc-400">
              Спасибо за вклад в проект «Анти-Вейп Трекер СибГИУ».
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {errorNotice && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
                {errorNotice}
              </div>
            )}

            <div>
              <textarea
                value={message}
                maxLength={400}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Напиши, что ты чувствуешь сейчас..."
                rows={4}
                className="w-full bg-[#171b1f] border border-[#232b31] focus:border-[#16f0c2] rounded-xl p-3 text-xs text-white placeholder-zinc-500 outline-none resize-none leading-relaxed"
              />
              <div className="text-right text-[10px] font-mono-code text-zinc-500">
                {message.length} / 400 символов
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#16f0c2] to-[#0fd2a9] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#16f0c2]/20 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Отправить финальный отзыв</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Quick return or reset buttons */}
        <div className="mt-4 pt-3 border-t border-[#1f262b] flex items-center justify-between text-xs">
          <button
            onClick={onFinishReviewed}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            ← К календарю
          </button>
          <button
            onClick={() => {
              if (confirm('Начать новый 25-дневный цикл?')) {
                onResetTracker();
              }
            }}
            className="text-zinc-500 hover:text-[#ff4b16] transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Начать заново</span>
          </button>
        </div>
      </div>
    </div>
  );
};

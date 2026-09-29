import React, { useState, useEffect, useRef } from 'react';
import { User, TrackerRecord } from '../types';
import { DAY_TEXTS } from '../data/dayTexts';
import { sounds } from '../utils/audio';
import { RelapseModal } from './RelapseModal';
import { EmergencyHelpModal } from './EmergencyHelpModal';
import {
  Flame,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Clock,
  Shield,
  LifeBuoy,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Wallet,
  Activity,
  Heart,
  FileText,
} from 'lucide-react';

interface TrackerScreenProps {
  user: User;
  onOpenFeedback: (records?: TrackerRecord[]) => void;
}

export const TrackerScreen: React.FC<TrackerScreenProps> = ({
  user,
  onOpenFeedback,
}) => {
  const [records, setRecords] = useState<TrackerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState('');
  const [daysMissed, setDaysMissed] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');

  // Daily release restriction state
  const [isTodayMarked, setIsTodayMarked] = useState(false);
  const [todayRecord, setTodayRecord] = useState<TrackerRecord | null>(null);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState('');

  // Selected day for previewing
  const [selectedDayNumber, setSelectedDayNumber] = useState<number>(1);

  // Modals
  const [showRelapseModal, setShowRelapseModal] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const [marking, setMarking] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);

  // Helper for current client date YYYY-MM-DD
  const getClientDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Live countdown to next calendar day (midnight 00:00:00)
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      const diffMs = tomorrow.getTime() - now.getTime();

      if (diffMs <= 0) {
        // Midnight crossed - unlock next day automatically
        loadTrackerData();
        return;
      }

      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeUntilMidnight(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [records, isTodayMarked]);

  // Load tracker data
  const loadTrackerData = async () => {
    try {
      setLoading(true);
      const clientDate = getClientDate();
      const res = await fetch(`/api/tracker/${user.id}?clientDate=${clientDate}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setRecords(data.records || []);
        setDaysMissed(data.daysMissed || 0);
        setIsTodayMarked(Boolean(data.isTodayMarked));
        setTodayRecord(data.todayRecord || null);

        const recs = data.records || [];
        // Default inspected day:
        // If today is already marked, inspect today's finished day. Otherwise, the day waiting for mark.
        const active = data.isTodayMarked
          ? Math.max(1, recs.length)
          : Math.min(25, recs.length + 1);
        setSelectedDayNumber(active);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorNotice('Не удалось связаться с сервером трекера');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrackerData();
  }, [user.id]);

  // Scroll active day into view in the horizontal timeline
  useEffect(() => {
    if (timelineRef.current) {
      const activeEl = timelineRef.current.querySelector(`[data-day="${selectedDayNumber}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedDayNumber]);

  const totalCompleted = records.length;
  const isAllFinished = totalCompleted >= 25;
  const currentActiveDay = isTodayMarked ? totalCompleted : Math.min(25, totalCompleted + 1);

  const cleanDays = records.filter((r) => r.status === 'Успех').length;
  const relapseDays = records.filter((r) => r.status === 'Срыв').length;

  // Approximate metrics for student
  // Average student vape cost: ~160 ₽/day (cartridges, liquid, disposables)
  const moneySaved = cleanDays * 160;
  const healthPercent = Math.min(100, Math.round((cleanDays / 25) * 100));

  // Handle Mark Success
  const handleMarkSuccess = async () => {
    if (marking || isAllFinished || isTodayMarked) return;
    setMarking(true);
    sounds.success();
    setErrorNotice('');

    try {
      const clientDate = getClientDate();
      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          status: 'Успех',
          clientDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка записи');
      }

      await loadTrackerData();

      if (data.isFinished) {
        const freshRes = await fetch(`/api/tracker/${user.id}?clientDate=${clientDate}`);
        const freshData = await freshRes.json();
        onOpenFeedback(freshData.records || []);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorNotice(error.message);
    } finally {
      setMarking(false);
    }
  };

  // Handle Mark Relapse
  const handleConfirmRelapse = async (triggerReason: string) => {
    setShowRelapseModal(false);
    if (marking || isAllFinished || isTodayMarked) return;
    setMarking(true);
    sounds.softNotice();
    setErrorNotice('');

    try {
      const clientDate = getClientDate();
      const res = await fetch('/api/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          status: 'Срыв',
          triggerReason,
          clientDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка записи');
      }

      await loadTrackerData();

      if (data.isFinished) {
        const freshRes = await fetch(`/api/tracker/${user.id}?clientDate=${clientDate}`);
        const freshData = await freshRes.json();
        onOpenFeedback(freshData.records || []);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorNotice(error.message);
    } finally {
      setMarking(false);
    }
  };

  // Reset tracker helper
  const handleReset = async () => {
    if (!confirm('Сбросить весь прогресс трекера и начать день 1?')) return;
    sounds.click();
    try {
      await fetch('/api/tracker/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      await loadTrackerData();
      setSelectedDayNumber(1);
    } catch (err) {
      console.error(err);
    }
  };

  // Content of inspected day
  const displayedContent = DAY_TEXTS[selectedDayNumber] || DAY_TEXTS[1];
  const inspectedRecord = records.find((r) => r.date_number === selectedDayNumber);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4">
      {/* Missed Days Banner */}
      {daysMissed > 1 && !isAllFinished && (
        <div className="bg-gradient-to-r from-[#ffb347]/15 to-[#ff4b16]/15 border border-[#ffb347]/30 rounded-2xl p-4 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#ffb347]/20 border border-[#ffb347]/40 flex items-center justify-center text-[#ffb347] shrink-0 mt-0.5">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="text-xs leading-relaxed">
              <h4 className="font-bold text-white mb-1">
                Ты не отмечался {daysMissed} {daysMissed === 1 ? 'день' : daysMissed < 5 ? 'дня' : 'дней'}
              </h4>
              <p className="text-zinc-300">
                Может, забыл. Может, сорвался. Может, просто закрутился на парах. Здесь нет дедлайнов и нет «должен». Трекер — не экзамен. Твой прогресс никуда не делся: загляни, отметься и продолжаем!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Flame Hero */}
      <div className="relative bg-[#111417] border border-[#1f262b] rounded-3xl p-5 shadow-2xl overflow-hidden text-center">
        {/* Ambient background glows */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#ff4b16]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 right-0 w-36 h-36 bg-[#16f0c2]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Action Header inside Card */}
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="px-2.5 py-1 rounded-lg bg-[#171b1f] border border-[#232b31] text-zinc-400 flex items-center gap-1.5 select-none">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#16f0c2]" />
            <span className="text-[11px]">Анкета заполнена</span>
          </div>

          <button
            onClick={() => {
              sounds.click();
              setShowSOSModal(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-[#ff4b16]/15 border border-[#ff4b16]/40 text-[#ff4b16] font-bold hover:bg-[#ff4b16]/25 transition-all flex items-center gap-1.5 shadow-sm shadow-[#ff4b16]/20 cursor-pointer"
          >
            <LifeBuoy className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
            <span>SOS: Тяга</span>
          </button>
        </div>

        {/* The Animated Flame Icon & Streak Counter */}
        <div className="my-2 relative flex flex-col items-center justify-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Flame */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full drop-shadow-[0_0_25px_rgba(255,75,22,0.45)] animate-pulse-slow"
            >
              <defs>
                <linearGradient id="flameGrad" x1="0%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#ff1e00" />
                  <stop offset="50%" stopColor="#ff4b16" />
                  <stop offset="100%" stopColor="#ffb347" />
                </linearGradient>
                <linearGradient id="innerFlameGrad" x1="0%" y1="100%" x2="50%" y2="0%">
                  <stop offset="0%" stopColor="#ffb347" />
                  <stop offset="100%" stopColor="#16f0c2" />
                </linearGradient>
              </defs>
              {/* Outer petal */}
              <path
                d="M50 5 C55 35 85 45 85 70 C85 88 68 95 50 95 C32 95 15 88 15 70 C15 45 45 35 50 5 Z"
                fill="url(#flameGrad)"
              />
              {/* Inner spark */}
              <path
                d="M50 35 C53 50 70 58 70 73 C70 84 60 88 50 88 C40 88 30 84 30 73 C30 58 47 50 50 35 Z"
                fill="url(#innerFlameGrad)"
                opacity="0.9"
              />
            </svg>

            {/* Streak Number Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-5">
              <span className="text-2xl font-black text-white font-mono-code leading-none drop-shadow-md">
                {cleanDays}
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-black/80 font-mono-code">
                {relapseDays > 0 ? `чистых / ${totalCompleted}` : 'из 25'}
              </span>
            </div>
          </div>

          <div className="mt-2">
            <h3 className="text-base font-black text-white font-display">
              {isAllFinished
                ? relapseDays > 0
                  ? `🎉 25 ДНЕЙ: ${cleanDays} ЧИСТЫХ, ${relapseDays} ${relapseDays === 1 ? 'СРЫВ' : relapseDays < 5 ? 'СРЫВА' : 'СРЫВОВ'}`
                  : '🎉 25 ИЗ 25 ЧИСТЫХ ДНЕЙ!'
                : isTodayMarked
                ? `ДЕНЬ ${totalCompleted}: ${DAY_TEXTS[totalCompleted]?.stage || 'Перезагрузка'}`
                : `ДЕНЬ ${currentActiveDay}: ${DAY_TEXTS[currentActiveDay]?.stage || 'Перезагрузка'}`}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isAllFinished
                ? `Все 25 дней закрыты (${cleanDays} дней чистоты, ${relapseDays} ${relapseDays === 1 ? 'срыв' : relapseDays < 5 ? 'срыва' : 'срывов'})`
                : isTodayMarked
                ? 'Сегодняшний день зафиксирован. Следующий день откроется завтра!'
                : relapseDays > 0
                ? `${cleanDays} чистых дней из ${totalCompleted} пройденных • Срывов: ${relapseDays}`
                : 'Срыв не сжигает серию • Каждый день делает тебя сильнее'}
            </p>
          </div>
        </div>

        {/* If finished all 25 days: show celebration action button */}
        {isAllFinished && (
          <div className="mt-4 pt-3 border-t border-[#1f262b]">
            <button
              onClick={() => {
                sounds.success();
                onOpenFeedback(records);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#16f0c2] to-emerald-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#16f0c2]/20 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>
                {relapseDays > 0
                  ? `Посмотреть итоги (${cleanDays} чистых, ${relapseDays} ${relapseDays === 1 ? 'срыв' : 'срыва'}) и отзыв →`
                  : 'Посмотреть итоги (25/25) и оставить отзыв →'}
              </span>
            </button>
          </div>
        )}

        {/* If Today is Already Marked (Daily Restriction in Release) */}
        {!isAllFinished && isTodayMarked && (
          <div className="mt-4 pt-3 border-t border-[#1f262b] space-y-2.5">
            <div
              className={`p-3 rounded-2xl border text-left flex items-center gap-3 ${
                todayRecord?.status === 'Успех'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-[#ff4b16]/10 border-[#ff4b16]/30'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  todayRecord?.status === 'Успех'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-[#ff4b16]/20 text-[#ff4b16]'
                }`}
              >
                {todayRecord?.status === 'Успех' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-white flex items-center justify-between">
                  <span>
                    {todayRecord?.status === 'Успех'
                      ? `День ${todayRecord?.date_number || totalCompleted} зачтен чисто 🔥`
                      : `День ${todayRecord?.date_number || totalCompleted}: срыв зафиксирован`}
                  </span>
                  <span className="text-[10px] font-mono-code text-[#16f0c2] bg-[#16f0c2]/10 px-2 py-0.5 rounded-full border border-[#16f0c2]/30">
                    ЗАВЕРШЁН
                  </span>
                </div>
                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {todayRecord?.status === 'Успех'
                    ? 'Отличная стойкость! Результат сохранен в базе данных.'
                    : 'Серия сохранена! Завтра продолжим без чувства вины.'}
                </div>
              </div>
            </div>

            {/* Countdown card to next day */}
            <div className="bg-[#171b1f] border border-[#232b31] rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-zinc-300 text-xs">
                <Clock className="w-4 h-4 text-[#16f0c2]" />
                <span>День {totalCompleted + 1} откроется через:</span>
              </div>
              <span className="font-mono-code font-black text-xs text-[#16f0c2] bg-[#0d1012] px-2.5 py-1 rounded-lg border border-[#16f0c2]/30 tracking-wider">
                {timeUntilMidnight || '00:00:00'}
              </span>
            </div>
          </div>
        )}

        {/* Check-In Buttons for Today (Only shown if NOT yet marked) */}
        {!isAllFinished && !isTodayMarked && (
          <div className="mt-4 pt-3 border-t border-[#1f262b] grid grid-cols-2 gap-2.5">
            <button
              onClick={handleMarkSuccess}
              disabled={marking}
              className="py-3 px-3 rounded-2xl bg-gradient-to-r from-[#16f0c2] to-[#0fd2a9] text-black font-extrabold text-xs shadow-lg shadow-[#16f0c2]/20 hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>День прожит чисто</span>
            </button>

            <button
              onClick={() => {
                sounds.click();
                setShowRelapseModal(true);
              }}
              disabled={marking}
              className="py-3 px-3 rounded-2xl bg-[#1c2227] hover:bg-[#232b31] border border-[#ff4b16]/30 text-zinc-300 font-bold text-xs hover:text-white active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-[#ff4b16]" />
              <span>Я сорвался</span>
            </button>
          </div>
        )}
      </div>

      {/* 25-Day Calendar (Grid or Timeline view) */}
      <div className="bg-[#111417] border border-[#1f262b] rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between text-xs mb-3 px-1">
          <span className="font-extrabold text-white flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-[#ff4b16]" />
            Календарь серии (25 дней)
          </span>
          <div className="flex items-center gap-1 bg-[#171b1f] p-0.5 rounded-lg border border-[#232b31]">
            <button
              onClick={() => {
                sounds.click();
                setViewMode('grid');
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#16f0c2] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Сетка 5×5
            </button>
            <button
              onClick={() => {
                sounds.click();
                setViewMode('timeline');
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                viewMode === 'timeline'
                  ? 'bg-[#16f0c2] text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Лента
            </button>
          </div>
        </div>

        {/* 5x5 Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-5 gap-2 py-1 animate-fade-in">
            {Array.from({ length: 25 }, (_, i) => i + 1).map((dayNum) => {
              const record = records.find((r) => r.date_number === dayNum);
              const isCompleted = Boolean(record);
              const isSuccess = record?.status === 'Успех';
              const isRelapse = record?.status === 'Срыв';
              const isCurrentToMark = !isTodayMarked && !isAllFinished && dayNum === totalCompleted + 1;
              const isTomorrowWaiting = isTodayMarked && !isAllFinished && dayNum === totalCompleted + 1;
              const isSelected = dayNum === selectedDayNumber;

              return (
                <button
                  key={dayNum}
                  onClick={() => {
                    sounds.click();
                    setSelectedDayNumber(dayNum);
                  }}
                  className={`aspect-square rounded-xl p-1 flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'ring-2 ring-[#16f0c2] scale-105 shadow-md shadow-[#16f0c2]/30 z-10'
                      : 'hover:scale-[1.02]'
                  } ${
                    isSuccess
                      ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400'
                      : isRelapse
                      ? 'bg-[#ff4b16]/15 border border-[#ff4b16]/40 text-[#ff4b16]'
                      : isCurrentToMark
                      ? 'bg-[#ff4b16]/20 border-2 border-[#ff4b16] text-white shadow-lg shadow-[#ff4b16]/25 animate-pulse'
                      : isTomorrowWaiting
                      ? 'bg-[#16f0c2]/10 border border-[#16f0c2]/30 text-[#16f0c2]'
                      : 'bg-[#171b1f] border border-[#232b31] text-zinc-500'
                  }`}
                >
                  <span className="text-[9px] font-mono-code leading-none">Д{dayNum}</span>
                  <div className="mt-1">
                    {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    {isRelapse && <Shield className="w-3.5 h-3.5 text-[#ff4b16]" />}
                    {isCurrentToMark && <Flame className="w-3.5 h-3.5 text-[#ff4b16]" />}
                    {isTomorrowWaiting && <Clock className="w-3 h-3 text-[#16f0c2]" />}
                    {!isCompleted && !isCurrentToMark && !isTomorrowWaiting && <Lock className="w-2.5 h-2.5 text-zinc-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Scrollable node track (Timeline View) */}
        {viewMode === 'timeline' && (
          <div
            ref={timelineRef}
            className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2 px-1 scroll-smooth animate-fade-in"
          >
            {Array.from({ length: 25 }, (_, i) => i + 1).map((dayNum) => {
              const record = records.find((r) => r.date_number === dayNum);
              const isCompleted = Boolean(record);
              const isSuccess = record?.status === 'Успех';
              const isRelapse = record?.status === 'Срыв';
              const isCurrentToMark = !isTodayMarked && !isAllFinished && dayNum === totalCompleted + 1;
              const isTomorrowWaiting = isTodayMarked && !isAllFinished && dayNum === totalCompleted + 1;
              const isSelected = dayNum === selectedDayNumber;

              return (
                <button
                  key={dayNum}
                  data-day={dayNum}
                  onClick={() => {
                    sounds.click();
                    setSelectedDayNumber(dayNum);
                  }}
                  className={`relative shrink-0 w-11 h-13 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'ring-2 ring-[#16f0c2] scale-105 shadow-md shadow-[#16f0c2]/20'
                      : 'opacity-90 hover:opacity-100'
                  } ${
                    isSuccess
                      ? 'bg-[#16f0c2]/15 border border-[#16f0c2]/40 text-[#16f0c2]'
                      : isRelapse
                      ? 'bg-[#ff4b16]/15 border border-[#ff4b16]/40 text-[#ff4b16]'
                      : isCurrentToMark
                      ? 'bg-[#ff4b16]/20 border-2 border-[#ff4b16] text-white animate-pulse'
                      : isTomorrowWaiting
                      ? 'bg-[#16f0c2]/10 border border-[#16f0c2]/30 text-[#16f0c2]'
                      : 'bg-[#171b1f] border border-[#232b31] text-zinc-500'
                  }`}
                >
                  <span className="text-[9px] font-mono-code opacity-75">ДЕНЬ</span>
                  <span className="text-xs font-black font-mono-code leading-tight">
                    {dayNum}
                  </span>

                  <div className="mt-0.5">
                    {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-[#16f0c2]" />}
                    {isRelapse && <Shield className="w-3.5 h-3.5 text-[#ff4b16]" />}
                    {isCurrentToMark && <Flame className="w-3.5 h-3.5 text-[#ff4b16]" />}
                    {isTomorrowWaiting && <Clock className="w-3 h-3 text-[#16f0c2]" />}
                    {!isCompleted && !isCurrentToMark && !isTomorrowWaiting && <Lock className="w-3 h-3 text-zinc-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Day Psychological Card */}
      <div className="bg-[#111417] border border-[#1f262b] rounded-3xl p-5 shadow-xl animate-fade-in">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#16f0c2]/10 border border-[#16f0c2]/30 text-[#16f0c2] text-xs font-mono-code font-bold">
              ДЕНЬ {selectedDayNumber} ИЗ 25
            </span>
            <span className="text-xs text-zinc-400 font-medium">
              {displayedContent.stage}
            </span>
          </div>

          {inspectedRecord ? (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                inspectedRecord.status === 'Успех'
                  ? 'bg-[#16f0c2]/20 text-[#16f0c2]'
                  : 'bg-[#ff4b16]/20 text-[#ff4b16]'
              }`}
            >
              Отметка: {inspectedRecord.status}
            </span>
          ) : selectedDayNumber === totalCompleted + 1 && !isTodayMarked ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#ff4b16]/20 text-[#ff4b16] animate-pulse">
              Сегодня (ждёт отметки)
            </span>
          ) : selectedDayNumber === totalCompleted + 1 && isTodayMarked ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#16f0c2]/15 text-[#16f0c2] border border-[#16f0c2]/30 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              Откроется завтра в 00:00
            </span>
          ) : (
            <span className="text-[10px] text-zinc-500 font-mono-code flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" />
              Откроется через {Math.max(1, selectedDayNumber - totalCompleted - (isTodayMarked ? 0 : 1))} дн.
            </span>
          )}
        </div>

        <h4 className="text-sm font-bold text-white mb-2 leading-snug">
          {displayedContent.summary}
        </h4>

        <div className="space-y-2.5 mt-3 text-xs">
          <div className="bg-[#171b1f] p-3 rounded-2xl border border-[#222930]">
            <div className="flex items-center gap-1.5 text-[#16f0c2] font-semibold text-[11px] mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Что происходит в организме:</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              {displayedContent.bodyChange}
            </p>
          </div>

          <div className="bg-[#171b1f] p-3 rounded-2xl border border-[#222930]">
            <div className="flex items-center gap-1.5 text-[#ffb347] font-semibold text-[11px] mb-1">
              <Heart className="w-3.5 h-3.5" />
              <span>Совет на этот день:</span>
            </div>
            <p className="text-zinc-300 leading-relaxed">
              {displayedContent.tip}
            </p>
          </div>
        </div>
      </div>

      {/* Student Personal Stats Bar */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#111417] border border-[#1f262b] rounded-2xl p-3 text-center">
          <div className="flex items-center justify-center text-[#16f0c2] mb-1">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-white font-mono-code">{cleanDays}</div>
          <div className="text-[10px] text-zinc-400">Чистых дней</div>
        </div>

        <div className="bg-[#111417] border border-[#1f262b] rounded-2xl p-3 text-center">
          <div className="flex items-center justify-center text-[#ffb347] mb-1">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-white font-mono-code">{moneySaved} ₽</div>
          <div className="text-[10px] text-zinc-400">Сберегли в кошельке</div>
        </div>

        <div className="bg-[#111417] border border-[#1f262b] rounded-2xl p-3 text-center">
          <div className="flex items-center justify-center text-[#ff4b16] mb-1">
            <Activity className="w-4 h-4" />
          </div>
          <div className="text-base font-black text-white font-mono-code">{healthPercent}%</div>
          <div className="text-[10px] text-zinc-400">Очищение легких</div>
        </div>
      </div>

      {/* Modals */}
      {showRelapseModal && (
        <RelapseModal
          currentDay={currentActiveDay}
          onConfirmRelapse={handleConfirmRelapse}
          onCancel={() => setShowRelapseModal(false)}
        />
      )}

      {showSOSModal && (
        <EmergencyHelpModal onClose={() => setShowSOSModal(false)} />
      )}
    </div>
  );
};

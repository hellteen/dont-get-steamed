import React, { useState, useEffect } from 'react';
import { sounds } from '../utils/audio';
import { X, Wind, Eye, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

interface EmergencyHelpModalProps {
  onClose: () => void;
}

export const EmergencyHelpModal: React.FC<EmergencyHelpModalProps> = ({ onClose }) => {
  const [tab, setTab] = useState<'breathe' | 'ground' | 'timer'>('breathe');

  // Breathing state
  const [breathPhase, setBreathPhase] = useState<'Вдох' | 'Задержка' | 'Выдох'>('Вдох');
  const [breathSeconds, setBreathSeconds] = useState(4);

  // 3-Minute Craving Timer
  const [timerSeconds, setTimerSeconds] = useState(180);
  const [timerRunning, setTimerRunning] = useState(true);

  // Breathing cycle 4-7-8
  useEffect(() => {
    if (tab !== 'breathe') return;

    let duration = 4;
    if (breathPhase === 'Вдох') duration = 4;
    else if (breathPhase === 'Задержка') duration = 7;
    else duration = 8;

    const interval = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev <= 1) {
          if (breathPhase === 'Вдох') {
            setBreathPhase('Задержка');
            return 7;
          } else if (breathPhase === 'Задержка') {
            setBreathPhase('Выдох');
            return 8;
          } else {
            setBreathPhase('Вдох');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tab, breathPhase]);

  // Craving Timer Countdown
  useEffect(() => {
    if (tab !== 'timer' || !timerRunning || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [tab, timerRunning, timerSeconds]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-[#12161a] border border-[#232b31] rounded-3xl p-5 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#181d22] border border-[#2a333a] flex items-center justify-center text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <h3 className="text-base font-black text-white font-display mb-1">
          Психологическая помощь (SOS)
        </h3>
        <p className="text-[11px] text-zinc-400 mb-3">
          Волна острой тяги длится всего 2–3 минуты. Переключи тело!
        </p>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#171b1f] border border-[#232b31] rounded-xl mb-4">
          <button
            onClick={() => {
              sounds.click();
              setTab('breathe');
            }}
            className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
              tab === 'breathe' ? 'bg-[#16f0c2] text-black shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Дыхание 4-7-8
          </button>
          <button
            onClick={() => {
              sounds.click();
              setTab('timer');
            }}
            className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
              tab === 'timer' ? 'bg-[#16f0c2] text-black shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Таймер тяги
          </button>
          <button
            onClick={() => {
              sounds.click();
              setTab('ground');
            }}
            className={`py-1.5 text-[11px] font-bold rounded-lg transition-all ${
              tab === 'ground' ? 'bg-[#16f0c2] text-black shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Заземление
          </button>
        </div>

        {/* TAB 1: Breathing 4-7-8 */}
        {tab === 'breathe' && (
          <div className="py-2">
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center mb-4">
              {/* Outer pulsing ring */}
              <div
                className={`absolute inset-0 rounded-full border-2 border-[#16f0c2]/30 transition-transform duration-1000 ${
                  breathPhase === 'Вдох'
                    ? 'scale-110 bg-[#16f0c2]/10'
                    : breathPhase === 'Задержка'
                    ? 'scale-105 bg-[#16f0c2]/20'
                    : 'scale-90 bg-transparent'
                }`}
              />

              <div className="z-10 flex flex-col items-center">
                <span className="text-sm font-extrabold text-white uppercase tracking-wider mb-0.5">
                  {breathPhase}
                </span>
                <span className="text-3xl font-black text-[#16f0c2] font-mono-code leading-none">
                  {breathSeconds}
                </span>
                <span className="text-[10px] text-zinc-400 mt-1">секунд</span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-300 leading-relaxed bg-[#171b1f] p-3 rounded-xl border border-[#22282e]">
              <strong>Метод 4-7-8:</strong> Мгновенно активирует парасимпатическую нервную систему, замедляет пульс и снимает спазм никотиновой тревоги.
            </div>
          </div>
        )}

        {/* TAB 2: 3-Min Craving Wave Timer */}
        {tab === 'timer' && (
          <div className="py-2">
            <div className="p-5 bg-[#171b1f] rounded-2xl border border-[#22282e] mb-3">
              <span className="text-[11px] font-mono-code text-zinc-400 uppercase tracking-widest block mb-1">
                Пиковая волна спадет через:
              </span>
              <div className="text-4xl font-black text-[#ffb347] font-mono-code mb-2">
                {formatTimer(timerSeconds)}
              </div>
              <div className="w-full bg-[#111417] h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-[#ffb347] to-[#16f0c2] transition-all duration-1000"
                  style={{ width: `${((180 - timerSeconds) / 180) * 100}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-300">
                Биохимический приступ тяги длится не более 3 минут. Выпей стакан холодной воды прямо сейчас.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="flex-1 py-2 rounded-xl bg-[#222930] hover:bg-[#2b343e] text-xs font-bold text-white transition-all"
              >
                {timerRunning ? 'Пауза' : 'Продолжить'}
              </button>
              <button
                onClick={() => {
                  setTimerSeconds(180);
                  setTimerRunning(true);
                }}
                className="px-3 py-2 rounded-xl bg-[#222930] hover:bg-[#2b343e] text-xs font-bold text-zinc-300"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: 5-4-3-2-1 Grounding */}
        {tab === 'ground' && (
          <div className="py-1 text-left space-y-2 text-xs">
            <div className="p-2.5 bg-[#171b1f] rounded-xl border border-[#22282e] flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-[#16f0c2]/20 text-[#16f0c2] font-black flex items-center justify-center shrink-0">
                5
              </span>
              <span className="text-zinc-300 text-[11px]">Найди взглядом <strong>5 предметов</strong> синего цвета вокруг.</span>
            </div>

            <div className="p-2.5 bg-[#171b1f] rounded-xl border border-[#22282e] flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-[#16f0c2]/20 text-[#16f0c2] font-black flex items-center justify-center shrink-0">
                4
              </span>
              <span className="text-zinc-300 text-[11px]">Потрогай <strong>4 разные текстуры</strong> (стол, ткань одежды, телефон, волосы).</span>
            </div>

            <div className="p-2.5 bg-[#171b1f] rounded-xl border border-[#22282e] flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-[#16f0c2]/20 text-[#16f0c2] font-black flex items-center justify-center shrink-0">
                3
              </span>
              <span className="text-zinc-300 text-[11px]">Услышь <strong>3 звука</strong> вокруг (гул ламп, шаги, дыхание).</span>
            </div>

            <div className="p-2.5 bg-[#171b1f] rounded-xl border border-[#22282e] flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-[#16f0c2]/20 text-[#16f0c2] font-black flex items-center justify-center shrink-0">
                2
              </span>
              <span className="text-zinc-300 text-[11px]">Улови <strong>2 запаха</strong> (кофе, свежий воздух, антисептик).</span>
            </div>

            <div className="p-2.5 bg-[#171b1f] rounded-xl border border-[#22282e] flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-[#16f0c2]/20 text-[#16f0c2] font-black flex items-center justify-center shrink-0">
                1
              </span>
              <span className="text-zinc-300 text-[11px]">Сделай <strong>1 медленный глоток воды</strong>.</span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 px-4 rounded-xl bg-[#16f0c2] text-black font-extrabold text-xs active:scale-[0.99] transition-all cursor-pointer"
        >
          Тяга отступила, вернуться в трекер
        </button>
      </div>
    </div>
  );
};

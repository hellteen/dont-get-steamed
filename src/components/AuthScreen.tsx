import React, { useState } from 'react';
import { SIBSIU_GROUPS } from '../data/groups';
import { User } from '../types';
import { sounds } from '../utils/audio';
import { Flame, ShieldCheck, ArrowRight, User as UserIcon, BookOpen, AlertCircle } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (
    user: User,
    hasCompletedSurvey: boolean,
    hasCompletedTracker: boolean,
    currentDay: number
  ) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [idGroup, setIdGroup] = useState<number>(1);
  const [customGroupName, setCustomGroupName] = useState('');
  const [course, setCourse] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('Пожалуйста, укажи имя и фамилию');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    sounds.click();

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: firstName.trim(),
          lastname: lastName.trim(),
          idgroup: idGroup,
          group_name: idGroup === 99 ? customGroupName : undefined,
          course: course,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ошибка входа');
      }

      sounds.success();
      localStorage.setItem('surveyUserId', String(data.user.id));
      localStorage.setItem('userData', JSON.stringify(data.user));

      onLoginSuccess(
        data.user,
        data.hasCompletedSurvey,
        data.hasCompletedTracker,
        data.currentDay
      );
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Сетевая ошибка при авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6">
      {/* Top Banner */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-[#ff4b16]/20 via-[#ff4b16]/10 to-transparent border border-[#ff4b16]/30 mb-3 shadow-lg shadow-[#ff4b16]/10">
          <Flame className="w-8 h-8 text-[#ff4b16] animate-pulse-slow" />
        </div>
        <div className="text-[11px] font-bold text-[#ff4b16] tracking-wider uppercase mb-1">
          Проект «Не запарься»
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight font-display">
          Откажись от курения
        </h2>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
          25-дневная программа СибГИУ для отказа от вейпа. Введи свои данные для входа или продолжения серии.
        </p>
      </div>

      {/* Card Form */}
      <div className="bg-[#111417] border border-[#1f262b] rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4b16]/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#16f0c2]/5 rounded-full blur-2xl pointer-events-none" />

        <form onSubmit={handleAuth} className="space-y-4 relative">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Имя
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Иван"
                className="w-full bg-[#171b1f] border border-[#232b31] focus:border-[#16f0c2] focus:ring-1 focus:ring-[#16f0c2] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Фамилия
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Иванов"
                className="w-full bg-[#171b1f] border border-[#232b31] focus:border-[#16f0c2] focus:ring-1 focus:ring-[#16f0c2] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5 flex items-center justify-between">
              <span>Академическая группа СибГИУ</span>
              <span className="text-[10px] text-[#16f0c2] font-mono-code">СибГИУ</span>
            </label>
            <select
              value={idGroup}
              onChange={(e) => setIdGroup(parseInt(e.target.value, 10))}
              className="w-full bg-[#171b1f] border border-[#232b31] focus:border-[#16f0c2] focus:ring-1 focus:ring-[#16f0c2] rounded-xl px-3.5 py-2.5 text-sm text-white outline-none transition-all cursor-pointer"
            >
              {SIBSIU_GROUPS.map((grp) => (
                <option key={grp.id} value={grp.id} className="bg-[#171b1f] text-white">
                  {grp.name}
                </option>
              ))}
              <option value={99} className="bg-[#171b1f] text-white">
                ➕ Другая группа (ввести вручную)
              </option>
            </select>
          </div>

          {idGroup === 99 && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                Укажи название своей группы
              </label>
              <input
                type="text"
                value={customGroupName}
                onChange={(e) => setCustomGroupName(e.target.value)}
                placeholder="например, ЭП-23"
                className="w-full bg-[#171b1f] border border-[#232b31] focus:border-[#16f0c2] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-zinc-600 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
              Курс обучения
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => {
                    sounds.click();
                    setCourse(c);
                  }}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                    course === c
                      ? 'bg-[#16f0c2] text-black border-[#16f0c2] shadow-sm shadow-[#16f0c2]/30'
                      : 'bg-[#171b1f] text-zinc-400 border-[#232b31] hover:text-white'
                  }`}
                >
                  {c} курс
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff4b16] to-[#ff6a00] hover:from-[#ff3a00] hover:to-[#ff5500] text-white font-bold text-sm shadow-lg shadow-[#ff4b16]/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block animate-spin mr-2">⏳</span>
            ) : (
              <>
                <span>Начать программу</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-[#1f262b] text-center">
          <p className="text-[10px] text-zinc-500">
            Вход без паролей по ФИО и группе. Твой прогресс сохраняется в единой базе данных проекта СибГИУ.
          </p>
        </div>
      </div>
    </div>
  );
};

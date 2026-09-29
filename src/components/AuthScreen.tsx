import React, { useState } from 'react';
import { SIBSIU_GROUPS } from '../data/groups';
import { sounds } from '../utils/audio';
import { Flame, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (userData: any, hasSurvey: boolean, hasCompletedTracker: boolean, currentDay: number) => void;
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
        <h2 className="text-2xl font-black text-white tracking-tight font-display mb-1.5">
          Откажись от курения
        </h2>
      </div>

      {/* Main Card */}
      <div className="bg-[#111417] border border-[#1f262b] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#16f0c2]/5 rounded-full blur-2xl pointer-events-none" />
        
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
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
                  {grp.name} ({grp.department})
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
                      ? 'bg-[#16f0c2] text-black border-[#16f0c2] shadow-md shadow-[#16f0c2]/20'
                      : 'bg-[#171b1f] text-zinc-400 border-[#232b31] hover:border-zinc-500'
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
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-[#16f0c2] to-[#0fd2a9] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#16f0c2]/25 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Войти в трекер</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

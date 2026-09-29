import React from 'react';
import { User } from '../types';
import { ShieldCheck, LogOut, Volume2, VolumeX, BarChart2, UserCheck, Flame } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  user: User | null;
  currentScreen: 'auth' | 'survey' | 'tracker' | 'feedback' | 'admin';
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNavigate: (screen: 'auth' | 'survey' | 'tracker' | 'feedback' | 'admin') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  currentScreen,
  soundEnabled,
  onToggleSound,
  onNavigate,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#080909]/90 backdrop-blur-md border-b border-[#1c2226] px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Logo / Brand */}
        <div 
          onClick={() => user && onNavigate(user.id_level === 2 ? 'admin' : 'tracker')}
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ff4b16] to-[#ff8c00] flex items-center justify-center shadow-lg shadow-[#ff4b16]/30">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold tracking-widest text-[#16f0c2] uppercase">СибГИУ</span>
              <span className="w-1 h-1 rounded-full bg-[#16f0c2]" />
              <span className="text-[10px] font-mono-code text-zinc-400">25 ДНЕЙ</span>
            </div>
            <h1 className="text-sm font-extrabold tracking-tight text-white leading-none">
              Проект «Не запарься»
            </h1>
            <span className="text-[9px] text-[#ff6a00] font-bold tracking-tight leading-none block mt-0.5">
              Откажись от курения
            </span>
          </div>
        </div>

        {/* User Status & Controls */}
        <div className="flex items-center gap-2">
          {/* Sound toggle */}
          <button
            onClick={() => {
              sounds.click();
              onToggleSound();
            }}
            title={soundEnabled ? 'Звуковые эффекты включены' : 'Звуковые эффекты выключены'}
            className="w-8 h-8 rounded-lg bg-[#14181b] border border-[#232b30] flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#16f0c2]" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
          </button>

          {/* Admin toggle: STRICTLY only for id_level === 2 (Admin) */}
          {user && (
            <>
              {user.id_level === 2 && (
                <button
                  onClick={() => {
                    sounds.click();
                    onNavigate(currentScreen === 'admin' ? 'tracker' : 'admin');
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1 transition-all ${
                    currentScreen === 'admin'
                      ? 'bg-[#16f0c2] text-black border-[#16f0c2]'
                      : 'bg-[#14181b] text-[#16f0c2] border-[#16f0c2]/40 hover:bg-[#16f0c2]/10'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  <span>{currentScreen === 'admin' ? 'Трекер' : 'Админ'}</span>
                </button>
              )}

              {/* User Chip */}
              <div className="hidden xs:flex flex-col text-right">
                <span className="text-xs font-medium text-white truncate max-w-[85px]">
                  {user.id_level === 2 ? 'Админ' : user.first_name}
                </span>
                <span className="text-[10px] text-[#16f0c2] font-mono-code leading-none">
                  {user.id_level === 2 ? 'Панель' : user.group_name}
                </span>
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  sounds.click();
                  onLogout();
                }}
                title="Сменить студента / выйти"
                className="w-8 h-8 rounded-lg bg-[#14181b] border border-[#232b30] flex items-center justify-center text-zinc-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

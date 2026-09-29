import React, { useState } from 'react';
import { sounds } from '../utils/audio';
import { Shield, HeartHandshake, X } from 'lucide-react';

interface RelapseModalProps {
  currentDay: number;
  onConfirmRelapse: (reason: string) => void;
  onCancel: () => void;
}

const COMMON_TRIGGERS = [
  'Стресс / дедлайн в СибГИУ',
  'Компания одногруппников на перерыве',
  'Скука / руки по привычке тянулись к карману',
  'Алкоголь / вечеринка',
  'Усталость / недосып',
  'Эмоциональный всплеск',
];

export const RelapseModal: React.FC<RelapseModalProps> = ({
  currentDay,
  onConfirmRelapse,
  onCancel,
}) => {
  const [selectedTrigger, setSelectedTrigger] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');

  const handleConfirm = () => {
    sounds.click();
    const finalReason = selectedTrigger === 'Другое' ? customReason : selectedTrigger || 'Не указано';
    onConfirmRelapse(finalReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-[#12161a] border border-[#232b31] rounded-3xl p-5 shadow-2xl relative">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#181d22] border border-[#2a333a] flex items-center justify-center text-zinc-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-[#ff4b16]/10 border border-[#ff4b16]/30 flex items-center justify-center text-[#ff4b16] mb-3">
          <HeartHandshake className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-black text-white font-display mb-2">
          Срыв — это не откат назад
        </h3>

        <div className="text-xs text-zinc-300 leading-relaxed space-y-2 mb-4 bg-[#171c21] p-3.5 rounded-2xl border border-[#222930]">
          <p>
            <strong>Ты сорвался. Окей.</strong> Это не провал и не «всё зря».
          </p>
          <p>
            Срыв – это не поражение, а <em>ценная информация</em>: ты узнал, что именно тебя цепляет (стресс, компания, скука). Теперь ты знаешь триггер в лицо.
          </p>
          <p className="text-[#16f0c2] font-semibold">
            Ты уже прошёл {currentDay - 1} дней. Это твоё достижение. Твоя серия НЕ сгорает — продолжаем дальше!
          </p>
        </div>

        {/* Trigger Selector */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold text-zinc-400 mb-2">
            Что спровоцировало затяжку? (для личного анализа)
          </label>
          <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {COMMON_TRIGGERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  sounds.click();
                  setSelectedTrigger(t);
                }}
                className={`w-full p-2 rounded-xl text-left text-xs transition-all border ${
                  selectedTrigger === t
                    ? 'bg-[#ff4b16]/15 border-[#ff4b16] text-white font-semibold'
                    : 'bg-[#181e24] border-[#252e35] text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button
            onClick={handleConfirm}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#ff4b16] to-[#ff6a00] text-white font-bold text-xs shadow-lg shadow-[#ff4b16]/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Shield className="w-4 h-4" />
            <span>Зафиксировать опыт и продолжить серию</span>
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2 px-3 rounded-xl border border-transparent text-zinc-500 hover:text-zinc-300 text-xs font-medium cursor-pointer"
          >
            Вернуться назад (я ошибся кнопкой)
          </button>
        </div>
      </div>
    </div>
  );
};

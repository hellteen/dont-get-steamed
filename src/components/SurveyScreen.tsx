import React, { useState } from 'react';
import { SURVEY_QUESTIONS } from '../data/questions';
import { User } from '../types';
import { sounds } from '../utils/audio';
import { ArrowLeft, ArrowRight, CheckCircle2, Flame, Sparkles } from 'lucide-react';

interface SurveyScreenProps {
  user: User;
  onSurveyCompleted: () => void;
}

export const SurveyScreen: React.FC<SurveyScreenProps> = ({ user, onSurveyCompleted }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [otherInputs, setOtherInputs] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [finishedIntro, setFinishedIntro] = useState(false);
  const [errorNotice, setErrorNotice] = useState('');

  const currentQ = SURVEY_QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / SURVEY_QUESTIONS.length) * 100);

  // Parse current question selected answers
  const currentVal = answers[currentQ.id] || '';
  const selectedOptions = currentQ.type === 'checkbox'
    ? currentVal ? currentVal.split('; ').map((s) => s.trim()) : []
    : [currentVal];

  const handleSelectRadio = (opt: string) => {
    sounds.click();
    setErrorNotice('');
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: opt,
    }));
  };

  const handleToggleCheckbox = (opt: string) => {
    sounds.click();
    setErrorNotice('');
    const currentList = selectedOptions.filter((s) => s && !s.startsWith('Другое:'));
    let updated: string[];

    if (currentList.includes(opt)) {
      updated = currentList.filter((x) => x !== opt);
    } else {
      updated = [...currentList, opt];
    }

    // Preserve custom "Другое" if active
    const hasOther = selectedOptions.some((s) => s.startsWith('Другое:'));
    if (hasOther && otherInputs[currentQ.id]) {
      updated.push(`Другое: ${otherInputs[currentQ.id]}`);
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: updated.join('; '),
    }));
  };

  const handleOtherTextChange = (text: string) => {
    setOtherInputs((prev) => ({ ...prev, [currentQ.id]: text }));
    const clean = text.trim();

    if (currentQ.type === 'radio') {
      setAnswers((prev) => ({
        ...prev,
        [currentQ.id]: clean ? `Другое: ${clean}` : '',
      }));
    } else {
      const regular = selectedOptions.filter((s) => s && !s.startsWith('Другое:'));
      if (clean) {
        setAnswers((prev) => ({
          ...prev,
          [currentQ.id]: [...regular, `Другое: ${clean}`].join('; '),
        }));
      } else {
        setAnswers((prev) => ({
          ...prev,
          [currentQ.id]: regular.join('; '),
        }));
      }
    }
  };

  const handleNext = () => {
    const ans = answers[currentQ.id];
    if (!ans || !ans.trim()) {
      setErrorNotice('Пожалуйста, выбери хотя бы один ответ');
      return;
    }

    setErrorNotice('');
    sounds.click();

    if (currentIdx < SURVEY_QUESTIONS.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      submitSurvey();
    }
  };

  const handleBack = () => {
    if (currentIdx > 0) {
      sounds.click();
      setErrorNotice('');
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const submitSurvey = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.alreadyCompleted) {
          setErrorNotice('Вы уже заполнили вводную анкету! Перенаправляем в трекер...');
          setTimeout(() => {
            onSurveyCompleted();
          }, 1200);
          return;
        }
        throw new Error(data.error || 'Ошибка сохранения анкеты');
      }

      sounds.success();
      setFinishedIntro(true);
    } catch (err: unknown) {
      const error = err as Error;
      setErrorNotice(error.message || 'Не удалось сохранить анкету');
    } finally {
      setSubmitting(false);
    }
  };

  // Completion card with text from technical specifications
  if (finishedIntro) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8 text-center animate-fade-in">
        <div className="bg-[#111417] border border-[#1f262b] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#16f0c2]/10 border border-[#16f0c2]/30 flex items-center justify-center text-[#16f0c2] mb-4">
            <Sparkles className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-black text-white font-display mb-3">
            Спасибо за честные ответы!
          </h2>

          <p className="text-sm text-zinc-300 leading-relaxed mb-6">
            Ты только что помог сделать проект реальным для студентов СибГИУ.
            Хочешь узнать, сколько дней ты уже не паришь?
            Нажми кнопку ниже — мы запустим твой личный трекер.
          </p>

          <button
            onClick={() => {
              sounds.success();
              onSurveyCompleted();
            }}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#16f0c2] to-[#0fd2a9] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#16f0c2]/25 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
          >
            <Flame className="w-5 h-5 text-black" />
            <span>Запустить мой трекер</span>
          </button>
        </div>
      </div>
    );
  }

  const isOtherActive = currentQ.type === 'radio'
    ? (answers[currentQ.id] || '').startsWith('Другое:')
    : selectedOptions.some((s) => s.startsWith('Другое:'));

  return (
    <div className="w-full max-w-md mx-auto px-4 py-5">
      {/* Top Header & Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-mono-code text-zinc-400 mb-1.5">
          <span className="text-[#16f0c2] font-semibold">
            Вопрос {currentIdx + 1} из {SURVEY_QUESTIONS.length}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#171b1f] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#16f0c2] to-[#0fd2a9] transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-[#111417] border border-[#1f262b] rounded-2xl p-5 shadow-xl">
        <h3 className="text-base font-bold text-white mb-1.5 leading-snug">
          {currentQ.text}
        </h3>
        <p className="text-xs text-zinc-500 mb-4">
          {currentQ.type === 'checkbox' ? 'Можно выбрать несколько вариантов' : 'Выбери один подходящий вариант'}
        </p>

        {errorNotice && (
          <div className="mb-3 p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
            {errorNotice}
          </div>
        )}

        {/* Options List */}
        <div className="space-y-2 mb-4">
          {currentQ.options.map((opt) => {
            const isSelected = currentQ.type === 'checkbox'
              ? selectedOptions.includes(opt)
              : answers[currentQ.id] === opt;

            return (
              <button
                key={opt}
                type="button"
                onClick={() => (currentQ.type === 'checkbox' ? handleToggleCheckbox(opt) : handleSelectRadio(opt))}
                className={`w-full p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#16f0c2]/10 border-[#16f0c2] text-white shadow-sm shadow-[#16f0c2]/10'
                    : 'bg-[#171b1f] border-[#22282e] text-zinc-300 hover:border-zinc-500'
                }`}
              >
                <span>{opt}</span>
                <div
                  className={`w-4 h-4 rounded-${currentQ.type === 'radio' ? 'full' : 'md'} border flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#16f0c2] border-[#16f0c2]' : 'border-zinc-600'
                  }`}
                >
                  {isSelected && (
                    <div className={currentQ.type === 'radio' ? 'w-1.5 h-1.5 rounded-full bg-black' : 'w-2 h-2 text-black'}>
                      {currentQ.type === 'checkbox' && '✓'}
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Option: Other / Custom */}
          <div
            className={`p-3 rounded-xl border transition-all ${
              isOtherActive
                ? 'bg-[#16f0c2]/10 border-[#16f0c2]'
                : 'bg-[#171b1f] border-[#22282e] hover:border-zinc-500'
            }`}
          >
            <div
              onClick={() => {
                sounds.click();
                if (currentQ.type === 'radio') {
                  const val = otherInputs[currentQ.id] || '';
                  setAnswers((prev) => ({ ...prev, [currentQ.id]: val ? `Другое: ${val}` : 'Другое:' }));
                } else {
                  if (isOtherActive) {
                    const filtered = selectedOptions.filter((s) => !s.startsWith('Другое:'));
                    setAnswers((prev) => ({ ...prev, [currentQ.id]: filtered.join('; ') }));
                  } else {
                    const text = otherInputs[currentQ.id] || '';
                    setAnswers((prev) => ({ ...prev, [currentQ.id]: [...selectedOptions, `Другое: ${text}`].join('; ') }));
                  }
                }
              }}
              className="flex items-center justify-between cursor-pointer mb-1.5"
            >
              <span className="text-xs font-medium text-zinc-300">Другое (свой вариант)</span>
              <div
                className={`w-4 h-4 rounded-${currentQ.type === 'radio' ? 'full' : 'md'} border flex items-center justify-center ${
                  isOtherActive ? 'bg-[#16f0c2] border-[#16f0c2]' : 'border-zinc-600'
                }`}
              >
                {isOtherActive && (
                  <div className={currentQ.type === 'radio' ? 'w-1.5 h-1.5 rounded-full bg-black' : 'w-2 h-2 text-black'}>
                    {currentQ.type === 'checkbox' && '✓'}
                  </div>
                )}
              </div>
            </div>

            {isOtherActive && (
              <input
                type="text"
                autoFocus
                value={otherInputs[currentQ.id] || ''}
                onChange={(e) => handleOtherTextChange(e.target.value)}
                placeholder="Введи свой вариант ответа..."
                className="w-full bg-[#111417] border border-[#232b31] focus:border-[#16f0c2] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 outline-none"
              />
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            disabled={currentIdx === 0}
            onClick={handleBack}
            className="px-4 py-2.5 rounded-xl border border-[#232b31] text-xs font-semibold text-zinc-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Назад</span>
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleNext}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#16f0c2] text-black text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-[#16f0c2]/20 hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : currentIdx === SURVEY_QUESTIONS.length - 1 ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Завершить опрос</span>
              </>
            ) : (
              <>
                <span>Далее</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

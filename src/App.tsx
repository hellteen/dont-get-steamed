import React, { useState, useEffect } from 'react';
import { User, TrackerRecord } from './types';
import { Header } from './components/Header';
import { AuthScreen } from './components/AuthScreen';
import { SurveyScreen } from './components/SurveyScreen';
import { TrackerScreen } from './components/TrackerScreen';
import { FeedbackScreen } from './components/FeedbackScreen';
import { AdminScreen } from './components/AdminScreen';
import { EmergencyHelpModal } from './components/EmergencyHelpModal';
import { sounds } from './utils/audio';
import { Flame, FileText, LifeBuoy, BarChart2, Shield } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'survey' | 'tracker' | 'feedback' | 'admin'>('auth');
  const [records, setRecords] = useState<TrackerRecord[]>([]);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
  const [hasCompletedTracker, setHasCompletedTracker] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showQuickSOS, setShowQuickSOS] = useState(false);
  const [initializing, setInitializing] = useState(true);

  // Load session from localStorage on startup
  useEffect(() => {
    const initUser = async () => {
      try {
        const storedId = localStorage.getItem('surveyUserId');
        if (storedId) {
          const res = await fetch(`/api/auth/me/${storedId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              setUser(data.user);
              setHasCompletedSurvey(Boolean(data.hasCompletedSurvey));
              setHasCompletedTracker(Boolean(data.hasCompletedTracker));

              // Route based on user progress and role
              if (data.user.id_level === 2) {
                setCurrentScreen('admin');
              } else if (!data.hasCompletedSurvey) {
                setCurrentScreen('survey');
              } else if (data.hasCompletedTracker) {
                setCurrentScreen('feedback');
              } else {
                setCurrentScreen('tracker');
              }
            }
          }
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      } finally {
        setInitializing(false);
      }
    };

    initUser();
  }, []);

  const handleLoginSuccess = (
    userData: User,
    hasSurvey: boolean,
    completedTracker: boolean
  ) => {
    setUser(userData);
    setHasCompletedSurvey(hasSurvey);
    setHasCompletedTracker(completedTracker);

    if (userData.id_level === 2) {
      setCurrentScreen('admin');
    } else if (!hasSurvey) {
      setCurrentScreen('survey');
    } else if (completedTracker) {
      setCurrentScreen('feedback');
    } else {
      setCurrentScreen('tracker');
    }
  };

  const handleNavigate = (screen: 'auth' | 'survey' | 'tracker' | 'feedback' | 'admin') => {
    // Security check: only id_level 2 can access admin
    if (screen === 'admin' && user?.id_level !== 2) {
      return;
    }
    // Survey can only be taken once
    if (screen === 'survey' && hasCompletedSurvey) {
      return;
    }
    setCurrentScreen(screen);
  };

  const handleLogout = () => {
    localStorage.removeItem('surveyUserId');
    localStorage.removeItem('userData');
    setUser(null);
    setHasCompletedSurvey(false);
    setHasCompletedTracker(false);
    setCurrentScreen('auth');
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#080909] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff4b16] to-[#ff8c00] flex items-center justify-center shadow-lg shadow-[#ff4b16]/30 animate-pulse-slow mb-4">
          <Flame className="w-7 h-7 text-white" />
        </div>
        <p className="text-xs font-mono-code text-[#16f0c2] animate-pulse">
          Загрузка проекта «Не запарься»...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080909] text-[#f4f4f4] flex flex-col selection:bg-[#16f0c2] selection:text-black pb-20">
      {/* Top Header */}
      <Header
        user={user}
        currentScreen={currentScreen}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col justify-start">
        {currentScreen === 'auth' && (
          <AuthScreen onLoginSuccess={handleLoginSuccess} />
        )}

        {currentScreen === 'survey' && user && !hasCompletedSurvey && (
          <SurveyScreen
            user={user}
            onSurveyCompleted={() => {
              setHasCompletedSurvey(true);
              setCurrentScreen('tracker');
            }}
          />
        )}

        {currentScreen === 'tracker' && user && (
          <TrackerScreen
            user={user}
            onOpenFeedback={(recs) => {
              if (recs && recs.length > 0) setRecords(recs);
              setCurrentScreen('feedback');
            }}
          />
        )}

        {currentScreen === 'feedback' && user && (
          <FeedbackScreen
            user={user}
            records={records}
            onFinishReviewed={() => setCurrentScreen('tracker')}
            onResetTracker={() => {
              setCurrentScreen('tracker');
            }}
          />
        )}

        {currentScreen === 'admin' && user?.id_level === 2 && (
          <AdminScreen onBackToApp={() => setCurrentScreen('tracker')} />
        )}
      </main>

      {/* Bottom Floating Navigation Dock (when logged in) */}
      {user && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0f12]/95 backdrop-blur-lg border-t border-[#1c2226] py-2 px-4 shadow-2xl">
          <div className="max-w-md mx-auto flex items-center justify-around gap-2">
            <button
              onClick={() => {
                sounds.click();
                handleNavigate('tracker');
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                currentScreen === 'tracker'
                  ? 'text-[#16f0c2] font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Flame className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-none">Трекер</span>
            </button>

            {/* Survey tab: ONLY shown if student hasn't completed it yet */}
            {!hasCompletedSurvey && user.id_level !== 2 && (
              <button
                onClick={() => {
                  sounds.click();
                  handleNavigate('survey');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                  currentScreen === 'survey'
                    ? 'text-[#16f0c2] font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <FileText className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-none">Анкета</span>
              </button>
            )}

            {/* Quick SOS Emergency Help Button */}
            <button
              onClick={() => {
                sounds.click();
                setShowQuickSOS(true);
              }}
              className="flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl text-[#ff4b16] hover:text-[#ff6a00] transition-all"
            >
              <LifeBuoy className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-none font-bold">SOS Тяга</span>
            </button>

            {/* Admin tab: ONLY shown to id_level === 2 */}
            {user.id_level === 2 && (
              <button
                onClick={() => {
                  sounds.click();
                  handleNavigate('admin');
                }}
                className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
                  currentScreen === 'admin'
                    ? 'text-[#16f0c2] font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <BarChart2 className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] leading-none">Админ</span>
              </button>
            )}
          </div>
        </nav>
      )}

      {/* Quick SOS Emergency Help Modal */}
      {showQuickSOS && (
        <EmergencyHelpModal onClose={() => setShowQuickSOS(false)} />
      )}
    </div>
  );
}

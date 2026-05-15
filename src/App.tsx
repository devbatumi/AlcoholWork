import { useEffect, useState } from 'react';
import { Onboarding } from './Onboarding';
import { Dashboard } from './Dashboard';
import { Welcome } from './Welcome';
import { SOSModal } from './SOSModal';
import { clearPersist, usePersist } from './store';
import { ACTIONS } from './actions';
import { applyPetAction } from './petLogic';
import type { JournalEntry, Persist } from './types';

const WELCOME_DISMISS_KEY = 'alcoholwork.welcome.dismissed';

export default function App() {
  const { state, setState, update } = usePersist();
  const [overlay, setOverlay] = useState<null | 'sailed' | 'sunk'>(null);
  const [sosOpen, setSosOpen] = useState(false);
  const [welcomeOpen, setWelcomeOpen] = useState<boolean>(
    () => !localStorage.getItem(WELCOME_DISMISS_KEY),
  );

  useEffect(() => {
    if (state?.status === 'sailed') setOverlay('sailed');
    if (state?.status === 'sunk') setOverlay('sunk');
  }, [state?.status]);

  const handleOnboard = (p: Persist) => setState(p);

  const handleSailed = () => {
    if (!state || state.status !== 'building') return;
    update({ status: 'sailed' });
  };

  const handleRelapse = () => {
    if (!state) return;
    update({ status: 'sunk' });
    setTimeout(() => {
      setState({
        ...state,
        startedAt: Date.now(),
        lastDrinkAt: Date.now(),
        relapses: state.relapses + 1,
        status: 'building',
        bonusBricks: 0,
        cooldowns: {},
      });
      setOverlay(null);
    }, 4200);
  };

  const handleReset = () => {
    if (!confirm('Стереть всё и начать заново?')) return;
    clearPersist();
    localStorage.removeItem(WELCOME_DISMISS_KEY);
    setState(null);
    setWelcomeOpen(true);
    setOverlay(null);
  };

  const handleNewJourney = () => {
    if (!state) return;
    setState({
      ...state,
      startedAt: Date.now(),
      lastDrinkAt: Date.now(),
      status: 'building',
      bonusBricks: 0,
      cooldowns: {},
    });
    setOverlay(null);
  };

  const handleBonus = (amount: number, actionId: string) => {
    if (!state) return;
    const now = Date.now();
    const cd = { ...state.cooldowns };
    const def = ACTIONS.find((a) => a.id === actionId);
    if (def) cd[actionId] = now + def.cooldownMs;
    update({
      bonusBricks: state.bonusBricks + amount,
      cooldowns: cd,
    });
  };

  const handleJournalAdd = (entry: JournalEntry) => {
    if (!state) return;
    update({
      journal: [...state.journal, entry],
      bonusBricks: state.bonusBricks + 1,
    });
  };

  const handlePetAction = (actionId: string) => {
    if (!state) return;
    const next = applyPetAction(state.pet, actionId, Date.now());
    if (!next) return;
    update({ pet: next });
  };

  const handleSosOvercame = () => {
    if (!state) return;
    update({ bonusBricks: state.bonusBricks + 3 });
    setSosOpen(false);
  };

  const handleWelcomeClose = (dontShowAgain: boolean) => {
    if (dontShowAgain) localStorage.setItem(WELCOME_DISMISS_KEY, '1');
    else localStorage.removeItem(WELCOME_DISMISS_KEY);
    setWelcomeOpen(false);
  };

  const showingDashboard = !!state && state.onboarded;
  const showFab = showingDashboard && !sosOpen && !overlay && !welcomeOpen;

  return (
    <div className="app">
      <header className="topbar">
        <h1>⛵ Корабль трезвости</h1>
        <div className="topbar-right">
          {showingDashboard && (
            <button
              className="topbar-btn"
              onClick={() => setWelcomeOpen(true)}
              title="Показать гайд"
            >
              📖
            </button>
          )}
          <span className="tag">66 дней</span>
        </div>
      </header>

      {welcomeOpen ? (
        <Welcome
          mode={showingDashboard ? 'overlay' : 'fullscreen'}
          onClose={handleWelcomeClose}
          initialDontShow={!!localStorage.getItem(WELCOME_DISMISS_KEY)}
        />
      ) : null}

      {!state || !state.onboarded ? (
        !welcomeOpen && <Onboarding onDone={handleOnboard} />
      ) : (
        <Dashboard
          state={state}
          onRelapse={handleRelapse}
          onReset={handleReset}
          onSailed={handleSailed}
          onBonus={handleBonus}
          onJournalAdd={handleJournalAdd}
          onPetAction={handlePetAction}
          onShowGuide={() => setWelcomeOpen(true)}
        />
      )}

      {showFab && (
        <button
          className="fab-sos"
          onClick={() => setSosOpen(true)}
          title="Мне тяжело — открыть помощь"
        >
          <span className="fab-icon">❤️</span>
          <span className="fab-label">Мне тяжело</span>
        </button>
      )}

      {sosOpen && state && (
        <SOSModal
          state={state}
          onClose={() => setSosOpen(false)}
          onOvercame={handleSosOvercame}
        />
      )}

      {overlay === 'sailed' && state && (
        <div className="victory">
          <div className="card">
            <div className="big-emoji">🎉</div>
            <h2>Корабль уплыл</h2>
            <p>
              66 дней. Привычка автоматизирована как <b>отсутствие</b> бокала.
              Твой мозг больше не тянет руку к бутылке на автопилоте — это теперь чужое.
              Ты сэкономил{' '}
              {Math.floor(
                (Math.min(state.perDay * 66, 1320) / 5) * state.pricePerBottle,
              ).toLocaleString('ru-RU')}{' '}
              ₽ и вернул себе ~{Math.min(state.perDay * 66, 1320) * 30} минут жизни.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="ghost" onClick={() => setOverlay(null)}>Закрыть</button>
              <button className="primary" onClick={handleNewJourney}>Новый рейс</button>
            </div>
          </div>
        </div>
      )}

      {overlay === 'sunk' && state && (
        <div className="sunk">
          <div className="card">
            <div className="big-emoji">🌊</div>
            <h2>Корабль затонул</h2>
            <p>
              Срывов: <b>{state.relapses + 1}</b>. Все доски ушли на дно вместе с ним.
              Это тяжело, но нормально — большинство бросает с 5-7 попытки.
              Каждая следующая короче, потому что мозг уже знает, что без алкоголя жить можно.
            </p>
            <p className="tiny" style={{ marginBottom: 20 }}>
              Через несколько секунд начнётся новый отсчёт. Глубоко вдохни.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import type { JournalEntry, Persist } from './types';

type Props = {
  state: Persist;
  onAdd: (e: JournalEntry) => void;
};

const TRIGGERS = [
  'стресс',
  'скука',
  'пятница',
  'после работы',
  'компания',
  'один дома',
  'праздник',
  'злость',
  'усталость',
  'другое',
];

export function JournalPanel({ state, onAdd }: Props) {
  const [craving, setCraving] = useState(5);
  const [trigger, setTrigger] = useState<string | undefined>(undefined);
  const [note, setNote] = useState('');
  const [overcame, setOvercame] = useState(true);
  const [just, setJust] = useState<number | null>(null);

  const submit = () => {
    onAdd({
      ts: Date.now(),
      craving,
      trigger,
      note: note.trim() || undefined,
      overcame,
    });
    setJust(Date.now());
    setNote('');
    setTrigger(undefined);
    setTimeout(() => setJust(null), 2000);
  };

  const recent = state.journal.slice(-5).reverse();

  return (
    <div>
      <div className="journal-form">
        <label>Сила тяги: <b>{craving}/10</b></label>
        <input
          type="range" min={0} max={10} value={craving}
          onChange={(e) => setCraving(parseInt(e.target.value, 10))}
        />
        <div className="chips" style={{ marginTop: 10 }}>
          {TRIGGERS.map((t) => (
            <button
              key={t}
              type="button"
              className={`chip${trigger === t ? ' on' : ''}`}
              onClick={() => setTrigger((cur) => (cur === t ? undefined : t))}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Что сейчас чувствуешь? Что произошло?"
          rows={2}
          style={{ marginTop: 10 }}
        />
        <div className="row-between" style={{ marginTop: 10 }}>
          <label className="inline">
            <input
              type="checkbox"
              checked={overcame}
              onChange={(e) => setOvercame(e.target.checked)}
            />
            <span>Пережил без выпивки</span>
          </label>
          <button className="primary" onClick={submit}>
            Записать (+1 🪵)
          </button>
        </div>
        {just && <div className="toast">Запись сохранена. +1 доска.</div>}
      </div>

      {recent.length > 0 && (
        <>
          <h3 style={{ marginTop: 24 }}>Последние записи</h3>
          <div className="journal-list">
            {recent.map((e, i) => (
              <div key={i} className="journal-row">
                <div className="jr-head">
                  <span className={`jr-craving l${Math.floor(e.craving / 3)}`}>
                    {e.craving}/10
                  </span>
                  {e.trigger && <span className="jr-trigger">{e.trigger}</span>}
                  <span className={`jr-status ${e.overcame ? 'ok' : 'bad'}`}>
                    {e.overcame ? '✓ пережил' : 'сорвался'}
                  </span>
                  <span className="jr-ts">
                    {new Date(e.ts).toLocaleString('ru-RU', {
                      day: '2-digit', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                {e.note && <div className="jr-note">{e.note}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

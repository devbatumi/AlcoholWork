import { STAGES, currentStage, nextStage } from './science';

type Props = { sinceMs: number };

function fmtEta(ms: number) {
  if (ms < 0) return 'сейчас';
  const h = ms / 3600000;
  if (h < 1) return `${Math.ceil(ms / 60000)} мин`;
  if (h < 24) return `${Math.ceil(h)} ч`;
  const d = h / 24;
  if (d < 30) return `${Math.ceil(d)} д`;
  const m = d / 30;
  if (m < 12) return `${Math.ceil(m)} мес`;
  return `${Math.ceil(m / 12)} лет`;
}

export function StagesTimeline({ sinceMs }: Props) {
  const cur = currentStage(sinceMs);
  const next = nextStage(sinceMs);
  const eta = next ? next.atHours * 3600 * 1000 - sinceMs : 0;

  return (
    <div>
      <div className="stage-now">
        <div className="stage-now-head">Сейчас в твоём теле</div>
        <h3 className="stage-now-title">{cur.label}</h3>
        <p className="stage-now-body">{cur.body}</p>
        {next && (
          <div className="stage-next">
            Следующая веха: <b>{next.label}</b> <span className="tiny">({next.short})</span> —
            через <b>{fmtEta(eta)}</b>
          </div>
        )}
      </div>

      <div className="timeline">
        {STAGES.map((s) => {
          const passed = sinceMs >= s.atHours * 3600 * 1000;
          const isCurrent = s === cur;
          return (
            <div key={s.atHours} className={`tl-row${passed ? ' passed' : ''}${isCurrent ? ' current' : ''}`}>
              <div className="tl-dot" />
              <div className="tl-when">{s.short}</div>
              <div className="tl-label">{s.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

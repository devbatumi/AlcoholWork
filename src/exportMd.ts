import type { Persist } from './types';
import { buildProgress, TOTAL_BRICKS } from './sections';
import { currentStage } from './science';
import { computeEarned } from './store';

export function buildMarkdown(state: Persist): string {
  const now = Date.now();
  const since = now - state.startedAt;
  const earned = computeEarned(state.lastDrinkAt, state.perDay, now);
  const built = Math.min(earned, TOTAL_BRICKS) + state.bonusBricks;
  const sections = buildProgress(built);
  const stage = currentStage(since);
  const avoided = Math.min(earned, TOTAL_BRICKS) + state.bonusBricks;
  const saved = Math.floor(((avoided / 5) * state.pricePerBottle) * 100) / 100;
  const mins = avoided * 30;
  const days = Math.floor(since / (24 * 3600 * 1000));

  return `---
project: AlcoholWork
generated: ${new Date().toISOString()}
---

# ⛵ Корабль трезвости — прогресс

- **Начато:** ${new Date(state.startedAt).toLocaleString('ru-RU')}
- **Без алкоголя:** ${days} д (${Math.floor(since / 3600000)} ч)
- **Исходная норма:** ${state.perDay}/день
- **Срывов:** ${state.relapses}
- **Стадия восстановления:** ${stage.label} (${stage.short})

## Прогресс корабля
${built} / ${TOTAL_BRICKS} досок (${Math.floor((built / TOTAL_BRICKS) * 100)}%)

| # | Секция | Прогресс |
|---|---|---|
${sections.map((s, i) => `| ${i + 1} | ${s.name} | ${s.filled}/${s.cost}${s.filled >= s.cost ? ' ✓' : ''} |`).join('\n')}

## Итоги
- Не выпито порций: **${avoided}**
- Сэкономлено: **${saved.toLocaleString('ru-RU')} ₽**
- Минут жизни возвращено: **${mins}** (~${(mins / 60).toFixed(1)} ч)

## Причины бросить
${state.reasons.length ? state.reasons.map((r) => `- ${r}`).join('\n') : '_не заданы_'}

## Письмо себе
${state.letterToSelf ? `> ${state.letterToSelf}` : '_не написано_'}

## Журнал (${state.journal.length} записей)
${state.journal.length === 0 ? '_пусто_' : state.journal.slice(-20).reverse().map((e) =>
  `- **${new Date(e.ts).toLocaleString('ru-RU')}** — тяга ${e.craving}/10${e.trigger ? `, триггер: ${e.trigger}` : ''}, ${e.overcame ? 'пережил' : 'сорвался'}${e.note ? ` — «${e.note}»` : ''}`
).join('\n')}
`;
}

export function downloadMd(state: Persist) {
  const md = buildMarkdown(state);
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const fname = `alcoholwork-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}.md`;
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fname;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

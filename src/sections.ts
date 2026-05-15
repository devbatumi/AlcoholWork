import type { Section, VisualPart } from './types';

// 66 дней × 20 шагов = 1320 досок (Lally et al. 2010, UCL).
// Секции разбиты на мелкие подсекции с возрастающим размером:
// первые «победы» приходят в первые часы/дни — это критично против
// дизмотивации в самом тяжёлом стартовом окне.
// Сумма по visualId сохраняет исходные пропорции корабля
// (keel 78, hull 236, deck 142, cabin 126, mast-fore 126,
//  mast-main 157, mast-mizzen 126, sails 236, flag 93).
export const SECTIONS: Section[] = [
  // Киль (78) — 4 шага, первый закрывается за ~6ч.
  { id: 'keel-1', name: 'Закладка киля', cost: 5, visualId: 'keel' },
  { id: 'keel-2', name: 'Шпангоут', cost: 10, visualId: 'keel' },
  { id: 'keel-3', name: 'Стрингеры', cost: 23, visualId: 'keel' },
  { id: 'keel-4', name: 'Кильсон', cost: 40, visualId: 'keel' },

  // Корпус (236) — 5 шагов вместо одной стены на 12 дней.
  { id: 'hull-1', name: 'Носовая обшивка', cost: 18, visualId: 'hull' },
  { id: 'hull-2', name: 'Скуловой пояс', cost: 30, visualId: 'hull' },
  { id: 'hull-3', name: 'Бортовая обшивка', cost: 45, visualId: 'hull' },
  { id: 'hull-4', name: 'Кормовая обшивка', cost: 65, visualId: 'hull' },
  { id: 'hull-5', name: 'Конопатка корпуса', cost: 78, visualId: 'hull' },

  // Палуба (142)
  { id: 'deck-1', name: 'Палубный настил', cost: 35, visualId: 'deck' },
  { id: 'deck-2', name: 'Леерное ограждение', cost: 50, visualId: 'deck' },
  { id: 'deck-3', name: 'Люки и трапы', cost: 57, visualId: 'deck' },

  // Каюта (126)
  { id: 'cabin-1', name: 'Каркас каюты', cost: 60, visualId: 'cabin' },
  { id: 'cabin-2', name: 'Окна и крыша', cost: 66, visualId: 'cabin' },

  // Фок-мачта (126)
  { id: 'mast-fore-1', name: 'Фок-мачта', cost: 60, visualId: 'mast-fore' },
  { id: 'mast-fore-2', name: 'Реи фок-мачты', cost: 66, visualId: 'mast-fore' },

  // Грот-мачта (157)
  { id: 'mast-main-1', name: 'Грот-мачта', cost: 75, visualId: 'mast-main' },
  { id: 'mast-main-2', name: 'Реи грот-мачты', cost: 82, visualId: 'mast-main' },

  // Бизань-мачта (126)
  { id: 'mast-mizzen-1', name: 'Бизань-мачта', cost: 60, visualId: 'mast-mizzen' },
  { id: 'mast-mizzen-2', name: 'Реи бизани', cost: 66, visualId: 'mast-mizzen' },

  // Паруса (236)
  { id: 'sails-1', name: 'Прямые паруса', cost: 110, visualId: 'sails' },
  { id: 'sails-2', name: 'Косые паруса', cost: 126, visualId: 'sails' },

  // Флаг (93)
  { id: 'flag-1', name: 'Флаг и такелаж', cost: 93, visualId: 'flag' },
];

export const TOTAL_BRICKS = SECTIONS.reduce((s, x) => s + x.cost, 0); // 1320

export type SectionView = Section & { filled: number };

export function buildProgress(built: number): SectionView[] {
  const sections: SectionView[] = SECTIONS.map((s) => ({ ...s, filled: 0 }));
  let rem = Math.min(built, TOTAL_BRICKS);
  for (const s of sections) {
    const take = Math.min(rem, s.cost);
    s.filled = take;
    rem -= take;
    if (rem <= 0) break;
  }
  return sections;
}

// Свод по визуальной группе (нужен Ship.tsx для opacity SVG-частей).
// Шаги opacity = completedSubs/subs — чтобы каждое закрытие подсекции
// давало заметный визуальный «щёлк», а не плавное размывание.
// currentFraction даёт небольшой прогресс внутри текущей подсекции.
export type VisualProgress = {
  filled: number;
  cost: number;
  subs: number;
  completedSubs: number;
  currentFraction: number;
};

export function visualProgress(
  sections: SectionView[],
): Record<VisualPart, VisualProgress> {
  const acc: Record<VisualPart, VisualProgress> = {
    keel: empty(),
    hull: empty(),
    deck: empty(),
    cabin: empty(),
    'mast-fore': empty(),
    'mast-main': empty(),
    'mast-mizzen': empty(),
    sails: empty(),
    flag: empty(),
  };
  // Текущая подсекция — первая незавершённая в каждой группе.
  const currentSeen: Partial<Record<VisualPart, boolean>> = {};
  for (const s of sections) {
    const a = acc[s.visualId];
    a.filled += s.filled;
    a.cost += s.cost;
    a.subs += 1;
    if (s.filled >= s.cost) {
      a.completedSubs += 1;
    } else if (!currentSeen[s.visualId]) {
      a.currentFraction = s.filled / s.cost;
      currentSeen[s.visualId] = true;
    }
  }
  return acc;
}

function empty(): VisualProgress {
  return { filled: 0, cost: 0, subs: 0, completedSubs: 0, currentFraction: 0 };
}

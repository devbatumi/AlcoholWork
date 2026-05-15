export type ActionDef = {
  id: string;
  name: string;
  icon: string;
  reward: number;
  cooldownMs: number;
  desc: string;
  kind: 'simple' | 'breathing';
};

export const ACTIONS: ActionDef[] = [
  {
    id: 'breathing',
    name: 'Дыхание 4-7-8',
    icon: '🫁',
    reward: 2,
    cooldownMs: 45 * 60 * 1000,
    desc: 'Мини-сессия 4 цикла. Физиологически гасит тягу.',
    kind: 'breathing',
  },
  {
    id: 'water',
    name: 'Стакан воды',
    icon: '💧',
    reward: 1,
    cooldownMs: 25 * 60 * 1000,
    desc: 'Гидратация снимает ложное «хочу выпить» — мозг часто путает жажду с тягой.',
    kind: 'simple',
  },
  {
    id: 'walk',
    name: 'Прошёлся 10 мин',
    icon: '🚶',
    reward: 2,
    cooldownMs: 90 * 60 * 1000,
    desc: 'Эндорфины перебивают тягу. Особенно вечером — в «опасное окно».',
    kind: 'simple',
  },
  {
    id: 'craving_beat',
    name: 'Пережил волну тяги',
    icon: '💪',
    reward: 3,
    cooldownMs: 120 * 60 * 1000,
    desc: 'Ты дождался, пока волна пройдёт. Это большая победа.',
    kind: 'simple',
  },
  {
    id: 'tea',
    name: 'Заварил чай / безалкогольное',
    icon: '🍵',
    reward: 1,
    cooldownMs: 60 * 60 * 1000,
    desc: 'Замена ритуала. Бокал в руке остался — только содержимое стало другим.',
    kind: 'simple',
  },
  {
    id: 'support',
    name: 'Сказал кому-то, что не пью',
    icon: '🗣',
    reward: 2,
    cooldownMs: 12 * 60 * 60 * 1000,
    desc: 'Социальная ответственность — сильный якорь. И отказ в компании проще, если уже сказал.',
    kind: 'simple',
  },
];

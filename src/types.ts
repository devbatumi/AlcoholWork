export type Status = 'building' | 'sailed' | 'sunk';

export type JournalEntry = {
  ts: number;
  craving: number; // 0..10
  trigger?: string;
  note?: string;
  overcame: boolean;
};

export type PetStat = 'hunger' | 'happiness' | 'energy' | 'cleanliness';

export type PetState = {
  name: string;
  hunger: number;
  happiness: number;
  energy: number;
  cleanliness: number;
  lastTick: number;
  cooldowns: Record<string, number>;
  totalActions: number;
  bornAt: number;
};

export type Persist = {
  onboarded: boolean;
  startedAt: number;
  lastDrinkAt: number;
  perDay: number;
  pricePerBottle: number;
  relapses: number;
  status: Status;
  bonusBricks: number;
  cooldowns: Record<string, number>;
  journal: JournalEntry[];
  reasons: string[];
  letterToSelf: string;
  pet: PetState;
};

export type VisualPart =
  | 'keel'
  | 'hull'
  | 'deck'
  | 'cabin'
  | 'mast-fore'
  | 'mast-main'
  | 'mast-mizzen'
  | 'sails'
  | 'flag';

export type Section = {
  id: string;
  name: string;
  cost: number;
  visualId: VisualPart;
};

export const INTEREST_CATEGORIES = [
  {
    key: 'rest_drinks',
    name: '☕️ Відпочинок та напої',
    emoji: '☕️',
    label: 'Відпочинок та напої',
  },
  {
    key: 'food',
    name: '🍕 Їжа та смаколики',
    emoji: '🍕',
    label: 'Їжа та смаколики',
  },
  {
    key: 'sport',
    name: '🎾 Спорт та активність',
    emoji: '🎾',
    label: 'Спорт та активність',
  },
  {
    key: 'leisure',
    name: '🚶‍♂️ Дозвілля та Lifestyle',
    emoji: '🚶‍♂️',
    label: 'Дозвілля та Lifestyle',
  },
  {
    key: 'entertainment',
    name: '🎮 Розваги та хобі',
    emoji: '🎮',
    label: 'Розваги та хобі',
  },
  {
    key: 'work',
    name: '💻 Робота',
    emoji: '💻',
    label: 'Робота',
  },
] as const;

export const MAP_SORT_GRID_ROWS = [
  ['sport', 'rest_drinks'],
  ['food', 'leisure', 'entertainment'],
  ['work'],
] as const;

export type InterestCategory = (typeof INTEREST_CATEGORIES)[number];
export type InterestCategoryKey = InterestCategory['key'];

export type MapSortFilterKey = 'all' | InterestCategoryKey;

export const INTEREST_CATEGORY_NAMES = INTEREST_CATEGORIES.map((item) => item.name);

export function getInterestCategoryByKey(key: InterestCategoryKey): InterestCategory {
  return INTEREST_CATEGORIES.find((item) => item.key === key)!;
}

export function getInterestNameByFilterKey(key: MapSortFilterKey): string | null {
  if (key === 'all') return null;
  return getInterestCategoryByKey(key).name;
}

export function getMapSortGridRowCategories(keys: readonly InterestCategoryKey[]) {
  return keys.map((key) => getInterestCategoryByKey(key));
}

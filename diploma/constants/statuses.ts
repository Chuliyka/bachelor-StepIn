export type StatusOption = {
  emoji: string;
  label: string;
};

export type StatusGroup = {
  title: string;
  options: StatusOption[];
};

export const STATUS_GROUPS: StatusGroup[] = [
  {
    title: '☕️ Відпочинок та напої',
    options: [
      { emoji: '☕️', label: 'П’ю каву' },
      { emoji: '☕️', label: 'По каві?' },
      { emoji: '💨', label: 'На перекур' },
      { emoji: '🍷', label: 'Келих вина' },
      { emoji: '🍹', label: 'На терасі' },
    ],
  },
  {
    title: '🍕 Їжа та смаколики',
    options: [
      { emoji: '🍔', label: 'Хочу смачно поїсти' },
      { emoji: '🍦', label: 'Йду за морозивом' },
    ],
  },
  {
    title: '🎾 Спорт та активність',
    options: [
      { emoji: '🎾', label: 'Хто на теніс?' },
      { emoji: '🏃‍♂️', label: 'На пробіжці' },
      { emoji: '🚲', label: 'Велопрогулянка' },
      { emoji: '🧘‍♂️', label: 'Йога на свіжому повітрі' },
      { emoji: '🛹', label: 'Катаюсь на скейті/роликах' },
      { emoji: '🛼', label: 'На роликах' },
      { emoji: '🎱', label: 'Більярд' },
    ],
  },
  {
    title: '🚶‍♂️ Дозвілля та Lifestyle',
    options: [
      { emoji: '🚶‍♂️', label: 'Прогулянка в парку' },
      { emoji: '🌳', label: 'Прогулянка в парку' },
      { emoji: '🐕', label: 'Вигулюю собаку' },
      { emoji: '🛍️', label: 'Шопінг' },
      { emoji: '📸', label: 'Шукаю модель для фото' },
    ],
  },
  {
    title: '🎮 Розваги та хобі',
    options: [
      { emoji: '🎮', label: 'Шукаю тімейта (PS/PC)' },
      { emoji: '🎬', label: 'Хочу в кіно' },
      { emoji: '🎭', label: 'Хочу в театр' },
      { emoji: '🎲', label: 'Настільні ігри' },
    ],
  },
  {
    title: '💻 Робота',
    options: [{ emoji: '👨‍💻', label: 'Працюю в коворкінгу' }],
  },
];

export const DEFAULT_STATUS: StatusOption = { emoji: '🛍️', label: 'Шопінг' };

const STATUS_VALUES_BY_CATEGORY = new Map<string, Set<string>>(
  STATUS_GROUPS.map((group) => [
    group.title,
    new Set(group.options.map((option) => formatStatusValue(option))),
  ]),
);

export function formatStatusValue(option: StatusOption) {
  return `${option.emoji} ${option.label}`;
}

export function parseStatusValue(value?: string | null): StatusOption {
  const normalized = value?.trim();
  if (!normalized) return DEFAULT_STATUS;

  const matched = STATUS_GROUPS.flatMap((group) => group.options).find(
    (option) => formatStatusValue(option) === normalized,
  );

  if (matched) return matched;

  const [emoji = DEFAULT_STATUS.emoji, ...labelParts] = normalized.split(' ');
  const label = labelParts.join(' ').trim() || normalized;
  return { emoji, label };
}

export function statusBelongsToCategory(status: string | null | undefined, categoryTitle: string) {
  const normalized = status?.trim();
  if (!normalized) return false;

  const allowed = STATUS_VALUES_BY_CATEGORY.get(categoryTitle);
  if (!allowed) return false;

  return allowed.has(normalized);
}

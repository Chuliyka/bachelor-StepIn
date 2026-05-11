import type { NotificationItem, NotificationListSection } from '@/types/notifications';

function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function diffCalendarDays(a: Date, b: Date): number {
  const sa = startOfLocalDay(a).getTime();
  const sb = startOfLocalDay(b).getTime();
  return Math.round((sa - sb) / (24 * 60 * 60 * 1000));
}

export function formatNotificationSectionTitle(day: Date, reference: Date = new Date(), locale = 'uk-UA'): string {
  const delta = diffCalendarDays(reference, day);
  if (delta === 0) return 'Сьогодні';
  if (delta === 1) return 'Вчора';
  return day.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
}

export function formatNotificationTime(iso: string, reference: Date = new Date(), locale = 'uk-UA'): string {
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return '—';
  const diffSec = Math.floor((reference.getTime() - t.getTime()) / 1000);
  if (diffSec >= 0 && diffSec < 60) return 'Зараз';
  return t.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

/**
 * Групує сповіщення по календарних днях (від новіших днів до старіших).
 * Порядок всередині дня: новіші зверху.
 */
export function groupNotificationsBySections(
  items: NotificationItem[],
  reference: Date = new Date(),
  locale = 'uk-UA',
): NotificationListSection[] {
  const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const byDay = new Map<string, NotificationItem[]>();
  for (const item of sorted) {
    const d = new Date(item.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = localDayKey(d);
    const list = byDay.get(key) ?? [];
    list.push(item);
    byDay.set(key, list);
  }

  const dayKeys = [...byDay.keys()].sort((ka, kb) => {
    const [ya, ma, da] = ka.split('-').map(Number);
    const [yb, mb, db] = kb.split('-').map(Number);
    const ta = new Date(ya, ma - 1, da).getTime();
    const tb = new Date(yb, mb - 1, db).getTime();
    return tb - ta;
  });

  return dayKeys.map((dayKey) => {
    const [y, m, d] = dayKey.split('-').map(Number);
    const dayDate = new Date(y, m - 1, d);
    const data = byDay.get(dayKey) ?? [];
    return {
      dayKey,
      title: formatNotificationSectionTitle(dayDate, reference, locale),
      data,
    };
  });
}

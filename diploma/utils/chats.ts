import type { ChatPreviewItem } from '@/types/chats';

export function formatChatTime(iso: string, reference: Date = new Date(), locale = 'uk-UA'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const diffSec = Math.floor((reference.getTime() - d.getTime()) / 1000);
  if (diffSec >= 0 && diffSec < 60) return 'Зараз';
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

export function filterChatsByQuery(items: ChatPreviewItem[], query: string): ChatPreviewItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((x) => {
    const name = x.participantName.toLowerCase();
    const text = x.lastMessageText.toLowerCase();
    return name.includes(q) || text.includes(q);
  });
}

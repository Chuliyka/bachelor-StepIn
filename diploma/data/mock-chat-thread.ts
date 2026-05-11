import type { ChatPreviewDto } from '@/types/chats';
import {
  LOCAL_CHAT_PARTICIPANT_ID,
  type ChatMessageDto,
  type ChatThreadHeaderDto,
  type ChatThreadListEntry,
  type ChatThreadPayload,
} from '@/types/chat-thread';
import { MOCK_CHAT_PREVIEWS } from './mock-chats';

const MILANA_CONVERSATION_ID = 'c6';

const MILANA_THREAD_ENTRIES: ChatThreadListEntry[] = [
  {
    kind: 'message',
    message: {
      id: 'm1',
      conversationId: MILANA_CONVERSATION_ID,
      authorParticipantId: 'u6',
      body: 'Справді?',
      createdAt: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    },
  },
  {
    kind: 'message',
    message: {
      id: 'm2',
      conversationId: MILANA_CONVERSATION_ID,
      authorParticipantId: 'u6',
      body: 'Клас',
      createdAt: new Date(Date.now() - 49 * 60 * 1000).toISOString(),
    },
  },
  {
    kind: 'message',
    message: {
      id: 'm3',
      conversationId: MILANA_CONVERSATION_ID,
      authorParticipantId: 'u6',
      body: 'Скільки тобі треба часу?',
      createdAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
      showAvatar: true,
    },
  },
  {
    kind: 'message',
    message: {
      id: 'm4',
      conversationId: MILANA_CONVERSATION_ID,
      authorParticipantId: LOCAL_CHAT_PARTICIPANT_ID,
      body: 'Я з вами! Де зустрінемось?',
      createdAt: new Date(Date.now() - 47 * 60 * 1000).toISOString(),
    },
  },
  {
    kind: 'message',
    message: {
      id: 'm5',
      conversationId: MILANA_CONVERSATION_ID,
      authorParticipantId: LOCAL_CHAT_PARTICIPANT_ID,
      body:
        'Маю ще закінчити деякі справи, вдягнутись та привести волосся в порядок. Думаю за хвилин 20 буду готова',
      createdAt: new Date(Date.now() - 46 * 60 * 1000).toISOString(),
    },
  },
  {
    kind: 'message',
    message: {
      id: 'm6',
      conversationId: MILANA_CONVERSATION_ID,
      authorParticipantId: LOCAL_CHAT_PARTICIPANT_ID,
      body: 'Добре?',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
  },
  { kind: 'timestamp', id: 'ts1', label: 'Сьогодні 12:43' },
  {
    kind: 'message',
    message: {
      id: 'm7',
      conversationId: MILANA_CONVERSATION_ID,
      authorParticipantId: 'u6',
      body: 'Окей',
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  },
  {
    kind: 'message',
    message: {
      id: 'm8',
      conversationId: MILANA_CONVERSATION_ID,
      authorParticipantId: 'u6',
      body: 'Я за хвилин 10 буду виходити',
      createdAt: new Date(Date.now() - 29 * 60 * 1000).toISOString(),
    },
  },
  {
    kind: 'message',
    message: {
      id: 'm9',
      conversationId: MILANA_CONVERSATION_ID,
      authorParticipantId: 'u6',
      body: 'Коли будеш готова, пиши і я надішлю локацію',
      createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      showAvatar: true,
    },
  },
];

function headerFromPreview(p: ChatPreviewDto): ChatThreadHeaderDto {
  return {
    conversationId: String(p.id),
    participantId: String(p.participantId),
    participantDisplayName: p.participantName,
    participantAvatarUrl: p.participantAvatarUrl ?? null,
    activityStatusEmoji: p.activityStatusEmoji?.trim() || '🛍️',
    threadStatusRelativeLabel: p.threadStatusRelativeLabel?.trim() ?? '',
    threadStatusBody: p.threadStatusBody?.trim() ?? '',
  };
}


export function getMockChatThread(conversationId: string): ChatThreadPayload | null {
  const preview = MOCK_CHAT_PREVIEWS.find((c) => String(c.id) === conversationId);
  if (!preview) return null;

  const header = headerFromPreview(preview);
  const entries: ChatThreadListEntry[] =
    conversationId === MILANA_CONVERSATION_ID ? [...MILANA_THREAD_ENTRIES] : [];

  return { header, entries };
}

export function createOptimisticOutgoingMessage(
  conversationId: string,
  body: string,
): ChatMessageDto {
  return {
    id: `local-${Date.now()}`,
    conversationId,
    authorParticipantId: LOCAL_CHAT_PARTICIPANT_ID,
    body,
    createdAt: new Date().toISOString(),
  };
}

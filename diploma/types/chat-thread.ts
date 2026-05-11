export const LOCAL_CHAT_PARTICIPANT_ID = '__local_user__';

export interface ChatThreadHeaderDto {
  conversationId: string;
  participantId: string;
  participantDisplayName: string;
  participantAvatarUrl: string | null;
  activityStatusEmoji: string;
  threadStatusRelativeLabel: string;
  threadStatusBody: string;
}

export interface ChatMessageDto {
  id: string;
  conversationId: string;
  authorParticipantId: string;
  body: string;
  createdAt: string;
  showAvatar?: boolean;
}

export type ChatThreadListEntry =
  | { kind: 'timestamp'; id: string; label: string }
  | { kind: 'message'; message: ChatMessageDto };

export interface ChatThreadPayload {
  header: ChatThreadHeaderDto;
  entries: ChatThreadListEntry[];
}

export function isOutgoingMessage(message: ChatMessageDto, localParticipantId: string): boolean {
  return message.authorParticipantId === localParticipantId;
}

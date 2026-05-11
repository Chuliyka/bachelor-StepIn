export interface ChatPreviewDto {
  id: string | number;
  participantId: string | number;
  participantName: string;
  participantAvatarUrl?: string | null;
  lastMessageText?: string | null;
  lastMessageAt: string;
  unreadCount?: number;
  activityStatusEmoji?: string | null;
  threadStatusRelativeLabel?: string | null;
  threadStatusBody?: string | null;
}

export interface ChatPreviewItem {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatarUrl: string | null;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  activityStatusEmoji: string;
}

export function mapChatPreviewDto(dto: ChatPreviewDto): ChatPreviewItem {
  return {
    id: String(dto.id),
    participantId: String(dto.participantId),
    participantName: dto.participantName,
    participantAvatarUrl: dto.participantAvatarUrl ?? null,
    lastMessageText: dto.lastMessageText ?? '',
    lastMessageAt: dto.lastMessageAt,
    unreadCount: dto.unreadCount ?? 0,
    activityStatusEmoji: dto.activityStatusEmoji?.trim() || '🛍️',
  };
}

export function mapChatPreviewDtoList(dtos: ChatPreviewDto[]): ChatPreviewItem[] {
  return dtos.map(mapChatPreviewDto);
}

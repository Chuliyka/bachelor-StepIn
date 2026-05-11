export class CreateConversationDto {
  participantId!: number;
}

export class SendMessageDto {
  conversationId?: number;
  recipientId?: number;
  text!: string;
}

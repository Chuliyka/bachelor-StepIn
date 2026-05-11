import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateDirectConversation(userId: number, participantId: number) {
    if (!Number.isInteger(participantId)) {
      throw new BadRequestException('participantId must be a valid user id.');
    }

    if (userId === participantId) {
      throw new BadRequestException('You cannot create a conversation with yourself.');
    }

    const participant = await this.prisma.user.findUnique({ where: { id: participantId } });
    if (!participant) {
      throw new NotFoundException(`User with id ${participantId} not found.`);
    }

    const directKey = this.getDirectKey(userId, participantId);

    return this.prisma.conversation.upsert({
      where: { directKey },
      update: {},
      create: {
        directKey,
        participants: {
          create: [
            { userId },
            { userId: participantId },
          ],
        },
      },
      include: this.conversationInclude(userId),
    });
  }

  async findUserConversations(userId: number) {
    return this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
      include: this.conversationInclude(userId),
    });
  }

  async findMessages(userId: number, conversationId: number, take = 50, cursorId?: number) {
    this.assertValidId(conversationId, 'conversationId');
    if (cursorId !== undefined) this.assertValidId(cursorId, 'cursorId');

    await this.assertParticipant(userId, conversationId);

    const safeTake = Number.isFinite(take) ? Math.min(Math.max(take, 1), 100) : 50;

    return this.prisma.message.findMany({
      where: { conversationId },
      take: safeTake,
      ...(cursorId && { skip: 1, cursor: { id: cursorId } }),
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: this.userSelect() } },
    });
  }

  async sendMessage(userId: number, params: { conversationId?: number; recipientId?: number; text: string }) {
    const text = params.text?.trim();
    if (!text) {
      throw new BadRequestException('Message text is required.');
    }

    if (!params.conversationId && !params.recipientId) {
      throw new BadRequestException('Provide conversationId or recipientId.');
    }

    if (params.conversationId !== undefined) {
      this.assertValidId(params.conversationId, 'conversationId');
    }

    if (params.recipientId !== undefined) {
      this.assertValidId(params.recipientId, 'recipientId');
    }

    const conversation = params.conversationId
      ? await this.findConversationForUser(userId, params.conversationId)
      : await this.getOrCreateDirectConversation(userId, params.recipientId as number);

    if (!conversation) {
      throw new NotFoundException('Conversation not found.');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        text,
      },
      include: { sender: { select: this.userSelect() } },
    });

    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: message.createdAt },
    });

    return message;
  }

  async markAsRead(userId: number, conversationId: number) {
    this.assertValidId(conversationId, 'conversationId');
    await this.assertParticipant(userId, conversationId);
    const readAt = new Date();

    await this.prisma.$transaction([
      this.prisma.conversationParticipant.update({
        where: { conversationId_userId: { conversationId, userId } },
        data: { lastReadAt: readAt },
      }),
      this.prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          readAt: null,
        },
        data: { readAt },
      }),
    ]);

    return { success: true, readAt };
  }

  async findConversationForUser(userId: number, conversationId: number) {
    this.assertValidId(conversationId, 'conversationId');

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { userId } },
      },
      include: this.conversationInclude(userId),
    });

    if (!conversation) {
      throw new ForbiddenException('You are not a participant of this conversation.');
    }

    return conversation;
  }

  private async assertParticipant(userId: number, conversationId: number) {
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });

    if (!participant) {
      throw new ForbiddenException('You are not a participant of this conversation.');
    }
  }

  private assertValidId(value: number, fieldName: string) {
    if (!Number.isInteger(value) || value <= 0) {
      throw new BadRequestException(`${fieldName} must be a positive integer.`);
    }
  }

  private getDirectKey(userId: number, participantId: number) {
    const [firstId, secondId] = [userId, participantId].sort((a, b) => a - b);
    return `${firstId}:${secondId}`;
  }

  private conversationInclude(currentUserId: number) {
    return {
      participants: {
        include: { user: { select: this.userSelect() } },
      },
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' as const },
        include: { sender: { select: this.userSelect() } },
      },
      _count: {
        select: {
          messages: {
            where: {
              senderId: { not: currentUserId },
              readAt: null,
            },
          },
        },
      },
    };
  }

  private userSelect() {
    return {
      id: true,
      name: true,
      photoUrl: true,
      isOnline: true,
      lastSeenAt: true,
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LocationGeoService } from '../location/location-geo.service';
import { NotificationsService } from '../notifications/notifications.service';
import { GeminiEmbeddingService } from './gemini-embedding.service';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  private get radiusMeters() {
    return Number(process.env.MATCH_RADIUS_METERS) || 500;
  }

  private get similarityThreshold() {
    return Number(process.env.MATCH_SIMILARITY_THRESHOLD) || 0.75;
  }

  private get cooldownHours() {
    return Number(process.env.MATCH_COOLDOWN_HOURS) || 24;
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly locationGeo: LocationGeoService,
    private readonly notifications: NotificationsService,
    private readonly gemini: GeminiEmbeddingService,
  ) {}

  async refreshUserEmbedding(userId: number): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          status: true,
          interests: { include: { interest: true } },
        },
      });

      if (!user) return;

      const interestNames = user.interests.map((ui) => ui.interest.name);
      if (interestNames.length === 0 && !user.status) return;

      const text = this.buildEmbeddingText(interestNames, user.status);
      const embedding = await this.gemini.generateEmbedding(text);

      await this.prisma.user.update({
        where: { id: userId },
        data: { embedding, embeddingUpdatedAt: new Date() },
      });

      this.logger.log(`Embedding refreshed | userId=${userId}`);
    } catch (err) {
      this.logger.error(`Failed to refresh embedding | userId=${userId}`, err instanceof Error ? err.stack : err);
    }
  }

  async checkNearbyMatches(userId: number): Promise<void> {
    if (!this.locationGeo.isPostgisReady()) return;

    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, latitude: true, longitude: true, embedding: true },
      });

      if (!user || user.latitude == null || user.longitude == null || !user.embedding) return;

      const userEmbedding = user.embedding as number[];
      if (!Array.isArray(userEmbedding) || userEmbedding.length === 0) return;

      const nearbyIds = await this.locationGeo.findNearbyUserIds(userId, user.latitude, user.longitude, this.radiusMeters);
      if (nearbyIds.length === 0) return;

      const candidates = await this.prisma.user.findMany({
        where: { id: { in: nearbyIds }, embedding: { not: null } },
        select: { id: true, name: true, embedding: true },
      });

      for (const candidate of candidates) {
        const candidateEmbedding = candidate.embedding as number[];
        if (!Array.isArray(candidateEmbedding) || candidateEmbedding.length === 0) continue;

        const similarity = this.cosineSimilarity(userEmbedding, candidateEmbedding);
        if (similarity < this.similarityThreshold) continue;

        const pairKey = this.pairKey(userId, candidate.id);
        const alreadyNotified = await this.wasRecentlyNotified(pairKey);
        if (alreadyNotified) continue;

        await this.upsertMatchSuggestion(pairKey, userId, candidate.id, similarity);
        await this.sendMatchNotifications(user, candidate, similarity);
      }
    } catch (err) {
      this.logger.error(`checkNearbyMatches failed | userId=${userId}`, err instanceof Error ? err.stack : err);
    }
  }

  private async sendMatchNotifications(
    userA: { id: number; name: string | null },
    userB: { id: number; name: string | null },
    similarity: number,
  ) {
    const pct = Math.round(similarity * 100);

    await this.notifications.createMatchSuggestionNotification({
      recipientId: userA.id,
      actorId: userB.id,
      actorName: userB.name,
      similarity: pct,
    });

    await this.notifications.createMatchSuggestionNotification({
      recipientId: userB.id,
      actorId: userA.id,
      actorName: userA.name,
      similarity: pct,
    });

    this.logger.log(`Match notified | pairKey=${this.pairKey(userA.id, userB.id)} | similarity=${pct}%`);
  }

  private async wasRecentlyNotified(pairKey: string): Promise<boolean> {
    const cutoff = new Date(Date.now() - this.cooldownHours * 60 * 60 * 1000);
    const existing = await this.prisma.matchSuggestion.findUnique({ where: { pairKey } });
    return existing != null && existing.notifiedAt > cutoff;
  }

  private async upsertMatchSuggestion(pairKey: string, userAId: number, userBId: number, similarity: number) {
    await this.prisma.matchSuggestion.upsert({
      where: { pairKey },
      update: { similarity, notifiedAt: new Date() },
      create: { pairKey, userAId, userBId, similarity },
    });
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const len = Math.min(a.length, b.length);
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < len; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
  }

  private buildEmbeddingText(interests: string[], status: string | null): string {
    const parts: string[] = [];
    if (interests.length > 0) parts.push(`Interests: ${interests.join(', ')}`);
    if (status) parts.push(`Status: ${status}`);
    return parts.join('. ');
  }

  private pairKey(a: number, b: number): string {
    const [lo, hi] = a < b ? [a, b] : [b, a];
    return `${lo}:${hi}`;
  }
}

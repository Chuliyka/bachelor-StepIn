import { Module } from '@nestjs/common';
import { LocationModule } from '../location/location.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { GeminiEmbeddingService } from './gemini-embedding.service';
import { MatchingService } from './matching.service';

@Module({
  imports: [LocationModule, NotificationsModule],
  providers: [GeminiEmbeddingService, MatchingService],
  exports: [MatchingService],
})
export class AiModule {}

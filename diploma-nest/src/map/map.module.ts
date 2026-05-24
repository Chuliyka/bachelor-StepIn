import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { MapController } from './map.controller';

@Module({
  imports: [UsersModule],
  controllers: [MapController],
})
export class MapModule {}

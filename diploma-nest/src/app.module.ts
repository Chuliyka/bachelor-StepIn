import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { FriendsModule } from './friends/friends.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MapModule } from './map/map.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ChatModule, FriendsModule, NotificationsModule, MapModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

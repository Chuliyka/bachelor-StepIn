import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LocationGeoService } from './location-geo.service';

@Module({
  imports: [PrismaModule],
  providers: [LocationGeoService],
  exports: [LocationGeoService],
})
export class LocationModule {}

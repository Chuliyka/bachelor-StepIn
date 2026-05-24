import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MAX_MAP_SEARCH_RADIUS_METERS } from '../location/postgis.constants';
import { UsersService } from '../users/users.service';

@Controller('map')
@UseGuards(JwtAuthGuard)
export class MapController {
  constructor(private readonly usersService: UsersService) {}

  @Get('users')
  findMapUsers(
    @Req() req: { user: { id: number } },
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusMeters') radiusMeters?: string,
  ) {
    const centerLatitude = lat !== undefined ? Number(lat) : undefined;
    const centerLongitude = lng !== undefined ? Number(lng) : undefined;
    const parsedRadius = radiusMeters !== undefined ? Number(radiusMeters) : undefined;

    const hasValidCenter =
      Number.isFinite(centerLatitude) &&
      Number.isFinite(centerLongitude) &&
      centerLatitude! >= -90 &&
      centerLatitude! <= 90 &&
      centerLongitude! >= -180 &&
      centerLongitude! <= 180;

    return this.usersService.findForMap(req.user.id, {
      ...(hasValidCenter && {
        centerLatitude,
        centerLongitude,
        radiusMeters: Number.isFinite(parsedRadius)
          ? Math.min(Math.max(parsedRadius!, 100), MAX_MAP_SEARCH_RADIUS_METERS)
          : undefined,
      }),
    });
  }
}

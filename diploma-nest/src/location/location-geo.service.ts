import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  DEFAULT_MAP_SEARCH_RADIUS_METERS,
  MAX_MAP_SEARCH_RADIUS_METERS,
  WGS84_SRID,
} from './postgis.constants';
import type { MapUserGeoRow } from './postgis.types';

@Injectable()
export class LocationGeoService implements OnModuleInit {
  private readonly logger = new Logger(LocationGeoService.name);
  private postgisReady = false;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const rows = await this.prisma.$queryRaw<{ version: string }[]>`
        SELECT PostGIS_Version() AS version
      `;
      const version = rows[0]?.version ?? 'unknown';
      this.postgisReady = true;
      this.logger.log(`PostGIS ready (${version})`);
    } catch (error) {
      this.postgisReady = false;
      this.logger.error(
        'PostGIS is not available. Use postgis/postgis image and run migrations. Spatial queries will fail.',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  isPostgisReady(): boolean {
    return this.postgisReady;
  }

  makePointSql(longitude: number, latitude: number): Prisma.Sql {
    return Prisma.sql`ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), ${WGS84_SRID})::geography`;
  }

  async distanceMeters(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
    this.assertReady();
    const rows = await this.prisma.$queryRaw<{ meters: number }[]>`
      SELECT ST_Distance(
        ${this.makePointSql(a.longitude, a.latitude)},
        ${this.makePointSql(b.longitude, b.latitude)}
      )::float8 AS meters
    `;
    return rows[0]?.meters ?? 0;
  }

  async findMapUsers(
    viewerId: number,
    options?: {
      centerLatitude?: number;
      centerLongitude?: number;
      radiusMeters?: number;
    },
  ): Promise<MapUserGeoRow[]> {
    this.assertReady();

    const centerLat = options?.centerLatitude;
    const centerLng = options?.centerLongitude;
    const hasCenter =
      Number.isFinite(centerLat) &&
      Number.isFinite(centerLng) &&
      centerLat! >= -90 &&
      centerLat! <= 90 &&
      centerLng! >= -180 &&
      centerLng! <= 180;

    const radiusMeters = hasCenter
      ? Math.min(
          Math.max(options?.radiusMeters ?? DEFAULT_MAP_SEARCH_RADIUS_METERS, 100),
          MAX_MAP_SEARCH_RADIUS_METERS,
        )
      : null;

    const centerPoint = hasCenter
      ? this.makePointSql(centerLng as number, centerLat as number)
      : null;

    const spatialFilter =
      hasCenter && centerPoint && radiusMeters !== null
        ? Prisma.sql`
            AND (
              (u."isOnline" = true AND u."location" IS NOT NULL AND ST_DWithin(u."location", ${centerPoint}, ${radiusMeters}))
              OR (
                u."isOnline" = false
                AND COALESCE(u."lastLocation", u."location") IS NOT NULL
                AND ST_DWithin(COALESCE(u."lastLocation", u."location"), ${centerPoint}, ${radiusMeters})
              )
            )
          `
        : Prisma.sql`
            AND (
              (u."isOnline" = true AND u."location" IS NOT NULL)
              OR (u."isOnline" = false AND COALESCE(u."lastLocation", u."location") IS NOT NULL)
            )
          `;

    return this.prisma.$queryRaw<MapUserGeoRow[]>`
      SELECT
        u."id" AS "id",
        u."name" AS "name",
        u."status" AS "status",
        u."photoUrl" AS "photoUrl",
        u."isOnline" AS "isOnline",
        CASE
          WHEN u."isOnline" = true AND u."location" IS NOT NULL THEN ST_Y(u."location"::geometry)
          WHEN COALESCE(u."lastLocation", u."location") IS NOT NULL THEN ST_Y(COALESCE(u."lastLocation", u."location")::geometry)
          ELSE u."latitude"
        END::float8 AS "latitude",
        CASE
          WHEN u."isOnline" = true AND u."location" IS NOT NULL THEN ST_X(u."location"::geometry)
          WHEN COALESCE(u."lastLocation", u."location") IS NOT NULL THEN ST_X(COALESCE(u."lastLocation", u."location")::geometry)
          ELSE u."longitude"
        END::float8 AS "longitude",
        CASE
          WHEN u."lastLocation" IS NOT NULL THEN ST_Y(u."lastLocation"::geometry)
          ELSE u."lastLatitude"
        END::float8 AS "lastLatitude",
        CASE
          WHEN u."lastLocation" IS NOT NULL THEN ST_X(u."lastLocation"::geometry)
          ELSE u."lastLongitude"
        END::float8 AS "lastLongitude",
        u."locationAccuracy" AS "locationAccuracy",
        u."lastSeenAt" AS "lastSeenAt"
      FROM "User" u
      WHERE u."id" <> ${viewerId}
      ${spatialFilter}
      ORDER BY u."id" ASC
    `;
  }

  async findNearbyUserIds(
    excludeUserId: number,
    latitude: number,
    longitude: number,
    radiusMeters: number,
  ): Promise<number[]> {
    this.assertReady();
    const center = this.makePointSql(longitude, latitude);
    const rows = await this.prisma.$queryRaw<{ id: number }[]>`
      SELECT u."id"
      FROM "User" u
      WHERE u."id" <> ${excludeUserId}
        AND u."location" IS NOT NULL
        AND ST_DWithin(u."location", ${center}, ${radiusMeters})
    `;
    return rows.map((r) => r.id);
  }

  private assertReady() {
    if (!this.postgisReady) {
      throw new Error('PostGIS is not initialized. Start postgis/postgis and run prisma migrate deploy.');
    }
  }
}

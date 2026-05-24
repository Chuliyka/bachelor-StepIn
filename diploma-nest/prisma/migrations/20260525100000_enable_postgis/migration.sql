CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "location" geography(Point, 4326),
ADD COLUMN IF NOT EXISTS "lastLocation" geography(Point, 4326);

UPDATE "User"
SET "location" = ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326)::geography
WHERE "latitude" IS NOT NULL
  AND "longitude" IS NOT NULL
  AND "location" IS NULL;

UPDATE "User"
SET "lastLocation" = ST_SetSRID(ST_MakePoint("lastLongitude", "lastLatitude"), 4326)::geography
WHERE "lastLatitude" IS NOT NULL
  AND "lastLongitude" IS NOT NULL
  AND "lastLocation" IS NULL;

CREATE INDEX IF NOT EXISTS "User_location_gix" ON "User" USING GIST ("location");
CREATE INDEX IF NOT EXISTS "User_lastLocation_gix" ON "User" USING GIST ("lastLocation");

CREATE OR REPLACE FUNCTION sync_user_location_geography()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."latitude" IS NOT NULL AND NEW."longitude" IS NOT NULL THEN
    NEW."location" := ST_SetSRID(ST_MakePoint(NEW."longitude", NEW."latitude"), 4326)::geography;
  ELSE
    NEW."location" := NULL;
  END IF;

  IF NEW."lastLatitude" IS NOT NULL AND NEW."lastLongitude" IS NOT NULL THEN
    NEW."lastLocation" := ST_SetSRID(ST_MakePoint(NEW."lastLongitude", NEW."lastLatitude"), 4326)::geography;
  ELSE
    NEW."lastLocation" := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_location_geography_sync ON "User";

CREATE TRIGGER user_location_geography_sync
BEFORE INSERT OR UPDATE OF "latitude", "longitude", "lastLatitude", "lastLongitude"
ON "User"
FOR EACH ROW
EXECUTE FUNCTION sync_user_location_geography();

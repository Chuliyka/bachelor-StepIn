ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "mapLatitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "mapLongitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "mapLastLatitude" DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS "mapLastLongitude" DOUBLE PRECISION;

UPDATE "User"
SET
  "mapLatitude" = "latitude",
  "mapLongitude" = "longitude",
  "mapLastLatitude" = "lastLatitude",
  "mapLastLongitude" = "lastLongitude"
WHERE "latitude" IS NOT NULL AND "longitude" IS NOT NULL;

CREATE OR REPLACE FUNCTION sync_user_location_geography()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW."mapLatitude" IS NOT NULL AND NEW."mapLongitude" IS NOT NULL THEN
    NEW."location" := ST_SetSRID(ST_MakePoint(NEW."mapLongitude", NEW."mapLatitude"), 4326)::geography;
  ELSIF NEW."latitude" IS NOT NULL AND NEW."longitude" IS NOT NULL THEN
    NEW."location" := ST_SetSRID(ST_MakePoint(NEW."longitude", NEW."latitude"), 4326)::geography;
  ELSE
    NEW."location" := NULL;
  END IF;

  IF NEW."mapLastLatitude" IS NOT NULL AND NEW."mapLastLongitude" IS NOT NULL THEN
    NEW."lastLocation" := ST_SetSRID(ST_MakePoint(NEW."mapLastLongitude", NEW."mapLastLatitude"), 4326)::geography;
  ELSIF NEW."lastLatitude" IS NOT NULL AND NEW."lastLongitude" IS NOT NULL THEN
    NEW."lastLocation" := ST_SetSRID(ST_MakePoint(NEW."lastLongitude", NEW."lastLatitude"), 4326)::geography;
  ELSE
    NEW."lastLocation" := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_location_geography_sync ON "User";

CREATE TRIGGER user_location_geography_sync
BEFORE INSERT OR UPDATE OF
  "latitude", "longitude", "lastLatitude", "lastLongitude",
  "mapLatitude", "mapLongitude", "mapLastLatitude", "mapLastLongitude"
ON "User"
FOR EACH ROW
EXECUTE FUNCTION sync_user_location_geography();

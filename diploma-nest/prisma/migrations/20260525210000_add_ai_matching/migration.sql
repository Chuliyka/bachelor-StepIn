ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'MATCH_SUGGESTION';

ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "embedding" JSONB,
  ADD COLUMN IF NOT EXISTS "embeddingUpdatedAt" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "MatchSuggestion" (
  "id"         SERIAL          NOT NULL,
  "pairKey"    TEXT            NOT NULL,
  "userAId"    INTEGER         NOT NULL,
  "userBId"    INTEGER         NOT NULL,
  "similarity" DOUBLE PRECISION NOT NULL,
  "notifiedAt" TIMESTAMP(3)    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MatchSuggestion_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "MatchSuggestion_pairKey_key" ON "MatchSuggestion"("pairKey");
CREATE INDEX IF NOT EXISTS "MatchSuggestion_userAId_idx"  ON "MatchSuggestion"("userAId");
CREATE INDEX IF NOT EXISTS "MatchSuggestion_userBId_idx"  ON "MatchSuggestion"("userBId");

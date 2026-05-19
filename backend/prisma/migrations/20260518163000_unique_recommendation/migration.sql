-- Cleanup duplicates before adding unique constraint
DELETE FROM "Recommendation" r1
USING "Recommendation" r2
WHERE r1."userId" = r2."userId"
  AND r1."animeTitle" = r2."animeTitle"
  AND r1.id > r2.id;

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_userId_animeTitle_key" ON "Recommendation"("userId", "animeTitle");

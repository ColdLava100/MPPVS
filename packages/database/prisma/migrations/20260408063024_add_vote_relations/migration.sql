/*
  Warnings:

  - A unique constraint covering the columns `[voterId,electionId,candidateId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Vote_voterId_electionId_candidateId_key" ON "Vote"("voterId", "electionId", "candidateId");

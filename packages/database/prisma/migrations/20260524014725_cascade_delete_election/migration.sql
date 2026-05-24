-- DropForeignKey
ALTER TABLE "Candidate" DROP CONSTRAINT "Candidate_electionId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_electionId_fkey";

-- DropForeignKey
ALTER TABLE "VoterRegistration" DROP CONSTRAINT "VoterRegistration_electionId_fkey";

-- DropForeignKey
ALTER TABLE "VotingSession" DROP CONSTRAINT "VotingSession_electionId_fkey";

-- Cleanup orphaned records referencing deleted elections
DELETE FROM "Vote" WHERE "electionId" NOT IN (SELECT "id" FROM "Election");
DELETE FROM "VoterRegistration" WHERE "electionId" NOT IN (SELECT "id" FROM "Election");
DELETE FROM "Candidate" WHERE "electionId" NOT IN (SELECT "id" FROM "Election");
DELETE FROM "VotingSession" WHERE "electionId" NOT IN (SELECT "id" FROM "Election");

-- AddForeignKey
ALTER TABLE "VotingSession" ADD CONSTRAINT "VotingSession_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRegistration" ADD CONSTRAINT "VoterRegistration_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE CASCADE ON UPDATE CASCADE;

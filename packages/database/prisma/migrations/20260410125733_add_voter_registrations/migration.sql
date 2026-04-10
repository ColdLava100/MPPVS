-- AlterTable
ALTER TABLE "User" ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "VoterRegistration" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "VoterRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VoterRegistration_electionId_userId_key" ON "VoterRegistration"("electionId", "userId");

-- AddForeignKey
ALTER TABLE "VoterRegistration" ADD CONSTRAINT "VoterRegistration_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "Election"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoterRegistration" ADD CONSTRAINT "VoterRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

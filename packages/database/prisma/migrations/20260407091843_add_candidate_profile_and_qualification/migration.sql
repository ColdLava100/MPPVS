-- AlterTable
ALTER TABLE "Candidate" ADD COLUMN     "information" TEXT,
ADD COLUMN     "profilePicture" TEXT,
ADD COLUMN     "spotlightBanner" TEXT;

-- CreateTable
CREATE TABLE "Qualification" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "cgpa" TEXT NOT NULL,
    "justification" TEXT NOT NULL,

    CONSTRAINT "Qualification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Qualification_candidateId_key" ON "Qualification"("candidateId");

-- AddForeignKey
ALTER TABLE "Qualification" ADD CONSTRAINT "Qualification_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

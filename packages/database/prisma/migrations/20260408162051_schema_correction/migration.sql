/*
  Warnings:

  - You are about to drop the column `manifestoDesc` on the `Manifesto` table. All the data in the column will be lost.
  - You are about to drop the column `manifestoLink` on the `Manifesto` table. All the data in the column will be lost.
  - You are about to drop the column `manifestoTitle` on the `Manifesto` table. All the data in the column will be lost.
  - The `position` column on the `Qualification` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[candidateId]` on the table `Qualification` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `Manifesto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Manifesto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Manifesto" DROP COLUMN "manifestoDesc",
DROP COLUMN "manifestoLink",
DROP COLUMN "manifestoTitle",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Qualification" DROP COLUMN "position",
ADD COLUMN     "position" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "Qualification_candidateId_key" ON "Qualification"("candidateId");

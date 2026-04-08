/*
  Warnings:

  - A unique constraint covering the columns `[studentPrefix]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "studentPrefix" TEXT NOT NULL DEFAULT 'null';

-- CreateIndex
CREATE UNIQUE INDEX "Course_studentPrefix_key" ON "Course"("studentPrefix");

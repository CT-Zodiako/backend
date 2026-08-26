/*
  Warnings:

  - You are about to drop the column `categoryId` on the `category_winners` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `evaluation_criteria` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `projects` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[categoryEditionId]` on the table `category_winners` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[editionId,name]` on the table `evaluation_criteria` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryEditionId` to the `category_winners` table without a default value. This is not possible if the table is not empty.
  - Added the required column `editionId` to the `evaluation_criteria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryEditionId` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EvaluationPeriodNumber" AS ENUM ('FIRST', 'SECOND');

-- DropForeignKey
ALTER TABLE "category_winners" DROP CONSTRAINT "category_winners_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "evaluation_criteria" DROP CONSTRAINT "evaluation_criteria_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_categoryId_fkey";

-- DropIndex
DROP INDEX "category_winners_categoryId_key";

-- DropIndex
DROP INDEX "evaluation_criteria_categoryId_idx";

-- DropIndex
DROP INDEX "evaluation_criteria_categoryId_name_key";

-- DropIndex
DROP INDEX "projects_categoryId_idx";

-- AlterTable
ALTER TABLE "category_winners" DROP COLUMN "categoryId",
ADD COLUMN     "categoryEditionId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "evaluation_criteria" DROP COLUMN "categoryId",
ADD COLUMN     "editionId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "categoryId",
ADD COLUMN     "categoryEditionId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "evaluation_periods" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "number" "EvaluationPeriodNumber" NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluation_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_editions" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "periodId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_editions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_periods_year_number_key" ON "evaluation_periods"("year", "number");

-- CreateIndex
CREATE INDEX "category_editions_periodId_idx" ON "category_editions"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "category_editions_categoryId_periodId_key" ON "category_editions"("categoryId", "periodId");

-- CreateIndex
CREATE UNIQUE INDEX "category_winners_categoryEditionId_key" ON "category_winners"("categoryEditionId");

-- CreateIndex
CREATE INDEX "evaluation_criteria_editionId_idx" ON "evaluation_criteria"("editionId");

-- CreateIndex
CREATE UNIQUE INDEX "evaluation_criteria_editionId_name_key" ON "evaluation_criteria"("editionId", "name");

-- CreateIndex
CREATE INDEX "projects_categoryEditionId_idx" ON "projects"("categoryEditionId");

-- AddForeignKey
ALTER TABLE "category_editions" ADD CONSTRAINT "category_editions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_editions" ADD CONSTRAINT "category_editions_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "evaluation_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluation_criteria" ADD CONSTRAINT "evaluation_criteria_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "category_editions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_categoryEditionId_fkey" FOREIGN KEY ("categoryEditionId") REFERENCES "category_editions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_winners" ADD CONSTRAINT "category_winners_categoryEditionId_fkey" FOREIGN KEY ("categoryEditionId") REFERENCES "category_editions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

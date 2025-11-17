/*
  Warnings:

  - You are about to drop the column `budgetFit` on the `ClientInsight` table. All the data in the column will be lost.
  - You are about to drop the column `companySize` on the `ClientInsight` table. All the data in the column will be lost.
  - You are about to drop the column `decisionMakerRole` on the `ClientInsight` table. All the data in the column will be lost.
  - You are about to drop the column `hasChampion` on the `ClientInsight` table. All the data in the column will be lost.
  - You are about to drop the column `mainObjections` on the `ClientInsight` table. All the data in the column will be lost.
  - You are about to drop the column `nextStepClarity` on the `ClientInsight` table. All the data in the column will be lost.
  - You are about to drop the column `sentimentBreakdown` on the `ClientInsight` table. All the data in the column will be lost.
  - You are about to drop the column `urgencyLevel` on the `ClientInsight` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClientInsight" DROP COLUMN "budgetFit",
DROP COLUMN "companySize",
DROP COLUMN "decisionMakerRole",
DROP COLUMN "hasChampion",
DROP COLUMN "mainObjections",
DROP COLUMN "nextStepClarity",
DROP COLUMN "sentimentBreakdown",
DROP COLUMN "urgencyLevel",
ADD COLUMN     "interactionVolumeLevel" TEXT,
ADD COLUMN     "interactionVolumeRaw" TEXT,
ADD COLUMN     "leadSource" TEXT,
ADD COLUMN     "mainGoal" TEXT;

-- DropEnum
DROP TYPE "BudgetFit";

-- DropEnum
DROP TYPE "CompanySizeBucket";

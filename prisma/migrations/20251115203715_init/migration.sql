-- CreateEnum
CREATE TYPE "CompanySizeBucket" AS ENUM ('S_1_10', 'S_11_50', 'S_51_200', 'S_200_PLUS', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "BudgetFit" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('NEGATIVO', 'NEUTRO', 'POSITIVO');

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "salesRep" TEXT NOT NULL,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "closed" BOOLEAN NOT NULL,
    "transcript" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientInsight" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "industry" TEXT,
    "companySize" "CompanySizeBucket",
    "useCase" JSONB,
    "primaryPainPoints" JSONB,
    "urgencyLevel" INTEGER,
    "budgetFit" "BudgetFit",
    "decisionMakerRole" TEXT,
    "hasChampion" BOOLEAN,
    "mainObjections" JSONB,
    "sentiment" "Sentiment",
    "nextStepClarity" INTEGER,
    "transcriptWordCount" INTEGER,
    "topKeywords" JSONB,
    "productFamiliarity" TEXT,
    "sentimentBreakdown" JSONB,
    "engagementScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientInsight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Client_salesRep_idx" ON "Client"("salesRep");

-- CreateIndex
CREATE INDEX "Client_meetingDate_idx" ON "Client"("meetingDate");

-- CreateIndex
CREATE INDEX "Client_closed_idx" ON "Client"("closed");

-- CreateIndex
CREATE UNIQUE INDEX "ClientInsight_clientId_key" ON "ClientInsight"("clientId");

-- AddForeignKey
ALTER TABLE "ClientInsight" ADD CONSTRAINT "ClientInsight_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - The primary key for the `RoundTurn` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "RoundTurn" DROP CONSTRAINT "RoundTurn_pkey",
ALTER COLUMN "roundTurnId" SET DATA TYPE TEXT,
ALTER COLUMN "relatedOrderIds" SET DATA TYPE TEXT[],
ADD CONSTRAINT "RoundTurn_pkey" PRIMARY KEY ("roundTurnId");

-- CreateTable
CREATE TABLE "TopStepCSV" (
    "id" TEXT NOT NULL,
    "contractName" TEXT NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL,
    "exitedAt" TIMESTAMP(3) NOT NULL,
    "entryPrice" DOUBLE PRECISION NOT NULL,
    "exitPrice" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL,
    "profitAndLoss" DOUBLE PRECISION NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "tradeDay" TIMESTAMP(3) NOT NULL,
    "tradeDuration" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopStepCSV_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TopStepCSV_contractName_idx" ON "TopStepCSV"("contractName");

-- CreateIndex
CREATE INDEX "TopStepCSV_enteredAt_idx" ON "TopStepCSV"("enteredAt");

-- CreateIndex
CREATE INDEX "TopStepCSV_tradeDay_idx" ON "TopStepCSV"("tradeDay");

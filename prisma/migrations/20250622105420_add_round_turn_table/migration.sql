-- CreateTable
CREATE TABLE "RoundTurn" (
    "roundTurnId" BIGINT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "contractId" TEXT NOT NULL,
    "openOrderId" BIGINT NOT NULL,
    "openOrderTimestamp" TIMESTAMP(3) NOT NULL,
    "openTradeId" BIGINT NOT NULL,
    "openPrice" DOUBLE PRECISION NOT NULL,
    "intraHighPrice" DOUBLE PRECISION NOT NULL,
    "intraLowPrice" DOUBLE PRECISION NOT NULL,
    "maxFavorableExcursion" DOUBLE PRECISION NOT NULL,
    "maxAdverseExcursion" DOUBLE PRECISION NOT NULL,
    "closeOrderId" BIGINT NOT NULL,
    "closeOrderTimestamp" TIMESTAMP(3) NOT NULL,
    "closeTradeId" BIGINT NOT NULL,
    "closePrice" DOUBLE PRECISION NOT NULL,
    "profitAndLoss" DOUBLE PRECISION NOT NULL,
    "fees" DOUBLE PRECISION NOT NULL,
    "side" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "durationSeconds" INTEGER NOT NULL,
    "voided" BOOLEAN NOT NULL,
    "relatedOrderIds" BIGINT[],

    CONSTRAINT "RoundTurn_pkey" PRIMARY KEY ("roundTurnId")
);

-- AddForeignKey
ALTER TABLE "RoundTurn" ADD CONSTRAINT "RoundTurn_openOrderId_fkey" FOREIGN KEY ("openOrderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundTurn" ADD CONSTRAINT "RoundTurn_openTradeId_fkey" FOREIGN KEY ("openTradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundTurn" ADD CONSTRAINT "RoundTurn_closeOrderId_fkey" FOREIGN KEY ("closeOrderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoundTurn" ADD CONSTRAINT "RoundTurn_closeTradeId_fkey" FOREIGN KEY ("closeTradeId") REFERENCES "Trade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "Trade" (
    "id" BIGINT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "contractId" TEXT NOT NULL,
    "creationTimestamp" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "profitAndLoss" DOUBLE PRECISION,
    "fees" DOUBLE PRECISION NOT NULL,
    "side" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "voided" BOOLEAN NOT NULL,
    "orderId" BIGINT NOT NULL,

    CONSTRAINT "Trade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" BIGINT NOT NULL,
    "accountId" INTEGER NOT NULL,
    "contractId" TEXT NOT NULL,
    "creationTimestamp" TIMESTAMP(3) NOT NULL,
    "updateTimestamp" TIMESTAMP(3),
    "status" INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    "side" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "limitPrice" DOUBLE PRECISION,
    "stopPrice" DOUBLE PRECISION,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content" TEXT DEFAULT '',
    "updated_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rules_pkey" PRIMARY KEY ("id")
);

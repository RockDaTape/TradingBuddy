// scripts/build-roundturns.ts

// ─── Heartbeat log ─────────────────────────────────────────────────────────────
console.log("🔄 build-roundturns.ts starting…");

import { prisma } from '../server/db/client';

async function main() {
  // ─── 1. Load all historical trades and orders ─────────────────────────────────
  const trades = await prisma.trade.findMany();
  const orders = await prisma.order.findMany();

  // Quick sanity checks:
  console.log("Total trades:", trades.length);
  console.log("Non-voided trades:", trades.filter(t => !t.voided).length);
  console.log("Total orders:", orders.length);
  console.log(
    "Unique order statuses:",
    Array.from(new Set(orders.map(o => o.status)))
  );

  // Build a lookup map from orderId → Order record
  const orderById = new Map<string, typeof orders[0]>(
    orders.map(o => [o.id.toString(), o])
  );

  // ─── 2. Pair trades into “round turns” tracking each exit leg’s P&L ─────────────
  type Pair = {
    open:    { trade: typeof trades[0]; order: typeof orders[0] };
    close:   { trade: typeof trades[0]; order: typeof orders[0] };
    pnlLegs: number[];
  };
  const pairs: Pair[] = [];

  // Group and sort trades by contract symbol
  const tradesByContract = trades
    .filter(t => !t.voided)
    .sort((a, b) => a.creationTimestamp.getTime() - b.creationTimestamp.getTime())
    .reduce<Record<string, typeof trades>>((groups, t) => {
      (groups[t.contractId] = groups[t.contractId] || []).push(t);
      return groups;
    }, {});

  // Walk each contract’s series and detect flat state by counts
  for (const [_contract, series] of Object.entries(tradesByContract)) {
    let openSegment: Pair['open'] | null = null;
    let lastExit:    Pair['close'] | null = null;
    let openCount   = 0;
    let closeCount  = 0;
    let pnlLegs:    number[] = [];

    for (const t of series) {
      const o = orderById.get(t.orderId.toString());
      if (!t || !o) continue;

      if (t.profitAndLoss == null) {
        // entry or scale-in
        openCount++;
        if (openCount === 1) {
          // first null after flat → open a new round-turn
          openSegment = { trade: t, order: o };
          // reset exit tracking
          closeCount = 0;
          lastExit   = null;
          pnlLegs    = [];
        }
      } else {
        // exit or scale-out
        closeCount++;
        lastExit = { trade: t, order: o };
        pnlLegs.push(t.profitAndLoss);
      }

      // when flat (opens == closes), close the round-turn
      if (openCount > 0 && openCount === closeCount && openSegment && lastExit) {
        pairs.push({ open: openSegment, close: lastExit, pnlLegs });
        // reset for next
        openSegment = null;
        lastExit    = null;
        openCount   = 0;
        closeCount  = 0;
        pnlLegs     = [];
      }
    }
  }

  console.log(`Built ${pairs.length} open/close pairs.`);

  // ─── 3. Compute metrics & upsert RoundTurn records using pnlLegs sums ─────────
  let successCount = 0;
  let errorCount   = 0;

  for (const { open, close, pnlLegs } of pairs) {
    const openTs  = open.order.creationTimestamp;
    const closeTs = close.order.updateTimestamp ?? close.trade.creationTimestamp;
    const roundIdStr = `${open.trade.id}${close.trade.id}`;

    // Sum P&L legs for the round-trip
    const roundPnl = pnlLegs.reduce((sum, p) => sum + p, 0);

    // All orders within the window as string[]
    const relatedIdsStr = orders
      .filter(o => o.creationTimestamp >= openTs && o.creationTimestamp <= closeTs)
      .map(o => o.id.toString());

    // Placeholder intraday high/low
    const intraHigh = Math.max(open.trade.price, close.trade.price);
    const intraLow  = Math.min(open.trade.price, close.trade.price);

    try {
      await prisma.roundTurn.upsert({
        where: { roundTurnId: roundIdStr },
        create: {
          roundTurnId:           roundIdStr,
          accountId:             open.trade.accountId,
          contractId:            open.trade.contractId,

          openOrderId:           open.order.id,
          openOrderTimestamp:    open.order.creationTimestamp,
          openTradeId:           open.trade.id,
          openPrice:             open.trade.price,

          intraHighPrice:        intraHigh,
          intraLowPrice:         intraLow,
          maxFavorableExcursion: intraHigh - open.trade.price,
          maxAdverseExcursion:   open.trade.price - intraLow,

          closeOrderId:          close.order.id,
          closeOrderTimestamp:   closeTs,
          closeTradeId:          close.trade.id,
          closePrice:            close.trade.price,

          profitAndLoss:         roundPnl,
          fees:                  open.trade.fees + close.trade.fees,
          side:                  open.trade.side,
          size:                  open.trade.size,
          durationSeconds:       Math.floor((closeTs.getTime() - openTs.getTime()) / 1000),
          voided:                false,

          relatedOrderIds:       relatedIdsStr,
        },
        update: { /* no-op */ },
      });
      successCount++;
    } catch (e) {
      console.error("Failed to upsert roundTurn", roundIdStr, e);
      errorCount++;
    }
  }

  console.log(`✅ Successfully wrote ${successCount} round-turns.`);
  if (errorCount) console.warn(`⚠️ ${errorCount} failed.`);
  await prisma.$disconnect();
}

console.log("👉 Scheduling main()");
main()
  .then(() => {
    console.log("✅ main() completed");
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error("❌ Error in main():", e);
    prisma.$disconnect().finally(() => process.exit(1));
  });

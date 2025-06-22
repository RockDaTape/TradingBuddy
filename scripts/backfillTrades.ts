#!/usr/bin/env tsx

import { PrismaClient }      from '@prisma/client'
import { fetchTrades, fetchOrders } from '../server/utils/topstepClient'
import type { Trade }        from '../app/types/trade'
import type { Order }        from '../app/types/order'

// detect --dry-run flag
const dryRun = process.argv.includes('--dry-run')

async function backfill(): Promise<void> {
  const prisma = new PrismaClient()
  const allTrades: Trade[] = dryRun ? [] : []
  const allOrders: Order[] = dryRun ? [] : []

  // 1) historic start & window size
  const accountOpened = new Date('2023-01-01T00:00:00Z') // ← adjust if needed
  const windowDays    = 30
  let windowStart    = accountOpened

  while (true) {
    // compute window
    const provisionalEnd = new Date(windowStart)
    provisionalEnd.setDate(provisionalEnd.getDate() + windowDays)
    const now       = new Date()
    const windowEnd = provisionalEnd > now ? now : provisionalEnd

    // <-- keep exactly one line per window -->
    console.log(`⏳ Fetching ${windowStart.toISOString()} → ${windowEnd.toISOString()}`)

    // --- TRADES ---
    const trades: Trade[] = await fetchTrades(
      windowStart.toISOString(),
      windowEnd.toISOString()
    )
    const validTrades = trades.filter(t => t.id != null && t.orderId != null)
    if (validTrades.length !== trades.length) {
      console.warn(`⚠️  Skipped ${trades.length - validTrades.length} invalid trades`)
    }
    if (dryRun) {
      allTrades.push(...validTrades)
    } else {
      await Promise.all(validTrades.map(t =>
        prisma.trade.upsert({
          where: { id: BigInt(t.id) },
          update: {
            price:         t.price,
            profitAndLoss: t.profitAndLoss,
          },
          create: {
            id:                BigInt(t.id),
            accountId:         Number(process.env.TOPSTEP_ACCOUNT_ID),
            contractId:        t.symbol,
            creationTimestamp: new Date(t.timestamp),
            price:             t.price,
            profitAndLoss:     t.profitAndLoss,
            fees:              t.fees,
            side:              t.side === 'BUY' ? 1 : 0,
            size:              t.size,
            voided:            t.voided,
            orderId:           BigInt(t.orderId),
          },
        })
      ))
    }

    // --- ORDERS ---
    const orders: Order[] = await fetchOrders(
      windowStart.toISOString(),
      windowEnd.toISOString()
    )
    const validOrders = orders.filter(o => o.id != null)
    if (validOrders.length !== orders.length) {
      console.warn(`⚠️  Skipped ${orders.length - validOrders.length} invalid orders`)
    }
    if (dryRun) {
      allOrders.push(...validOrders)
    } else {
      await Promise.all(validOrders.map(o =>
        prisma.order.upsert({
          where: { id: o.id },
          update: {
            status:          o.status,
            updateTimestamp: o.updateTimestamp ? new Date(o.updateTimestamp) : null,
            limitPrice:      o.limitPrice,
            stopPrice:       o.stopPrice,
          },
          create: {
            id:                o.id,
            accountId:         o.accountId,
            contractId:        o.contractId,
            creationTimestamp: new Date(o.creationTimestamp),
            updateTimestamp:   o.updateTimestamp ? new Date(o.updateTimestamp) : null,
            status:            o.status,
            type:              o.type,
            side:              o.side,
            size:              o.size,
            limitPrice:        o.limitPrice,
            stopPrice:         o.stopPrice,
          },
        })
      ))
    }

    // done?
    if (windowEnd.getTime() === now.getTime()) {
      console.log(dryRun
        ? '✅ [dry-run] complete'
        : '✅ Backfill complete')
      break
    }

    // advance slice
    windowStart = new Date(windowEnd)
    windowStart.setSeconds(windowStart.getSeconds() + 1)
  }

  if (dryRun) {
    // for dry-run just spit out counts
    console.log(`Collected ${allTrades.length} trades and ${allOrders.length} orders`)
    process.exit(0)
  }

  await prisma.$disconnect()
}

backfill().catch(err => {
  console.error(err)
  process.exit(1)
})

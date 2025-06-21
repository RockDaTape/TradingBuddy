#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'
import { fetchTrades }  from '../server/utils/topstepClient'
import type { Trade }    from '../app/types/trade'

// detect --dry-run flag
const dryRun = process.argv.includes('--dry-run')

async function backfill(): Promise<void> {
  const prisma = new PrismaClient()

  // if dry-run, collect everything here; otherwise we'll skip collecting
  const allTrades: Trade[] = dryRun ? [] : []

  // 1) historic start & window size
  const accountOpened = new Date('2023-01-01T00:00:00Z') // ← adjust if needed
  const windowDays    = 30

  let windowStart = accountOpened

  while (true) {
    // provisional 30-day end
    const provisionalEnd = new Date(windowStart)
    provisionalEnd.setDate(provisionalEnd.getDate() + windowDays)

    // clamp to now on the last batch
    const now       = new Date()
    const windowEnd = provisionalEnd > now ? now : provisionalEnd

    console.error(`🟢 Fetching trades ${windowStart.toISOString()} → ${windowEnd.toISOString()}`)

    // fetchTrades returns Trade[]
    const trades: Trade[] = await fetchTrades(
      windowStart.toISOString(),
      windowEnd.toISOString()
    )

    // filter out any with missing id/orderId
    const validTrades = trades.filter(t => t.id != null && t.orderId != null)
    if (validTrades.length !== trades.length) {
      console.error(`⚠️  Skipping ${trades.length - validTrades.length} trades with missing id/orderId`)
    }

    if (dryRun) {
      allTrades.push(...validTrades)
      console.error(`🟢 [dry-run] collected ${validTrades.length} trades`)
    } else {
      // upsert each valid trade
      await Promise.all(
        validTrades.map(t =>
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
        )
      )
    }

    // if we just used “now”, we’re caught up
    if (windowEnd.getTime() === now.getTime()) {
      console.error(dryRun
        ? '✔ [dry-run] backfill complete'
        : '✔ Backfill complete (caught up to now)')
      break
    }

    // advance to next slice
    windowStart = new Date(windowEnd)
    windowStart.setSeconds(windowStart.getSeconds() + 1)
  }

  if (dryRun) {
    // emit just the JSON array on stdout and exit
    console.log(JSON.stringify(allTrades, null, 2))
    process.exit(0)
  }

  await prisma.$disconnect()
}

backfill().catch(err => {
  console.error(err)
  process.exit(1)
})

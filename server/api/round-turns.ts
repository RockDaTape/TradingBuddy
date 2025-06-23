// server/api/round-turns.ts
import { defineEventHandler, getQuery, createError } from 'h3'
import { parseISO } from 'date-fns'
import { prisma } from '../../server/db/client'

export default defineEventHandler(async (event) => {
  const { start, end } = getQuery(event)
  if (!start || !end) {
    throw createError({ statusCode: 400, statusMessage: 'start and end are required' })
  }

  const startDate = parseISO(Array.isArray(start) ? start[0] : start)
  const endDate   = parseISO(Array.isArray(end)   ? end[0]   : end)

  // Fetch raw RoundTurn records (with BigInt fields)
  const rawRounds = await prisma.roundTurn.findMany({
    where: {
      openOrderTimestamp:  { gte: startDate },
      closeOrderTimestamp: { lte: endDate   },
    },
    orderBy: { openOrderTimestamp: 'desc' },
  })

  // Serialize BigInt and Date fields for JSON
  const rounds = rawRounds.map(r => ({
    roundTurnId:            r.roundTurnId.toString(),
    accountId:              r.accountId,
    contractId:             r.contractId,
    openOrderId:            r.openOrderId.toString(),
    openOrderTimestamp:     r.openOrderTimestamp.toISOString(),
    openTradeId:            r.openTradeId.toString(),
    openPrice:              r.openPrice,
    intraHighPrice:         r.intraHighPrice,
    intraLowPrice:          r.intraLowPrice,
    maxFavorableExcursion:  r.maxFavorableExcursion,
    maxAdverseExcursion:    r.maxAdverseExcursion,
    closeOrderId:           r.closeOrderId.toString(),
    closeOrderTimestamp:    r.closeOrderTimestamp.toISOString(),
    closeTradeId:           r.closeTradeId.toString(),
    closePrice:             r.closePrice,
    profitAndLoss:          r.profitAndLoss,
    fees:                   r.fees,
    side:                   r.side,
    size:                   r.size,
    durationSeconds:        r.durationSeconds,
    voided:                 r.voided,
    relatedOrderIds:        r.relatedOrderIds.map(id => id.toString()),
  }))

  return rounds
})

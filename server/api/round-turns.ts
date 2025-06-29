// server/api/round-turns.ts
// API endpoint for fetching round turn records within a specified date range.
// Handles query parameters and returns serialized round turn data.
import {defineEventHandler, getQuery, createError} from 'h3'
import {parseISO} from 'date-fns'
import {prisma} from '../../server/db/client'

export default defineEventHandler(async (event) => {
  // Extract and validate required date range parameters
  const {start, end} = getQuery(event)
  if (!start || !end) {
    throw createError({statusCode: 400, statusMessage: 'start and end are required'})
  }

  const startDate = parseISO(Array.isArray(start) ? start[0] : start)
  const endDate = parseISO(Array.isArray(end) ? end[0] : end)

  // Fetch RoundTurn records with simple structure
  const rounds = await prisma.roundTurn.findMany({
    where: {
      entryTime: {gte: startDate},
      exitTime: {lte: endDate},
    },
    orderBy: {entryTime: 'desc'},
  })

  // Convert to JSON-safe format
  const serializedRounds = rounds.map(r => ({
    id: r.id,
    symbol: r.symbol,
    size: r.size,
    entryTime: r.entryTime.toISOString(),
    exitTime: r.exitTime.toISOString(),
    entryPrice: r.entryPrice,
    exitPrice: r.exitPrice,
    pnl: r.pnl,
    fees: r.fees,
    direction: r.direction,
    importedAt: r.importedAt.toISOString(),
  }))

  return serializedRounds
})

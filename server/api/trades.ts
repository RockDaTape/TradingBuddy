// server/api/trades.ts
import { defineEventHandler, getQuery } from 'h3'
import { fetchTrades } from '../utils/topstepClient'

export default defineEventHandler(async (event) => {
  const { start, end } = getQuery(event)
  if (!start || !end) {
    event.node.res.statusCode = 400
    return { error: 'Missing required start or end timestamp' }
  }

  try {
    const trades = await fetchTrades(start as string, end as string)
    return { trades }
  } catch (err: any) {
    // Log the full stack or message so you can see why it failed
    console.error('🔴 /api/trades error:', err)
    event.node.res.statusCode = 502
    return { error: err.message || 'Unknown server error' }
  }
})

/**
 * server/api/round-turns/[id].patch.ts
 *
 * API endpoint to update trade notes/journal content.
 * Simple PATCH endpoint similar to rules page approach.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const tradeId = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!tradeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Trade ID is required'
      })
    }

    // Update the notes field
    const updatedTrade = await prisma.roundTurn.update({
      where: { id: tradeId },
      data: { notes: body.notes || body.content }
    })

    return updatedTrade

  } catch (error) {
    console.error('Error updating trade:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update trade'
    })
  }
})

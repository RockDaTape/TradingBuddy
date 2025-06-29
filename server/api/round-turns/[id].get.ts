/**
 * server/api/round-turns/[id].get.ts
 *
 * API endpoint to fetch individual trade (round turn) data by ID.
 * Returns the complete trade data including notes field.
 *
 * Route: GET /api/round-turns/{id}
 * Returns: Individual RoundTurn object or 404 if not found
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Get the trade ID from the URL parameter
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Trade ID is required'
      })
    }

    // Fetch the specific trade from the database
    const trade = await prisma.roundTurn.findUnique({
      where: {
        id: id
      }
    })

    // Check if trade exists
    if (!trade) {
      throw createError({
        statusCode: 404,
        statusMessage: `Trade with ID '${id}' not found`
      })
    }

    // Return the trade data
    return trade

  } catch (error) {
    console.error('Error fetching individual trade:', error)

    // If it's already a structured error, re-throw it
    if (error.statusCode) {
      throw error
    }

    // For unexpected errors, return a generic 500 error
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while fetching trade data'
    })
  }
})

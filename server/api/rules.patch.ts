/**
 * server/api/rules.patch.ts
 *
 * PATCH endpoint for updating trading rules content in the database.
 * This endpoint handles auto-save functionality from the TipTap editor,
 * updating existing rules or creating a new entry if none exists.
 *
 * Route: PATCH /api/rules
 */

import { prisma } from '../db/client'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const content = body.content || ''

    console.log('💾 Updating rules content, length:', content.length)

    // Try to find existing rules record
    const existingRules = await prisma.rules.findFirst({
      select: { id: true }
    })

    let rules

    if (existingRules) {
      // Update existing rules record
      console.log('📝 Updating existing rules with ID:', existingRules.id)

      rules = await prisma.rules.update({
        where: { id: existingRules.id },
        data: {
          content: content,
          updated_at: new Date()  // Use snake_case field name
        },
        select: {
          id: true,
          content: true,
          created_at: true,
          updated_at: true
        }
      })
    } else {
      // Create new rules entry if none exists
      console.log('📝 Creating new rules entry...')

      rules = await prisma.rules.create({
        data: {
          content: content
        },
        select: {
          id: true,
          content: true,
          created_at: true,
          updated_at: true
        }
      })
    }

    console.log('✅ Rules saved successfully')

    // Return camelCase fields to the frontend
    return {
      id: rules.id,
      content: rules.content,
      createdAt: rules.created_at.toISOString(),
      updatedAt: rules.updated_at.toISOString()
    }

  } catch (error: any) {
    console.error('❌ Error in rules PATCH endpoint:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code
    })

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update trading rules in database: ${error?.message || 'Unknown error'}`
    })
  }
})

/**
 * server/api/rules.get.ts
 *
 * GET endpoint for fetching trading rules content from the database.
 * This endpoint handles retrieving the user's trading rules, creating
 * a default empty entry if no rules exist yet.
 *
 * Route: GET /api/rules
 */

import { prisma } from '../db/client'

export default defineEventHandler(async () => {
  try {
    console.log('📖 Fetching rules from database...')

    // Attempt to fetch existing rules record using snake_case field names
    let rules = await prisma.rules.findFirst({
      select: {
        id: true,
        content: true,
        created_at: true,
        updated_at: true
      }
    })

    // If no rules exist, create a default empty entry
    if (!rules) {
      console.log('📝 No rules found, creating default entry...')

      // Default content with proper HTML structure for TipTap editor
      const defaultContent = `
        <h1>Welcome to Your Trading Rulebook</h1>
        <p>This is your space to define the personal guidelines that keep you consistent, disciplined, and accountable—day in and day out.</p>
        <p>Start by writing down your core trading principles, such as:</p>
        <ul>
          <li>Risk limits and position sizing rules</li>
          <li>When to walk away from the screen</li>
          <li>How you respond to losing streaks</li>
          <li>Emotional guardrails and mindset reminders</li>
        </ul>
        <p>These aren't strategies—they're your guardrails. Keep them simple, clear, and tailored to you. This rulebook is here to keep you grounded when the market isn't.</p>
      `.trim()

      try {
        rules = await prisma.rules.create({
          data: {
            content: defaultContent,
          },
          select: {
            id: true,
            content: true,
            created_at: true,
            updated_at: true
          }
        })

        console.log('✅ Created default rules entry with ID:', rules.id)
      } catch (createError: any) {
        console.error('❌ Failed to create default rules entry:', createError)
        throw createError
      }
    } else {
      console.log('✅ Found existing rules with ID:', rules.id)
    }

    // Return with camelCase fields for the frontend
    return {
      id: rules.id,
      content: rules.content,
      createdAt: rules.created_at.toISOString(),
      updatedAt: rules.updated_at.toISOString()
    }

  } catch (error: any) {
    console.error('❌ Error in rules GET endpoint:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      code: error?.code
    })

    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch trading rules from database: ${error?.message || 'Unknown error'}`
    })
  }
})

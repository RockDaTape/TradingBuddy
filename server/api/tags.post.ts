import { prisma } from '../../server/db/client'
import { z } from 'zod'

const addTagsSchema = z.object({
  tagIds: z.array(z.number()).min(1, 'At least one tag ID is required')
})

export default defineEventHandler(async (event) => {
  try {
    const roundTurnId = getRouterParam(event, 'id')
    if (!roundTurnId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Round turn ID is required'
      })
    }

    const body = await readBody(event)
    const { tagIds } = addTagsSchema.parse(body)

    // Create the tag associations
    const roundTurnTags = await Promise.all(
      tagIds.map(tagId =>
        prisma.roundTurnTag.upsert({
          where: {
            round_turn_id_tag_id: {
              round_turn_id: roundTurnId,
              tag_id: tagId
            }
          },
          update: {},
          create: {
            round_turn_id: roundTurnId,
            tag_id: tagId
          }
        })
      )
    )

    return roundTurnTags
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid input data',
        data: error.errors
      })
    }

    console.error('Error adding tags to round turn:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to add tags to round turn'
    })
  }
})

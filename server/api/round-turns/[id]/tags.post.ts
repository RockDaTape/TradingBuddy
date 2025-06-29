import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tag_group_id: z.number().min(1, 'Tag group ID is required')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createTagSchema.parse(body)

    const tag = await prisma.tag.create({
      data: validatedData,
      include: {
        tag_group: true,
        round_turn_tags: true
      }
    })

    return tag
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid input data',
        data: error.errors
      })
    }

    console.error('Error creating tag:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create tag'
    })
  }
})

import { prisma } from '../../server/db/client'
import { z } from 'zod'

const createTagGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().optional()
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createTagGroupSchema.parse(body)

    const tagGroup = await prisma.tagGroup.create({
      data: validatedData,
      include: {
        tags: true
      }
    })

    return tagGroup
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid input data',
        data: error.errors
      })
    }

    console.error('Error creating tag group:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create tag group'
    })
  }
})

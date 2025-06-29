import { prisma } from '../../../db/client'
import { z } from 'zod'

const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tag_group_id: z.number().min(1, 'Tag group ID is required')
})

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const validatedData = createTagSchema.parse(body)

    // Check if the tag group exists
    const tagGroup = await prisma.tagGroup.findUnique({
      where: { id: validatedData.tag_group_id }
    })

    if (!tagGroup) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tag group not found'
      })
    }

    // Check for duplicate tag names within the same group
    const existingTag = await prisma.tag.findFirst({
      where: {
        name: validatedData.name,
        tag_group_id: validatedData.tag_group_id
      }
    })

    if (existingTag) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A tag with this name already exists in this group'
      })
    }

    // Create the new tag
    return await prisma.tag.create({
      data: validatedData,
      include: {
        tag_group: true,
        round_turn_tags: true
      }
    })
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid input data',
        data: error.errors
      })
    }

    if (error.statusCode) {
      throw error
    }

    console.error('Error creating tag:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create tag'
    })
  }
})

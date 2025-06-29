import { prisma } from '../../server/db/client'

export default defineEventHandler(async (event) => {
  try {
    const tagGroups = await prisma.tagGroup.findMany({
      include: {
        tags: {
          include: {
            round_turn_tags: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return tagGroups
  } catch (error) {
    console.error('Error fetching tag groups:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tag groups'
    })
  }
})


import { prisma } from '../../server/db/client'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const tagGroupId = query.tagGroupId ? parseInt(query.tagGroupId as string) : undefined

    const tags = await prisma.tag.findMany({
      where: tagGroupId ? { tag_group_id: tagGroupId } : undefined,
      include: {
        tag_group: true,
        round_turn_tags: {
          include: {
            round_turn: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return tags
  } catch (error) {
    console.error('Error fetching tags:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch tags'
    })
  }
})

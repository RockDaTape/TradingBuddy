import { prisma } from '../../db/client'

export default defineEventHandler(async (event) => {
  try {
    // Get the tag ID from the route parameter
    const id = getRouterParam(event, 'id')

    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid tag ID'
      })
    }

    const tagId = parseInt(id)

    // Check if the tag exists
    const existingTag = await prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        tag_group: true,
        round_turn_tags: true
      }
    })

    if (!existingTag) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tag not found'
      })
    }

    // Delete the tag (this will also delete associated round_turn_tags due to cascade)
    await prisma.tag.delete({
      where: { id: tagId }
    })

    console.log(`✅ Deleted tag: ${existingTag.name} (ID: ${tagId}) from group: ${existingTag.tag_group.name}`)

    return {
      success: true,
      message: `Tag "${existingTag.name}" deleted successfully`,
      tagGroupName: existingTag.tag_group.name,
      usageCount: existingTag.round_turn_tags.length
    }
  } catch (error: any) {
    console.error('Error deleting tag:', error)

    // Handle Prisma foreign key constraint errors
    if (error?.code === 'P2003') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete tag: it is being used by existing trades'
      })
    }

    // Re-throw createError instances
    if (error?.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete tag'
    })
  }
})

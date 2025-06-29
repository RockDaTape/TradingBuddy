import { prisma } from '../../db/client'

export default defineEventHandler(async (event) => {
  try {
    // Get the tag group ID from the route parameter
    const id = getRouterParam(event, 'id')

    if (!id || isNaN(Number(id))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid tag group ID'
      })
    }

    const tagGroupId = parseInt(id)

    // Check if the tag group exists
    const existingTagGroup = await prisma.tagGroup.findUnique({
      where: { id: tagGroupId },
      include: { tags: true }
    })

    if (!existingTagGroup) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Tag group not found'
      })
    }

    // Delete the tag group (this will cascade delete all associated tags)
    await prisma.tagGroup.delete({
      where: { id: tagGroupId }
    })

    console.log(`✅ Deleted tag group: ${existingTagGroup.name} (ID: ${tagGroupId}) with ${existingTagGroup.tags.length} tags`)

    return {
      success: true,
      message: `Tag group "${existingTagGroup.name}" deleted successfully`,
      deletedTagsCount: existingTagGroup.tags.length
    }
  } catch (error: any) {
    console.error('Error deleting tag group:', error)

    // Handle Prisma foreign key constraint errors
    if (error?.code === 'P2003') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete tag group: it is being used by existing trades'
      })
    }

    // Re-throw createError instances
    if (error?.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete tag group'
    })
  }
})

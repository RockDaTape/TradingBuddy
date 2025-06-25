export const useImageUpload = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const uploadImage = async (
    file: File,
    context: 'trade' | 'page' | 'note' = 'page',
    contextId?: string
  ): Promise<string> => {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file')
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size should be less than 5MB')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

    // DEV MODE: Simple folder structure without user auth
    const isDev = process.env.NODE_ENV === 'development'

    let filePath: string

    if (isDev || !user.value) {
      // Development path - no auth required
      filePath = `dev/${context}/${contextId || 'general'}/${fileName}`
    } else {
      // Production path - with user auth
      let folderPath: string
      switch (context) {
        case 'trade':
          if (!contextId) throw new Error('Trade ID required for trade images')
          folderPath = `users/${user.value.id}/trades/${contextId}`
          break
        case 'page':
          folderPath = `users/${user.value.id}/pages/${contextId || 'general'}`
          break
        case 'note':
          folderPath = `users/${user.value.id}/notes`
          break
        default:
          folderPath = `users/${user.value.id}/general`
      }
      filePath = `${folderPath}/${fileName}`
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return urlData.publicUrl
  }

  const deleteImage = async (filePath: string): Promise<void> => {
    // Extract path from full URL if needed
    const path = filePath.includes('/storage/v1/object/public/images/')
      ? filePath.split('/storage/v1/object/public/images/')[1]
      : filePath

    const { error } = await supabase.storage
      .from('images')
      .remove([path])

    if (error) {
      console.error('Delete error:', error)
      throw new Error('Failed to delete image')
    }
  }

  return {
    uploadImage,
    deleteImage
  }
}

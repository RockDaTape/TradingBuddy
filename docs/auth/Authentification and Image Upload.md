# Authentication & Image Upload Documentation

## Overview

This project uses Supabase for authentication and file storage. Currently implemented with a development-first approach that gracefully handles both authenticated and non-authenticated states.

## Current Implementation Status

### ✅ Completed
- **Supabase Integration**: Client setup with authentication and storage
- **Image Upload System**: Full composable with context-aware file organization
- **Development Mode**: No-auth development environment for easy testing
- **File Organization**: Smart folder structure based on user context and content type

### 🚧 In Progress
- Route protection middleware
- User session management
- Production authentication flow

### 📋 Planned
- User onboarding/registration flow
- Role-based permissions
- Password reset functionality
- User profile management

## Image Upload Implementation

### Architecture

The image upload system (`composables/useImageUpload.ts`) handles:
- File validation (type, size limits)
- Context-aware storage organization
- Dual-mode operation (dev/production)
- Public URL generation

### Storage Structure

supabase-storage/ ├── dev/ # Development uploads │ ├── trade/[tradeId]/ # Trade-specific images │ ├── page/[pageId]/ # Page/content images │ └── note/ # Note attachments └── users/[userId]/ # Production user-scoped uploads ├── trades/[tradeId]/ # User's trade images ├── pages/[pageId]/ # User's page images ├── notes/ # User's note attachments └── general/ # Miscellaneous uploads

### Usage Examples

typescript // Basic image upload const { uploadImage } = useImageUpload() const imageUrl = await uploadImage(file, 'page', 'dashboard')
// Trade-specific upload const tradeImageUrl = await uploadImage(file, 'trade', tradeId.toString())
// General upload (development) const generalUrl = await uploadImage(file)


## Authentication Strategy

### Development Mode
- **No authentication required** for testing
- Files stored in `/dev/` bucket
- Allows rapid development and testing
- Environment: `NODE_ENV === 'development'`

### Production Mode
- **User authentication required** via Supabase Auth
- Files organized by user ID
- Proper access control and permissions
- Context-aware file organization

### Security Considerations

1. **File Validation**: Type and size restrictions (5MB limit, images only)
2. **Path Isolation**: User files completely separated in production
3. **Public URLs**: Generated through Supabase's secure URL system
4. **Development Safety**: Dev files clearly separated from production

## Integration Points

### TiptapEditor Integration
- Drag & drop image uploads
- Automatic insertion into editor content
- Error handling with toast notifications
- Progress feedback during uploads

### Toast Notifications

typescript // Success toast.add({ title: 'Image uploaded successfully', color: 'success' })
// Error handling toast.add({ title: 'Upload failed', description: error.message, color: 'error' })

## Environment Configuration

### Required Environment Variables

bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url SUPABASE_ANON_KEY=your_supabase_anon_key
# Optional: Development mode override
NODE_ENV=development


### Supabase Storage Setup
1. Create `images` bucket in Supabase Storage
2. Configure appropriate RLS policies
3. Set public access for uploaded files

## Known Issues & Workarounds

### TypeScript Type Issues
- File extension extraction: `file.name.split('.').pop()` can return `undefined`
- **Workaround**: Currently ignored with `// @ts-ignore` for rapid development
- **Future**: Add proper type guards when stabilizing

### Color Type Restrictions
- Nuxt UI toast colors limited to specific values
- Use `'success'` instead of `'green'`, `'error'` instead of `'red'`

## Next Steps

### Short Term (Current Sprint)
1. Implement route protection middleware
2. Add user session state management
3. Create basic login/logout flow

### Medium Term
1. User registration and onboarding
2. Profile management system
3. Proper error boundaries for auth failures

### Long Term
1. Role-based access control
2. Advanced file management (delete, organize)
3. User preferences and settings

## Development Notes

- **Philosophy**: Development-first approach allows rapid iteration
- **File Organization**: Context-aware storage prevents file conflicts
- **Error Handling**: Graceful degradation when auth is unavailable
- **Testing Strategy**: Dev mode enables testing without auth complexity

## Troubleshooting

### Common Issues
1. **Upload failures**: Check Supabase bucket permissions
2. **Type errors**: Temporarily ignore with `// @ts-ignore` during development
3. **File not found**: Verify storage bucket configuration
4. **Toast color errors**: Use only approved Nuxt UI color values

### Debug Mode
Enable debug logging by checking browser console during uploads for detailed error information.

# Development Mode Guide

## Quick Start

1. **No Authentication Required**: Start developing immediately
2. **File Uploads**: Work in `/dev/` storage bucket
3. **Testing**: All features available without login

## Development Benefits

- **Rapid Prototyping**: Test image uploads immediately
- **No Auth Complexity**: Focus on feature development
- **Clear Separation**: Dev files isolated from production
- **Easy Debugging**: Console logging enabled

## Switching to Production Mode

When ready for production authentication:
1. Set `NODE_ENV=production`
2. Implement user registration flow
3. Files automatically move to user-scoped storage
4. Authentication becomes required

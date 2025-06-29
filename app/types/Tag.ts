/**
 * types/Tag.ts
 *
 * TypeScript type definitions for the tagging system.
 * These interfaces match our Prisma database models to ensure type safety
 * across the frontend application.
 */

// Main TagGroup interface - represents a category of tags
export interface TagGroup {
  id: number
  name: string                    // e.g., "Trading Strategies"
  description?: string            // Optional description
  color?: string                  // Hex color for UI display
  created_at: Date
  updated_at: Date
  tags: Tag[]                     // All tags belonging to this group
}

// Individual Tag interface - specific labels within a group
export interface Tag {
  id: number
  name: string                    // e.g., "Breakout", "Support Level"
  tag_group_id: number           // Foreign key to TagGroup
  created_at: Date
  updated_at: Date
  tag_group: TagGroup            // Parent group information
  round_turn_tags: RoundTurnTag[] // All associations with trades
}

// Junction table interface - links tags to specific trades
export interface RoundTurnTag {
  id: number
  round_turn_id: string          // Foreign key to RoundTurn (trade)
  tag_id: number                 // Foreign key to Tag
  created_at: Date
  tag?: Tag                      // Optional tag details
  round_turn?: any               // Replace with your RoundTurn type when available
}

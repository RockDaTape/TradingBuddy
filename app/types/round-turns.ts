/**
 * app/types/round-turns.ts
 *
 * TypeScript interfaces for round turn trading records.
 * Represents consolidated trading data that combines overlapping trades
 * into complete round turn cycles (entry to exit).
 */

// Interface for individual round turn trading records
export interface RoundTurn {
  // Core trade identification
  id: string                       // Concatenated TopStep IDs of underlying trades
  symbol: string                   // Contract/instrument symbol traded

  // Position details
  size: number                     // Total size/volume of position
  direction: string                // Position direction: "Long" or "Short"

  // Timing information
  entryTime: string               // ISO timestamp when position was opened
  exitTime: string                // ISO timestamp when position was closed

  // Price and financial data
  entryPrice: number              // Volume-weighted average entry price
  exitPrice: number               // Volume-weighted average exit price
  pnl: number                     // Net profit/loss for the round turn
  fees: number                    // Total trading fees/commissions

  // Metadata and tracking
  importedAt: string              // ISO timestamp when record was imported

  // NEW: Additional fields for trade journaling and tagging
  notes?: string                  // Optional trade journal notes (HTML content)
  updatedAt?: string             // ISO timestamp when record was last updated
  round_turn_tags?: RoundTurnTag[] // Associated tag relationships
}

// Interface for the relationship between round turns and tags
export interface RoundTurnTag {
  id: number                      // Unique identifier for the tag relationship
  round_turn_id: string          // Foreign key to RoundTurn
  tag_id: number                 // Foreign key to Tag

  // Related tag information (populated via database joins)
  tag: {
    id: number                    // Tag identifier
    name: string                  // Tag display name
    tag_group: {                  // Parent tag group information
      id: number                  // Tag group identifier
      name: string                // Tag group name
      color?: string              // Optional color for visual organization
    }
  }
}

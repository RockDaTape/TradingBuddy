/**
 * app/types/Rules.ts
 *
 * TypeScript interface definitions for trading rules data structure.
 * Defines the shape of rules objects returned from API endpoints
 * and used throughout the application.
 */

/**
 * Represents a trading rules record from the database
 */
export interface Rules {
  id: string           // Unique identifier for the rules record
  content: string      // HTML content from TiptapEditor (trading rules text)
  createdAt: string    // ISO timestamp when rules were first created
  updatedAt: string    // ISO timestamp when rules were last modified
}

/**
 * Request payload for updating rules content
 */
export interface UpdateRulesRequest {
  content: string      // New HTML content to save
}

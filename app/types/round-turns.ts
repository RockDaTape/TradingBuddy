/**
 * Represents a consolidated round turn trading record that combines overlapping trades
 */
export interface RoundTurn {
  id: string   // Concatenated TopStep IDs of underlying trades
  symbol: string   // Contract/instrument symbol traded
  size: number   // Total size/volume of position
  entryTime: string   // ISO timestamp when position was opened
  exitTime: string   // ISO timestamp when position was closed
  entryPrice: number   // Volume-weighted average entry price
  exitPrice: number   // Volume-weighted average exit price
  pnl: number   // Net profit/loss for the round turn
  fees: number   // Total trading fees/commissions
  direction: string   // Position direction: "Long" or "Short"
  importedAt: string   // ISO timestamp when record was imported
}

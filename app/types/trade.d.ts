// app/types/trade.d.ts
export interface Trade {
  id: string
  timestamp: string      // ISO timestamp
  symbol: string
  side: 'BUY' | 'SELL'
  price: number
  profitAndLoss: number
}

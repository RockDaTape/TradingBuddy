export interface Trade {
  id:             number
  timestamp:      string
  symbol:         string
  side:           'BUY' | 'SELL'
  price:          number
  profitAndLoss:  number | null

  // ← added:
  fees:           number
  size:           number
  voided:         boolean
  orderId:        number
}

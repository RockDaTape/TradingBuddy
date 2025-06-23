// types/round-turns.ts
export interface RoundTurn {
  roundTurnId:           string
  accountId:             number
  contractId:            string
  openOrderId:           string
  openOrderTimestamp:    string
  // …the rest of the fields from your API…
  voided:                boolean
  relatedOrderIds:       string[]
}

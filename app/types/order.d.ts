// app/types/order.d.ts

export interface Order {
  /** Unique order ID */
  id: number

  /** Your Topstep account ID */
  accountId: number

  /** Contract identifier, e.g. "CON.F.US.EP.M25" */
  contractId: string

  /** When the order was created (ISO timestamp) */
  creationTimestamp: string

  /** When the order was last updated (ISO timestamp) */
  updateTimestamp: string | null

  /** Order status code (per Topstep API) */
  status: number

  /** Order type code (per Topstep API) */
  type: number

  /** 0 = SELL, 1 = BUY */
  side: number

  /** Size / quantity */
  size: number

  /** Limit price, if any */
  limitPrice: number | null

  /** Stop price, if any */
  stopPrice: number | null
}

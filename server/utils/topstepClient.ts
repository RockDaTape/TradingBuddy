// server/utils/topstepClient.ts

import type { Trade } from '../../app/types/trade'
import type { Order } from '../../app/types/order'

// Base URL for TopstepX API
const BASE_URL = process.env.TOPSTEP_API_URL || 'https://api.topstepx.com'

interface AuthResponse {
  token: string
  success: boolean
  errorCode: number
  errorMessage: string | null
}

interface ValidateResponse {
  newToken: string
  success: boolean
  errorCode: number
  errorMessage: string | null
}

interface Account {
  id: number
  name: string
  balance: number
  canTrade: boolean
  isVisible: boolean
  simulated: boolean
}

interface AccountSearchResponse {
  accounts: Account[]
  success: boolean
  errorCode: number
  errorMessage: string | null
}

let cachedToken: string | null = null

/** Authenticate with API key / username */
async function login(): Promise<string> {
  const response = await fetch(`${BASE_URL}/api/Auth/loginKey`, {
    method: 'POST',
    headers: {
      Accept: 'text/plain',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userName: process.env.TOPSTEP_USERNAME,
      apiKey: process.env.TOPSTEP_API_KEY,
    }),
  })
  if (!response.ok) {
    throw new Error(`Auth request failed: ${response.status} ${response.statusText}`)
  }
  const data: AuthResponse = await response.json()
  if (!data.success || data.errorCode !== 0) {
    throw new Error(`Auth error (${data.errorCode}): ${data.errorMessage}`)
  }
  return data.token
}

/** Validate (and refresh) existing session token */
async function validateToken(token: string): Promise<string> {
  const resp = await fetch(`${BASE_URL}/api/Auth/validate`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
  if (!resp.ok) {
    throw new Error(`Token validation failed: ${resp.status} ${resp.statusText}`)
  }
  const data: ValidateResponse = await resp.json()
  if (!data.success || data.errorCode !== 0) {
    throw new Error(`Token invalid (${data.errorCode}): ${data.errorMessage}`)
  }
  return data.newToken
}

/** Get a valid JWT, re‐using or re‐authing as needed */
async function getValidToken(): Promise<string> {
  if (cachedToken) {
    try {
      cachedToken = await validateToken(cachedToken)
      return cachedToken
    } catch {
      // expired / invalid → fall through to login
    }
  }
  cachedToken = await login()
  return cachedToken
}

/**
 * Fetch all trades in [startTs, endTs]
 */
export async function fetchTrades(startTs: string, endTs: string): Promise<Trade[]> {
  const token = await getValidToken()
  const payload = {
    accountId:      Number(process.env.TOPSTEP_ACCOUNT_ID),
    startTimestamp: startTs,
    endTimestamp:   endTs,
  }
  console.log('🟢 Sending trade search payload:', payload)

  const resp = await fetch(`${BASE_URL}/api/Trade/search`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!resp.ok) {
    const txt = await resp.text()
    console.error('🔴 Trade search bad response:', resp.status, resp.statusText, txt)
    throw new Error(`Trade fetch failed: ${resp.status} ${resp.statusText}`)
  }

  const { trades, success, errorCode, errorMessage } = await resp.json() as {
    trades: any[]
    success: boolean
    errorCode: number
    errorMessage: string | null
  }
  if (!success) {
    throw new Error(`Trade search error (${errorCode}): ${errorMessage}`)
  }

  return trades.map(t => ({
    id:             t.id,
    timestamp:      t.creationTimestamp,
    symbol:         t.contractId,
    side:           t.side === 1 ? 'BUY' : 'SELL',
    price:          t.price,
    profitAndLoss:  t.profitAndLoss,
    fees:           t.fees,
    size:           t.size,
    voided:         t.voided,
    orderId:        t.orderId,
  }))
}

/**
 * Fetch all orders in [startTs, endTs]
 */
export async function fetchOrders(startTs: string, endTs: string): Promise<Order[]> {
  const token = await getValidToken()
  const payload = {
    accountId:      Number(process.env.TOPSTEP_ACCOUNT_ID),
    startTimestamp: startTs,
    endTimestamp:   endTs,
  }
  console.log('🟢 Sending order search payload:', payload)

  const resp = await fetch(`${BASE_URL}/api/Order/search`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  if (!resp.ok) {
    const txt = await resp.text()
    console.error('🔴 Order search bad response:', resp.status, resp.statusText, txt)
    throw new Error(`Order fetch failed: ${resp.status} ${resp.statusText}`)
  }

  const { orders, success, errorCode, errorMessage } = await resp.json() as {
    orders: any[]
    success: boolean
    errorCode: number
    errorMessage: string | null
  }
  if (!success) {
    throw new Error(`Order search error (${errorCode}): ${errorMessage}`)
  }

  return orders.map(o => ({
    id:                o.id,
    accountId:         o.accountId,
    contractId:        o.contractId,
    creationTimestamp: o.creationTimestamp,
    updateTimestamp:   o.updateTimestamp,
    status:            o.status,
    type:              o.type,
    side:              o.side,
    size:              o.size,
    limitPrice:        o.limitPrice,
    stopPrice:         o.stopPrice,
  }))
}

/**
 * Search for accounts (unchanged)
 */
export async function searchAccounts(onlyActiveAccounts: boolean): Promise<Account[]> {
  const token = await getValidToken()
  const resp = await fetch(`${BASE_URL}/api/Account/search`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ onlyActiveAccounts }),
  })
  if (!resp.ok) {
    throw new Error(`Account search failed: ${resp.status} ${resp.statusText}`)
  }
  const data: AccountSearchResponse = await resp.json()
  if (!data.success) {
    throw new Error(`Account search error (${data.errorCode}): ${data.errorMessage}`)
  }
  return data.accounts
}

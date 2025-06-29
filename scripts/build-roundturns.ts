/**
 * Script to build round turns from TopStep CSV trades
 *
 * This script:
 * 1. Clears existing round turns from the database
 * 2. Loads all TopStep trades ordered by contract and entry time
 * 3. Groups trades by contract and direction (Long/Short)
 * 4. Uses a Union-Find algorithm to identify overlapping trades within each group
 * 5. Creates consolidated round turn records from overlapping trade groups
 *
 * Round turns represent the full cycle of entering and exiting a position,
 * accounting for potential partial entries/exits over time.
 */

console.log("🔄 build-roundturns.ts starting…")

import {prisma} from '../server/db/client'
import type {TopStepCSV} from '@prisma/client'

async function main() {
  // Clear existing round turns
  await prisma.roundTurn.deleteMany({})
  console.log("🗑️ Cleared existing round turns")

  // Load all TopStep CSV data
  const topStepTrades = await prisma.topStepCSV.findMany({
    orderBy: [
      {contractName: 'asc'},
      {enteredAt: 'asc'}
    ]
  })

  console.log(`📊 Loaded ${topStepTrades.length} TopStep trades`)

  // Group by contract and direction
  const tradeGroups = new Map<string, TopStepCSV[]>()

  for (const trade of topStepTrades) {
    const key = `${trade.contractName}-${trade.type}`
    if (!tradeGroups.has(key)) {
      tradeGroups.set(key, [])
    }
    tradeGroups.get(key)!.push(trade)
  }

  console.log(`📦 Processing ${tradeGroups.size} contract-direction groups`)

  let totalRoundTurns = 0

  // Process each group to find overlapping trades
  for (const [groupKey, trades] of tradeGroups) {
    console.log(`\n🔍 Processing ${groupKey} (${trades.length} trades)`)

    const roundTurnGroups = findOverlappingTrades(trades)
    console.log(`  → Found ${roundTurnGroups.length} round turn groups`)

    for (const group of roundTurnGroups) {
      await createRoundTurnFromGroup(group)
      totalRoundTurns++
    }
  }

  console.log(`\n✅ Created ${totalRoundTurns} round turns`)
  await prisma.$disconnect()
}

// Union-Find data structure for connected components
class UnionFind {
  private parent: number[]
  private rank: number[]

  constructor(size: number) {
    this.parent = Array.from({length: size}, (_, i) => i)
    this.rank = new Array(size).fill(0)
  }

  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]) // Path compression
    }
    return this.parent[x]
  }

  union(x: number, y: number): void {
    const rootX = this.find(x)
    const rootY = this.find(y)

    if (rootX !== rootY) {
      // Union by rank
      if (this.rank[rootX] < this.rank[rootY]) {
        this.parent[rootX] = rootY
      } else if (this.rank[rootX] > this.rank[rootY]) {
        this.parent[rootY] = rootX
      } else {
        this.parent[rootY] = rootX
        this.rank[rootX]++
      }
    }
  }

  getGroups(): number[][] {
    const groups = new Map<number, number[]>()
    for (let i = 0; i < this.parent.length; i++) {
      const root = this.find(i)
      if (!groups.has(root)) {
        groups.set(root, [])
      }
      groups.get(root)!.push(i)
    }
    return Array.from(groups.values())
  }
}

function findOverlappingTrades(trades: TopStepCSV[]): TopStepCSV[][] {
  if (trades.length === 0) return []
  if (trades.length === 1) return [trades]

  const n = trades.length
  const uf = new UnionFind(n)

  // Check all pairs for overlaps
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (tradesOverlap(trades[i], trades[j])) {
        uf.union(i, j)
        console.log(`    📎 Overlap: Trade ${i} (${trades[i].enteredAt.toISOString()}-${trades[i].exitedAt.toISOString()}) with Trade ${j} (${trades[j].enteredAt.toISOString()}-${trades[j].exitedAt.toISOString()})`)
      }
    }
  }

  // Convert index groups back to trade groups
  const indexGroups = uf.getGroups()
  return indexGroups.map(indices => indices.map(i => trades[i]))
}

function tradesOverlap(trade1: TopStepCSV, trade2: TopStepCSV): boolean {
  // Two trades overlap if one's entry time is before the other's exit time
  // and vice versa (they have any time intersection)
  return (
    (trade1.enteredAt < trade2.exitedAt && trade2.enteredAt < trade1.exitedAt)
  )
}

async function createRoundTurnFromGroup(trades: TopStepCSV[]): Promise<void> {
  if (trades.length === 0) return

  // Sort trades by entry time for consistent processing
  trades.sort((a, b) => a.enteredAt.getTime() - b.enteredAt.getTime())

  // Calculate consolidated metrics
  const totalSize = trades.reduce((sum, t) => sum + t.size, 0)
  const totalPnL = trades.reduce((sum, t) => sum + t.profitAndLoss, 0)
  const totalFees = trades.reduce((sum, t) => sum + t.fees, 0)

  // Weighted average prices
  const weightedEntryPrice = trades.reduce((sum, t) => sum + (t.entryPrice * t.size), 0) / totalSize
  const weightedExitPrice = trades.reduce((sum, t) => sum + (t.exitPrice * t.size), 0) / totalSize

  // Time boundaries
  const entryTime = new Date(Math.min(...trades.map(t => t.enteredAt.getTime())))
  const exitTime = new Date(Math.max(...trades.map(t => t.exitedAt.getTime())))

  // Concatenated ID
  const consolidatedId = trades.map(t => t.id).join('-')

  // Common contract and direction
  const symbol = trades[0].contractName
  const direction = trades[0].type === 'Long' ? 'Long' : 'Short'

  console.log(`    ✨ Creating round turn: ${consolidatedId} | ${symbol} | ${direction} | Size: ${totalSize} | P&L: $${totalPnL.toFixed(2)}`)

  try {
    await prisma.roundTurn.create({
      data: {
        id: consolidatedId,
        symbol: symbol,
        size: totalSize,
        entryTime: entryTime,
        exitTime: exitTime,
        entryPrice: weightedEntryPrice,
        exitPrice: weightedExitPrice,
        pnl: totalPnL,
        fees: totalFees,
        direction: direction,
      }
    })
  } catch (error) {
    console.error(`❌ Failed to create round turn ${consolidatedId}:`, error)
    throw error
  }
}

main()
  .then(() => console.log("✅ Build completed"))
  .catch((e) => {
    console.error("❌ Error:", e)
    process.exit(1)
  })

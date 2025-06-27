import { PrismaClient } from '@prisma/client'
import { readFileSync, existsSync, copyFileSync, mkdirSync } from 'fs'
import { parse } from 'csv-parse/sync'
import { createInterface } from 'readline'
import { join } from 'path'

const prisma = new PrismaClient()

interface CSVRow {
  Id?: string
  ContractName: string
  EnteredAt: string
  ExitedAt: string
  EntryPrice: string
  ExitPrice: string
  Fees: string
  PnL: string
  Size: string
  Type: string
  TradeDay: string
  TradeDuration: string
}

// Explicit type for the data object
type TopStepCSVData = {
  contractName: string
  enteredAt: Date
  exitedAt: Date
  entryPrice: number
  exitPrice: number
  fees: number
  profitAndLoss: number
  size: number
  type: string
  tradeDay: Date
  tradeDuration: string
}

function askForFilePath(): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question('📁 Enter the path to your CSV file: ', (filePath) => {
      rl.close()
      resolve(filePath.trim())
    })
  })
}

function backupCSVFile(originalPath: string): string {
  // Create backup directory if it doesn't exist
  const backupDir = join(process.cwd(), 'app', 'data', 'csv-imports')
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true })
  }

  // Generate clean timestamp for filename
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`

  // Standardized filename - always use .csv extension
  const backupFileName = `trades_import_${timestamp}.csv`
  const backupPath = join(backupDir, backupFileName)

  // Copy the file
  copyFileSync(originalPath, backupPath)

  console.log(`📋 CSV backed up to: ${backupPath}`)
  return backupPath
}

async function importCSV(filePath: string) {
  console.log(`\n📂 Importing CSV from: ${filePath}`)

  // Check if file exists
  if (!existsSync(filePath)) {
    console.error('❌ File not found:', filePath)
    return
  }

  try {
    // First, backup the original CSV file
    const backupPath = backupCSVFile(filePath)

    // Read and parse CSV
    const fileContent = readFileSync(filePath, 'utf-8')
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as CSVRow[]

    console.log(`📊 Found ${records.length} records`)

    // Show first record to debug
    if (records.length > 0) {
      console.log('📋 First record columns:', Object.keys(records[0]))
      console.log('📋 First record data:', records[0])
    }

    let successCount = 0
    let errorCount = 0

    // Process records one by one using a regular for loop
    for (let i = 0; i < records.length; i++) {
      const row = records[i]
      try {
        const data: TopStepCSVData = {
          contractName: row.ContractName,
          enteredAt: new Date(row.EnteredAt),
          exitedAt: new Date(row.ExitedAt),
          entryPrice: parseFloat(row.EntryPrice),
          exitPrice: parseFloat(row.ExitPrice),
          fees: parseFloat(row.Fees),
          profitAndLoss: parseFloat(row.PnL),
          size: parseInt(row.Size),
          type: row.Type,
          tradeDay: new Date(row.TradeDay),
          tradeDuration: row.TradeDuration
        }

        await prisma.topStepCSV.create({ data })
        successCount++

        if ((i + 1) % 10 === 0) {
          console.log(`✅ Processed ${i + 1}/${records.length} records`)
        }
      } catch (error) {
        console.error(`❌ Error inserting record ${i + 1}:`, error)
        console.error('Row data:', row)
        errorCount++
      }
    }

    console.log(`✅ Import completed: ${successCount} successful, ${errorCount} errors`)
    console.log(`📁 Original file backed up to: ${backupPath}`)

  } catch (error) {
    console.error('❌ Import failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Main function
async function main() {
  console.log('🚀 TopStep CSV Importer')
  console.log('=====================')

  // Check if file path was provided as argument
  let csvFilePath = process.argv[2]

  // If no argument provided, ask for file path
  if (!csvFilePath) {
    csvFilePath = await askForFilePath()
  }

  if (!csvFilePath) {
    console.error('❌ No file path provided')
    process.exit(1)
  }

  await importCSV(csvFilePath)
}

// Run the script
main().catch(console.error)


// ========================================
// IMPORTS - These are the tools we need
// ========================================
import { PrismaClient } from '@prisma/client'  // Database connection tool
import { readFileSync, existsSync, copyFileSync, mkdirSync } from 'fs'  // File system tools (read files, check if files exist, copy files, create folders)
import { parse } from 'csv-parse/sync'  // CSV parsing tool - converts CSV text into JavaScript objects
import { createInterface } from 'readline'  // Tool to ask user questions in terminal
import { join } from 'path'  // Tool to build file paths correctly

// ========================================
// DATABASE CONNECTION
// ========================================
// Create a connection to our database
const prisma = new PrismaClient()

// ========================================
// TYPE DEFINITIONS - What our data looks like
// ========================================

// This describes what ONE ROW of the CSV file looks like
// Each property matches a column header in your CSV
interface CSVRow {
  Id: string           // The trade ID
  ContractName: string  // Like "MNQM5" - the trading instrument
  EnteredAt: string     // When the trade started (as text from CSV)
  ExitedAt: string      // When the trade ended (as text from CSV)
  EntryPrice: string    // Price when entering trade (as text from CSV)
  ExitPrice: string     // Price when exiting trade (as text from CSV)
  Fees: string          // Trading fees (as text from CSV)
  PnL: string           // Profit and Loss (as text from CSV)
  Size: string          // Number of contracts traded (as text from CSV)
  Type: string          // "Long" or "Short"
  TradeDay: string      // The trading day (as text from CSV)
  TradeDuration: string // How long the trade lasted
}

// This describes what the data looks like AFTER we clean it up for the database
// We convert text numbers to real numbers, text dates to real dates, etc.
type TopStepCSVData = {
  id: string            // Unique identifier for this trade
  contractName: string  // Trading instrument name
  enteredAt: Date       // Start time as a proper Date object
  exitedAt: Date        // End time as a proper Date object
  entryPrice: number    // Entry price as a real number
  exitPrice: number     // Exit price as a real number
  fees: number          // Fees as a real number
  profitAndLoss: number // P&L as a real number
  size: number          // Contract size as a real number
  type: string          // Trade type (Long/Short)
  tradeDay: Date        // Trade day as a proper Date object
  tradeDuration: string // Duration as text (we keep this as-is)
}

// ========================================
// HELPER FUNCTIONS
// ========================================

// This function asks the user to type in the path to their CSV file
function askForFilePath(): Promise<string> {
  // Create a way to ask questions in the terminal
  const rl = createInterface({
    input: process.stdin,   // Listen to keyboard input
    output: process.stdout  // Write to terminal screen
  })

  // Return a Promise (this is async - it waits for user input)
  return new Promise((resolve) => {
    // Ask the question and wait for answer
    rl.question('📁 Enter the path to your CSV file: ', (filePath) => {
      rl.close()  // Stop listening for input
      resolve(filePath.trim())  // Return the answer with extra spaces removed
    })
  })
}

// This function creates a backup copy of the original CSV file
// Why? So if something goes wrong, we still have the original!
function backupCSVFile(originalPath: string): string {
  // Create backup directory if it doesn't exist
  // This creates: /your-project/app/data/csv-imports/
  const backupDir = join(process.cwd(), 'app', 'data', 'csv-imports')
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true })  // Create the folder (and parent folders if needed)
  }

  // Generate a unique timestamp for the backup filename
  // This ensures each backup has a unique name
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')  // padStart adds leading zero if needed
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')

  // Build timestamp like: 2025-06-28_14-30-45
  const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`

  // Create the backup filename: trades_import_2025-06-28_14-30-45.csv
  const backupFileName = `trades_import_${timestamp}.csv`
  const backupPath = join(backupDir, backupFileName)

  // Actually copy the file from original location to backup location
  copyFileSync(originalPath, backupPath)

  // Tell the user where we saved the backup
  console.log(`📋 CSV backed up to: ${backupPath}`)
  return backupPath  // Return the backup file path
}

// This function cleans up messy column headers from the CSV file
// CSV files sometimes have hidden characters that cause problems
function cleanColumnHeaders(records: Record<string, any>[]): CSVRow[] {
  return records.map(record => {
    const cleanedRecord: Record<string, any> = {}

    // Clean each key (column header) and copy the value
    Object.keys(record as Record<string, any>).forEach(key => {
      // Remove BOM (Byte Order Mark), trim spaces, and normalize the key
      // BOM is an invisible character that sometimes appears at the start of files
      const cleanKey = key.replace(/^\uFEFF/, '').trim()

      // Map the cleaned key to our expected format
      // This handles cases where the header might have invisible characters
      if (cleanKey === 'Id') {
        cleanedRecord.Id = record[key]
      } else {
        cleanedRecord[cleanKey] = record[key]
      }
    })

    return cleanedRecord as CSVRow
  })
}

// Helper function to safely parse a date string
function safeParseDate(dateString: string, fieldName: string): Date {
  const parsedDate = new Date(dateString);
  if (isNaN(parsedDate.getTime())) {
    console.warn(`Invalid ${fieldName} date format: ${dateString}, using current date`);
    return new Date();
  }
  return parsedDate;
}

// ========================================
// MAIN IMPORT FUNCTION
// ========================================

// This is the main function that does all the heavy lifting
async function importCSV(filePath: string) {
  console.log(`\n📂 Importing CSV from: ${filePath}`)

  // First, check if the file actually exists
  if (!existsSync(filePath)) {
    console.error('❌ File not found:', filePath)
    return  // Stop here if file doesn't exist
  }

  try {
    // Step 1: Create a backup of the original file
    const backupPath = backupCSVFile(filePath)

    // Step 2: Read the entire CSV file into memory as text
    const fileContent = readFileSync(filePath, 'utf-8')

    // Step 3: Parse the CSV text into JavaScript objects
    const rawRecords = parse(fileContent, {
      columns: true,        // Use first row as column headers
      skip_empty_lines: true, // Ignore empty rows
      trim: true           // Remove extra spaces from values
    }) as Record<string, any>[]

    // Step 4: Clean the column headers to remove any hidden characters
    // This fixes issues with invisible characters in CSV headers
    const records = cleanColumnHeaders(rawRecords)

    console.log(`📊 Found ${records.length} records`)

    // Step 5: Show the first record for debugging
    // This helps us see what columns we actually have
    if (records.length > 0) {
      // Show what the raw headers look like (with hidden characters visible)
      console.log('📋 Raw column headers:', Object.keys(rawRecords[0] as Record<string, any>).map(key => JSON.stringify(key)))
      // Show the cleaned headers
      console.log('📋 Cleaned record columns:', Object.keys(records[0] as Record<string, any>))
      console.log('📋 First record data:', records[0])
    }

    // Keep track of how many succeed vs fail
    let successCount = 0
    let errorCount = 0

    // Step 6: Process each record one by one
    for (let i = 0; i < records.length; i++) {
      const row = records[i]  // Get the current row

      // Add null check to satisfy TypeScript
      if (!row) {
        console.error(`❌ Row ${i + 1} is null or undefined`)
        errorCount++
        continue
      }

      try {
        // Check if this row has an ID - your CSV DOES have IDs!
        if (!row.Id) {
          console.error(`❌ Row ${i + 1} is missing an Id field:`, row)
          errorCount++
          continue  // Skip this row and go to the next one
        }

        // Use the actual ID from the CSV (no more random generation!)
        const uniqueId = row.Id

        // Step 7: Convert date strings to proper Date objects
        // We do this carefully because date parsing can fail
        const enteredAt = safeParseDate(row.EnteredAt, 'EnteredAt');
        const exitedAt = safeParseDate(row.ExitedAt, 'ExitedAt');
        const tradeDay = safeParseDate(row.TradeDay, 'TradeDay');

        // Step 8: Build the clean data object for the database
        // Convert all text numbers to real numbers, handle missing values
        const data: TopStepCSVData = {
          id: uniqueId,
          contractName: row.ContractName || '',
          enteredAt: enteredAt,
          exitedAt: exitedAt,
          entryPrice: parseFloat(row.EntryPrice) || 0,      // Convert to number, use 0 if invalid
          exitPrice: parseFloat(row.ExitPrice) || 0,
          fees: parseFloat(row.Fees) || 0,
          profitAndLoss: parseFloat(row.PnL) || 0,
          size: parseInt(row.Size) || 0,                    // Convert to whole number
          type: row.Type || 'Unknown',                      // Use 'Unknown' if missing
          tradeDay: tradeDay,
          tradeDuration: row.TradeDuration || '00:00:00'    // Use default if missing
        }

        // Step 9: Save this record to the database
        await prisma.topStepCSV.create({
          data: data
        })
        successCount++

        // Show progress every 10 records
        if ((i + 1) % 10 === 0) {
          console.log(`✅ Processed ${i + 1}/${records.length} records`)
        }

      } catch (error) {
        // If anything goes wrong with this record, log it and continue
        console.error(`❌ Error inserting record ${i + 1}:`, error)
        console.error('Row data:', row)
        errorCount++
      }
    }

    // Step 10: Show final results
    console.log(`✅ Import completed: ${successCount} successful, ${errorCount} errors`)
    console.log(`📁 Original file backed up to: ${backupPath}`)

  } catch (error) {
    // If the whole import fails, show the error
    console.error('❌ Import failed:', error)
  } finally {
    // Always disconnect from database when done (cleanup)
    await prisma.$disconnect()
  }
}

// ========================================
// STARTUP FUNCTION
// ========================================

// This function runs when the script starts
async function main() {
  console.log('🚀 TopStep CSV Importer')
  console.log('=====================')

  // Check if user provided file path as command line argument
  // Like: node script.js /path/to/file.csv
  let csvFilePath = process.argv[2]

  // If no file path provided, ask for manual input
  if (!csvFilePath) {
    csvFilePath = await askForFilePath()
  }

  // Make sure we have a file path
  if (!csvFilePath) {
    console.error('❌ No file path provided')
    process.exit(1)  // Exit the program with error code
  }

  // Start the import process
  await importCSV(csvFilePath)
}

// ========================================
// START THE SCRIPT
// ========================================

// Run the main function and catch any errors
main().catch(console.error)

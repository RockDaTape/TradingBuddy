<!--
  TradeTable.vue

  A Vue component that displays trading round turns data in a paginated table format.
  Fetches trade data from an API based on date range and period filters, and presents
  it with formatted columns including ID (clickable to copy), symbol, size, entry/exit
  times and prices, P&L, fees, and direction.
-->

<script setup lang="ts">
// Core Vue composition API imports
import { ref, computed, watch, resolveComponent } from 'vue'
import { useFetch }            from 'nuxt/app'
import type { TableColumn }    from '@nuxt/ui'
import type { RoundTurn }      from '~/types/round-turns'
import { format }              from 'date-fns'
import type { Period, Range }  from '~/app/types'
import { h } from 'vue'

// ========================================
// Component Props
// ========================================
// Accept period and date range from parent component (analysis.vue)
const props = defineProps<{
  period: Period  // Time period filter for the data
  range:  Range   // Date range object with start and end dates
}>()

// ========================================
// Pagination State Management
// ========================================
// Reactive variables to control table pagination
const page    = ref(1)   // Current page number
const perPage = ref(20)  // Number of items per page

// ========================================
// Data Fetching with API Integration
// ========================================
// Fetch round turns data from API with query parameters
// Converts Date objects to ISO strings for API compatibility
const { data: fetchedData, pending, refresh } = useFetch<RoundTurn[]>(
  () =>
    `/api/round-turns`
    + `?start=${encodeURIComponent(props.range.start.toISOString())}`
    + `&end=${encodeURIComponent(props.range.end.toISOString())}`
    + `&page=${page.value}`
    + `&perPage=${perPage.value}`,
  { method: 'get' }
)

// ========================================
// Reactive Data Watchers
// ========================================
// Watch for changes in pagination or date range and refetch data
watch(
  [page, () => props.range.start, () => props.range.end],
  () => refresh()
)

// ========================================
// Computed Properties for Template
// ========================================
// Transform fetched data for template consumption
const rows       = computed(() => fetchedData.value ?? [])        // Table data rows
const isLoading  = computed(() => pending.value)                  // Loading state
const totalCount = computed(() =>                                 // Total count for pagination
  (fetchedData.value as any)?.total ?? rows.value.length
)

// ========================================
// Table Column Configuration
// ========================================
// Define table columns with custom cell renderers and formatting
const columns = ref<TableColumn<RoundTurn>[]>([
  // ID Column - Clickable with truncation and copy-to-clipboard functionality
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({row}) => {
      // Get the full ID value from the row data
      const id = row.getValue('id') as string
      // Truncate ID if longer than 12 chars, add ellipsis
      const truncated = id.length > 12 ? `${id.substring(0, 12)}...` : id

      // Resolve the UTooltip component for displaying copy hint
      const UTooltip = resolveComponent('UTooltip')

      // Create tooltip wrapper with button for copying ID
      return h(UTooltip, {
        text: 'Click to copy full ID',
        'open-delay': 100,
      }, {
        // Render clickable button with tooltip
        default: () => h('button', {
          // Style classes for hover effects and appearance
          // TODO: Change the hoover from theme color border to a grey bg inline with the nav menu
          class: 'cursor-pointer text-primary-600 hover:text-primary-600 hover:border hover:border-primary-600 px-1 py-0.5 rounded text-left underline',
          // Click handler to copy full ID to clipboard
          onClick: async () => {
            try {
              await navigator.clipboard.writeText(id)
              console.log('ID copied to clipboard:', id)
            } catch (err) {
              console.error('Failed to copy:', err)
            }
          }
        }, truncated)
      })
    }
  },

  // Basic text columns - Symbol, Size, Direction
  { accessorKey: 'symbol', header: 'Symbol' },
  { accessorKey: 'size', header: 'Size' },
  { accessorKey: 'direction', header: 'Direction' },

  // Time columns with custom date formatting
  {
    accessorKey: 'entryTime',
    header: 'Entry Time',
    cell: ({ row }) => {
      const raw = row.getValue('entryTime') as string
      return format(new Date(raw), 'dd-MM-yyyy HH:mm:ss')
    }
  },
  {
    accessorKey: 'exitTime',
    header: 'Exit Time',
    cell: ({ row }) => {
      const raw = row.getValue('exitTime') as string
      return format(new Date(raw), 'dd-MM-yyyy HH:mm:ss')
    }
  },

  // Price columns with currency formatting
  {
    accessorKey: 'entryPrice',
    header: 'Entry Price',
    cell: ({ row }) => {
      const price = row.getValue('entryPrice') as number
      return `$${price.toFixed(2)}`
    }
  },
  {
    accessorKey: 'exitPrice',
    header: 'Exit Price',
    cell: ({ row }) => {
      const price = row.getValue('exitPrice') as number
      return `$${price.toFixed(2)}`
    }
  },

  // P&L column with positive/negative formatting
  {
    accessorKey: 'pnl',
    header: 'P&L',
    cell: ({ row }) => {
      const value = row.getValue('pnl') as number
      const sign = value >= 0 ? '+$' : '-$'
      return `${sign}${Math.abs(value).toFixed(2)}`
    }
  },

  // Fees column with currency formatting
  {
    accessorKey: 'fees',
    header: 'Fees',
    cell: ({ row }) => {
      const fees = row.getValue('fees') as number
      return `$${fees.toFixed(2)}`
    }
  },
])
</script>

<template>
  <!-- ========================================
       Main Table Container
       ======================================== -->
  <div class="trade-table">
    <!-- Data Table Component -->
    <!-- Displays trading data with configured columns and loading state -->
    <UTable
      :data="rows"
      :columns="columns"
      :loading="isLoading"
    >
    </UTable>

    <!-- Pagination Component -->
    <!-- Handles page navigation and items per page control -->
    <UPagination
      v-model:page="page"
      :items-per-page="perPage"
      :total="totalCount"
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useFetch }            from 'nuxt/app'
import type { TableColumn }    from '@nuxt/ui'
import type { RoundTurn }      from '~/types/round-turns'
import { format }              from 'date-fns'
import type { Period, Range }  from '~/app/types'

// — Props — match what you pass in from analysis.vue
const props = defineProps<{
  period: Period
  range:  Range    // { start: Date; end: Date }
}>()

// — Pagination state —
const page    = ref(1)
const perPage = ref(20)

// — Fetch data — turn your Date props into ISO strings
const { data: fetchedData, pending, refresh } = useFetch<RoundTurn[]>(
  () =>
    `/api/round-turns`
    + `?start=${encodeURIComponent(props.range.start.toISOString())}`
    + `&end=${encodeURIComponent(props.range.end.toISOString())}`
    + `&page=${page.value}`
    + `&perPage=${perPage.value}`,
  { method: 'get' }
)

// — Re-fetch when page or range changes —
watch(
  [page, () => props.range.start, () => props.range.end],
  () => refresh()
)

// — Computed for template —
const rows       = computed(() => fetchedData.value ?? [])
const isLoading  = computed(() => pending.value)
const totalCount = computed(() =>
  (fetchedData.value as any)?.total ?? rows.value.length
)

// — Strongly-typed columns with casts inside each cell —
const columns = ref<TableColumn<RoundTurn>[]>([
  { accessorKey: 'roundTurnId', header: 'ID' },
  { accessorKey: 'contractId',  header: 'Symbol' },
  {
    accessorKey: 'openOrderTimestamp',
    header:      'Entry Time',
    cell:        ({ row }) => {
      const raw = row.getValue('openOrderTimestamp') as string
      return format(new Date(raw), 'dd-MM-yyyy HH:mm:ss')
    }
  },
  {
    accessorKey: 'closeOrderTimestamp',
    header:      'Exit Time',
    cell:        ({ row }) => {
      const raw = row.getValue('closeOrderTimestamp') as string
      return format(new Date(raw), 'dd-MM-yyyy HH:mm:ss')
    }
  },
  {
    accessorKey: 'openPrice',
    header:      'Entry Price',
    cell:        ({ row }) => {
      const p = row.getValue('openPrice') as number
      return `${p.toFixed(2)}`
    }
  },
  {
    accessorKey: 'closePrice',
    header:      'Exit Price',
    cell:        ({ row }) => {
      const p = row.getValue('closePrice') as number
      return `${p.toFixed(2)}`
    }
  },
  {
    accessorKey: 'profitAndLoss',
    header:      'P&L',
    cell:        ({ row }) => {
      const v = row.getValue('profitAndLoss') as number
      const sign = v >= 0 ? '+$' : '-$'
      return `${sign}${Math.abs(v).toFixed(2)}`
    }
  },
  {
    accessorKey: 'fees',
    header:      'Fees',
    cell:        ({ row }) => {
      const f = row.getValue('fees') as number
      const sign = f >= 0 ? '+$' : '-$'
      return `${sign}${Math.abs(f).toFixed(2)}`
    }
  },
  { accessorKey: 'size',             header: 'Size' },
  {
    accessorKey: 'side',
    header:      'Direction',
    cell:        ({ row }) => {
      const s = row.getValue('side') as number
      return s === 1 ? 'Short' : 'Long'
    }
  },
])
</script>

<template>
  <div class="trade-table">
    <UTable
      :data="rows"
      :columns="columns"
      class="shrink-0"
      :ui="{
        base:  'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th:    'first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td:    'border-b border-default'
      }"
      :loading="isLoading"
    />

    <UPagination
      v-model:page="page"
      :items-per-page="perPage"
      :total="totalCount"
      class="mt-4"
    />
  </div>
</template>

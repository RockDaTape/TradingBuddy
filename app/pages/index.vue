<script setup lang="ts">
import { useAsyncData } from 'nuxt/app'
import { computed }     from 'vue'
import type { Trade }   from '~/app/types/trade'

// ───────────────────────────────────────────────────────────
// 1) Build your UTC “today” window
// ───────────────────────────────────────────────────────────
// ─── Fixed window for 20 June 2025 ───
const START = '2025-06-20T00:00:00Z'
const END   = '2025-06-21T00:00:00Z'

// ───────────────────────────────────────────────────────────
// 2) Fetch trades from your Nitro API
// ───────────────────────────────────────────────────────────
const { data: tradesData, pending, error } = await useAsyncData(
  'trades',
  () => $fetch<{ trades: Trade[] }>('/api/trades', {
    params: { start: START, end: END }
  })
)

// ───────────────────────────────────────────────────────────
// 3) Always give the table an array, even if empty
// ───────────────────────────────────────────────────────────
const trades = computed<Trade[]>(() => tradesData.value?.trades ?? [])
</script>

<template>
  <h1>Today’s Topstep Trades</h1>

  <!-- Loading state -->
  <p v-if="pending">Loading trades…</p>

  <!-- Error state -->
  <p v-else-if="error">Error: {{ error.message }}</p>

  <!-- Data state -->
  <TradesTable
    v-else
    :trades="trades"
  />
</template>

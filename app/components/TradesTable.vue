<script setup lang="ts">
import type { Trade } from '~/app/types/trade'
const props = defineProps<{ trades: Trade[] }>()
</script>

<template>
  <table>
    <thead>
    <tr>
      <th>ID</th><th>Time</th><th>Symbol</th><th>Side</th><th>Price</th><th>P/L</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="t in props.trades" :key="t.id">
      <td>{{ t.id }}</td>
      <td>{{ new Date(t.timestamp).toLocaleString() }}</td>
      <td>{{ t.symbol }}</td>
      <td>{{ t.side }}</td>
      <td>{{ t.price }}</td>
      <td>{{ t.profitAndLoss ?? '—' }}</td>
    </tr>
    </tbody>
  </table>
</template>

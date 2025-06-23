<script setup lang="ts">
// 1) bring in Vue’s refs
import { ref, shallowRef }         from 'vue'
// 2) helper to subtract days
import { sub }                     from 'date-fns'
// 3) your shared types
import type { Period, Range }      from '~/app/types'

// 4) your new local components (use absolute aliases if you like)
import DateRangePicker from '../components/periodSelectors/DateRangePicker.vue';
import PeriodSelect    from '../components/periodSelectors/PeriodSelect.vue';

// ← Use real Date objects, not strings
const range = shallowRef<Range>({
  start: sub(new Date(), { days: 14 }),
  end:   new Date()
})

// period selector state
const period = ref<Period>('daily')
</script>

<template>
  <UDashboardPanel id="analysis">
    <template #header>
      <UDashboardNavbar title="Analysis" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <DateRangePicker v-model="range" class="-ms-1" />

          <PeriodSelect v-model="period" :range="range" />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
<!--      <HomeStats   :period="period" :range="range" />-->
<!--      <HomeChart   :period="period" :range="range" />-->
      <TradesTable :period="period" :range="range" />
    </template>
  </UDashboardPanel>
</template>

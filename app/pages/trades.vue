<script setup lang="ts">
/**
 * This component displays an analysis dashboard with date range selection and trade data.
 */

// 1) bring in Vue's refs
import {ref, shallowRef} from 'vue'
// 2) helper to subtract days
import {sub} from 'date-fns'
// 3) your shared types
import type {Period, Range} from '~/app/types'

// 4) your new local components (use absolute aliases if you like)
import DateRangePicker from '../components/periodSelectors/DateRangePicker.vue';
import PeriodSelect from '../components/periodSelectors/PeriodSelect.vue';

// Initialize date range to last 14 days
const range = shallowRef<Range>({
  start: sub(new Date(), {days: 14}),
  end: new Date()
})

// Initialize period selector state to 'daily'
const period = ref<Period>('daily')
</script>

<template>
  <UDashboardPanel id="trades">
    <template #header>
      <UDashboardNavbar title="Trades" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse/>
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <!-- NOTE: The `-ms-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
          <DateRangePicker v-model="range" class="-ms-1"/>

          <PeriodSelect v-model="period" :range="range"/>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <!--      <HomeStats   :period="period" :range="range" />-->
      <!--      <HomeChart   :period="period" :range="range" />-->
      <TradesTable :period="period" :range="range"/>
    </template>
  </UDashboardPanel>
</template>

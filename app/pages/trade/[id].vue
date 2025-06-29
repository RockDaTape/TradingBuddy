<!--
  pages/trade/[id].vue

  Individual trade journaling page - simplified to use existing notes column
-->

<template>
  <UDashboardPanel id="trade-journal">
    <template #header>
      <UDashboardNavbar :title="`Trade Journal`" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <div class="flex items-center gap-2">
            <!-- Back to Trades Button -->
            <UButton
              icon="i-lucide-arrow-left"
              variant="ghost"
              size="sm"
              @click="navigateTo('/trades')"
            >
              Back to Trades
            </UButton>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Loading State -->
      <div v-if="pending" class="flex items-center justify-center p-8">
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
        <span class="ml-2">Loading trade data...</span>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-8">
        <UAlert
          icon="i-lucide-alert-circle"
          title="Error loading trade"
          :description="error.message"
          color="red"
        />
      </div>

      <!-- Main Content -->
      <div v-else-if="tradeData" class="space-y-6">
        <!-- Trade Information Summary Card -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Trade Details</h3>
          </template>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span class="text-gray-500">Symbol:</span>
              <p class="font-medium">{{ tradeData.symbol }}</p>
            </div>
            <div>
              <span class="text-gray-500">Direction:</span>
              <p class="font-medium">{{ tradeData.direction }}</p>
            </div>
            <div>
              <span class="text-gray-500">Size:</span>
              <p class="font-medium">{{ tradeData.size }}</p>
            </div>
            <div>
              <span class="text-gray-500">P&L:</span>
              <p class="font-medium" :class="tradeData.pnl >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ tradeData.pnl >= 0 ? '+' : '' }}${{ tradeData.pnl.toFixed(2) }}
              </p>
            </div>
            <div>
              <span class="text-gray-500">Entry Price:</span>
              <p class="font-medium">${{ tradeData.entryPrice.toFixed(2) }}</p>
            </div>
            <div>
              <span class="text-gray-500">Exit Price:</span>
              <p class="font-medium">${{ tradeData.exitPrice.toFixed(2) }}</p>
            </div>
            <div>
              <span class="text-gray-500">Entry Time:</span>
              <p class="font-medium">{{ formatDate(tradeData.entryTime) }}</p>
            </div>
            <div>
              <span class="text-gray-500">Exit Time:</span>
              <p class="font-medium">{{ formatDate(tradeData.exitTime) }}</p>
            </div>
          </div>
        </UCard>

        <!-- Journal Editor Section -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Trade Journal</h3>
              <div v-if="tradeData.updatedAt" class="text-sm text-gray-500">
                Last updated: {{ formatDate(tradeData.updatedAt) }}
              </div>
            </div>
          </template>

          <client-only>
            <div class="trade-journal-editor">
              <TiptapEditor
                v-if="!pending"
                :initial-content="tradeData.notes || ''"
                @update="handleUpdate"
                @save="handleSave"
                :auto-save="true"
                :auto-save-delay="2000"
                toolbar="full"
                context="trade"
                :context-id="tradeId"
                placeholder="Add your trade analysis, lessons learned, market observations, and insights..."
                min-height="400px"
                variant="subtle"
              />
            </div>
          </client-only>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { format } from 'date-fns'
import type { RoundTurn } from '~/types/round-turns'

// Route setup
const route = useRoute()
const tradeId = computed(() => route.params.id as string)

// Fetch trade data (includes notes)
const { data: tradeData, pending, error } = await useFetch<RoundTurn>(
  `/api/round-turns/${tradeId.value}`,
  {
    key: `trade-${tradeId.value}`
  }
)

// Handle content updates
const handleUpdate = (html: string) => {
  console.log('📝 Journal content updated, length:', html.length)
}

// Handle auto-save events
const handleSave = async (html: string) => {
  try {
    console.log('💾 Auto-saving trade journal...')

    // Update the trade notes using PATCH
    await $fetch(`/api/round-turns/${tradeId.value}`, {
      method: 'PATCH',
      body: {
        notes: html
      }
    })

    console.log('✅ Trade journal auto-saved successfully')

  } catch (error) {
    console.error('❌ Failed to save trade journal:', error)
  }
}

// Utility function
const formatDate = (dateString: string) => {
  return format(new Date(dateString), 'dd-MM-yyyy HH:mm:ss')
}

// Page metadata
definePageMeta({
  title: 'Trade Journal',
  description: 'Document and analyze individual trade performance'
})
</script>

<style scoped>
.trade-journal-editor {
  min-height: 400px;
}

.grid > div {
  padding: 0.5rem 0;
}

.text-green-600 {
  color: #10b981;
}

.text-red-600 {
  color: #ef4444;
}
</style>

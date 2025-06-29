<!--
  app/pages/tags.vue

  Tag management page for creating and organizing trade tags.
  Provides functionality to create tag groups and individual tags
  for categorizing and analyzing trading performance.
-->

<template>
  <!-- Main dashboard panel container for the tags page -->
  <UDashboardPanel id="tags">
    <!-- Dashboard header section with navigation and action buttons -->
    <template #header>
      <UDashboardNavbar title="Tags" :ui="{ right: 'gap-3' }">
        <!-- Left side: Sidebar collapse toggle -->
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <!-- Right side: Help tooltip only -->
        <template #right>
          <div class="flex items-center gap-2">
            <!-- Help tooltip providing context about tags functionality -->
            <UTooltip text="Tags help you categorize trades for better analysis">
              <UButton
                icon="i-lucide-help-circle"
                variant="ghost"
                size="sm"
                color="neutral"
                square
              />
            </UTooltip>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <!-- Main content body with conditional rendering -->
    <template #body>
      <!-- Loading state: Show spinner while fetching tag groups data -->
      <div v-if="pending" class="flex items-center justify-center p-8">
        <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
        <span class="ml-2">Loading tag groups...</span>
      </div>

      <!-- Error state: Display error message if data fetching fails -->
      <div v-else-if="error" class="p-8">
        <UAlert
          icon="i-lucide-alert-circle"
          title="Error loading tags"
          :description="error.message"
          color="red"
        />
      </div>

      <!-- Main content: Display when data is successfully loaded -->
      <div v-else class="space-y-6">
        <!-- Introduction card with page overview and quick statistics -->
        <UCard>
          <div class="space-y-4">
            <!-- Explanatory text about the purpose of tags -->
            <p class="text-gray-600">
              Organize your trades with custom tags to identify patterns, strategies, and market conditions.
              Create tag groups to categorize different aspects of your trading.
            </p>

            <!-- Statistics dashboard showing key metrics -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <!-- Total tag groups counter -->
              <div class="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <span class="text-blue-600 dark:text-blue-400 font-medium">Total Groups:</span>
                <p class="text-lg font-bold text-blue-700 dark:text-blue-300">
                  {{ tagGroups?.length || 0 }}
                </p>
              </div>
              <!-- Total individual tags counter across all groups -->
              <div class="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                <span class="text-green-600 dark:text-green-400 font-medium">Total Tags:</span>
                <p class="text-lg font-bold text-green-700 dark:text-green-300">
                  {{ totalTagsCount }}
                </p>
              </div>
              <!-- Most populated tag group name -->
              <div class="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                <span class="text-purple-600 dark:text-purple-400 font-medium">Most Used:</span>
                <p class="text-lg font-bold text-purple-700 dark:text-purple-300">
                  {{ mostUsedGroup || 'None yet' }}
                </p>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Tag management interface card -->
        <UCard>
          <template #header>
            <!-- Header with section title -->
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Tag Management</h3>
            </div>
          </template>

          <!-- TagManager component handles ALL CRUD operations for tag groups and tags -->
          <!-- Emits refresh event to reload data when changes are made -->
          <TagManager @refresh="refresh" />
        </UCard>

        <!-- Educational content card with usage guidelines -->
        <UCard>
          <template #header>
            <!-- Header with lightbulb icon indicating tips/advice -->
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <UIcon name="i-lucide-lightbulb" class="w-5 h-5 text-yellow-500" />
              Tips for Effective Tagging
            </h3>
          </template>

          <!-- List of best practices for using tags effectively -->
          <div class="space-y-3 text-sm text-gray-600">
            <!-- Strategy-focused tagging advice -->
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Strategy Tags:</strong> Create groups like "Entry Patterns", "Market Conditions", or "Setup Types"
              </div>
            </div>
            <!-- Outcome tracking advice -->
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Outcome Tags:</strong> Track "Profitable", "Stopped Out", "Breakeven" for quick analysis
              </div>
            </div>
            <!-- Visual organization advice -->
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Color Coding:</strong> Use consistent colors for related tag groups to improve visual organization
              </div>
            </div>
            <!-- Naming convention advice -->
            <div class="flex items-start gap-3">
              <UIcon name="i-lucide-check-circle" class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Keep it Simple:</strong> Use clear, concise tag names that you'll remember and use consistently
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TagGroup } from '~/types/Tag'

// API call to fetch all tag groups with their associated tags
// Uses Nuxt's useFetch composable for reactive data fetching
const { data: tagGroups, pending, error, refresh } = await useFetch<TagGroup[]>('/api/tag-groups', {
  key: 'tag-groups-management' // Cache key for this request
})

// Computed property: Calculate total number of individual tags across all groups
const totalTagsCount = computed(() => {
  // Return 0 if no tag groups exist
  if (!tagGroups.value) return 0
  // Sum up the length of tags array for each group
  return tagGroups.value.reduce((total, group) => total + (group.tags?.length || 0), 0)
})

// Computed property: Find the name of the tag group with the most tags
const mostUsedGroup = computed(() => {
  // Return null if no tag groups exist
  if (!tagGroups.value || tagGroups.value.length === 0) return null

  // Find the group with the highest number of tags using reduce
  const groupWithMostTags = tagGroups.value.reduce((prev, current) => {
    const prevCount = prev.tags?.length || 0
    const currentCount = current.tags?.length || 0
    return currentCount > prevCount ? current : prev
  })

  // Return the group name only if it actually has tags, otherwise null
  return groupWithMostTags.tags && groupWithMostTags.tags.length > 0
    ? groupWithMostTags.name
    : null
})
</script>

<style scoped>
/* Ensure consistent vertical spacing for grid statistics items */
.grid > div {
  padding: 0.5rem 0;
}

/* Custom styling for tip section icons (currently unused but available) */
.tip-icon {
  margin-top: 2px;
}
</style>

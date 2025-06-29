<template>
  <UDashboardPanel id="rules">
    <template #header>
      <UDashboardNavbar title="Rules" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <!-- Save indicator in header -->
        <template #right>
          <div class="flex items-center gap-2">
            <!-- Auto-save status indicator -->
            <div v-if="saveStatus || pending" class="flex items-center gap-1 text-sm text-gray-500">
              <UIcon
                :name="(saveStatus === 'saving' || pending) ? 'i-lucide-loader-2' : 'i-lucide-check'"
                :class="{ 'animate-spin': saveStatus === 'saving' || pending }"
                class="w-4 h-4"
              />
              <span>{{
                  pending ? 'Loading...' :
                    saveStatus === 'saving' ? 'Saving...' : 'Saved'
                }}</span>
            </div>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <client-only>
        <div class="rules-editor">
          <!-- Enhanced TiptapEditor with new API integration -->
          <TiptapEditor
            v-if="data"
            :initial-content="data.content || ''"
            @update="handleUpdate"
            @save="handleSave"

            :auto-save="true"
            :auto-save-delay="2000"
            toolbar="full"
            context="page"
            context-id="rules"
            placeholder="Start documenting your trading rules and strategies..."
            min-height="400px"
            variant="subtle"
          />

          <!-- Loading state when no data yet -->
          <div v-else-if="pending" class="flex items-center justify-center p-8">
            <UIcon name="i-lucide-loader-2" class="w-8 h-8 animate-spin text-gray-400" />
            <span class="ml-2 text-gray-500">Loading your trading rules...</span>
          </div>
        </div>
      </client-only>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import type { Rules } from '~/types/Rules'

// Page meta for better SEO and navigation
definePageMeta({
  title: 'Trading Rules',
  description: 'Document and manage your trading rules and strategies'
})

// Fetch rules data from new API endpoint
const { data, pending, refresh } = await useFetch<Rules>('/api/rules', {
  key: 'rules',
  default: () => ({ id: '', content: '', createdAt: '', updatedAt: '' })
})

// Save status tracking for better UX
const saveStatus = ref<'saving' | 'saved' | null>(null)

// Enhanced update handler (immediate updates)
const handleUpdate = (html: string) => {
  // This is called on every keystroke - just update content immediately
  // No need to save here since auto-save will handle it
  console.log('📝 Content updated, length:', html.length)
}

// Enhanced save handler (triggered by auto-save)
const handleSave = async (html: string) => {
  try {
    saveStatus.value = 'saving'
    console.log('💾 Auto-saving rules...')

    // Use new PATCH API endpoint
    const updatedRules = await $fetch<Rules>('/api/rules', {
      method: 'PATCH',
      body: { content: html }
    })

    // Update local data with response
    if (data.value) {
      data.value.content = updatedRules.content
      data.value.updatedAt = updatedRules.updatedAt
    }

    saveStatus.value = 'saved'
    console.log('✅ Rules auto-saved successfully')

    // Hide the saved indicator after 2 seconds
    setTimeout(() => {
      saveStatus.value = null
    }, 2000)

  } catch (error) {
    console.error('❌ Failed to save rules:', error)
    saveStatus.value = null

    // Optional error toast (you can uncomment if you have toast setup)
    // const toast = useToast()
    // toast.add({
    //   title: 'Failed to save rules',
    //   description: 'Please try again',
    //   color: 'error'
    // })
  }
}
</script>

<style scoped>
/* Optional custom styles for rules page */
.rules-editor {
  /* Ensure the editor takes full height */
  height: 100%;
}

/* Optional styles for save indicator */
.save-indicator {
  transition: opacity 0.2s ease-in-out;
}
</style>

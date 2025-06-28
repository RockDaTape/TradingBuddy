<template>
  <UDashboardPanel id="rules">
    <template #header>
      <UDashboardNavbar title="Rules" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <!-- 🆕 NEW: Optional save indicator in header -->
        <template #right>
          <div class="flex items-center gap-2">
            <!-- Auto-save status indicator -->
            <div v-if="saveStatus" class="flex items-center gap-1 text-sm text-gray-500">
              <UIcon
                :name="saveStatus === 'saving' ? 'i-lucide-loader-2' : 'i-lucide-check'"
                :class="{ 'animate-spin': saveStatus === 'saving' }"
                class="w-4 h-4"
              />
              <span>{{ saveStatus === 'saving' ? 'Saving...' : 'Saved' }}</span>
            </div>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <client-only>
        <div class="rules-editor">
          <!-- 🆕 NEW: Enhanced TiptapEditor with new props while maintaining compatibility -->
          <TiptapEditor
            v-if="isLoaded"
            :initial-content="content"
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
        </div>
      </client-only>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRules } from '../composables/useRules'

// 🆕 NEW: Enhanced state management
const { content, save, isLoaded } = useRules()

// 🆕 NEW: Save status tracking for better UX
const saveStatus = ref<'saving' | 'saved' | null>(null)

// 🆕 NEW: Enhanced update handler (immediate updates)
const handleUpdate = (html: string) => {
  // This is called on every keystroke - just update content immediately
  // No need to save here since auto-save will handle it
  console.log('📝 Content updated, length:', html.length)
}

// 🆕 NEW: Enhanced save handler (triggered by auto-save)
const handleSave = async (html: string) => {
  try {
    saveStatus.value = 'saving'
    console.log('💾 Auto-saving rules...')

    // Use your existing save function
    await save(html)

    saveStatus.value = 'saved'
    console.log('✅ Rules auto-saved successfully')

    // Hide the saved indicator after 2 seconds
    setTimeout(() => {
      saveStatus.value = null
    }, 2000)

  } catch (error) {
    console.error('❌ Failed to save rules:', error)
    saveStatus.value = null

    // 🆕 NEW: Optional error toast (if you want user feedback)
    // const toast = useToast()
    // toast.add({
    //   title: 'Failed to save rules',
    //   description: 'Please try again',
    //   color: 'error'
    // })
  }
}

// 🆕 NEW: Page meta for better SEO and navigation
definePageMeta({
  title: 'Trading Rules',
  description: 'Document and manage your trading rules and strategies'
})
</script>

<style scoped>
/* 🆕 NEW: Optional custom styles for rules page */
.rules-editor {
  /* Ensure the editor takes full height */
  height: 100%;
}

/* 🆕 NEW: Optional styles for save indicator */
.save-indicator {
  transition: opacity 0.2s ease-in-out;
}
</style>

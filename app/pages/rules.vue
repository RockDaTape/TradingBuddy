<template>
  <UDashboardPanel id="rules">
    <template #header>
      <UDashboardNavbar title="Rules" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template class="-ms-1" #body>
      <client-only>
        <div class="rules-editor">
          <TiptapEditor
            v-if="loaded"
            :initial-content="content"
            @update="save"
          />
        </div>
      </client-only>
    </template>
    <template #footer>
      <h1>Hello</h1>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRules } from '../composables/useRules'

const { content, save } = useRules()
const loaded = computed(() => content.value !== '')  // or content.value !== null
</script>

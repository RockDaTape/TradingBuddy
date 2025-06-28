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
            v-if="isLoaded"
            :initial-content="content"
            @update="save"
          />
        </div>
      </client-only>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useRules } from '../composables/useRules'

const { content, save, isLoaded } = useRules()
</script>

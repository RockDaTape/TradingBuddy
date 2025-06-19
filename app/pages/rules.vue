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
          <tiptap-editor />
        </div>
      </client-only>
    </template>
  </UDashboardPanel>
</template>

<script setup>
import TiptapEditor from '~/components/TiptapEditor.vue'
</script>

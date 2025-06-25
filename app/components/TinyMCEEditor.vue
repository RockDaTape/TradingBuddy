<template>
  <div class="tinymce-container">
    <Editor
      api-key="x63m316252h4jcz2jdbr4ltsy33y5quzfyasn0n494cbrowv"
      :model-value="initialContent"
      :init="editorConfig"
      @update:model-value="handleUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import Editor from '@tinymce/tinymce-vue'

const props = defineProps<{
  initialContent: string
}>()

const emit = defineEmits<{
  (e: 'update', content: string): void
}>()

const handleUpdate = (content: string) => {
  emit('update', content)
}

const editorConfig = {
  // Dark theme settings
  skin: 'oxide-dark',
  content_css: 'dark',

  // Auto-resize configuration
  plugins: [
    // Core editing features
    'anchor', 'autolink', 'charmap', 'codesample', 'emoticons', 'image', 'link', 'lists', 'media', 'searchreplace', 'table', 'visualblocks', 'wordcount',
    // Premium features
    'checklist', 'mediaembed', 'casechange', 'formatpainter', 'pageembed', 'a11ychecker', 'tinymcespellchecker', 'permanentpen', 'powerpaste', 'advtable', 'advcode', 'editimage', 'advtemplate', 'ai', 'mentions', 'tinycomments', 'tableofcontents', 'footnotes', 'mergetags', 'autocorrect', 'typography', 'inlinecss', 'markdown','importword', 'exportword', 'exportpdf',
    // Auto-resize plugin
    'autoresize'
  ],

  // Remove fixed height and enable auto-resize
  // height: 400, // Remove this line
  min_height: 200,
  // max_height: 800,
  autoresize_bottom_margin: 16,
  autoresize_overflow_padding: 10,

  // Custom background color for content area
  content_style: `
    body {
      background-color: #202023 !important;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.6;
    }
    h1, h2, h3, h4, h5, h6 {
      color: #f0f0f0;
    }
    a {
      color: #60a5fa;
    }
  `,

  toolbar_mode: 'sliding',
  toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ychecker typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
  tinycomments_mode: 'embedded',
  tinycomments_author: 'Author name',
  mergetags_list: [
    { value: 'First.Name', title: 'First Name' },
    { value: 'Email', title: 'Email' },
  ],
  ai_request: (request: any, respondWith: any) => respondWith.string(() => Promise.reject('See docs to implement AI Assistant')),
}
</script>

<style scoped>
.tinymce-container {
  /* Wrapper styling */
  border-radius: 8px;
  overflow: hidden;
}

/* Target the entire TinyMCE editor container */
:deep(.tox.tox-tinymce) {
  background-color: #202023 !important;
  border: 1px solid #3a3a3d !important;
}

/* Toolbar background */
:deep(.tox-toolbar),
:deep(.tox-toolbar__primary),
:deep(.tox-toolbar__overflow) {
  background-color: #202023 !important;
  border-bottom: 1px solid #3a3a3d !important;
}

/* Menu bar background */
:deep(.tox-menubar) {
  background-color: #202023 !important;
  border-bottom: 1px solid #3a3a3d !important;
}

/* Status bar/footer background */
:deep(.tox-statusbar) {
  background-color: #202023 !important;
  border-top: 1px solid #3a3a3d !important;
}

/* Editor content area background */
:deep(.tox-edit-area) {
  background-color: #202023 !important;
}

/* Sidebar background (if using sidebar plugins) */
:deep(.tox-sidebar) {
  background-color: #202023 !important;
}

/* Button hover states to match the theme */
:deep(.tox-toolbar__group .tox-tbtn:hover) {
  background-color: #3a3a3d !important;
}

/* Active button states */
:deep(.tox-toolbar__group .tox-tbtn--enabled) {
  background-color: #4a4a4d !important;
}

/* Dropdown menus */
:deep(.tox-menu) {
  background-color: #202023 !important;
  border: 1px solid #3a3a3d !important;
}

/* Dropdown menu items */
:deep(.tox-menu .tox-menuitem) {
  color: #ffffff !important;
}

:deep(.tox-menu .tox-menuitem:hover) {
  background-color: #3a3a3d !important;
}
</style>

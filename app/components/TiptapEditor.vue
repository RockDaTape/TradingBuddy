<template>
  <client-only>
    <UCard variant="subtle" class="w-full"
           :ui="{
              header: 'sticky -top-[25px] z-10 bg-[#202023] px-4 py-2'
            }"

    >
      <template #header>
        <div class="control-group px-4">
          <div class="button-group">
            <!-- Text Formatting -->
            <UButton
              size="sm"
              variant="outline"
              active-variant="solid"
              active-color="primary"
              @click="editor?.chain().focus().toggleBold().run()"
              :disabled="!editor?.can().chain().focus().toggleBold().run()"
              :active="editor?.isActive('bold')"
              icon="i-lucide-bold"
              square
            />
            <UButton
              size="sm"
              variant="outline"
              active-variant="solid"
              active-color="primary"
              @click="editor?.chain().focus().toggleItalic().run()"
              :disabled="!editor?.can().chain().focus().toggleItalic().run()"
              :active="editor?.isActive('italic')"
              icon="i-lucide-italic"
              square
            />
            <UButton
              size="sm"
              variant="outline"
              active-variant="solid"
              active-color="primary"
              @click="editor?.chain().focus().toggleStrike().run()"
              :disabled="!editor?.can().chain().focus().toggleStrike().run()"
              :active="editor?.isActive('strike')"
              icon="i-lucide-strikethrough"
              square
            />
            <UButton
              size="sm"
              variant="outline"
              active-variant="solid"
              active-color="primary"
              @click="editor?.chain().focus().toggleCode().run()"
              :disabled="!editor?.can().chain().focus().toggleCode().run()"
              :active="editor?.isActive('code')"
              icon="i-lucide-code"
              square
            />

            <!-- Divider -->
            <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

            <!-- Headings -->
            <UButton
              size="sm"
              variant="outline"
              active-variant="solid"
              active-color="primary"
              @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
              :disabled="!editor?.can().chain().focus().toggleHeading({ level: 1 }).run()"
              :active="editor?.isActive('heading', { level: 1 })"
              icon="i-lucide-heading-1"
              square
            />
            <UButton
              size="sm"
              variant="outline"
              active-variant="solid"
              active-color="primary"
              @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
              :disabled="!editor?.can().chain().focus().toggleHeading({ level: 2 }).run()"
              :active="editor?.isActive('heading', { level: 2 })"
              icon="i-lucide-heading-2"
              square
            />
            <UButton
              size="sm"
              variant="outline"
              active-variant="solid"
              active-color="primary"
              @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
              :disabled="!editor?.can().chain().focus().toggleHeading({ level: 3 }).run()"
              :active="editor?.isActive('heading', { level: 3 })"
              icon="i-lucide-heading-3"
              square
            />

            <!-- Divider -->
            <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

            <!-- Lists -->
            <UButton
              size="sm"
              variant="outline"
              active-variant="solid"
              active-color="primary"
              @click="editor?.chain().focus().toggleBulletList().run()"
              :disabled="!editor?.can().chain().focus().toggleBulletList().run()"
              :active="editor?.isActive('bulletList')"
              icon="i-lucide-list"
              square
            />
            <UButton
              size="sm"
              variant="outline"
              active-variant="solid"
              active-color="primary"
              @click="editor?.chain().focus().toggleOrderedList().run()"
              :disabled="!editor?.can().chain().focus().toggleOrderedList().run()"
              :active="editor?.isActive('orderedList')"
              icon="i-lucide-list-ordered"
              square
            />
            <UButton
              size="sm"
              variant="outline"
              active-variant="solid"
              active-color="primary"
              @click="editor?.chain().focus().toggleTaskList().run()"
              :disabled="!editor?.can().chain().focus().toggleTaskList().run()"
              :active="editor?.isActive('taskList')"
              icon="i-lucide-check-square"
              square
            />

            <!-- Divider -->
            <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

            <!-- Other Elements -->
            <UButton
              size="sm"
              variant="outline"
              @click="editor?.chain().focus().setHorizontalRule().run()"
              :disabled="!editor?.can().chain().focus().setHorizontalRule().run()"
              icon="i-lucide-minus"
              square
            />

            <!-- Image Upload Button -->
            <UButton
              size="sm"
              variant="outline"
              @click="triggerImageUpload"
              icon="i-lucide-image"
              square
              :loading="isUploading"
              :disabled="isUploading"
            />

            <!-- Hidden file input -->
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              style="display: none;"
            />

            <!-- Add embed button after image button -->
            <UButton
              size="sm"
              variant="outline"
              @click="openEmbedDialog"
              icon="i-lucide-video"
              square
              title="Add Embed"
            />

            <!-- Divider -->
            <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

            <!-- Undo/Redo -->
            <UButton
              size="sm"
              variant="outline"
              @click="editor?.chain().focus().undo().run()"
              :disabled="!editor?.can().chain().focus().undo().run()"
              icon="i-lucide-undo"
              square
            />
            <UButton
              size="sm"
              variant="outline"
              @click="editor?.chain().focus().redo().run()"
              :disabled="!editor?.can().chain().focus().redo().run()"
              icon="i-lucide-redo"
              square
            />
          </div>
        </div>
      </template>
      <template #default>
        <editor-content
          v-if="editor"
          :editor="editor"
          class="tiptap-editor__content prose max-w-none"
        />
      </template>
    </UCard>

    <!-- Custom Embed Modal -->
    <div v-if="showEmbedDialog" class="fixed inset-0 z-50 flex items-center justify-center">
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black bg-opacity-50"
        @click="showEmbedDialog = false"
      ></div>

      <!-- Modal -->
      <div class="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Add Embed</h3>
        </div>

        <!-- Body -->
        <div class="px-6 py-4 space-y-4">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              URL *
            </label>
            <input
              v-model="embedUrl"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title (optional)
            </label>
            <input
              v-model="embedTitle"
              type="text"
              placeholder="Video title or description"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg flex justify-end gap-2">
          <button
            type="button"
            @click="showEmbedDialog = false"
            class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="insertEmbed"
            :disabled="!embedUrl"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Embed
          </button>
        </div>
      </div>
    </div>
  </client-only>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Code from '@tiptap/extension-code'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import History from '@tiptap/extension-history'
import Image from '@tiptap/extension-image'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'


import { EmbedExtension } from '../extensions/embed'

// Custom TaskItem extension like in the docs
const CustomTaskItem = TaskItem.extend({
  content: 'inline*',
})

// Props: initial HTML content and context
const props = defineProps<{
  initialContent: string
  context?: 'trade' | 'page' | 'note'
  contextId?: string
}>()

// Emit update events
const emit = defineEmits<{
  (e: 'update', html: string): void
}>()

// Composables
const { uploadImage } = useImageUpload()
const toast = useToast()

// File input reference and loading state
const fileInput = ref<HTMLInputElement>()
const isUploading = ref(false)

// Embed dialog state
const showEmbedDialog = ref(false)
const embedUrl = ref('')
const embedTitle = ref('')

// Initialize Tiptap editor
const editor = useEditor({
  extensions: [
    Document,
    Paragraph,
    Text,
    Bold,
    Italic,
    Strike,
    Code,
    Heading,
    BulletList,
    OrderedList,
    ListItem,
    HorizontalRule,
    History,
    TaskList,
    TaskItem.configure({  // Use CustomTaskItem instead of TaskItem
      nested: true,
    }),

    Image.configure({
      inline: true,
      allowBase64: false, // We're using Supabase now
      HTMLAttributes: {
        class: 'editor-image',
      },
    }),
    EmbedExtension, // Custom embed extension
  ],
  content: props.initialContent,
  onUpdate({ editor }) {
    const html = editor.getHTML()
    emit('update', html)
  },
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
    },
  },
})

// Open embed dialog with debugging
const openEmbedDialog = () => {
  console.log('🔵 Opening embed dialog...')
  showEmbedDialog.value = true
  console.log('🔵 showEmbedDialog.value:', showEmbedDialog.value)
}

// Insert embed function with debugging
const insertEmbed = () => {
  console.log('🟢 Inserting embed...', { url: embedUrl.value, title: embedTitle.value })

  if (editor.value && embedUrl.value) {
    const success = editor.value.chain().focus().setEmbed({
      url: embedUrl.value,
      title: embedTitle.value || 'Embedded Content'
    }).run()

    console.log('🟢 Embed insertion success:', success)

    if (success) {
      // Reset form
      embedUrl.value = ''
      embedTitle.value = ''
      showEmbedDialog.value = false

      toast.add({
        title: 'Embed added successfully',
        color: 'success'
      })
    } else {
      console.log('🔴 Embed insertion failed')
      toast.add({
        title: 'Failed to add embed',
        description: 'Please check the URL and try again',
        color: 'error'
      })
    }
  } else {
    console.log('🔴 No editor or URL provided')
  }
}

// Trigger file input click
const triggerImageUpload = () => {
  fileInput.value?.click()
}

// Handle image upload with Supabase
const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  isUploading.value = true

  try {
    // Upload to Supabase
    const imageUrl = await uploadImage(
      file,
      props.context || 'page',
      props.contextId
    )

    // Insert image into editor
    if (editor.value) {
      editor.value.chain().focus().setImage({ src: imageUrl }).run()
    }

    toast.add({
      title: 'Image uploaded successfully',
      color: 'success'  // ✅ Valid Nuxt UI color
    })

  } catch (error) {
    console.error('Upload failed:', error)
    toast.add({
      title: 'Upload failed',
      description: error instanceof Error ? error.message : 'Unknown error',
      color: 'error'
    })
  } finally {
    isUploading.value = false
    target.value = '' // Clear the input
  }
}

// Clean up editor instance
onBeforeUnmount(() => {
  if (editor.value) {
    editor.value.destroy()
  }
})
</script>

<style scoped>

#header { /* Use your original selector instead of .ai-style-change-1 */
  position: sticky;
  top: -10px;
  z-index: 1;
  background-color: oklab(0.274 0.00165715 -0.00576662);
}

/* Basic editor styles */
.button-group {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
}

/* Ensure headings inside the editor are styled */
.tiptap-editor__content.prose :deep(h1) {
  font-size: 2rem;
  font-weight: bold;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}
.tiptap-editor__content.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 1.25rem;
  margin-bottom: 0.75rem;
}
.tiptap-editor__content.prose :deep(h3) {
  font-size: 1.25rem;
  font-weight: bold;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

/* Paragraph styles */
.tiptap-editor__content.prose :deep(p) {
  margin: 0.75rem 0;
  line-height: 1.6;
}

/* List styles */
.tiptap-editor__content.prose :deep(ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin: 1rem 0;
}
.tiptap-editor__content.prose :deep(ol) {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin: 1rem 0;
}
.tiptap-editor__content.prose :deep(li) {
  margin-bottom: 0.25rem;
  line-height: 1.5;
}

/* Code styles */
.tiptap-editor__content.prose :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
  font-size: 0.875em;
}

.dark .tiptap-editor__content.prose :deep(code) {
  background-color: #374151;
  color: #f9fafb;
}

/* Horizontal rule styles */
.tiptap-editor__content.prose :deep(hr) {
  border: none;
  border-top: 2px solid #e5e7eb;
  margin: 2rem 0;
}

.dark .tiptap-editor__content.prose :deep(hr) {
  border-top-color: #4b5563;
}

/* Task list specific styles - Updated with proper CSS and .tiptap wrapper */
.tiptap-editor__content :deep(.tiptap ul[data-type="taskList"]) {
  list-style: none;
  margin-left: 0;
  padding: 0;
}

.tiptap-editor__content :deep(.tiptap ul[data-type="taskList"] li) {
  align-items: center;
  display: flex;
}

.tiptap-editor__content :deep(.tiptap ul[data-type="taskList"] li > label) {
  flex: 0 0 auto;
  margin-right: 0.5rem;
  user-select: none;
}

.tiptap-editor__content :deep(.tiptap ul[data-type="taskList"] li > div) {
  flex: 1 1 auto;
}

.tiptap-editor__content :deep(.tiptap ul[data-type="taskList"] input[type="checkbox"]) {
  cursor: pointer;
}

.tiptap-editor__content :deep(ul[data-type="taskList"] li) {
  max-height: 1.7rem; /* Adjust this value as needed */
}


/* Image styles */
.tiptap-editor__content.prose :deep(.editor-image) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tiptap-editor__content.prose :deep(.editor-image:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Image selection styles */
.tiptap-editor__content.prose :deep(.ProseMirror-selectednode.editor-image) {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Focus styles */
.tiptap-editor__content.prose :deep(.ProseMirror:focus) {
  outline: none;
}

/* Placeholder styles */
.tiptap-editor__content.prose :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

/* Embed styles */
.tiptap-editor__content.prose :deep(.embed-wrapper) {
  margin: 1rem 0;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.tiptap-editor__content.prose :deep(.embed-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.tiptap-editor__content.prose :deep(.embed-title) {
  font-weight: 500;
  font-size: 0.875rem;
}

.tiptap-editor__content.prose :deep(.embed-link) {
  text-decoration: none;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.tiptap-editor__content.prose :deep(.embed-link:hover) {
  opacity: 1;
}

/* YouTube embed styles */
.tiptap-editor__content.prose :deep(.youtube-embed iframe) {
  width: 100%;
  min-height: 315px;
}

/* Loom embed styles - responsive wrapper */
.tiptap-editor__content.prose :deep(.loom-embed) {
  border: none; /* Remove border for cleaner look */
}

.tiptap-editor__content.prose :deep(.loom-embed > div) {
  /* The responsive wrapper div already has inline styles */
}

/* Default iframe embed styles */
.tiptap-editor__content.prose :deep(.iframe-embed iframe) {
  width: 100%;
  min-height: 400px;
}

/* Dark mode embed styles */
.dark .tiptap-editor__content.prose :deep(.embed-wrapper) {
  border-color: #4b5563;
}

.dark .tiptap-editor__content.prose :deep(.embed-header) {
  background-color: #374151;
  border-bottom-color: #4b5563;
}
</style>

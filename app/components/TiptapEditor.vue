<template>
    <client-only>
      <UCard variant="subtle" class="w-full">
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
    </client-only>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

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

// Initialize Tiptap editor
const editor = useEditor({
  extensions: [
    StarterKit,
    Image.configure({
      inline: true,
      allowBase64: false, // We're using Supabase now
      HTMLAttributes: {
        class: 'editor-image',
      },
    })
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
/* Basic editor styles */
.button-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
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
</style>

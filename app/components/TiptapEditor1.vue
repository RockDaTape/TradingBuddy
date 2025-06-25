<template>
  <client-only>
    <UCard variant="subtle" class="w-full">
      <template #header>
        <div class="control-group px-4">
          <div class="button-group">
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
            />

            <!-- Hidden file input -->
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              style="display: none;"
            />

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
          class="tiptap-editor__content prose"
        />
      </template>
    </UCard>
  </client-only>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'

// Props: initial HTML content
const props = defineProps<{
  initialContent: string
}>()

// Emit update events
const emit = defineEmits<{
  (e: 'update', html: string): void
}>()

// File input reference
const fileInput = ref<HTMLInputElement>()

// Initialize Tiptap editor with prop content and Image extension
const editor = useEditor({
  extensions: [
    StarterKit,
    Image.configure({
      inline: true,
      allowBase64: true,
      HTMLAttributes: {
        class: 'editor-image',
      },
    })
  ],
  content: props.initialContent,
  onUpdate({ editor }) {
    const html = editor.getHTML()
    emit('update', html)
  }
})

// Trigger file input click
const triggerImageUpload = () => {
  fileInput.value?.click()
}

// Handle image upload
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) return

  // Check file type
  if (!file.type.startsWith('image/')) {
    alert('Please select an image file')
    return
  }

  // Check file size (limit to 5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('File size should be less than 5MB')
    return
  }

  // Convert to base64 and insert
  const reader = new FileReader()
  reader.onload = (e) => {
    const src = e.target?.result as string
    if (src && editor.value) {
      editor.value.chain().focus().setImage({ src }).run()
    }
  }
  reader.readAsDataURL(file)

  // Clear the input
  target.value = ''
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
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

/* Ensure headings inside the editor are styled */
.tiptap-editor__content.prose :deep(h1) {
  font-size: 2rem;
}
.tiptap-editor__content.prose :deep(h2) {
  font-size: 1.5rem;
}
.tiptap-editor__content.prose :deep(h3) {
  font-size: 1.25rem;
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
  margin-bottom: 0.5rem;
}

/* Image styles */
.tiptap-editor__content.prose :deep(.editor-image) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1rem 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Image selection styles */
.tiptap-editor__content.prose :deep(.ProseMirror-selectednode.editor-image) {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

</style>

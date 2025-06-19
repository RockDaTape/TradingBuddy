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
                @click="editor.chain().focus().toggleBold().run()"
                :disabled="!editor.can().chain().focus().toggleBold().run()"
                :active="editor.isActive('bold')"
              >
                Bold
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                active-variant="solid"
                active-color="primary"
                @click="editor.chain().focus().toggleItalic().run()"
                :disabled="!editor.can().chain().focus().toggleItalic().run()"
                :active="editor.isActive('italic')"
              >
                Italic
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                active-variant="solid"
                active-color="primary"
                @click="editor.chain().focus().toggleStrike().run()"
                :disabled="!editor.can().chain().focus().toggleStrike().run()"
                :active="editor.isActive('strike')"
              >
                Strike
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                active-variant="solid"
                active-color="primary"
                @click="editor.chain().focus().toggleCode().run()"
                :disabled="!editor.can().chain().focus().toggleCode().run()"
                :active="editor.isActive('code')"
              >
                Code
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                active-variant="solid"
                active-color="primary"
                @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                :disabled="!editor.can().chain().focus().toggleHeading({ level: 1 }).run()"
                :active="editor.isActive('heading', { level: 1 })"
              >
                H1
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                active-variant="solid"
                active-color="primary"
                @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                :disabled="!editor.can().chain().focus().toggleHeading({ level: 2 }).run()"
                :active="editor.isActive('heading', { level: 2 })"
              >
                H2
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                active-variant="solid"
                active-color="primary"
                @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                :disabled="!editor.can().chain().focus().toggleHeading({ level: 3 }).run()"
                :active="editor.isActive('heading', { level: 3 })"
              >
                H3
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                active-variant="solid"
                active-color="primary"
                @click="editor.chain().focus().toggleBulletList().run()"
                :disabled="!editor.can().chain().focus().toggleBulletList().run()"
                :active="editor.isActive('bulletList')"
              >
                Bullet list
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                active-variant="solid"
                active-color="primary"
                @click="editor.chain().focus().toggleOrderedList().run()"
                :disabled="!editor.can().chain().focus().toggleOrderedList().run()"
                :active="editor.isActive('orderedList')"
              >
                Ordered list
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                @click="editor.chain().focus().setHorizontalRule().run()"
                :disabled="!editor.can().chain().focus().setHorizontalRule().run()"
              >
                Horizontal rule
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                @click="editor.chain().focus().undo().run()"
                :disabled="!editor.can().chain().focus().undo().run()"
              >
                Undo
              </UButton>
              <UButton
                size="sm"
                variant="outline"
                @click="editor.chain().focus().redo().run()"
                :disabled="!editor.can().chain().focus().redo().run()"
              >
                Redo
              </UButton>
            </div>
          </div>
        </template>
        <template #default>
          <editor-content
            :editor="editor"
            class="tiptap-editor__content prose"
          />
        </template>
      </UCard>
    </client-only>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'

// Persist editor content across reloads
const STORAGE_KEY  = 'tiptap-content';
const savedContent = localStorage.getItem(STORAGE_KEY) || '';

const editor = useEditor({
  // load saved HTML (or start empty)
  content: savedContent,
  extensions: [StarterKit],
  // after every change, write HTML back to localStorage
  onUpdate({ editor }) {
    localStorage.setItem(STORAGE_KEY, editor.getHTML());
  },
  // …any other config you already have…
});
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
  font-weight: 600;
  margin: 1.5em 0 0.75em;
}
.tiptap-editor__content.prose :deep(h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.25em 0 0.5em;
}
.tiptap-editor__content.prose :deep(h3) {
  font-size: 1.25rem;
  font-weight: 500;
  margin: 1em 0 0.5em;
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
</style>

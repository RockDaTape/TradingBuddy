<script setup lang="ts">
import type { TagGroup, Tag } from '~/types/Tag'

// Component Props: Data passed from parent component
interface Props {
  roundTurnId: string      // The trade ID we're tagging
  initialTags?: Tag[]      // Tags already assigned to this trade
}

const props = defineProps<Props>()

// Component Events: What this component can emit to parent
const emit = defineEmits<{
  tagsUpdated: [tags: Tag[]]  // Notify parent when tags change
}>()

// Reactive State: Component's dynamic data
const showTagModal = ref(false)              // Controls modal visibility
const searchQuery = ref('')                  // Search filter text
const saving = ref(false)                    // Loading state for save operation
const selectedTags = ref<Tag[]>(props.initialTags || [])  // Currently assigned tags
const tempSelectedTagIds = ref<Set<number>>(new Set())    // Temporary selection for modal

// Data Fetching: Get all available tag groups and tags
const { data: tagGroups } = await useFetch<TagGroup[]>('/api/tag-groups')

// Computed Properties: Reactive calculated values

// Filter tag groups based on search query
const filteredTagGroups = computed(() => {
  if (!searchQuery.value) return tagGroups.value || []

  const query = searchQuery.value.toLowerCase()
  return (tagGroups.value || []).map((group: TagGroup) => ({
    ...group,
    // Only include tags that match the search
    tags: group.tags.filter((tag: Tag) =>
      tag.name.toLowerCase().includes(query)
    )
  })).filter((group: TagGroup) => group.tags.length > 0)  // Remove empty groups
})

// Methods: Component functionality

// Check if a tag is currently selected in the modal
const isTagSelected = (tagId: number) => {
  return tempSelectedTagIds.value.has(tagId)
}

// Toggle tag selection in the modal (add/remove from temporary selection)
const toggleTag = (tag: Tag) => {
  if (tempSelectedTagIds.value.has(tag.id)) {
    tempSelectedTagIds.value.delete(tag.id)
  } else {
    tempSelectedTagIds.value.add(tag.id)
  }
}

// Remove a tag immediately (from the badge display)
const removeTag = async (tagId: number) => {
  // Update local state immediately
  selectedTags.value = selectedTags.value.filter(tag => tag.id !== tagId)
  emit('tagsUpdated', selectedTags.value)

  // Update on server - send remaining tag IDs
  const remainingTagIds = selectedTags.value.map(tag => tag.id)
  if (remainingTagIds.length > 0) {
    await updateTagsOnServer(remainingTagIds)
  } else {
    // If no tags left, we still need to clear the server
    await updateTagsOnServer([])
  }
}

// Save the selected tags from the modal
const saveTags = async () => {
  saving.value = true
  try {
    const tagIds = Array.from(tempSelectedTagIds.value)

    // Update server with new tag selection
    await updateTagsOnServer(tagIds)

    // Update local state with the new tags
    if (tagIds.length > 0) {
      const allTags = (tagGroups.value || []).flatMap((group: TagGroup) => group.tags)
      selectedTags.value = allTags.filter((tag: Tag) => tagIds.includes(tag.id))
    } else {
      selectedTags.value = []
    }

    // Notify parent component of changes
    emit('tagsUpdated', selectedTags.value)
    showTagModal.value = false
  } catch (error) {
    console.error('Error saving tags:', error)
  } finally {
    saving.value = false
  }
}

// Helper function: Send tag updates to the server
const updateTagsOnServer = async (tagIds: number[]) => {
  await $fetch(`/api/round-turns/${props.roundTurnId}/tags`, {
    method: 'POST',
    body: { tagIds }
  })
}

// Watchers: React to state changes

// Initialize temporary selection when modal opens
watch(showTagModal, (isOpen) => {
  if (isOpen) {
    // Set temp selection to match current tags
    tempSelectedTagIds.value = new Set(selectedTags.value.map(tag => tag.id))
  }
})
</script>

<template>
  <div class="space-y-4">
    <!-- Header Section: Title and main action button -->
    <div class="flex justify-between items-center">
      <h4 class="font-medium">Tags</h4>
      <UButton
        @click="showTagModal = true"
        size="sm"
        variant="outline"
        icon="i-heroicons-tag"
        label="Add Tags"
      />
    </div>

    <!-- Current Tags Display: Show assigned tags as removable badges -->
    <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-2">
      <UBadge
        v-for="tag in selectedTags"
        :key="tag.id"
        :label="tag.name"
        :style="tag.tag_group.color ? { backgroundColor: tag.tag_group.color } : {}"
        closable
        @close="removeTag(tag.id)"
      />
    </div>
    <!-- Empty State: Show when no tags are assigned -->
    <div v-else class="text-gray-500 text-sm">
      No tags assigned
    </div>

    <!-- Tag Selection Modal: Interface for choosing tags -->
    <UModal v-model="showTagModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Select Tags</h3>
        </template>

        <div class="space-y-4">
          <!-- Search Input: Filter tags by name -->
          <UInput
            v-model="searchQuery"
            placeholder="Search tags..."
            icon="i-heroicons-magnifying-glass"
          />

          <!-- Tag Groups Display: Organized list of all available tags -->
          <div class="space-y-4 max-h-96 overflow-y-auto">
            <div
              v-for="group in filteredTagGroups"
              :key="group.id"
              class="space-y-2"
            >
              <!-- Group Header: Name with color indicator -->
              <h4 class="font-medium flex items-center gap-2">
                <span
                  v-if="group.color"
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: group.color }"
                ></span>
                {{ group.name }}
              </h4>

              <!-- Tags Grid: Checkboxes for each tag in the group -->
              <div class="grid grid-cols-2 gap-2">
                <div
                  v-for="tag in group.tags"
                  :key="tag.id"
                  class="flex items-center space-x-2"
                >
                  <!-- Tag Checkbox: Allow selection/deselection -->
                  <UCheckbox
                    :model-value="isTagSelected(tag.id)"
                    @update:model-value="toggleTag(tag)"
                  />
                  <span class="text-sm">{{ tag.name }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer: Action buttons -->
        <template #footer>
          <div class="flex justify-end gap-2">
            <UButton
              variant="ghost"
              @click="showTagModal = false"
              label="Cancel"
            />
            <UButton
              @click="saveTags"
              :loading="saving"
              label="Save Tags"
            />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

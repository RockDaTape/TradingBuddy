<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { TagGroup } from '~/types/Tag'

// Define emits for parent communication
const emit = defineEmits<{
  refresh: []
}>()

// ========================================
// FORM VALIDATION SCHEMAS
// ========================================
const tagGroupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().optional()
})

const tagSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tag_group_id: z.string().min(1, 'Please select a tag group')
})

type TagGroupSchema = z.output<typeof tagGroupSchema>
type TagSchema = z.output<typeof tagSchema>

// ========================================
// REACTIVE STATE MANAGEMENT
// ========================================
const creatingGroup = ref(false)
const creatingTag = ref(false)
const deletingGroupId = ref<number | null>(null)
const deletingTagId = ref<number | null>(null)

// ========================================
// FORM DATA OBJECTS
// ========================================
const tagGroupState = reactive({
  name: undefined,
  description: undefined,
  color: '#3B82F6'
})

const tagState = reactive({
  name: undefined,
  tag_group_id: undefined
})

// ========================================
// DATA FETCHING
// ========================================
const { data: tagGroups, pending } = await useFetch<TagGroup[]>('/api/tag-groups', {
  key: 'tag-groups-list'
})

// ========================================
// COMPONENT METHODS
// ========================================
async function onSubmitTagGroup(event: FormSubmitEvent<TagGroupSchema>) {
  creatingGroup.value = true
  try {
    console.log('Raw form data:', event.data)

    // Clean the data - remove empty strings and undefined values
    const cleanData: any = {
      name: event.data.name
    }

    if (event.data.description && event.data.description.trim() !== '') {
      cleanData.description = event.data.description
    }

    if (event.data.color && event.data.color.trim() !== '') {
      cleanData.color = event.data.color
    }

    console.log('Cleaned data being sent:', cleanData)

    const response = await $fetch('/api/tag-groups', {
      method: 'POST',
      body: cleanData
    })

    console.log('Success response:', response)

    // Reset form
    Object.assign(tagGroupState, {
      name: undefined,
      description: undefined,
      color: '#3B82F6'
    })

    emit('refresh') // Notify parent to refresh data
  } catch (error: any) {
    console.error('Full error object:', error)
    console.error('Error data:', error.data)
    console.error('Error message:', error.message)
    console.error('Error status:', error.statusCode)
  } finally {
    creatingGroup.value = false
  }
}

async function onSubmitTag(event: FormSubmitEvent<TagSchema>) {
  creatingTag.value = true
  try {
    await $fetch('/api/tags', {
      method: 'POST',
      body: {
        name: event.data.name,
        tag_group_id: parseInt(event.data.tag_group_id)
      }
    })

    // Reset form
    Object.assign(tagState, {
      name: undefined,
      tag_group_id: undefined
    })

    emit('refresh') // Notify parent to refresh data
  } catch (error) {
    console.error('Error creating tag:', error)
  } finally {
    creatingTag.value = false
  }
}

async function deleteTagGroup(groupId: number) {
  const group = tagGroups.value?.find(g => g.id === groupId)

  if (group?.tags && group.tags.length > 0) {
    // Show confirmation if group has tags
    const confirmed = confirm(`Are you sure you want to delete "${group.name}"? This will also delete all ${group.tags.length} tags in this group.`)
    if (!confirmed) return
  } else {
    // Simple confirmation for empty groups
    const confirmed = confirm(`Are you sure you want to delete "${group?.name}"?`)
    if (!confirmed) return
  }

  deletingGroupId.value = groupId
  try {
    await $fetch(`/api/tag-groups/${groupId}`, {
      method: 'DELETE'
    })

    emit('refresh') // Notify parent to refresh data
  } catch (error) {
    console.error('Error deleting tag group:', error)
  } finally {
    deletingGroupId.value = null
  }
}

async function deleteTag(tagId: number, tagName: string) {
  const confirmed = confirm(`Are you sure you want to delete the tag "${tagName}"?`)
  if (!confirmed) return

  deletingTagId.value = tagId
  try {
    await $fetch(`/api/tags/${tagId}`, {
      method: 'DELETE'
    })

    emit('refresh') // Notify parent to refresh data
  } catch (error) {
    console.error('Error deleting tag:', error)
  } finally {
    deletingTagId.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- ========================================
         CREATE TAG GROUP CARD
         ======================================== -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <UIcon name="i-heroicons-folder-plus" class="w-5 h-5" />
          Create Tag Group
        </h3>
      </template>

      <UForm
        :schema="tagGroupSchema"
        :state="tagGroupState"
        class="space-y-4"
        @submit="onSubmitTagGroup"
      >
        <UFormGroup label="Group Name" name="name" required>
          <UInput
            v-model="tagGroupState.name"
            placeholder="e.g., Trading Strategies"
          />
        </UFormGroup>

        <UFormGroup label="Description (Optional)" name="description">
          <UTextarea
            v-model="tagGroupState.description"
            placeholder="Brief description of this tag group"
            :rows="2"
          />
        </UFormGroup>

        <UFormGroup label="Color" name="color">
          <div class="flex items-center gap-3">
            <UInput
              v-model="tagGroupState.color"
              type="color"
              class="w-16"
            />
            <span class="text-sm text-gray-500">{{ tagGroupState.color }}</span>
          </div>
        </UFormGroup>

        <div class="flex justify-end">
          <UButton
            type="submit"
            :loading="creatingGroup"
            label="Create Group"
            icon="i-heroicons-plus"
          />
        </div>
      </UForm>
    </UCard>

    <!-- ========================================
         CREATE TAG CARD
         ======================================== -->
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <UIcon name="i-heroicons-tag" class="w-5 h-5" />
          Create Tag
        </h3>
      </template>

      <UForm
        :schema="tagSchema"
        :state="tagState"
        class="space-y-4"
        @submit="onSubmitTag"
      >
        <UFormGroup label="Tag Group" name="tag_group_id" required>
          <USelectMenu
            v-model="tagState.tag_group_id"
            :options="tagGroups || []"
            placeholder="Select a tag group"
            value-attribute="id"
            option-attribute="name"
            :disabled="!tagGroups || tagGroups.length === 0"
          >
            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <span
                  v-if="option.color"
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: option.color }"
                ></span>
                {{ option.name }}
              </div>
            </template>
          </USelectMenu>
        </UFormGroup>

        <UFormGroup label="Tag Name" name="name" required>
          <UInput
            v-model="tagState.name"
            placeholder="e.g., Breakout, Swing Trade"
          />
        </UFormGroup>

        <div class="flex justify-end">
          <UButton
            type="submit"
            :loading="creatingTag"
            :disabled="!tagGroups || tagGroups.length === 0"
            label="Create Tag"
            icon="i-heroicons-plus"
          />
        </div>
      </UForm>

      <!-- Helper text when no groups exist -->
      <div v-if="!tagGroups || tagGroups.length === 0" class="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
        <p class="text-sm text-amber-600 dark:text-amber-400">
          Create a tag group first before adding individual tags.
        </p>
      </div>
    </UCard>

    <!-- ========================================
         LOADING STATE
         ======================================== -->
    <div v-if="pending" class="flex justify-center py-8">
      <USpinner size="lg" />
    </div>

    <!-- ========================================
         EXISTING TAG GROUPS DISPLAY
         ======================================== -->
    <div v-else class="space-y-4">
      <h3 class="text-lg font-semibold">Existing Tag Groups</h3>

      <!-- Individual Tag Group Cards -->
      <div
        v-for="group in tagGroups"
        :key="group.id"
        class="border rounded-lg p-4"
      >
        <!-- Group Header -->
        <div class="flex justify-between items-start mb-3">
          <div class="flex-1">
            <h4 class="text-md font-semibold flex items-center gap-2">
              <span
                v-if="group.color"
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: group.color }"
              ></span>
              {{ group.name }}
            </h4>
            <p v-if="group.description" class="text-gray-600 text-sm">
              {{ group.description }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <div class="text-sm text-gray-500">
              {{ group.tags?.length || 0 }} tags
            </div>
            <UButton
              @click="deleteTagGroup(group.id)"
              size="sm"
              variant="ghost"
              color="red"
              icon="i-heroicons-trash"
              :loading="deletingGroupId === group.id"
              :disabled="deletingGroupId !== null"
              square
            />
          </div>
        </div>

        <!-- Tags Display -->
        <div class="flex flex-wrap gap-2">
          <div
            v-for="tag in group.tags"
            :key="tag.id"
            class="flex items-center gap-1"
          >
            <UBadge
              :label="tag.name"
              :style="group.color ? { backgroundColor: group.color } : {}"
              class="cursor-pointer"
            />
            <UButton
              @click="deleteTag(tag.id, tag.name)"
              size="2xs"
              variant="ghost"
              color="red"
              icon="i-heroicons-x-mark"
              :loading="deletingTagId === tag.id"
              :disabled="deletingTagId !== null"
              square
              class="ml-1"
            />
          </div>
          <UBadge
            v-if="group.tags?.length === 0"
            label="No tags yet"
            color="gray"
            variant="soft"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="tagGroups && tagGroups.length === 0" class="text-center py-8">
        <div class="text-gray-500 mb-4">
          <UIcon name="i-heroicons-tag" class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p class="text-lg font-medium">No tag groups yet</p>
          <p class="text-sm">Create your first tag group above to start organizing your trades</p>
        </div>
      </div>
    </div>
  </div>
</template>

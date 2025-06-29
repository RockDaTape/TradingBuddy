<script setup lang="ts">
import { z } from 'zod'
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
  name: z.string().min(1, 'Name is required')
})

// ========================================
// REACTIVE STATE MANAGEMENT
// ========================================
const showCreateGroupModal = ref(false)
const showCreateTagModalValue = ref(false)
const selectedGroup = ref<TagGroup | null>(null)
const creatingGroup = ref(false)
const creatingTag = ref(false)

// ========================================
// FORM DATA OBJECTS
// ========================================
const tagGroupForm = reactive({
  name: '',
  description: '',
  color: '#3B82F6'
})

const tagForm = reactive({
  name: ''
})

// ========================================
// DATA FETCHING
// ========================================
// Receive tag groups as props instead of fetching here
const props = defineProps<{
  tagGroups: TagGroup[] | null
  pending?: boolean
}>()

// ========================================
// COMPONENT METHODS
// ========================================
const showCreateTagModal = (group: TagGroup) => {
  selectedGroup.value = group
  tagForm.name = ''
  showCreateTagModalValue.value = true
}

const createTagGroup = async (data: any) => {
  creatingGroup.value = true
  try {
    await $fetch('/api/tag-groups', {
      method: 'POST',
      body: data
    })

    showCreateGroupModal.value = false
    Object.assign(tagGroupForm, { name: '', description: '', color: '#3B82F6' })
    emit('refresh') // Notify parent to refresh data
  } catch (error) {
    console.error('Error creating tag group:', error)
  } finally {
    creatingGroup.value = false
  }
}

const createTag = async (data: any) => {
  if (!selectedGroup.value) return

  creatingTag.value = true
  try {
    await $fetch('/api/tags', {
      method: 'POST',
      body: {
        name: data.name,
        tag_group_id: selectedGroup.value.id
      }
    })

    showCreateTagModalValue.value = false
    tagForm.name = ''
    emit('refresh') // Notify parent to refresh data
  } catch (error) {
    console.error('Error creating tag:', error)
  } finally {
    creatingTag.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- ========================================
         PAGE HEADER SECTION
         ======================================== -->

    <!-- ========================================
         LOADING STATE
         ======================================== -->
    <div v-if="pending" class="flex justify-center py-8">
      <USpinner size="lg" />
    </div>

    <!-- ========================================
         MAIN CONTENT AREA
         ======================================== -->
    <div v-else class="space-y-4">
      <!-- ========================================
           TAG GROUP CARDS
           ======================================== -->
      <div
        v-for="group in tagGroups"
        :key="group.id"
        class="border rounded-lg p-4"
      >
        <!-- Group Header -->
        <div class="flex justify-between items-start mb-3">
          <div>
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <span
                v-if="group.color"
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: group.color }"
              ></span>
              {{ group.name }}
            </h3>
            <p v-if="group.description" class="text-gray-600 text-sm">
              {{ group.description }}
            </p>
          </div>
          <UButton
            @click="showCreateTagModal(group)"
            size="sm"
            variant="outline"
            icon="i-heroicons-plus"
            label="Add Tag"
          />
        </div>

        <!-- Tags Display -->
        <div class="flex flex-wrap gap-2">
          <UBadge
            v-for="tag in group.tags"
            :key="tag.id"
            :label="tag.name"
            :style="group.color ? { backgroundColor: group.color } : {}"
            class="cursor-pointer"
          />
          <UBadge
            v-if="group.tags.length === 0"
            label="No tags yet"
            color="gray"
            variant="soft"
          />
        </div>
      </div>

      <!-- ========================================
           EMPTY STATE
           ======================================== -->
      <div v-if="tagGroups && tagGroups.length === 0" class="text-center py-8">
        <div class="text-gray-500 mb-4">
          <UIcon name="i-heroicons-tag" class="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p class="text-lg font-medium">No tag groups yet</p>
          <p class="text-sm">Create your first tag group to start organizing your trades</p>
        </div>
        <UButton
          @click="showCreateGroupModal = true"
          label="Create Your First Tag Group"
          size="lg"
        />
      </div>
    </div>

    <!-- Modals remain the same... -->
    <UModal v-model="showCreateGroupModal">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Create Tag Group</h3>
        </template>

        <UForm
          :schema="tagGroupSchema"
          :state="tagGroupForm"
          @submit="createTagGroup"
          class="space-y-4"
        >
          <UFormGroup label="Name" name="name" required>
            <UInput v-model="tagGroupForm.name" placeholder="e.g., Trading Strategies" />
          </UFormGroup>

          <UFormGroup label="Description" name="description">
            <UTextarea v-model="tagGroupForm.description" placeholder="Optional description" />
          </UFormGroup>

          <UFormGroup label="Color" name="color">
            <UInput v-model="tagGroupForm.color" type="color" />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              variant="ghost"
              @click="showCreateGroupModal = false"
              label="Cancel"
            />
            <UButton
              type="submit"
              :loading="creatingGroup"
              label="Create Group"
            />
          </div>
        </UForm>
      </UCard>
    </UModal>

    <UModal v-model="showCreateTagModalValue">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            Add Tag to {{ selectedGroup?.name }}
          </h3>
        </template>

        <UForm
          :schema="tagSchema"
          :state="tagForm"
          @submit="createTag"
          class="space-y-4"
        >
          <UFormGroup label="Tag Name" name="name" required>
            <UInput v-model="tagForm.name" placeholder="e.g., Breakout" />
          </UFormGroup>

          <div class="flex justify-end gap-2">
            <UButton
              type="button"
              variant="ghost"
              @click="showCreateTagModalValue = false"
              label="Cancel"
            />
            <UButton
              type="submit"
              :loading="creatingTag"
              label="Create Tag"
            />
          </div>
        </UForm>
      </UCard>
    </UModal>
  </div>
</template>

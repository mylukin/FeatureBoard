<script setup lang="ts">
import { ref, inject, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { createFeature } from '../api';
import type { FeatureStatus } from '../types';

const router = useRouter();

// Inject global state from App.vue
const globalLoading = inject<Ref<boolean>>('globalLoading')!;
const globalError = inject<Ref<string | null>>('globalError')!;

// Form state
const title = ref('');
const description = ref('');
const module = ref('');
const status = ref<FeatureStatus>('todo');
const priority = ref(3);

// Validation state
const titleError = ref('');
const isSubmitting = ref(false);

const statusOptions: { value: FeatureStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'doing', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

function validateForm(): boolean {
  titleError.value = '';
  if (!title.value.trim()) {
    titleError.value = 'Title is required';
    return false;
  }
  return true;
}

async function handleSubmit() {
  if (!validateForm()) return;

  isSubmitting.value = true;
  globalLoading.value = true;
  globalError.value = null;

  try {
    await createFeature({
      title: title.value.trim(),
      description: description.value.trim() || undefined,
      module: module.value.trim() || undefined,
      status: status.value,
      priority: priority.value,
    });
    router.push('/');
  } catch (err) {
    globalError.value = err instanceof Error ? err.message : 'Failed to create feature';
  } finally {
    isSubmitting.value = false;
    globalLoading.value = false;
  }
}
</script>

<template>
  <div class="max-w-2xl">
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Create New Feature</h1>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Title -->
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700">
          Title <span class="text-red-500">*</span>
        </label>
        <input
          id="title"
          v-model="title"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          :class="{ 'border-red-500': titleError }"
          placeholder="Enter feature title"
        />
        <p v-if="titleError" class="mt-1 text-sm text-red-500">{{ titleError }}</p>
      </div>

      <!-- Description -->
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          v-model="description"
          rows="4"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter feature description (optional)"
        ></textarea>
      </div>

      <!-- Module -->
      <div>
        <label for="module" class="block text-sm font-medium text-gray-700">
          Module
        </label>
        <input
          id="module"
          v-model="module"
          type="text"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="e.g., frontend, backend, test"
        />
      </div>

      <!-- Status -->
      <div>
        <label for="status" class="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          v-model="status"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Priority -->
      <div>
        <label for="priority" class="block text-sm font-medium text-gray-700">
          Priority (1-5)
        </label>
        <select
          id="priority"
          v-model.number="priority"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option :value="1">1 (Lowest)</option>
          <option :value="2">2</option>
          <option :value="3">3 (Default)</option>
          <option :value="4">4</option>
          <option :value="5">5 (Highest)</option>
        </select>
      </div>

      <!-- Buttons -->
      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Creating...' : 'Create Feature' }}
        </button>
        <router-link
          to="/"
          class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </router-link>
      </div>
    </form>
  </div>
</template>

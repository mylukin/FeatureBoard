<script setup lang="ts">
import { ref, inject, onMounted, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { fetchFeature } from '../api';
import type { Feature, FeatureStatus } from '../types';
import { ArrowLeft, Pencil, Calendar, Flag, Layers } from 'lucide-vue-next';

const route = useRoute();
const featureId = Number(route.params.id);

const globalLoading = inject<Ref<boolean>>('globalLoading')!;
const globalError = inject<Ref<string | null>>('globalError')!;

const feature = ref<Feature | null>(null);
const isLoading = ref(true);
const notFound = ref(false);

const statusColors: Record<FeatureStatus, string> = {
  todo: 'bg-gray-100 text-gray-800',
  doing: 'bg-blue-100 text-blue-800',
  done: 'bg-green-100 text-green-800',
};

const statusLabels: Record<FeatureStatus, string> = {
  todo: 'To Do',
  doing: 'In Progress',
  done: 'Done',
};

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function loadFeature() {
  isLoading.value = true;
  globalLoading.value = true;
  globalError.value = null;

  try {
    const data = await fetchFeature(featureId);
    feature.value = data;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to load feature';
    if (errorMessage.includes('404') || errorMessage.toLowerCase().includes('not found')) {
      notFound.value = true;
    } else {
      globalError.value = errorMessage;
    }
  } finally {
    isLoading.value = false;
    globalLoading.value = false;
  }
}

onMounted(() => {
  loadFeature();
});
</script>

<template>
  <div class="max-w-2xl">
    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <p class="text-gray-500">Loading feature...</p>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="text-center py-12">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Feature Not Found</h2>
      <p class="text-gray-500 mb-4">The feature you're looking for doesn't exist.</p>
      <router-link
        to="/"
        class="inline-flex items-center text-blue-600 hover:text-blue-800"
      >
        <ArrowLeft class="w-4 h-4 mr-1" />
        Back to List
      </router-link>
    </div>

    <!-- Feature Content -->
    <div v-else-if="feature">
      <!-- Back Link -->
      <router-link
        to="/"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft class="w-4 h-4 mr-1" />
        Back to List
      </router-link>

      <!-- Header: Title + Status -->
      <div class="flex items-start justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ feature.title }}</h1>
        <span
          :class="[
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            statusColors[feature.status],
          ]"
        >
          {{ statusLabels[feature.status] }}
        </span>
      </div>

      <!-- Description -->
      <div v-if="feature.description" class="mb-6">
        <h2 class="text-sm font-medium text-gray-700 mb-2">Description</h2>
        <p class="text-gray-600 whitespace-pre-line bg-gray-50 rounded-lg p-4">
          {{ feature.description }}
        </p>
      </div>
      <div v-else class="mb-6">
        <h2 class="text-sm font-medium text-gray-700 mb-2">Description</h2>
        <p class="text-gray-400 italic">No description provided.</p>
      </div>

      <!-- Metadata Grid -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <!-- Module -->
        <div class="flex items-center text-sm">
          <Layers class="w-4 h-4 text-gray-400 mr-2" />
          <span class="text-gray-500 mr-1">Module:</span>
          <span class="text-gray-900 font-medium">{{ feature.module || 'other' }}</span>
        </div>

        <!-- Priority -->
        <div class="flex items-center text-sm">
          <Flag class="w-4 h-4 text-gray-400 mr-2" />
          <span class="text-gray-500 mr-1">Priority:</span>
          <span class="text-gray-900 font-medium">{{ feature.priority }}</span>
        </div>

        <!-- Created -->
        <div class="flex items-center text-sm">
          <Calendar class="w-4 h-4 text-gray-400 mr-2" />
          <span class="text-gray-500 mr-1">Created:</span>
          <span class="text-gray-900">{{ formatDate(feature.createdAt) }}</span>
        </div>

        <!-- Updated -->
        <div class="flex items-center text-sm">
          <Calendar class="w-4 h-4 text-gray-400 mr-2" />
          <span class="text-gray-500 mr-1">Updated:</span>
          <span class="text-gray-900">{{ formatDate(feature.updatedAt) }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="border-t pt-6">
        <router-link
          :to="`/edit/${feature.id}`"
          class="inline-flex items-center justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Pencil class="w-4 h-4 mr-2" />
          Edit Feature
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, type Ref } from 'vue';
import { fetchFeatures } from '../api';
import type { Feature } from '../types';

// Inject global state from App.vue
const globalLoading = inject<Ref<boolean>>('globalLoading')!;
const globalError = inject<Ref<string | null>>('globalError')!;

const features = ref<Feature[]>([]);

async function loadFeatures() {
  globalLoading.value = true;
  globalError.value = null;
  try {
    features.value = await fetchFeatures();
  } catch (err) {
    globalError.value = err instanceof Error ? err.message : 'Failed to load features';
  } finally {
    globalLoading.value = false;
  }
}

onMounted(() => {
  loadFeatures();
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Features</h1>

    <!-- Empty state -->
    <div v-if="!globalLoading && features.length === 0" class="text-center py-12">
      <p class="text-gray-500">No features found. Create your first feature!</p>
    </div>

    <!-- Feature list placeholder -->
    <div v-else-if="features.length > 0" class="space-y-4">
      <div
        v-for="feature in features"
        :key="feature.id"
        class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">{{ feature.title }}</h3>
          <span
            :class="{
              'bg-gray-100 text-gray-800': feature.status === 'todo',
              'bg-blue-100 text-blue-800': feature.status === 'doing',
              'bg-green-100 text-green-800': feature.status === 'done',
            }"
            class="px-2 py-1 text-xs font-medium rounded-full"
          >
            {{ feature.status }}
          </span>
        </div>
        <div class="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span>Module: {{ feature.module }}</span>
          <span>Priority: {{ feature.priority }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, watch, type Ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchFeatures, fetchStats, updateFeature } from '../api';
import type { Feature, FeatureStatus, FeatureStats } from '../types';

// Inject global state from App.vue
const globalLoading = inject<Ref<boolean>>('globalLoading')!;
const globalError = inject<Ref<string | null>>('globalError')!;

const route = useRoute();
const router = useRouter();

const features = ref<Feature[]>([]);
const stats = ref<FeatureStats | null>(null);
const statusFilter = ref<string>('');
const moduleFilter = ref<string>('');

// Available filter options
const statusOptions: { value: string; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'todo', label: 'To Do' },
  { value: 'doing', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

// Status options for inline change
const featureStatusOptions: { value: FeatureStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'doing', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];

// Computed unique modules from features (will be populated after initial load)
const moduleOptions = ref<string[]>([]);

// LocalStorage key for filter preferences
const FILTERS_STORAGE_KEY = 'featureboard_filters';

// Save filters to localStorage
function saveFiltersToStorage() {
  const filters = {
    status: statusFilter.value,
    module: moduleFilter.value,
  };
  localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters));
}

// Load filters from localStorage
function loadFiltersFromStorage(): { status: string; module: string } | null {
  try {
    const stored = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

async function loadStats() {
  try {
    stats.value = await fetchStats();
  } catch (err) {
    // Stats loading failure is non-critical
    console.error('Failed to load stats:', err);
  }
}

async function loadFeatures() {
  globalLoading.value = true;
  globalError.value = null;
  try {
    const params: { status?: string; module?: string } = {};
    if (statusFilter.value) params.status = statusFilter.value;
    if (moduleFilter.value) params.module = moduleFilter.value;
    features.value = await fetchFeatures(params);

    // If no filters, update available modules
    if (!statusFilter.value && !moduleFilter.value) {
      const modules = new Set(features.value.map(f => f.module));
      moduleOptions.value = Array.from(modules).sort();
    }

    // Refresh stats whenever features are loaded
    await loadStats();
  } catch (err) {
    globalError.value = err instanceof Error ? err.message : 'Failed to load features';
  } finally {
    globalLoading.value = false;
  }
}

// Sync filters with URL query params (URL takes precedence over localStorage)
function syncFiltersFromUrl() {
  const hasUrlParams = route.query.status !== undefined || route.query.module !== undefined;

  if (hasUrlParams) {
    // URL parameters take precedence
    statusFilter.value = (route.query.status as string) || '';
    moduleFilter.value = (route.query.module as string) || '';
  } else {
    // Fall back to localStorage if no URL params
    const stored = loadFiltersFromStorage();
    if (stored) {
      statusFilter.value = stored.status || '';
      moduleFilter.value = stored.module || '';
    }
  }
}

function updateUrlParams() {
  const query: Record<string, string> = {};
  if (statusFilter.value) query.status = statusFilter.value;
  if (moduleFilter.value) query.module = moduleFilter.value;
  router.replace({ query });
}

// Watch for filter changes and reload
watch([statusFilter, moduleFilter], () => {
  updateUrlParams();
  saveFiltersToStorage();
  loadFeatures();
});

// Handle inline status change with optimistic update
async function handleStatusChange(feature: Feature, newStatus: FeatureStatus) {
  const oldStatus = feature.status;

  // Optimistic update
  feature.status = newStatus;

  try {
    await updateFeature(feature.id, { status: newStatus });
    // Refresh stats after status change
    await loadStats();
  } catch (err) {
    // Rollback on error
    feature.status = oldStatus;
    globalError.value = err instanceof Error ? err.message : 'Failed to update status';
  }
}

onMounted(() => {
  syncFiltersFromUrl();
  loadFeatures();
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Features</h1>

    <!-- Stats View -->
    <div v-if="stats" class="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Status Stats -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h3 class="text-sm font-medium text-gray-500 mb-3">By Status</h3>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-800 text-sm font-semibold">
              {{ stats.byStatus.todo || 0 }}
            </span>
            <span class="text-sm text-gray-600">To Do</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold">
              {{ stats.byStatus.doing || 0 }}
            </span>
            <span class="text-sm text-gray-600">In Progress</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
              {{ stats.byStatus.done || 0 }}
            </span>
            <span class="text-sm text-gray-600">Done</span>
          </div>
        </div>
      </div>

      <!-- Module Stats -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
        <h3 class="text-sm font-medium text-gray-500 mb-3">By Module</h3>
        <div class="flex flex-wrap items-center gap-3">
          <div
            v-for="(count, moduleName) in stats.byModule"
            :key="moduleName"
            class="flex items-center gap-2"
          >
            <span class="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 text-gray-800 text-xs font-semibold">
              {{ count }}
            </span>
            <span class="text-sm text-gray-600">{{ moduleName }}</span>
          </div>
          <div v-if="Object.keys(stats.byModule).length === 0" class="text-sm text-gray-400">
            No modules yet
          </div>
        </div>
      </div>
    </div>

    <!-- Filter Controls -->
    <div class="mb-6 flex flex-wrap gap-4">
      <div class="flex items-center gap-2">
        <label for="status-filter" class="text-sm font-medium text-gray-700">Status:</label>
        <select
          id="status-filter"
          v-model="statusFilter"
          class="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
        >
          <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label for="module-filter" class="text-sm font-medium text-gray-700">Module:</label>
        <select
          id="module-filter"
          v-model="moduleFilter"
          class="block w-40 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
        >
          <option value="">All Modules</option>
          <option v-for="mod in moduleOptions" :key="mod" :value="mod">
            {{ mod }}
          </option>
        </select>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!globalLoading && features.length === 0" class="text-center py-12">
      <p class="text-gray-500">No features found. Create your first feature!</p>
    </div>

    <!-- Feature list -->
    <div v-else-if="features.length > 0" class="space-y-4">
      <div
        v-for="feature in features"
        :key="feature.id"
        class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm"
        :class="{ 'opacity-60': feature.status === 'done' }"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-gray-900">{{ feature.title }}</h3>
          <select
            :value="feature.status"
            @change="handleStatusChange(feature, ($event.target as HTMLSelectElement).value as FeatureStatus)"
            class="text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer"
            :class="{
              'bg-gray-100 text-gray-800': feature.status === 'todo',
              'bg-blue-100 text-blue-800': feature.status === 'doing',
              'bg-green-100 text-green-800': feature.status === 'done',
            }"
          >
            <option v-for="opt in featureStatusOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <div class="flex items-center gap-4 text-sm text-gray-500">
            <span>Module: {{ feature.module }}</span>
            <span>Priority: {{ feature.priority }}</span>
          </div>
          <router-link
            :to="`/edit/${feature.id}`"
            class="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

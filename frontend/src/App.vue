<script setup lang="ts">
import { ref, provide } from 'vue';
import { LayoutDashboard } from 'lucide-vue-next';

// Global loading and error state
const globalLoading = ref(false);
const globalError = ref<string | null>(null);

// Provide to child components
provide('globalLoading', globalLoading);
provide('globalError', globalError);

function clearError() {
  globalError.value = null;
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <router-link to="/" class="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-gray-700">
            <LayoutDashboard class="w-6 h-6 text-blue-600" />
            <span>FeatureBoard</span>
          </router-link>
          <router-link
            to="/create"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            New Feature
          </router-link>
        </div>
      </div>
    </header>

    <!-- Global Loading Indicator -->
    <div
      v-if="globalLoading"
      class="fixed top-16 left-0 right-0 z-50"
    >
      <div class="h-1 bg-blue-200">
        <div class="h-1 bg-blue-600 animate-pulse" style="width: 100%"></div>
      </div>
    </div>

    <!-- Global Error Banner -->
    <div
      v-if="globalError"
      class="bg-red-50 border-l-4 border-red-400 p-4"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ globalError }}</p>
          </div>
        </div>
        <button
          @click="clearError"
          class="text-red-400 hover:text-red-600"
        >
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-view />
      </div>
    </main>
  </div>
</template>

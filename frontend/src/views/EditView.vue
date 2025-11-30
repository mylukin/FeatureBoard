<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
const featureId = route.params.id;
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Edit Feature</h1>
    <p class="text-gray-500">Editing feature ID: {{ featureId }}</p>
  </div>
</template>

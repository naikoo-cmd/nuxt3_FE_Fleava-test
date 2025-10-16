<template>
  <span class="load-indicator">
    {{ count }}<span v-if="total"> / {{ total }}</span> loaded
  </span>
</template>
<script setup lang="ts">
defineProps<{ count: number; total?: number }>()
</script>
<style scoped>
.load-indicator {
  margin-left: 1rem;
  color: var(--muted);
  font-size: 0.95rem;
  font-weight: 600;
}
</style>
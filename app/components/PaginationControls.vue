<template>
  <div class="pager" role="navigation" aria-label="Pagination">
    <button class="pager__btn" :disabled="disabledPrev" @click="$emit('prev')">Prev</button>
    <span class="pager__info" aria-live="polite">Page {{ page }} / {{ pages }}</span>
    <button class="pager__btn" :disabled="disabledNext" @click="$emit('next')">Next</button>
    <div class="pager__spacer"></div>
    <button class="pager__btn pager__load" :disabled="loading || disabledNext" @click="$emit('loadMore')">
      <span v-if="loading">Loading…</span>
      <span v-else>Load more (6)</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  page: number
  pages: number
  loading?: boolean
  disabledPrev?: boolean
  disabledNext?: boolean
}>()
defineEmits<{ prev: []; next: []; loadMore: [] }>()
</script>

<style scoped>
.pager {
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}
.pager__btn {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  font-weight: 700;
  min-width: 88px;
  cursor: pointer;
}
.pager__btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pager__info { color: var(--muted); font-weight: 700; }
.pager__spacer { width: 1px; }
.pager__load { background: var(--accent); color: var(--accent-contrast); border-color: var(--accent); }
</style>
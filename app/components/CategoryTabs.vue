<template>
  <div class="tabs-row">
    <div class="tabs" role="tablist" aria-label="Categories">
      <button
        v-for="c in items"
        :key="c.value"
        class="tabs__btn"
        :class="{ 'is-active': modelValue === c.value }"
        role="tab"
        :aria-selected="modelValue === c.value"
        @click="$emit('update:modelValue', c.value)"
      >
        {{ c.label }}
      </button>
    </div>
    <span class="load-indicator">
      {{ count }}<span v-if="total"> / {{ total }}</span> loaded
    </span>
  </div>
</template>

<script setup lang="ts">
export type CategoryValue = 'popular' | 'top_rated' | 'upcoming'
defineProps<{
  modelValue: CategoryValue
  items?: { label: string; value: CategoryValue }[]
  count: number
  total?: number
}>()
defineEmits<{ 'update:modelValue': [CategoryValue] }>()
</script>

<style lang="scss" src="@/layout/styles/CategoryTabs.scss"></style>
<style scoped>
.tabs-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  width: 100%;
}
.load-indicator {
  color: var(--muted);
  font-size: 0.95rem;
  font-weight: 600;
}
</style>
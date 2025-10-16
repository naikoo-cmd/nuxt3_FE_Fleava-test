<template>
  <div class="slideshow" role="region" aria-label="Featured movies slideshow">
    <div class="slideshow__viewport">
      <!-- Crossfade + gentle zoom -->
      <TransitionGroup v-if="currentSlide" name="fade-zoom" tag="div" class="slideshow__track">
        <article :key="currentSlide.id" class="slideshow__slide">
          <div class="slideshow__img-wrap">
            <!-- NEW: placeholder until image loads -->
            <div class="slideshow__ph" v-show="!imgLoaded" aria-hidden="true"></div>

            <img
              class="slideshow__image"
              :class="{ 'is-loaded': imgLoaded }"
              :src="currentSlide.image"
              :alt="currentSlide.title"
              decoding="async"
              loading="lazy"
              @load="onImgLoad"
              @error="onImgError"
            />
          </div>
          <div class="slideshow__overlay">
            <!-- Staggered text animation -->
            <Transition name="hero-line" mode="out-in">
              <div class="slideshow__content" :key="`${currentIndex}-content`">
                <Transition name="hero-line" mode="out-in">
                  <h3 class="slideshow__title" :key="`${currentIndex}-title`" style="--i:0">
                    {{ currentSlide.title }}
                  </h3>
                </Transition>
                <Transition name="hero-line" mode="out-in">
                  <p v-if="currentSlide.overview" class="slideshow__overview" :key="`${currentIndex}-overview`" style="--i:1">
                    {{ currentSlide.overview }}
                  </p>
                </Transition>
                <button
                  class="slideshow__details-btn"
                  @click="$router.push(`/movies/${currentSlide.id}`)"
                  :key="`${currentIndex}-details`"
                >
                  View Details
                </button>
              </div>
            </Transition>
          </div>
        </article>
      </TransitionGroup>

      <SkeletonSlide v-else />
    </div>

    <button v-if="hasMultiple" class="slideshow__nav slideshow__nav--prev" @click="prev" aria-label="Previous slide">‹</button>
    <button v-if="hasMultiple" class="slideshow__nav slideshow__nav--next" @click="next" aria-label="Next slide">›</button>

    <div v-if="hasSlides" class="slideshow__dots" role="tablist" aria-label="Slide selector">
      <button
        v-for="(slide, i) in slides"
        :key="slide?.id ?? i"
        class="slideshow__dot"
        :class="{ 'is-active': i === currentIndex }"
        @click="goTo(i)"
        role="tab"
        :aria-selected="i === currentIndex"
        :aria-label="`Go to slide ${i + 1}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import SkeletonSlide from './SkeletonSlide.vue'

interface SlideItem { id?: string|number; title: string; overview?: string; image: string }
const props = defineProps<{ slides: SlideItem[] }>()
const emit = defineEmits<{ change: [string] }>() // NEW: notify parent of current image
const currentIndex = ref(0)
const timer = ref<ReturnType<typeof setInterval> | null>(null)
/* slightly slower for cinematic effect */
const intervalMs = 5500

function next() {
  if (!props.slides?.length) return
  currentIndex.value = (currentIndex.value + 1) % props.slides.length
}
function prev() {
  if (!props.slides?.length) return
  currentIndex.value = (currentIndex.value - 1 + props.slides.length) % props.slides.length
}
function goTo(i: number) {
  if (!props.slides?.length) return
  const max = props.slides.length - 1
  currentIndex.value = Math.max(0, Math.min(i, max))
}
function play() {
  stop()
  if (props.slides?.length > 1) {
    timer.value = setInterval(next, intervalMs)
  }
}
function stop() {
  if (timer.value) clearInterval(timer.value)
  timer.value = null
}
const hasSlides = computed(() => (props.slides?.length ?? 0) > 0)
const hasMultiple = computed(() => (props.slides?.length ?? 0) > 1)
const currentSlide = computed(() => hasSlides.value ? props.slides[currentIndex.value] : null)

const imgLoaded = ref(false)
watch(currentSlide, (s) => {
  imgLoaded.value = false
  if (s?.image) emit('change', s.image)
}, { immediate: true })

function onImgLoad() { imgLoaded.value = true }
function onImgError() { imgLoaded.value = true } // hide placeholder even if fallback

// NEW: emit on slide change (and initially)
watch(currentSlide, (s) => { if (s?.image) emit('change', s.image) }, { immediate: true })

onMounted(() => {
  if (hasSlides.value) play()
})
onBeforeUnmount(stop)
watch(() => props.slides.length, (len) => {
  currentIndex.value = 0
  if (len > 1 && !timer.value) play()
  if (len <= 1) stop()
})
</script>

<style lang="scss" src="@/layout/styles/MovieSlideshow.scss"></style>
<style lang="scss">
/* Softer crossfade + slight zoom, with overlap and leave delay */
.fade-zoom-enter-active,
.fade-zoom-leave-active {
  transition:
    opacity 900ms cubic-bezier(.22,.55,.1,1),
    transform 900ms cubic-bezier(.22,.55,.1,1);
}

/* Keep the leaving slide on top until the entering slide is visible */
.fade-zoom-enter-active { z-index: 0; }
.fade-zoom-leave-active { z-index: 1; position: absolute; inset: 0; transition-delay: 120ms; }

.fade-zoom-enter-from,
.fade-zoom-leave-to {
  opacity: 0;
  transform: scale(1.01);
}
.fade-zoom-enter-to,
.fade-zoom-leave-from {
  opacity: 1;
  transform: none;
}

/* Prevent group 'move' shifts */
.fade-zoom-move { transition: none !important; }
</style>
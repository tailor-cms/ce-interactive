<template>
  <div
    :aria-busy="isLoading"
    :class="{ 'is-loading': isLoading, 'is-failed': isFailed }"
    :style="{ minHeight: height ? `${height}px` : undefined }"
    class="tce-interactive-placeholder"
    role="status"
  >
    <div aria-hidden="true" class="tce-interactive-bubbles">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <p class="tce-interactive-placeholder-title">{{ copy.title }}</p>
    <p v-if="copy.hint" class="tce-interactive-placeholder-hint">
      {{ copy.hint }}
    </p>
    <button
      v-if="isFailed"
      class="tce-interactive-retry"
      type="button"
      @click="emit('retry')"
    >
      Try again
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { PageStatus } from '../types';

type PendingStatus = Exclude<PageStatus, typeof PageStatus.Loaded>;

const props = withDefaults(
  defineProps<{ status?: PendingStatus; height?: number }>(),
  { status: PageStatus.Empty, height: undefined },
);

const emit = defineEmits<{ retry: [] }>();

const COPY: Record<PendingStatus, { title: string; hint?: string }> = {
  [PageStatus.Empty]: {
    title: 'This activity is on its way',
    hint: "It hasn't been added yet. Check back a little later.",
  },
  [PageStatus.Loading]: { title: 'Getting the activity ready...' },
  [PageStatus.Failed]: {
    title: "This activity couldn't be opened",
    hint: 'Check your connection and try again.',
  },
};

const copy = computed(() => COPY[props.status]);
const isLoading = computed(() => props.status === PageStatus.Loading);
const isFailed = computed(() => props.status === PageStatus.Failed);
</script>

<style scoped>
.tce-interactive-placeholder {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 12rem;
  padding: 2rem;
  overflow: hidden;
  border: 1px dashed color-mix(in srgb, currentColor 20%, transparent);
  border-radius: 0.5rem;
  background: color-mix(in srgb, currentColor 3%, transparent);
}

.tce-interactive-placeholder.is-loading {
  border-style: solid;
}

.is-failed .tce-interactive-bubbles span {
  animation: none;
  opacity: 0.6;
}

.tce-interactive-placeholder.is-loading::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    transparent 30%,
    color-mix(in srgb, currentColor 6%, transparent) 50%,
    transparent 70%
  );
  transform: translateX(-100%);
  animation: tce-interactive-sweep 1.8s ease-in-out infinite;
}

.tce-interactive-bubbles {
  position: relative;
  width: 3.5rem;
  height: 3rem;
}

.tce-interactive-bubbles span {
  position: absolute;
  border-radius: 50%;
  background: color-mix(in srgb, currentColor 22%, transparent);
  animation: tce-interactive-float 3.6s ease-in-out infinite;
}

.tce-interactive-bubbles span:nth-child(1) {
  right: 0.25rem;
  top: 0;
  width: 1.75rem;
  height: 1.75rem;
}

.tce-interactive-bubbles span:nth-child(2) {
  left: 0.25rem;
  top: 1.25rem;
  width: 1.125rem;
  height: 1.125rem;
  animation-delay: -1.2s;
}

.tce-interactive-bubbles span:nth-child(3) {
  left: 1.6rem;
  bottom: 0;
  width: 0.75rem;
  height: 0.75rem;
  animation-delay: -2.4s;
}

.is-loading .tce-interactive-bubbles span {
  animation-duration: 1.8s;
}

.tce-interactive-placeholder-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.8;
}

.tce-interactive-placeholder-hint {
  margin: -0.5rem 0 0;
  font-size: 0.875rem;
  text-align: center;
  opacity: 0.6;
}

.tce-interactive-retry {
  padding: 0.5rem 1.25rem;
  border: 1px solid color-mix(in srgb, currentColor 24%, transparent);
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.tce-interactive-retry:hover,
.tce-interactive-retry:focus-visible {
  background: color-mix(in srgb, currentColor 8%, transparent);
}

@keyframes tce-interactive-float {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }

  50% {
    transform: translateY(-0.3rem) scale(1.08);
    opacity: 1;
  }
}

@keyframes tce-interactive-sweep {
  to {
    transform: translateX(100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .tce-interactive-bubbles span,
  .tce-interactive-placeholder.is-loading::after {
    animation: none;
  }
}
</style>

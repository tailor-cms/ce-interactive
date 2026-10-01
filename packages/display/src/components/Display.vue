<template>
  <div v-if="element.data.url" ref="root" class="tce-interactive-root">
    <PagePlaceholder
      v-if="status !== PageStatus.Loaded"
      :height="frameHeight"
      :status="status"
      class="tce-interactive-overlay"
      @retry="retry"
    />
    <iframe
      :key="attempt"
      ref="frame"
      :aria-describedby="describedBy"
      :class="{ 'is-hidden': status !== PageStatus.Loaded }"
      :height="frameHeight"
      :sandbox="FRAME_SANDBOX"
      :src="element.data.url"
      :title="element.data.title || manifest.name"
      allow="fullscreen"
      class="tce-interactive-frame"
      loading="lazy"
      referrerpolicy="no-referrer"
      @error="status = PageStatus.Failed"
      @load="onLoad"
    ></iframe>
    <p
      v-if="element.data.description"
      :id="descriptionId"
      class="tce-interactive-description"
    >
      {{ element.data.description }}
    </p>
  </div>
  <PagePlaceholder v-else />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import manifest, { FRAME_SANDBOX } from '@tailor-cms/ce-interactive-manifest';
import type { Element } from '@tailor-cms/ce-interactive-manifest';

import PagePlaceholder from './PagePlaceholder.vue';
import { PageStatus } from '../types';
import { useFrameHeight } from '../composables/useFrameHeight';

const props = defineProps<{ element: Element; userState: any }>();

const LOAD_TIMEOUT = 20_000;

const root = ref<HTMLElement>();
const frame = ref<HTMLIFrameElement>();
const frameHeight = useFrameHeight(frame, () => props.element);
const status = ref<PageStatus>(PageStatus.Loading);
const attempt = ref(0);
const isVisible = ref(false);

// Screen reader
const descriptionId = useId();
const describedBy = computed(() =>
  props.element.data.description ? descriptionId : undefined,
);

let timer: ReturnType<typeof setTimeout> | undefined;
let observer: IntersectionObserver | undefined;

const startLoadTimeout = () => {
  clearTimeout(timer);
  if (!isVisible.value || status.value !== PageStatus.Loading) return;
  timer = setTimeout(() => {
    if (status.value === PageStatus.Loading) status.value = PageStatus.Failed;
  }, LOAD_TIMEOUT);
};

const PAGE_CHECK: RequestInit = { method: 'HEAD', cache: 'no-store' };

const failIfMissing = async (url: string) => {
  const res = await fetch(url, PAGE_CHECK).catch(() => null);
  const isCurrent = url === props.element.data.url;
  if (res && !res.ok && isCurrent) status.value = PageStatus.Failed;
};

const startLoading = () => {
  status.value = PageStatus.Loading;
  startLoadTimeout();
  if (props.element.data.url) failIfMissing(props.element.data.url);
};

const onLoad = () => {
  clearTimeout(timer);
  if (status.value === PageStatus.Loading) status.value = PageStatus.Loaded;
};

const retry = () => {
  attempt.value++;
  startLoading();
};

watch(() => props.element.data.url, startLoading, { immediate: true });

// The wrapper exists if HTML file exists
watch(root, (el) => {
  observer?.disconnect();
  if (el) observer?.observe(el);
});

onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    if (!entry || entry.isIntersecting === isVisible.value) return;
    isVisible.value = entry.isIntersecting;
    if (isVisible.value) startLoadTimeout();
  });
  if (root.value) observer.observe(root.value);
});

onBeforeUnmount(() => {
  clearTimeout(timer);
  observer?.disconnect();
});
</script>

<style scoped>
.tce-interactive-root {
  position: relative;
}

.tce-interactive-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.tce-interactive-frame {
  display: block;
  width: 100%;
  border: 0;
}

.tce-interactive-frame.is-hidden {
  opacity: 0;
}

.tce-interactive-description {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
</style>

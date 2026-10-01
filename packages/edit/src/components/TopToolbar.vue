<template>
  <VToolbarItems class="tce-interactive-toolbar ga-4">
    <TailorFileInput
      :allowed-extensions="HTML_EXTENSIONS"
      :density="'compact'"
      :file-key="element.data.assets?.url"
      :variant="'outlined'"
      label="HTML file"
      placeholder="Upload HTML..."
      @delete="remove"
      @upload="setPage"
    />
    <VTextField
      :density="'compact'"
      :max="MAX_HEIGHT"
      :min="MIN_HEIGHT"
      :model-value="element.data.height || DEFAULT_HEIGHT"
      :variant="'outlined'"
      label="Height"
      max-width="160"
      min-width="160"
      prepend-inner-icon="mdi-arrow-expand-vertical"
      suffix="px"
      type="number"
      @change="setHeight"
    />
  </VToolbarItems>
</template>

<script setup lang="ts">
import {
  clampHeight,
  DEFAULT_HEIGHT,
  MAX_HEIGHT,
  MIN_HEIGHT,
} from '@tailor-cms/ce-interactive-manifest';
import type { Element, ElementData } from '@tailor-cms/ce-interactive-manifest';

import { HTML_EXTENSIONS } from '../composables/usePageUpload';

const props = defineProps<{ element: Element }>();
const emit = defineEmits<{ save: [data: ElementData] }>();

const save = (changes: Partial<ElementData>) =>
  emit('save', { ...props.element.data, ...changes });

const setPage = ({ url, publicUrl }: { url: string; publicUrl: string }) =>
  save({ url: publicUrl, assets: { url } });

const remove = () => save({ url: null, assets: {} });

const setHeight = (event: Event) => {
  const value = Number((event.target as HTMLInputElement).value);
  if (!value || !Number.isFinite(value)) return;
  save({ height: clampHeight(value) });
};
</script>

<style scoped>
.tce-interactive-toolbar {
  align-items: center;
}
</style>

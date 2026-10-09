<template>
  <div class="tce-interactive-side-toolbar d-flex flex-column ga-4">
    <div class="text-title-small">Layout</div>
    <VTextField
      :max="MAX_HEIGHT"
      :min="MIN_HEIGHT"
      :model-value="element.data.height || DEFAULT_HEIGHT"
      hint="Used until the page reports its own height."
      label="Height"
      prepend-inner-icon="mdi-arrow-expand-vertical"
      suffix="px"
      type="number"
      variant="outlined"
      persistent-hint
      @change="setHeight"
    />
    <div class="text-title-small">Accessibility</div>
    <VTextField
      :model-value="element.data.title"
      hint="Names the page for screen readers."
      label="Title"
      variant="outlined"
      persistent-hint
      @change="save({ title: valueOf($event) })"
    />
    <VTextarea
      :model-value="element.data.description"
      hint="One sentence about what the page shows."
      label="Text alternative"
      rows="3"
      variant="outlined"
      auto-grow
      persistent-hint
      @change="save({ description: valueOf($event) })"
    />
  </div>
</template>

<script setup lang="ts">
import {
  clampHeight,
  DEFAULT_HEIGHT,
  MAX_HEIGHT,
  MIN_HEIGHT,
} from '@tailor-cms/ce-interactive-manifest';
import type { Element, ElementData } from '@tailor-cms/ce-interactive-manifest';

const props = defineProps<{ element: Element }>();
const emit = defineEmits<{ save: [data: ElementData] }>();

const valueOf = (event: Event) =>
  (event.target as HTMLInputElement).value.trim();

const save = (changes: Partial<ElementData>) =>
  emit('save', { ...props.element.data, ...changes });

const setHeight = (event: Event) => {
  const value = Number(valueOf(event));
  if (!value || !Number.isFinite(value)) return;
  save({ height: clampHeight(value) });
};
</script>

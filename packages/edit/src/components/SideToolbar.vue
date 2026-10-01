<template>
  <div class="tce-interactive-side-toolbar d-flex flex-column ga-4 pa-4">
    <div class="text-title-small">Accessibility</div>
    <VTextField
      :model-value="element.data.title"
      density="compact"
      hint="Names the page for screen readers."
      label="Title"
      variant="outlined"
      persistent-hint
      @change="save({ title: valueOf($event) })"
    />
    <VTextarea
      :model-value="element.data.description"
      density="compact"
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
import type { Element, ElementData } from '@tailor-cms/ce-interactive-manifest';

const props = defineProps<{ element: Element }>();
const emit = defineEmits<{ save: [data: ElementData] }>();

const valueOf = (event: Event) =>
  (event.target as HTMLInputElement).value.trim();

const save = (changes: Partial<ElementData>) =>
  emit('save', { ...props.element.data, ...changes });
</script>

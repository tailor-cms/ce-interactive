<template>
  <VSheet
    :class="{ 'is-dragging': isDragging }"
    class="tce-interactive-placeholder"
    color="transparent"
    @dragenter.prevent="onDragEnter"
    @dragleave.prevent="onDragLeave"
    @dragover.prevent
    @drop.prevent="onDrop"
  >
    <TailorElementPlaceholder
      :icon="manifest.ui.icon"
      :is-disabled="isReadonly"
      :is-focused="isFocused"
      :is-readonly="isReadonly"
      :name="`${manifest.name} component`"
      active-placeholder="Upload a self-contained HTML file or drop it here"
      placeholder="Select to upload an HTML file"
    />
    <div v-if="!isReadonly" class="tce-interactive-upload px-8 pb-8">
      <VBtn
        :loading="isUploading"
        prepend-icon="mdi-upload"
        text="Upload HTML"
        variant="tonal"
        @click="fileInput?.click()"
      />
      <VAlert
        v-if="error"
        :text="error"
        class="mt-4 text-left"
        density="compact"
        type="error"
        variant="tonal"
      />
      <input
        ref="fileInput"
        :accept="HTML_EXTENSIONS.join(',')"
        aria-label="HTML file"
        class="d-none"
        type="file"
        @change="onSelect"
      />
    </div>
  </VSheet>
</template>

<script lang="ts" setup>
import manifest from '@tailor-cms/ce-interactive-manifest';
import { ref } from 'vue';

import {
  HTML_EXTENSIONS,
  type UploadedPage,
  usePageUpload,
} from '../composables/usePageUpload';

const props = defineProps<{ isFocused: boolean; isReadonly: boolean }>();

const emit = defineEmits<{ upload: [page: UploadedPage] }>();

const { isUploading, error, upload } = usePageUpload();

const fileInput = ref<HTMLInputElement>();

// Counts dragenter/dragleave pairs so children don't flicker
const dragDepth = ref(0);
const isDragging = ref(false);

const submit = async (file?: File | null) => {
  const page = await upload(file);
  if (page) emit('upload', page);
};

const onSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  submit(input.files?.[0]);
  input.value = '';
};

const onDragEnter = () => {
  if (props.isReadonly) return;
  dragDepth.value++;
  isDragging.value = true;
};

const onDragLeave = () => {
  dragDepth.value = Math.max(0, dragDepth.value - 1);
  isDragging.value = dragDepth.value > 0;
};

const onDrop = (event: DragEvent) => {
  dragDepth.value = 0;
  isDragging.value = false;
  if (props.isReadonly) return;
  submit(event.dataTransfer?.files[0]);
};
</script>

<style scoped>
.tce-interactive-placeholder {
  border-radius: 0.5rem;
  outline: 2px dashed transparent;
  outline-offset: -2px;
  transition:
    outline-color 0.15s,
    background-color 0.15s;
}

.tce-interactive-placeholder.is-dragging {
  outline-color: rgba(var(--v-theme-on-surface), 0.38);
  background-color: rgba(var(--v-theme-on-surface), 0.04) !important;
}

.tce-interactive-placeholder :deep(.v-avatar) {
  background-color: rgba(var(--v-theme-on-surface), 0.08) !important;
  color: rgba(var(--v-theme-on-surface), 0.7) !important;
}

.tce-interactive-placeholder :deep(.v-avatar .v-icon) {
  color: inherit !important;
}

.tce-interactive-upload {
  text-align: center;
}
</style>

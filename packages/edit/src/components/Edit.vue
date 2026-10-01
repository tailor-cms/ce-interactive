<template>
  <div class="tce-interactive">
    <PagePlaceholder
      v-if="!element.data.url"
      :is-focused="isFocused"
      :is-readonly="isReadonly"
      @upload="setPage"
    />
    <div v-else class="tce-interactive-frame">
      <iframe
        ref="frame"
        :height="frameHeight"
        :sandbox="FRAME_SANDBOX"
        :src="element.data.url"
        :title="element.data.title || manifest.name"
        allow="fullscreen"
        class="d-block w-100"
        frameborder="0"
        referrerpolicy="no-referrer"
        @load="isLoading = false"
      ></iframe>
      <VProgressLinear
        v-if="isLoading"
        class="tce-interactive-progress"
        indeterminate
      />
      <div v-if="!isFocused || isDragged" class="tce-interactive-shield">
        <VChip
          class="tce-interactive-hint"
          prepend-icon="mdi-cursor-default-click-outline"
          size="small"
          text="Select to interact"
          variant="elevated"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Element, ElementData } from '@tailor-cms/ce-interactive-manifest';
import manifest, { FRAME_SANDBOX } from '@tailor-cms/ce-interactive-manifest';
import { ref, watch } from 'vue';

import PagePlaceholder from './PagePlaceholder.vue';
import type { UploadedPage } from '../composables/usePageUpload';
import { useFrameHeight } from '../composables/useFrameHeight';

const props = defineProps<{
  element: Element;
  isDragged: boolean;
  isFocused: boolean;
  isReadonly: boolean;
}>();

const emit = defineEmits<{ save: [data: ElementData] }>();

const frame = ref<HTMLIFrameElement>();
const frameHeight = useFrameHeight(frame, () => props.element);
const isLoading = ref(true);

watch(
  () => props.element.data.url,
  () => (isLoading.value = true),
);

const setPage = ({ url, publicUrl, title }: UploadedPage) => {
  const { data } = props.element;
  emit('save', {
    ...data,
    url: publicUrl,
    assets: { url },
    title: data.title || title,
  });
};
</script>

<style lang="scss" scoped>
.tce-interactive {
  text-align: left;
}

.tce-interactive-frame {
  position: relative;
}

.tce-interactive-progress {
  position: absolute;
  top: 0;
}

.tce-interactive-shield {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 0.75rem;
  cursor: pointer;

  .tce-interactive-hint {
    opacity: 0;
    transition: opacity 0.15s;
  }

  &:hover .tce-interactive-hint {
    opacity: 1;
  }
}
</style>

<template>
  <div class="tce-interactive">
    <TailorElementPlaceholder
      v-if="!element.data.url && isReadonly"
      :icon="manifest.ui.icon"
      :name="`${manifest.name} component`"
      is-readonly
    />
    <template v-else>
      <VAlert
        v-if="error"
        :text="error"
        class="mb-3"
        density="compact"
        type="error"
        variant="tonal"
      />
      <TailorFileInput
        :allowed-extensions="HTML_EXTENSIONS"
        :file-key="pendingKey || element.data.assets?.url"
        :readonly="isReadonly"
        :show-actions="isFocused && !isPreparing"
        mode="dropzone"
        @delete="remove"
        @upload="setPage"
      >
        <div v-if="isPreparing" class="pa-6 text-center">
          <VProgressLinear class="mb-3" indeterminate />
          <div class="text-body-medium text-medium-emphasis">
            Preparing page...
          </div>
        </div>
        <div v-else class="tce-interactive-frame">
          <iframe
            ref="frame"
            :height="frameHeight"
            :sandbox="FRAME_SANDBOX"
            :src="element.data.url ?? ''"
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
      </TailorFileInput>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref, watch } from 'vue';
import type { Element, ElementData } from '@tailor-cms/ce-interactive-manifest';
import manifest, { FRAME_SANDBOX } from '@tailor-cms/ce-interactive-manifest';
import type { RpcCaller } from '@tailor-cms/cek-common';

import { useFrameHeight } from '../composables/useFrameHeight';

const HTML_EXTENSIONS = ['.html', '.htm'];

const props = defineProps<{
  element: Element;
  isDragged: boolean;
  isFocused: boolean;
  isReadonly: boolean;
}>();

const emit = defineEmits<{ save: [data: ElementData] }>();

const rpc = inject('$rpc') as RpcCaller;

const frame = ref<HTMLIFrameElement>();
const frameHeight = useFrameHeight(frame, () => props.element);
const isLoading = ref(true);
const error = ref('');
// Storage URL of an uploaded page until the server has prepared it
const pendingKey = ref('');
const isPreparing = computed(() => !!pendingKey.value);

watch(
  () => props.element.data.url,
  () => (isLoading.value = true),
);

const setPage = async ({ key, url, publicUrl }: Record<string, any>) => {
  error.value = '';
  pendingKey.value = url;
  try {
    // Adds the resize reporter so the frame can follow the page height
    const { title } = await rpc<{ title: string }>('preparePage', { key });
    const { data } = props.element;
    emit('save', {
      ...data,
      url: publicUrl,
      assets: { url },
      title: data.title || title,
    });
  } catch {
    error.value = 'The page could not be prepared. Please try again.';
  } finally {
    pendingKey.value = '';
  }
};

const remove = () => {
  error.value = '';
  emit('save', { ...props.element.data, url: null, assets: {} });
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

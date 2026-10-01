import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import {
  listenForFrameHeight,
  resolveFrameHeight,
} from '@tailor-cms/ce-interactive-manifest';
import type { Element } from '@tailor-cms/ce-interactive-manifest';

// Composable to manage the height of an iframe based on the
// reported height from the page.
export function useFrameHeight(
  frame: Ref<HTMLIFrameElement | undefined>,
  element: () => Element,
): ComputedRef<number> {
  const reportedHeight = ref<number | null>(null);
  let stopListening = () => {};

  onMounted(() => {
    stopListening = listenForFrameHeight(
      () => frame.value?.contentWindow,
      (height) => (reportedHeight.value = height),
    );
  });

  onBeforeUnmount(() => stopListening());

  watch(
    () => element().data.url,
    () => (reportedHeight.value = null),
  );

  return computed(() =>
    resolveFrameHeight(element().data.height, reportedHeight.value),
  );
}

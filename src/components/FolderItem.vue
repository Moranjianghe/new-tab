<template>
  <div :class="wrapperClass">
    <button v-if="isFolder" type="button" :class="rowClass" @click="toggleOpen" :title="item.name">
      <span class="min-w-0 flex-1 truncate text-left text-[0.9rem]">{{ item.name }}</span>
      <ChevronDown
        v-if="item.isOpen"
        class="shrink-0 text-[#5f6368] dark:text-[#9aa0a6]"
        :size="14"
        :stroke-width="2.2"
        aria-hidden="true"
      />
      <ChevronRight
        v-else
        class="shrink-0 text-[#5f6368] dark:text-[#9aa0a6]"
        :size="14"
        :stroke-width="2.2"
        aria-hidden="true"
      />
    </button>

    <button v-else type="button" :class="rowClass" :title="item.name" @click="openUrl(item.url)">
      <span class="min-w-0 flex-1 truncate text-left text-[0.9rem]">{{ item.name }}</span>
    </button>

    <div
      v-if="isFolder && item.isOpen"
      :class="[
        'mt-1.5 grid gap-1.5 border-l border-dashed border-[#dfe1e5] pl-2.5 dark:border-[#5f6368]',
        level === 0 ? 'ml-1' : 'ml-2',
      ]"
    >
      <folder-item
        v-for="(child, index) in item.items"
        :key="`${path}-${index}`"
        :item="child"
        :path="buildChildPath(child, index)"
        :level="level + 1"
      />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { ChevronDown, ChevronRight } from 'lucide-vue-next';
import { openBookmarkTarget } from '../utils/browser';

export default {
  name: 'FolderItem',
  components: {
    ChevronDown,
    ChevronRight,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const isFolder = computed(() => props.item?.type === 'folder');

    const wrapperClass = computed(() => {
      return '';
    });

    const rowClass = computed(() => {
      const base = 'flex w-full items-center rounded-lg px-2.5 py-2 text-left transition';
      if (props.level === 0) {
        return `${base} min-h-[42px] border border-[#dfe1e5] bg-white hover:bg-[#f1f3f4] dark:border-[#5f6368] dark:bg-[#2a2b2e] dark:hover:bg-[#3c4043]`;
      }
      return `${base} min-h-[38px] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043]`;
    });

    return {
      isFolder,
      wrapperClass,
      rowClass,
    };
  },
  created() {
    if (this.item.type !== 'folder' || !this.path) return;

    const savedState = localStorage.getItem(`folder_${this.path}_state`);
    if (savedState !== null) {
      this.item.isOpen = savedState === 'true';
    }
  },
  methods: {
    buildChildPath(child, index) {
      const childName = child?.name || `item-${index}`;
      return `${this.path}/${childName}`;
    },
    toggleOpen() {
      this.item.isOpen = !this.item.isOpen;
      localStorage.setItem(`folder_${this.path}_state`, String(this.item.isOpen));
    },
    openUrl(url) {
      openBookmarkTarget(url);
    },
  },
};
</script>

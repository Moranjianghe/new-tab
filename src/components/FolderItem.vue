<template class="text-sky-500 border-pink-500 dark:border-white">
  <div class="folder-item my-1">
    <!-- 資料夾標題 -->
    <div v-if="item.type === 'folder'"
      class="flex items-center px-2 py-1 rounded hover:bg-pink-100 cursor-pointer transition-colors"
      @click="toggleOpen">
      <span class="text-pink-500 dark:text-white mr-1 w-4">{{ item.isOpen ? '▼' : '▶' }}</span>
      <span class="font-medium">{{ item.name }}</span>
    </div>

    <!-- 資料夾內容 (遞迴) -->
    <div v-if="item.type === 'folder' && item.isOpen" class="folder-content pl-4 border-l-2 border-sky-200 ml-2">
      <div v-for="(child, index) in item.items" :key="index" class="py-0.5">
        <!-- 遞迴呼叫自身組件來處理子資料夾 -->
        <folder-item v-if="child.type === 'folder'" :item="child" />
        <!-- 一般網站連結 -->
        <a v-else :href="child.url" target="_blank"
          class="flex items-center px-2 py-1 rounded  hover:bg-pink-100  transition-colors">
          {{ child.name }}
        </a>
      </div>
    </div>

    <!-- 一般網站連結 -->
    <a v-else-if="!item.type || item.type !== 'folder'" :href="item.url" target="_blank"
      class="flex items-center px-2 py-1 rounded  hover:bg-pink-100  transition-colors">
      {{ item.name }}
    </a>
  </div>
</template>

<script>
export default {
  name: 'FolderItem',
  props: {
    item: {
      type: Object,
      required: true
    }
  },
  methods: {
    toggleOpen() {
      this.item.isOpen = !this.item.isOpen;
    }
  }
}
</script>
<style lang='css'>
@import "tailwindcss";
</style>
<template>
  <div class="text-sky-500 border-pink-500 dark:border-white folder-item my-1 flex flex-col">
    <!-- 資料夾標題 -->
    <div v-if="item.type === 'folder'"
      class="flex items-center px-2 py-1 rounded hover:bg-pink-100 cursor-pointer transition-colors w-auto w-auto inline-block self-start"
      @click="toggleOpen">
      <span class="text-pink-500 dark:text-white mr-1 w-4 ">{{ item.isOpen ? '▼' : '▶' }}</span>
      <span class="font-medium">{{ item.name }}</span>
    </div>

    <!-- 資料夾內容 (遞迴) -->
    <div v-if="item.type === 'folder' && item.isOpen"
      class="folder-content pl-4 border-l-2 border-sky-200 ml-2 w-auto inline-block  self-start ">
      <div v-for="(child, index) in item.items" :key="index" class="py-0.5 flex col">
        <!-- 遞迴呼叫自身組件來處理子資料夾 -->
        <folder-item v-if="child.type === 'folder'" :item="child" />
        <!-- 一般網站連結 -->
        <a v-else target="_blank" @click="openUrl(child.url)"
          class="flex items-center px-2 py-1 rounded  hover:bg-pink-100  cursor-pointer  transition-colors w-auto inline-block  self-start">
          {{ child.name }}
        </a>
      </div>
    </div>

    <!-- 一般網站連結 -->
    <a v-else-if="!item.type || item.type !== 'folder'" target="_blank" @click="openUrl(item.url)"
      class="flex items-center px-2 py-1 rounded  hover:bg-pink-100  cursor-pointer  transition-colors w-auto inline-block  self-start">
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
  created() {
    if(this.item.type === 'folder' && this.item.name){
      const savedState = localStorage.getItem(`folder_${this.item.name}_state`);
      if (savedState !== null) {
        this.item.isOpen = savedState === 'true';
      } 
    }
  },
    methods: {

    
    toggleOpen() {
      this.item.isOpen = !this.item.isOpen;
      //儲存資料夾狀態到 localStorage
      if(this.item.name){
        localStorage.setItem(`folder_${this.item.path}_state`, this.item.isOpen);
      }
    },
    openUrl(url) {
      // 在這裡可以添加任何額外的邏輯，例如記錄點擊或更新狀態
      console.log(`Opening URL: ${url}`);
      if (url.startsWith('chrome://') && typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'openUrl', url: url }, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
          }
        });
      } else {
        // 否則，使用 window.open() 打開新頁面
        window.open(url, '_blank');
      }

    }

  },

}
</script>
<style lang='css'>
@import "tailwindcss";
</style>
<template>
    <div class="folder-item">
      <!-- 資料夾標題 -->
      <div v-if="item.type === 'folder'" class="folder-title" @click="toggleOpen">
        <span>{{ item.isOpen ? '▼' : '▶' }}</span>
        <span>{{ item.name }}</span>
      </div>
  
      <!-- 資料夾內容 (遞迴) -->
      <div v-if="item.type === 'folder' && item.isOpen" class="folder-content">
        <div v-for="(child, index) in item.items" :key="index">
          <!-- 遞迴呼叫自身組件來處理子資料夾 -->
          <folder-item v-if="child.type === 'folder'" :item="child" />
          <!-- 一般網站連結 -->
          <a v-else :href="child.url" target="_blank" class="site-link">{{ child.name }}</a>
        </div>
      </div>
  
      <!-- 一般網站連結 -->
      <a v-else-if="!item.type || item.type !== 'folder'" :href="item.url" target="_blank" class="site-link">{{ item.name }}</a>
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
  
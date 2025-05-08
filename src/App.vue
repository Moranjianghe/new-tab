<template>
  <div class="">
    <!--search bar-->
    <div>
      <select v-model="selectedSearchEngine">
        <option v-for="engine in searchEngines" :key="engine" :value="engine.url">
          {{ engine.name }}
        </option>
      </select>
      <input v-model="searchQuery" @keyup.enter="performSearch" />
      <button @click="performSearch">Search</button>
    </div>
    <!--List of Commonly Used Websites-->
    <div v-if="favoriteSites.length > 0">
      <p>Commonly Used Websites</p>
      <div>
        <div v-for="(site, index) in favoriteSites" :key="index">
          <a :href="site.url" target="_blank">{{ site.name }}</a>
        </div>
      </div>
    </div>
    <div v-else>
      <p>No commonly used websites available</p>
    </div>
  </div>
  
    <!-- Settings Button -->
    <button @click="showSettings = true">Settings</button>

    <!-- Settings Dialog -->
    <div v-if="showSettings">
      <p>Set Config URL:</p>
      <input v-model="newConfigUrl" placeholder="Enter new config URL" />
      <button @click="updateConfigUrl">Save</button>
      <button @click="showSettings = false">Cancel</button>
    </div>
</template>
<script lang="js">
let configUrl = '/config.yaml'; // 配置文件的URL
const response = await fetch(configUrl); // 使用fetch API請求配置文件
import yaml from 'js-yaml'; // 引入js-yaml库来解析YAML文件
import { ref, onMounted } from 'vue';

export default {
  name: 'App',
  setup() {
    const searchQuery = ref('');
    const selectedSearchEngine = ref('');
    const searchEngines = ref([]);
    const favoriteSites = ref([]);
    const showSettings = ref(false);
    const newConfigUrl = ref(''); // 用於存儲新的配置文件URL

    // 加載緩存的配置文件和網頁內容
    const loadCachedData = () => {
      
      const cachedConfigUrl = localStorage.getItem('configUrl');
      if (cachedConfigUrl) {
        configUrl = cachedConfigUrl;
        console.log('Loaded cached config URL:', configUrl);
      } 
      // 嘗試從localStorage中獲取緩存的配置文件和網頁內容
      const cachedConfig = localStorage.getItem('config');
      if (cachedConfig) {
        const config = JSON.parse(cachedConfig);
        searchEngines.value = config.searchEngines || [];
        favoriteSites.value = config.favoriteSites || [];
        console.log('Loaded cached config:', config);
        
        // 默認選中第一個搜索引擎
        if (searchEngines.value.length > 0) {
          selectedSearchEngine.value = searchEngines.value[0].url;
        }
      }
    };

    // 請求最新的配置文件和網頁內容並更新緩存
    const fetchLatestData = async () => {
      try {
        const response = await fetch(configUrl);
        const configText = await response.text();
        const config = yaml.load(configText);

        // 更新數據
        searchEngines.value = config.searchEngines;
        favoriteSites.value = config.favoriteSites;

        // 更新緩存
        localStorage.setItem('config', JSON.stringify(config));
        console.log('renew cached config:', config);
        
        // 默認選中第一個搜索引擎
        if (searchEngines.value.length > 0) {
          selectedSearchEngine.value = searchEngines.value[0].url;
        }
      } catch (error) {
        console.error('Failed to fetch latest config:', error);
      }
    };

    // 在組件掛載時加載緩存的配置文件和網頁內容
    onMounted(async () => {
      /** 
      if('serviceWorker' in navigator) {
        try {
          await navigator.serviceWorker.register('/service-worker.js');
          console.log('Service Worker registered successfully');
        } catch (error) {
          console.error('Service Worker registration failed:', error);
        }
      }
      */

      loadCachedData(); // 加載緩存的配置文件和網頁內容
      try {
        await fetchLatestData(); // 請求最新的配置文件和網頁內容並更新緩存
      } catch (error) {
        console.error('Failed to fetch latest config:', error);
      }
    });

    // 設置配置文件的URL
    const updateConfigUrl =async () => {
      if (newConfigUrl.value.trim() !== '') {
        configUrl = newConfigUrl.value.trim();
        localStorage.setItem('configUrl', configUrl);
        console.log('Updated configUrl:', configUrl);
        await fetchLatestData();
        showSettings.value = false; // 關閉設置對話框
      }
    };

    // 执行搜索
    const performSearch = () => {
      if (searchQuery.value.trim() !== '') {
        const url = `${selectedSearchEngine.value}${encodeURIComponent(searchQuery.value)}`;
        window.open(url, '_blank');
      }
    };



    return {
      searchQuery,
      selectedSearchEngine,
      searchEngines,
      favoriteSites,
      performSearch,
      showSettings,
      newConfigUrl,
      updateConfigUrl,
    };
  }
};
</script>
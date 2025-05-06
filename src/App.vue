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
</template>
<script lang="js">
const response = await fetch('/config.yaml');
import yaml from 'js-yaml'; // 引入js-yaml库来解析YAML文件
import { ref, onMounted } from 'vue';

export default {
  name: 'App',
  setup() {
    const searchQuery = ref('');
    const selectedSearchEngine = ref('');
    const searchEngines = ref([]);
    const favoriteSites = ref([]);

    // 加載緩存的配置文件和網頁內容
    const loadCachedData = () => {
      const cachedConfig = localStorage.getItem('config');
      if (cachedConfig) {
        const config = JSON.parse(cachedConfig);
        searchEngines.value = config.searchEngines || [];
        favoriteSites.value = config.favoriteSites || [];
        if (searchEngines.value.length > 0) {
          selectedSearchEngine.value = searchEngines.value[0].url;
        }
      }
    };

    // 請求最新的配置文件和網頁內容並更新緩存
    const fetchLatestData = async () => {
      try {
        const response = await fetch('/config.yaml');
        const configText = await response.text();
        const config = yaml.load(configText);

        // 更新數據
        searchEngines.value = config.searchEngines;
        favoriteSites.value = config.favoriteSites;

        // 更新緩存
        localStorage.setItem('config', JSON.stringify(config));

        // 默認選中第一個搜索引擎
        if (searchEngines.value.length > 0) {
          selectedSearchEngine.value = searchEngines.value[0].url;
        }
      } catch (error) {
        console.error('Failed to fetch latest config:', error);
      }
    };

    // 解析YAML配置文件
    onMounted(async () => {
      const response = await fetch('/config.yaml');
      const configText = await response.text();
      const config = yaml.load(configText);

      // 设置搜索引擎和常用网站
      searchEngines.value = config.searchEngines;
      favoriteSites.value = config.favoriteSites;

      // 默认选中第一个搜索引擎
      selectedSearchEngine.value = searchEngines.value[0].url;
    });

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
      performSearch
    };
  }
};
</script>
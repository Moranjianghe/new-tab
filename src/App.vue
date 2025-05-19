<template>
  <div
    class="text-sky-500 border-pink-500 dark:border-white dark:bg-black  min-h-screen p-2 w-full md:w-[80lvw] max-w-[768px]">
    <div class=" ">
    </div>
    <!--search bar-->
    <div class="md:mt-[40lvh] flex h-12  rounded-xl border-2 ring-2 ring-white dark:ring-black  transition-colors  "
      :class="{ 'ring-pink-500 border-pink-500': isSearchBarFocused }">
      <select class="focus:outline-none" v-model="selectedSearchEngine" @focus="isSearchBarFocused = true"
        @blur="isSearchBarFocused = false">
        <option v-for="engine in searchEngines" :key="engine" :value="engine.url">
          {{ engine.name }}
        </option>
      </select>
      <input class=" h-full flex-1 focus:outline-none" v-model="searchQuery" @keyup.enter="performSearch"
        :placeholder="t('search.placeholder')" @focus="isSearchBarFocused = true" @blur="isSearchBarFocused = false" />
      <div class="h-full w-18 flex items-center justify-center cursor-pointer" @focus="isSearchBarFocused = true"
        @blur="isSearchBarFocused = false" @click="performSearch">
        {{ t('search.button') }}
      </div>
    </div>
    <!--List of Commonly Used Websites-->
    <div v-if="favoriteSites.length > 0">
      <h2 class="text-2xl mb-4 mt-12 mx-2 text-left text-pink-500">{{ t('favorites.title') }}</h2>
      <div class="favorites-container  flex flex-col ">
        <!-- 使用遞迴組件處理每個項目 -->
        <folder-item v-for="(site, index) in favoriteSites" :key="index" :item="site" :path="site.name" />
      </div>
    </div>
    <div v-else>
      <p>{{ t('favorites.empty') }}</p>
    </div>


    <!-- Settings Button -->
    <button @click="showSettings = true">{{ t('settings.button') }}</button>

    <!-- Settings Dialog -->
    <div v-if="showSettings">
      <div>
        <p>{{ t('settings.configUrl') }}</p>
        <input v-model="newConfigUrl" @click="$event.target.select()" />
        <button @click="updateConfigUrl">{{ t('settings.save') }}</button>
        <button @click="showSettings = false">{{ t('settings.cancel') }}</button>
      </div>
      <!-- Language Selector -->
      <select v-model="currentLocale" @change="changeLocale">
        <option value="zh-TW">繁體中文</option>
        <option value="en-US">English</option>
      </select>
    </div>
    <!--構建時間-->
    <div class="fixed bottom-2 right-2 text-xs text-gray-500">
      Build time: {{ buildTime }}
    </div>
  </div>
</template>

<script lang="js">
import yaml from 'js-yaml';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import FolderItem from './components/FolderItem.vue';

export default {
  name: 'App',
  components: {
    FolderItem
  },
  setup() {
    const { t, locale } = useI18n();
    const currentLocale = ref(locale.value);
    const searchQuery = ref('');
    const selectedSearchEngine = ref('');
    const searchEngines = ref([]);
    const favoriteSites = ref([]);
    const showSettings = ref(false);
    const configUrl = ref('/config.yaml');
    const newConfigUrl = ref(configUrl.value);
    const isSearchBarFocused = ref(false);
    const buildTime = ref(import.meta.env.VITE_BUILD_TIME || new Date().toISOString());

    const syncFolderOpenState = (items, parentPath = '') => {
      if (!Array.isArray(items)) return;
      items.forEach(item => {
        if (item.type === 'folder' && item.name) {
          const path = parentPath ? `${parentPath}/${item.name}` : item.name;


          const savedState = localStorage.getItem(`folder_${path}_state`);
          if (savedState !== null) {
            item.isOpen = savedState === 'true';
          }
          // 遞迴處理子資料夾
          if (Array.isArray(item.items)) {
            syncFolderOpenState(item.items, path);
          }
        }
      });
    };
    const loadCachedData = () => {
      const cachedConfigUrl = localStorage.getItem('configUrl');
      if (cachedConfigUrl) {
        configUrl.value = cachedConfigUrl;
        console.log('Loaded cached config URL:', configUrl);
      }
      const cachedConfig = localStorage.getItem('config');
      if (cachedConfig) {
        const config = JSON.parse(cachedConfig);
        searchEngines.value = config.searchEngines || [];
        favoriteSites.value = config.favoriteSites || [];
        console.log('Loaded cached config:', config);

        if (searchEngines.value.length > 0) {
          selectedSearchEngine.value = searchEngines.value[0].url;
        }
      }
    };

    // 清理過時的資料夾狀態
    // 這個函數會遍歷所有的資料夾，並將不在當前配置中的資料夾狀態從 localStorage 中刪除
    function cleanObsoleteFolderStates(items, validPaths = new Set(), parentPath = '') {
      if (!Array.isArray(items)) return;
      items.forEach(item => {
        if (item.type === 'folder' && item.name) {
          validPaths.add(item.name);
          if (Array.isArray(item.items)) {
            const newPath = `${parentPath}/${item.name}`;
            cleanObsoleteFolderStates(item.items, validPaths, newPath);
          }
        }
      });
      // 清理 localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('folder_') && key.endsWith('_state')) {
          const path = key.slice(7, -6); // 取出資料夾名稱
          if (!validPaths.has(path)) {
            localStorage.removeItem(key);
          }
        }
      });
    }

    // Fetch the latest config data from the URL
    const fetchLatestData = async () => {
      try {
        const response = await fetch(configUrl.value);
        const configText = await response.text();
        const config = yaml.load(configText);

        searchEngines.value = config.searchEngines;
        favoriteSites.value = config.favoriteSites;

        syncFolderOpenState(favoriteSites.value);

        localStorage.setItem('config', JSON.stringify(config));
        console.log('renew cached config:', config);

        if (searchEngines.value.length > 0) {
          selectedSearchEngine.value = searchEngines.value[0].url;
        }
      } catch (error) {
        console.error('Failed to fetch latest config:', error);
      }
    };

    onMounted(async () => {
      document.title = t('tab.newTabTitle');
      const savedLocale = localStorage.getItem('locale');
      if (savedLocale) {
        currentLocale.value = savedLocale;
        locale.value = savedLocale;
      }

      loadCachedData();
      try {
        await fetchLatestData();
      } catch (error) {
        console.error('Failed to fetch latest config:', error);
      }
      cleanObsoleteFolderStates(favoriteSites.value);
    });

    const updateConfigUrl = async () => {
      if (newConfigUrl.value.trim() !== '') {
        configUrl.value = newConfigUrl.value.trim();
        localStorage.setItem('configUrl', configUrl.value);
        console.log('Updated configUrl:', configUrl);
        await fetchLatestData();
        showSettings.value = false;
      }
    };

    const performSearch = () => {
      if (searchQuery.value.trim() !== '') {
        const url = selectedSearchEngine.value.replace('%s', encodeURIComponent(searchQuery.value));
        window.open(url, '_blank');
      }
    };

    const openUrl = (url) => {
      // 如果是 chrome:// 開頭的 URL，使用 chrome API
      if (url.startsWith('chrome://') && typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({ action: 'openUrl', url: url })
          .catch(error => {
            console.error('Failed to open chrome:// URL:', error);
            // 降級處理：嘗試普通方式打開
            window.open(url, '_blank');
          });
      } else {
        // 一般 URL 使用普通方式打開
        window.open(url, '_blank');
      }
    };

    const changeLocale = () => {
      locale.value = currentLocale.value;
      localStorage.setItem('locale', currentLocale.value);
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
      configUrl,
      t,
      currentLocale,
      changeLocale,
      isSearchBarFocused,
      buildTime
    };
  }
};
</script>

<style lang='css'>
@import "tailwindcss";
</style>
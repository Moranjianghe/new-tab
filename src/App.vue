<template>
  <div class="text-sky-500 border-pink-500 dark:border-white  w-full h-full flex flex-col items-center">
    <!--search bar-->
    <div class="flex h-12 w-full max-w-[768px]  rounded-xl border-2 ring-2 ring-white  transition-colors  "
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
      <p>{{ t('favorites.title') }}</p>
      <div class="favorites-container">
        <!-- 使用遞迴組件處理每個項目 -->
        <folder-item v-for="(site, index) in favoriteSites" :key="index" :item="site" />
      </div>
    </div>
    <div v-else>
      <p>{{ t('favorites.empty') }}</p>
    </div>
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
    const newConfigUrl = configUrl;
    const isSearchBarFocused = ref(false);
    const buildTime = ref(import.meta.env.VITE_BUILD_TIME || new Date().toISOString());

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

    const fetchLatestData = async () => {
      try {
        const response = await fetch(configUrl.value);
        const configText = await response.text();
        const config = yaml.load(configText);

        searchEngines.value = config.searchEngines;
        favoriteSites.value = config.favoriteSites;

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
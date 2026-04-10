<template>
  <main class="min-h-screen bg-white px-4 pb-6 pt-3 text-[#202124] dark:bg-[#202124] dark:text-[#e8eaed]">
    <header class="mx-auto flex min-h-10 w-full max-w-[1280px] items-center justify-end">
      <button
        class="grid size-[34px] place-items-center rounded-full text-[#5f6368] hover:bg-[#f1f3f4] dark:text-[#9aa0a6] dark:hover:bg-[#3c4043]"
        type="button"
        :aria-label="t('settings.button')"
        @click="showSettings = true"
      >
        <Settings :size="18" :stroke-width="1.8" aria-hidden="true" />
      </button>
    </header>

    <section class="nt-hero mx-auto mt-[clamp(48px,12vh,132px)] flex w-full max-w-[720px] flex-col items-stretch gap-3 md:items-center">
      <form
        class="nt-search grid w-full max-w-[580px] grid-cols-1 items-center gap-2 rounded-2xl border border-[#dfe1e5] bg-white px-1.5 py-1 transition md:rounded-full dark:border-[#5f6368] dark:bg-[#303134] md:[grid-template-columns:144px_1fr_auto]"
        :class="
          isSearchBarFocused
            ? 'border-transparent shadow-[0_1px_6px_rgba(32,33,36,0.28),0_0_0_2px_rgba(26,115,232,0.24)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45),0_0_0_2px_rgba(138,180,248,0.3)]'
            : 'shadow-[0_1px_2px_rgba(32,33,36,0.08)] hover:shadow-[0_1px_6px_rgba(32,33,36,0.28)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.45)]'
        "
        @submit.prevent="performSearch"
      >
        <label class="sr-only" for="search-engine">{{ t('search.engineLabel') }}</label>
        <select
          id="search-engine"
          class="w-full rounded-[10px] border border-[#dfe1e5] bg-transparent px-3 py-2 text-[0.92rem] outline-none dark:border-[#5f6368] md:rounded-full md:border-0 md:border-r md:border-[#dfe1e5] dark:md:border-[#5f6368]"
          v-model="selectedSearchEngine"
          @focus="isSearchBarFocused = true"
          @blur="isSearchBarFocused = false"
        >
          <option v-for="engine in searchEngines" :key="engine.name" :value="engine.url">
            {{ engine.name }}
          </option>
        </select>

        <input
          class="w-full rounded-[10px] border border-[#dfe1e5] bg-transparent px-3 py-2 text-[0.92rem] outline-none dark:border-[#5f6368] md:rounded-full md:border-0"
          v-model="searchQuery"
          :placeholder="t('search.placeholder')"
          @focus="isSearchBarFocused = true"
          @blur="isSearchBarFocused = false"
        />

        <button
          class="hidden w-10 items-center justify-center rounded-full bg-[#1a73e8] py-2 text-white hover:brightness-95 md:flex dark:bg-[#8ab4f8] dark:text-[#202124]"
          type="submit"
          :aria-label="t('search.button')"
        >
          <Search :size="18" :stroke-width="2" aria-hidden="true" />
        </button>
      </form>
    </section>

    <section v-if="favoriteSites.length > 0" class="nt-shortcuts mx-auto mt-10 w-full max-w-[960px]">
      <div class="grid grid-cols-1 gap-2">
        <folder-item v-for="(site, index) in favoriteSites" :key="index" :item="site" :path="site.name" :level="0" />
      </div>
    </section>
    <p v-else class="mt-12 text-center text-[#5f6368] dark:text-[#9aa0a6]">{{ t('favorites.empty') }}</p>

    <div v-if="showSettings" class="fixed inset-0 z-20 grid place-items-center bg-[rgba(32,33,36,0.36)] p-4" @click.self="showSettings = false">
      <div class="grid w-full max-w-[500px] gap-2.5 rounded-2xl border border-[#dfe1e5] bg-white p-[18px] shadow-[0_1px_6px_rgba(32,33,36,0.28)] dark:border-[#5f6368] dark:bg-[#303134]">
        <h3 class="m-0 text-[1.04rem]">{{ t('settings.button') }}</h3>

        <label class="text-[0.88rem] text-[#5f6368] dark:text-[#9aa0a6]" for="config-url">{{ t('settings.configUrl') }}</label>
        <input
          id="config-url"
          class="w-full rounded-[10px] border border-[#dfe1e5] bg-white px-3 py-2 outline-none focus:border-[#1a73e8] focus:shadow-[0_0_0_3px_rgba(26,115,232,0.2)] dark:border-[#5f6368] dark:bg-[#303134] dark:focus:border-[#8ab4f8]"
          v-model="newConfigUrl"
          @focus="$event.target.select()"
        />

        <label class="text-[0.88rem] text-[#5f6368] dark:text-[#9aa0a6]" for="locale-select">{{ t('settings.language') }}</label>
        <select
          id="locale-select"
          class="w-full rounded-[10px] border border-[#dfe1e5] bg-white px-3 py-2 outline-none focus:border-[#1a73e8] focus:shadow-[0_0_0_3px_rgba(26,115,232,0.2)] dark:border-[#5f6368] dark:bg-[#303134] dark:focus:border-[#8ab4f8]"
          v-model="currentLocale"
          @change="changeLocale"
        >
          <option value="zh-CN">{{ t('settings.locales.zhCN') }}</option>
          <option value="zh-TW">{{ t('settings.locales.zhTW') }}</option>
          <option value="en-US">{{ t('settings.locales.enUS') }}</option>
        </select>

        <div class="mt-2 flex justify-end gap-2">
          <button
            class="rounded-full bg-[#1a73e8] px-4 py-2 text-white hover:brightness-95 dark:bg-[#8ab4f8] dark:text-[#202124]"
            type="button"
            @click="updateConfigUrl"
          >
            {{ t('settings.save') }}
          </button>
          <button
            class="rounded-full border border-[#dfe1e5] bg-white px-4 py-2 hover:bg-[#f8f9fa] dark:border-[#5f6368] dark:bg-[#303134] dark:hover:bg-[#3c4043]"
            type="button"
            @click="showSettings = false"
          >
            {{ t('settings.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script lang="js">
import yaml from 'js-yaml';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { Search, Settings } from 'lucide-vue-next';
import FolderItem from './components/FolderItem.vue';

const DEFAULT_CONFIG_URL = '/config.yaml';
const SUPPORTED_LOCALES = new Set(['zh-CN', 'zh-TW', 'en-US']);

export default {
  name: 'App',
  components: {
    FolderItem,
    Search,
    Settings,
  },
  setup() {
    const { t, locale } = useI18n();
    const currentLocale = ref(locale.value);
    const searchQuery = ref('');
    const selectedSearchEngine = ref('');
    const searchEngines = ref([]);
    const favoriteSites = ref([]);
    const showSettings = ref(false);
    const configUrl = ref(DEFAULT_CONFIG_URL);
    const newConfigUrl = ref(configUrl.value);
    const isSearchBarFocused = ref(false);

    const syncFolderOpenState = (items, parentPath = '') => {
      if (!Array.isArray(items)) return;

      items.forEach((item) => {
        if (item.type === 'folder' && item.name) {
          const path = parentPath ? `${parentPath}/${item.name}` : item.name;
          const savedState = localStorage.getItem(`folder_${path}_state`);

          if (savedState !== null) {
            item.isOpen = savedState === 'true';
          }

          if (Array.isArray(item.items)) {
            syncFolderOpenState(item.items, path);
          }
        }
      });
    };

    const cleanObsoleteFolderStates = (items, validPaths = new Set(), parentPath = '') => {
      if (!Array.isArray(items)) return validPaths;

      for (const item of items) {
        if (item.type === 'folder' && item.name) {
          const path = parentPath ? `${parentPath}/${item.name}` : item.name;
          validPaths.add(path);

          if (Array.isArray(item.items)) {
            cleanObsoleteFolderStates(item.items, validPaths, path);
          }
        }
      }

      if (parentPath === '') {
        Object.keys(localStorage).forEach((key) => {
          if (!key.startsWith('folder_') || !key.endsWith('_state')) return;

          const path = key.slice(7, -6);
          if (!validPaths.has(path)) {
            localStorage.removeItem(key);
          }
        });
      }

      return validPaths;
    };

    const loadCachedData = () => {
      const cachedConfigUrl = localStorage.getItem('configUrl');
      if (cachedConfigUrl) {
        configUrl.value = cachedConfigUrl;
        newConfigUrl.value = cachedConfigUrl;
      }

      const cachedConfig = localStorage.getItem('config');
      if (!cachedConfig) return;

      try {
        const config = JSON.parse(cachedConfig);
        searchEngines.value = Array.isArray(config.searchEngines) ? config.searchEngines : [];
        favoriteSites.value = Array.isArray(config.favoriteSites) ? config.favoriteSites : [];
        syncFolderOpenState(favoriteSites.value);

        if (searchEngines.value.length > 0) {
          selectedSearchEngine.value = searchEngines.value[0].url;
        }
      } catch (error) {
        console.error('Failed to parse cached config:', error);
      }
    };

    const fetchLatestData = async () => {
      const response = await fetch(configUrl.value, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Fetch failed with status ${response.status}`);
      }

      const configText = await response.text();
      const config = yaml.load(configText) || {};

      searchEngines.value = Array.isArray(config.searchEngines) ? config.searchEngines : [];
      favoriteSites.value = Array.isArray(config.favoriteSites) ? config.favoriteSites : [];

      syncFolderOpenState(favoriteSites.value);
      cleanObsoleteFolderStates(favoriteSites.value);

      localStorage.setItem(
        'config',
        JSON.stringify({
          searchEngines: searchEngines.value,
          favoriteSites: favoriteSites.value,
        }),
      );

      if (searchEngines.value.length > 0) {
        selectedSearchEngine.value = searchEngines.value[0].url;
      } else {
        selectedSearchEngine.value = '';
      }
    };

    onMounted(async () => {
      const savedLocale = localStorage.getItem('locale');
      if (savedLocale && SUPPORTED_LOCALES.has(savedLocale)) {
        currentLocale.value = savedLocale;
        locale.value = savedLocale;
      }

      document.title = t('tab.newTabTitle');
      loadCachedData();

      try {
        await fetchLatestData();
      } catch (error) {
        console.error('Failed to fetch latest config:', error);
      }
    });

    const updateConfigUrl = async () => {
      if (newConfigUrl.value.trim() === '') return;

      configUrl.value = newConfigUrl.value.trim();
      localStorage.setItem('configUrl', configUrl.value);

      try {
        await fetchLatestData();
        showSettings.value = false;
      } catch (error) {
        console.error('Failed to refresh config:', error);
      }
    };

    const performSearch = () => {
      const query = searchQuery.value.trim();
      if (!query) return;

      const fallbackEngine = searchEngines.value[0]?.url;
      const engine = selectedSearchEngine.value || fallbackEngine;
      if (!engine) return;

      const template = engine.includes('%s') ? engine : `${engine}%s`;
      const url = template.replace('%s', encodeURIComponent(query));
      window.open(url, '_blank', 'noopener,noreferrer');
    };

    const changeLocale = () => {
      if (!SUPPORTED_LOCALES.has(currentLocale.value)) return;

      locale.value = currentLocale.value;
      localStorage.setItem('locale', currentLocale.value);
      document.title = t('tab.newTabTitle');
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
      t,
      currentLocale,
      changeLocale,
      isSearchBarFocused,
    };
  },
};
</script>

<style scoped>
@media (min-width: 1024px) {
  .nt-hero {
    min-width: 760px;
  }

  .nt-shortcuts {
    min-width: 900px;
  }
}

@media (max-width: 768px) {
  .nt-hero {
    margin-top: 4px;
  }

  .nt-search {
    max-width: none;
  }

  .nt-shortcuts {
    margin-top: 16px;
  }
}

@media (min-width: 1280px) {
  .nt-hero {
    min-width: 840px;
  }

  .nt-search {
    max-width: 680px;
  }

  .nt-shortcuts {
    min-width: 1020px;
  }
}
</style>

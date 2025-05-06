<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
<div class="">
  <!--search bar-->
  <div>
    <input
      v-model="query"
      @keyup.enter="search"
      />
    <button @click="search">Search</button>
  </div>
</div>
</template>

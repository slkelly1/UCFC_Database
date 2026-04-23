<template>
  <div class="h-full">
    <SectionLandscape />
        <SectionSearch />
  

    <GbifLatestLiterature />

  </div>
</template>

<script setup>
import GbifLatestLiterature from './components/Section/GbifLatestLiterature.vue';
import SectionLandscape from './components/Section/SectionLandscape.vue';
import SectionSearch from './components/Section/SectionSearch.vue';
</script>

<template>
  <div>
    <PageBand
      kicker="The collection in numbers"
      title="More than half a million specimens"
      lede="The UCFC is one of the largest fully databased arthropod collections in the world. These figures are read live from the collection's dataset on GBIF, so they grow as new specimens are published."
    />
    <div class="fl-page">
    <CollectionNumbers  />
  </div>
  </div>
</template>

<script setup>
import PageBand from './components/Florida/PageBand.vue'
import CollectionNumbers from './components/Florida/CollectionNumbers.vue'
</script>

<style scoped>
.fl-intro {
  max-width: 46rem;
}
.fl-mt-top {
  margin-top: 1rem;
}
</style>

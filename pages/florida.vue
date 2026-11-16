<template>
  <div>
    <PageBand
      kicker="Florida, county by county"
      title="Where the specimens come from"
      lede="Two thirds of the UCFC comes from Florida. The map shows how many specimens were collected in each county; pick one to see its orders and the species collected most often there."
    />
    <div class="fl-page">
    <CountyMap  />
  </div>
  </div>
</template>

<script setup>
import PageBand from './components/Florida/PageBand.vue'
import CountyMap from './components/Florida/CountyMap.vue'
</script>

<style scoped>
.fl-intro {
  max-width: 46rem;
}
.fl-mt-map {
  margin-top: 2rem;
}
</style>

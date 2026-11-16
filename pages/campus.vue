<template>
  <div>
    <PageBand
      kicker="Our own backyard"
      title="Insects of the UCF campus"
      lede="A large share of the UCFC was collected right here, on the UCF Orlando campus and in its arboretum. This page shows what has been found on campus and when, from every specimen collected inside the campus area (an approximate box around the main campus and the arboretum)."
    />
    <div class="fl-page">
    <CampusInsects />
  </div>
  </div>
</template>

<script setup>
import PageBand from './components/Florida/PageBand.vue'
import CampusInsects from './components/Florida/CampusInsects.vue'
</script>

<style scoped>
.fl-intro {
  max-width: 46rem;
}
</style>

<template>
  <div>
    <PageBand
      kicker="Browse"
      title="The tree of life in the Bug Closet"
      lede="Every group in the collection, ranked by how many specimens it holds. Open a group to see what it contains, from class to species; click a name to open its page. The numbers come live from the UCFC dataset on GBIF."
    />
    <div class="fl-page">
    <div class="fl-card tr-card">
      <RankTree />
    </div>
    <p class="fl-muted tr-note">
      The tree follows the GBIF classification of the UCFC records, so a few names may sit in a slightly different
      place than in the database.
    </p>
  </div>
  </div>
</template>

<script setup>
import PageBand from './components/Florida/PageBand.vue'
import RankTree from './components/Florida/RankTree.vue'
</script>

<style scoped>
.tr-intro {
  max-width: 46rem;
}
.tr-card {
  margin-top: 2rem;
  padding: 1rem 0.75rem;
}
.tr-note {
  font-size: 0.8rem;
  margin-top: 0.9rem;
}
</style>

<template>
    <div class="taxonomy-page">
      <h1>Taxonomy Tree</h1>
  
      <div v-if="taxonomy">
        <SectionTree :taxonomy="taxonomy" />
      </div>
  
      <div v-else>
        Loading...
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import SectionTree from '~/components/Section/Tree/SectionTree.vue' // <-- same component as the panel!
  import TaxonWorks from '../../../services/TaxonWorks'
  
  const taxonomy = ref(null)
  
  onMounted(async () => {
    const { data } = await TaxonWorks.getTaxonomy(1) // <-- replace 1 with the OTU ID you want as root
    taxonomy.value = data
  })
  </script>
  
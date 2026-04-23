<template>
  <section>
    <div class="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">

      <div
        v-for="(item, key) in dataTypes"
        :key="key"
        class="p-5 bg-gray-100 border-gray-300 dark:bg-gray-200 rounded-xl shadow-lg 
               border dark:border-gray-100
               flex flex-col items-center justify-center 
               transition hover:shadow-md"
      >
        <DataType
          :icon="item.icon"
          :label="item.label"
          :count="item.count"
        />
      </div>

    </div>
  </section>
</template>


  
<script setup>
import { makeAPIRequest } from '@/utils/request'
import { shallowRef, triggerRef } from 'vue'

import IconBug from '../Icon/IconBug.vue'
import IconImage from '../Icon/IconImage.vue'
import IconMicroscope from '../Icon/IconMicroscope.vue'
import IconOk from '../Icon/IconOk.vue'

import DataType from './Data/DataType.vue'

const TYPES = {
  validSpecies: 'Species at UCFC',
  taxonNames: 'Taxon names',
  collectionObjects: 'Collection objects',
  citations: 'Citations',
  images: 'Images'
}

const dataTypes = shallowRef({
  [TYPES.validSpecies]: {
    icon: IconOk,
    label: 'Species at UCFC',
    count: 29410
  },
  [TYPES.taxonNames]: {
    icon: IconMicroscope,
    label: 'Scientific names',
    count: 47350
  },
  [TYPES.images]: {
    icon: IconImage,
    label: 'Images',
    count: 0
  },  
  [TYPES.collectionObjects]: {
    icon: IconBug,
    label: 'Specimen records',
    count: 108000
  }
})

// fetch stats from API
makeAPIRequest('/stats').then((response) => {
  const { data } = response.data

  for (const key in data) {
    if (dataTypes.value[key]) {
      dataTypes.value[key].count = data[key]
    }
  }

  triggerRef(dataTypes)
})

// fetch valid species count only
async function loadSpeciesCount() {
  await makeAPIRequest('/taxon_names.json', {
    params: {
      page: 1,
      per: 1,
      validity: true,
      rank: ['NomenclaturalRank::Iczn::SpeciesGroup::Species']
    }
  }).then(({ headers }) => {
    dataTypes.value[TYPES.validSpecies].count = Number(
      headers['pagination-total']
    )
  })

  triggerRef(dataTypes)
}

loadSpeciesCount()
</script>
  
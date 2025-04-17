<template>
    <div class="h-full">
      <SectionLandscape />
      <SectionData />
      <SectionAnnouncements />
      <SectionTerms class="drop-shadow" />
    <PanelDescendants />
    </div>
  </template>


  <script setup>
  import SectionData from './components/Section/SectionData.vue'
  import SectionLandscape from './components/Section/SectionLandscape.vue'
  import SectionTerms from './components/Section/SectionTerms.vue'
    import SectionAnnouncements from './components/Section/SectionAnnouncements.vue'
    import PanelDescendants from './PanelDescendants.vue'
  </script>

<template>
    <section>
      <div class="relative box-border">
        <ImageCarrousel>
          <div
            class="flex flex-col justify-center sm:items-center w-full h-full gap-4 bg-black bg-opacity-10"
          >
            <span class="text-3xl sm:text-4xl px-4 font-medium text-white">{{
              project_name
            }}</span>
            <span class="text-lg sm:text-xl text-white px-4"
              >Check out all the specimens in our collections!</span
            >
<span class="text-lg sm:text-xl text-white px-4">Search by taxa below or start browsing
            <a href="https://slkelly1.github.io/UCFC_Database/#/otus/1079019/overview" class="hover:underline">here</a>.</span>
            <div class="p-3 bg-black bg-opacity-20 w-full max-w-lg box-border rounded-lg">
              <AutocompleteOtu
                autofocus
                class="w-full"
                placeholder="Search by taxon name..."
              />
            </div>
          </div>
        </ImageCarrousel>
      </div>
    </section>
  </template>
  
  <script setup>
  import ImageCarrousel from '../ImageCarrousel.vue'
  const { project_name } = __APP_ENV__
  </script>
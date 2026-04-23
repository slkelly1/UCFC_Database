<template>
  <section class="py-7 bg-gray-50 dark:bg-gray-900/30 border-t border-gray-300 dark:border-gray-700">
    <div class="max-w-6xl mx-auto">

      <h3 class="text-xl font-semibold text-gray-700 dark:text-gray-100 mb-4">
        Latest Publications Using UCFC Data
      </h3>

      <iframe 
        src="https://www.gbif.org/api/widgets/literature/latest?gbifDatasetKey=262f8270-f9c2-4bc6-a562-8ed71c0790e6"
        scrolling="no"
        frameborder="0"
        allowtransparency="true"
        allowfullscreen="false"
        class="w-full h-[350px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white"
      ></iframe>

    </div>
  </section>
</template>

<script setup>
</script>

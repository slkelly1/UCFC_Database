<template>
  <section class="relative bg-gray-50 dark:bg-gray-900 py-16 px-6 md:px-12">
    <div class="relative max-w-6xl mx-auto space-y-12">

      <!-- Data Access Card -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 rounded-xl shadow-lg p-8 md:flex md:items-center md:justify-between gap-8">
        <div class="space-y-4">
          <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100">Accessing the Data</h2>
          <p class="text-gray-700 dark:text-gray-300 text-lg">
            All data from this collection are freely available on this website or through the 
            Global Biodiversity Information Facility (GBIF).
          </p>
        </div>

        <!-- GBIF Logo / Image -->
        <div class="flex justify-center md:justify-end mt-6 md:mt-0">
          <img src="/images/GBIF.png" alt="GBIF Logo" class="w-32 md:w-40 object-contain">
        </div>
      </div>

      <!-- Terms of Use Card -->
      <div class="bg-white border border-gray-200 dark:bg-gray-800 rounded-xl shadow-lg p-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Terms of Use</h2>
        <p class="text-gray-700 dark:text-gray-300 text-lg">
          Except where noted, content is licensed under 
          <a :href="ccByUrl" class="underline text-primary hover:text-primary-dark transition" target="_blank" rel="noopener">
            CC-BY 4.0
          </a>. 
          Images and media are by default under 
          <a :href="ccByNcSaUrl" class="underline text-primary hover:text-primary-dark transition" target="_blank" rel="noopener">
            CC BY-NC-SA 4.0
          </a>, unless otherwise stated.
        </p>
      </div>

      <!-- Find Out More Card -->
      <div class="bg-white dark:bg-gray-800 border border-gray-200 rounded-xl shadow-lg p-8">
        <h2 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">Need Assistance?</h2>
  <p class="text-gray-700 dark:text-gray-300 text-lg">
    If you have issues with the dataset, please contact the collection manager. 
    For website-related problems, contact the website manager. 
    Contact information and technical details are available 
    <RouterLink to="/about" class="underline text-primary hover:text-primary-dark transition">
      here
    </RouterLink>.
  </p>
      </div>

    </div>
  </section>
</template>

<script setup>
const ccByUrl = "https://creativecommons.org/licenses/by/4.0/";
const ccByNcSaUrl = "https://creativecommons.org/licenses/by-nc-sa/4.0/";
</script>

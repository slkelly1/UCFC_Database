<template>
  <section class="border-t border-gray-200 py-6 px-6 md:px-12 dark:bg-gray-500">
    <div class="max-w-3xl mx-auto text-center space-y-4">
      <h3 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">
        Search the Collection
      </h3>
      <p class="text-gray-700 dark:text-gray-300">
        Search by taxon name below or start browsing
        <a href="https://slkelly1.github.io/UCFC_Database/#/otus/1079019/overview" class="text-primary font-semibold hover:underline">
          here
        </a>.
      </p>
      <div class="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <AutocompleteOtu
          autofocus
          class="w-full"
          placeholder="Search by taxon name..."
        />
      </div>
    </div>
  </section>
</template>

<script setup>

</script>

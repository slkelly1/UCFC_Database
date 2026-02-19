<template>
  <section class="relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-16 px-6 md:px-12">
    <!-- Decorative shapes for subtle visual interest -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute top-0 left-1/2 w-[600px] h-[600px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl"></div>
    </div>

    <div class="relative max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      <!-- Left Column: Text -->
      <div class="space-y-6">
        <h2 class="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
          Welcome to the UCFC Collection of Arthropods
        </h2>
        <p class="text-lg text-gray-700 dark:text-gray-300">
          Officially known as the <strong>University of Central Florida Collection of Arthropods (UCFC)</strong>, 
          we are one of the largest fully databased collections in the world, with over 
          <strong>575,000 specimen records</strong> for insects and other arthropods — and more are added daily.
        </p>
        <p class="text-lg text-gray-700 dark:text-gray-300">
          Check out the 
          <a :href="databaseUrl" class="underline text-primary font-semibold hover:text-primary-dark transition">
            Database
          </a> 
          and explore what entomological wonders reside within Central Florida! 
          We especially pride ourselves on our <strong>Hymenoptera</strong> (ants, bees, and wasps) and 
          <strong>Coleoptera</strong> (beetles) holdings.
        </p>
      </div>

      <!-- Right Column: Image / Illustration -->
      <div class="flex justify-center md:justify-end">
        <img src="/images/epsilosimple_logo.png" alt="UCFC Arthropod Collection" class="rounded-xl w-full max-w-md object-cover">
      </div>
    </div>
  </section>
</template>

<script setup>
const databaseUrl = "https://collections.ucf.edu";
</script>

<template>
  <section
    class="container mx-auto max-w-screen-xl py-12 px-8 sm:px-6 lg:px-10 bg-[rgb(var(--color-base-foreground))] rounded-xl shadow-2xl mt-12"
  >
    <!-- Heading with subtle underline -->
    <h1 class="text-3xl sm:text-4xl font-bold tracking-tight relative inline-block mb-10 text-[rgb(var(--color-base-lighter))]">
      About the UCFC
      <span
        class="absolute left-0 -bottom-1 h-1 w-20 bg-[rgb(var(--color-primary))] rounded"
        aria-hidden="true"
      ></span>
    </h1>

    <!-- Intro paragraphs -->
    <p class="mb-5 leading-relaxed text-base sm:text-lg text-gray-700">
      <strong>The University of Central Florida Collection (UCFC)</strong> is a curated repository of biodiversity specimens, designed to provide a comprehensive and dynamic experience for researchers, educators, and the public. It serves as a central hub for exploring UCF’s biological collections.
    </p>

    <p class="mb-5 leading-relaxed text-base sm:text-lg text-gray-700">
      <strong>UCFC</strong> features detailed information on research highlights, specimen records, and associated biodiversity data. Researchers can search for specimens, track collection data, and access information to support scientific studies across multiple taxa.
    </p>

    <p class="mb-5 leading-relaxed text-base sm:text-lg text-gray-700">
      The collection is overseen by <strong>Dr. Barbara Sharanowski, Curator of UCFC</strong>, managed by <strong>Sandor Kelly, Collection Manager</strong>, and maintained online by <strong>Dr. Davide Dal Pos, Database & Web Manager</strong>. They ensure the accuracy, preservation, and accessibility of all specimens. <strong>UCFC</strong> is integrated with global biodiversity initiatives, contributing to open-access scientific data platforms.
    </p>

    <p class="mb-8 leading-relaxed text-base sm:text-lg text-gray-700">
      Explore the <strong>UCFC</strong> through our official portal or access our contributions on international biodiversity networks using the links below.
    </p>

    <!-- Buttons -->
    <div class="flex flex-wrap gap-4">
      <a
        href="https://www.gbif.org/publisher/f9846278-7e1b-449b-b92b-417fab3a5a20"
        target="_blank"
        rel="noopener"
        class="px-6 py-3 bg-green-500 text-white border border-green-600 rounded-lg shadow-lg font-medium hover:bg-green-600 hover:brightness-110 transition"
      >
        GBIF Publisher Page
      </a>
      <a
        href="https://collections.ucf.edu/"
        target="_blank"
        rel="noopener"
        class="px-6 py-3 bg-yellow-400 text-white border border-yellow-500 rounded-lg shadow-lg font-medium hover:bg-yellow-500 hover:brightness-105 transition"
      >
        UCFC Official Page
      </a>
    </div>
  </section>
</template>

<script setup>
// Static content only
</script>


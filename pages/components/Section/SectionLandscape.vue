<template>
  <section 
    class="fl-hero relative px-3 md:px-6 py-12 md:py-20"
  >
    <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">

      <!-- Left Column: Hero Image -->
      <div class="flex justify-center md:justify-start">
        <img 
          src="/images/epsilosimple_logo.png" 
          alt="UCFC Arthropod Collection"
          class="rounded-xl w-full max-w-md object-cover shadow-lg border-gray-300 bg-gray-100 dark:bg-gray-300 border border-gray-200 dark:border-gray-700"
        > 
        
      </div>

      <!-- Right Column: Intro Text + SectionData -->
      <div class="space-y-6 text-left">
<h2 class="text-3xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
  Welcome to the <br>
  <span class="fl-hero-accent">Bug Closet</span> Database
</h2>

        <p class="text-lg text-gray-700 dark:text-gray-300">
          Officially known as the 
          <strong>University of Central Florida Collection of Arthropods (UCFC)</strong>, 
          we are one of the largest fully databased arthropod collections in the world.
        </p>

        <p class="text-lg text-gray-700 dark:text-gray-300">
          With over <strong>575,000 specimen records</strong> — and more added daily — 
          the UCFC supports research, teaching, biodiversity discovery, and public engagement.
        </p>

        <!-- Replace CTA with SectionData -->

          <SectionData />
<GbifBar />
      </div>

    </div>
  </section>
</template>

<script setup>
import GbifBar from './GbifBar.vue';
import SectionData from './SectionData.vue';
</script>

<style scoped>
/* Florida morning: Gulf teal fading into sand */
.fl-hero {
  background:
    radial-gradient(120% 90% at 100% 0%, rgb(var(--fl-sun) / 0.18) 0%, transparent 55%),
    linear-gradient(180deg, rgb(var(--fl-teal-soft)) 0%, rgb(var(--color-base-background)) 100%);
}
.fl-hero-accent {
  color: rgb(var(--fl-coral));
}
</style>

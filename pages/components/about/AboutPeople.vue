<template>
  <section class="container  mx-auto max-w-screen-xl py-12 px-8 sm:px-6 lg:px-10 mt-12">
    <!-- Section Heading -->
    <h2 class="text-3xl sm:text-4xl font-bold tracking-tight relative inline-block mb-12 text-[rgb(var(--color-base-lighter))]">
      Meet the Team
      <span
        class="absolute left-0 -bottom-1 h-1 w-20 bg-[rgb(var(--color-primary))] dark:bg-yellow-500 rounded"
        aria-hidden="true"
      ></span>
    </h2>

    <!-- Team Grid -->
    <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="member in team"
        :key="member.name"
        class="bg-[rgb(var(--color-base-foreground))]  dark:bg-gray-100 border border-gray-200 rounded-xl shadow-lg hover:shadow-2xl transition-shadow p-6 flex flex-col items-center"
      >
        <!-- Circular Image with subtle border -->
        <img
          :src="member.photo"
          :alt="member.name"
          class="w-44 h-44 object-cover rounded-full border-4 border-[rgb(var(--color-primary))] shadow-md mb-4"
        />

        <!-- Name & Title -->
        <h3 class="text-xl font-semibold text-gray-800 mb-1">{{ member.name }}</h3>
        <span class="block dark:bg-yellow-500 w-12 h-1 bg-[rgb(var(--color-primary))] rounded mb-2"></span>
        <p class="text-gray-600 mb-3">{{ member.title }}</p>

        <!-- Description -->
        <p class="text-gray-700 text-sm">{{ member.description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { team } from './people.js';
</script>

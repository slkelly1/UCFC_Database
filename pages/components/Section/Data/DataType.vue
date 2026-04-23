<template>
  <div
    class="flex flex-col items-center justify-center p-3 rounded-xl 
           transition-transform transform hover:-translate-y-1 
      "
  >
    <!-- Icon container -->
    <div 
      class="rounded-full p-2 mb-3 flex items-center justify-center
             bg-gray-200 dark:bg-gray-700"
    >
      <component
        :is="icon"
        class="w-8 h-8 text-primary-color dark:text-primary-color"
      />
    </div>

    <!-- Count -->
    <div class="text-center">
      <span 
        class="font-bold text-2xl text-gray-700 dark:text-gray-700 block leading-none"
      >
        <ClientOnly>
          <AnimateNumber :number="count" />
        </ClientOnly>
      </span>

      <!-- Label -->
      <span 
        class="text-gray-500 dark:text-gray-400 uppercase tracking-wide text-xs mt-1 block"
      >
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script setup>
import AnimateNumber from '../../AnimateNumber.vue';

defineProps({
  icon: { type: Object, required: true },
  count: { type: Number, default: 0 },
  label: { type: String, required: true }
})
</script>

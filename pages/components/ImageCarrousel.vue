<template>
    <div class="overflow-hidden h-[550px] w-full">
      <img
        class="object-cover overflow-hidden h-[550px] w-full absolute"
        :key="currentImage.src"
        :src="currentImage.src"
        alt="Dichroplus maculipennis"
      />
      <div class="bg-black bg-opacity-25 absolute h-full w-full top-0">
        <slot />
      </div>
      <div class="absolute bottom-2 right-4">
        <span class="z-10 text-white text-sm drop-shadow">
          <RouterLink
            v-if="currentImage.otuId"
            class="text-white"
            :to="{ name: 'otus-id', params: { id: currentImage.otuId } }"
          >
            {{ currentImage.label }} © {{ currentImage.copyright }}
          </RouterLink>
        </span>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref, computed } from 'vue'
  import logoWID from './images/epsilosimple_1.png'
  
  const props = defineProps({
    duration: {
      type: Number,
      default: 5000
    }
  })
  
  const images = [
  
    {
      label: 'Logo',
      copyright: 'Jamie Ling',
      src: logoWID,
      otuId: 3435
    }
  ]
  
  const currentIndex = ref(null)
  const currentImage = computed(() => images[currentIndex.value] || {})
  
  onMounted(() => {
    currentIndex.value = Math.floor(Math.random() * images.length)
  })
  </script>
  
  <style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 1s ease-in-out;
  }
  .fade-enter-from {
    opacity: 0;
  }
  .fade-enter-to {
    opacity: 1;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
  </style>
  
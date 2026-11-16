<template>
  <div
    ref="menu"
    class="relative cursor-pointer select-none group"
  >
    <button
      class="flex items-center gap-2 text-primary-content"
      aria-haspopup="true"
      :aria-expanded="isOpen"
      @click="toggleMenu"
      @keydown.escape="closeMenu"
      @keydown.arrow-down.prevent="openAndFocusFirst"
    >
      {{ label }}
      <IconArrowDown
        :class="[
          'size-3 stroke-[3] transition-transform',
          isOpen && 'rotate-180'
        ]"
      />
    </button>

    <div
      v-if="isOpen"
      ref="submenu"
      role="menu"
      class="ucf-dropdown absolute top-full left-0 break-keep text-nowrap mt-3 z-50 min-w-full leading-5"
      @keydown="handleSubmenuKeydown"
    >
      <div
        v-for="item in menu"
        class="ucf-dropdown-item"
        @click="() => (isOpen = false)"
      >
        <RouterLink
          :to="item.link"
          role="menuitem"
          class="ucf-dropdown-link"
        >
          {{ item.label }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, useTemplateRef, onMounted, onBeforeUnmount } from 'vue'

defineProps({
  menu: {
    type: Object,
    required: true
  },

  label: {
    type: String,
    required: true
  }
})

const isOpen = ref(false)
const element = useTemplateRef('menu')
const submenu = ref(null)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

async function openAndFocusFirst() {
  isOpen.value = true
  await nextTick()
  submenu.value?.querySelector('[role="menuitem"]')?.focus()
}

function handleSubmenuKeydown(e) {
  const items = submenu.value?.querySelectorAll('[role="menuitem"]')
  if (!items?.length) return

  const currentIndex = Array.from(items).indexOf(document.activeElement)

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      items[(currentIndex + 1) % items.length]?.focus()
      break
    case 'ArrowUp':
      e.preventDefault()
      items[(currentIndex - 1 + items.length) % items.length]?.focus()
      break
    case 'Escape':
      e.preventDefault()
      closeMenu()
      break
  }
}

function handleClickOutside(e) {
  const menu = element.value

  if (menu && !menu.contains(e.target)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.ucf-dropdown {
  min-width: 13rem;
  padding: 0.4rem;
  border-radius: 14px;
  background: rgb(var(--color-base-foreground));
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.06), 0 18px 40px -16px rgb(0 0 0 / 0.45);
  animation: ucf-drop 0.18s ease;
}
@keyframes ucf-drop {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
}
.ucf-dropdown-link {
  display: block;
  padding: 0.5rem 0.8rem;
  border-radius: 10px;
  color: rgb(var(--color-base-content));
  font-weight: 500;
  transition: background 0.15s ease;
}
.ucf-dropdown-link:hover,
.ucf-dropdown-link:focus-visible {
  outline: none;
  background: rgb(255 201 4 / 0.2);
}
.ucf-dropdown-link.router-link-active {
  background: rgb(255 201 4 / 0.35);
}
</style>

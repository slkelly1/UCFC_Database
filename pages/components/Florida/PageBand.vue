<template>
  <header class="pb">
    <div class="pb-inner">
      <p class="pb-kicker">{{ kicker }}</p>
      <h1 class="pb-title">{{ title }}</h1>
      <p v-if="lede" class="pb-lede">{{ lede }}</p>
      <slot />
    </div>
  </header>
</template>

<script setup>
defineProps({
  kicker: { type: String, default: '' },
  title: { type: String, required: true },
  lede: { type: String, default: '' }
})
</script>

<style scoped>
/* soft gold header, one flat colour */
.pb {
  background: rgb(255 226 122);
  color: #111;
}
:global(.dark) .pb {
  background: rgb(38 34 20);
  color: rgb(var(--fl-ink));
}
.pb-inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 3.25rem 1rem 3rem;
}
.pb-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgb(var(--fl-ink) / 0.75);
  background: rgb(255 255 255 / 0.6);
  border: 1px solid rgb(var(--fl-ink) / 0.08);
  backdrop-filter: blur(4px);
  padding: 0.3rem 0.8rem 0.3rem 0.6rem;
  border-radius: 999px;
  margin: 0 0 1rem;
}
.pb-kicker::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: rgb(255 201 4);
  box-shadow: 0 0 0 3px rgb(255 201 4 / 0.25);
}
:global(.dark) .pb-kicker {
  background: rgb(255 255 255 / 0.06);
}
.pb-title {
  font-size: clamp(2.1rem, 4.6vw, 3.4rem);
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.025em;
  margin: 0;
  max-width: 50rem;
}
.pb-lede {
  margin: 1rem 0 0;
  max-width: 42rem;
  font-size: 1.08rem;
  line-height: 1.65;
  color: rgb(var(--fl-ink) / 0.72);
}
</style>

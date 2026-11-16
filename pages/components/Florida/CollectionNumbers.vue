<template>
  <div>
    <div v-if="loading" class="fl-muted">Loading the numbers from GBIF…</div>
    <p v-else-if="error" class="fl-muted">The live numbers from GBIF are not available right now.</p>

    <template v-else>
      <div class="fl-stats">
        <div class="fl-stat"><b>{{ fmt(total) }}</b><span>specimens online</span></div>
        <div class="fl-stat"><b>{{ floridaShare }}%</b><span>collected in Florida</span></div>
        <div class="fl-stat"><b>{{ countries.length }}</b><span>countries represented</span></div>
        <div class="fl-stat"><b>{{ firstYear }}–{{ lastYear }}</b><span>years of collecting</span></div>
      </div>

      <!-- Timeline -->
      <div class="fl-card">
        <h3 class="fl-h3">Specimens by year collected</h3>
        <svg :viewBox="`0 0 ${TW} ${TH + 22}`" class="fl-timeline" role="img" :aria-label="`Specimens by year, peak in ${peak.year}`">
          <g v-for="y in years" :key="y.year">
            <rect
              :x="xOf(y.year)"
              :y="TH - (TH * y.count) / peak.count"
              :width="barW"
              :height="(TH * y.count) / peak.count"
              rx="1.5"
              :class="{ peak: y.year === peak.year }"
            >
              <title>{{ y.year }}: {{ fmt(y.count) }} specimens</title>
            </rect>
          </g>
          <line :x1="0" :x2="TW" :y1="TH + 0.5" :y2="TH + 0.5" class="fl-axis" />
          <text v-for="t in ticks" :key="t" :x="xOf(t) + barW / 2" :y="TH + 16" text-anchor="middle" class="fl-tick">{{ t }}</text>
        </svg>
        <p class="fl-muted fl-small">
          Busiest year: <strong>{{ peak.year }}</strong>, with {{ fmt(peak.count) }} specimens.
          Hover a bar for its year.
        </p>
      </div>

      <div class="fl-grid fl-mt">
        <!-- Orders -->
        <div class="fl-card">
          <h3 class="fl-h3">What the collection holds</h3>
          <ul class="fl-bars">
            <li v-for="o in orders" :key="o.key">
              <span class="fl-bar-label">{{ o.name }}</span>
              <span class="fl-bar-track"><span class="fl-bar" :style="{ width: (100 * o.count) / orders[0].count + '%' }" /></span>
              <span class="fl-bar-n">{{ fmt(o.count) }}</span>
            </li>
          </ul>
        </div>

        <!-- Collectors -->
        <div class="fl-card">
          <h3 class="fl-h3">The people who built it</h3>
          <ul class="fl-bars">
            <li v-for="c in collectors" :key="c.name">
              <span class="fl-bar-label">{{ c.name }}</span>
              <span class="fl-bar-track"><span class="fl-bar fl-bar-coral" :style="{ width: (100 * c.count) / collectors[0].count + '%' }" /></span>
              <span class="fl-bar-n">{{ fmt(c.count) }}</span>
            </li>
          </ul>
          <p class="fl-muted fl-small">Specimens by collector; variants of the same name are merged.</p>
        </div>

        <!-- Where -->
        <div class="fl-card">
          <h3 class="fl-h3">Beyond Florida</h3>
          <ul class="fl-bars">
            <li v-for="s in places" :key="s.key">
              <span class="fl-bar-label">{{ s.key }}</span>
              <span class="fl-bar-track"><span class="fl-bar fl-bar-palm" :style="{ width: (100 * s.count) / places[0].count + '%' }" /></span>
              <span class="fl-bar-n">{{ fmt(s.count) }}</span>
            </li>
          </ul>
          <p class="fl-muted fl-small">
            States and provinces with the most specimens after Florida, from
            {{ countries.length }} countries in all.
          </p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { facets, fmt, topTaxa } from './useGbif.js'
import './florida.css'

const TW = 900
const TH = 170

const loading = ref(true)
const error = ref(false)
const total = ref(0)
const years = ref([])
const orders = ref([])
const collectors = ref([])
const states = ref([])
const countries = ref([])

const firstYear = computed(() => years.value[0]?.year || '')
const lastYear = computed(() => years.value.at(-1)?.year || '')
const peak = computed(() => years.value.reduce((a, b) => (b.count > a.count ? b : a), { year: '', count: 1 }))
const span = computed(() => Math.max(1, lastYear.value - firstYear.value + 1))
const barW = computed(() => Math.max(2, TW / span.value - 1.5))
const xOf = (y) => ((y - firstYear.value) * TW) / span.value
const ticks = computed(() => {
  const out = []
  for (let y = Math.ceil(firstYear.value / 10) * 10; y <= lastYear.value; y += 10) out.push(y)
  return out
})
const florida = computed(() => states.value.find((s) => s.key === 'Florida')?.count || 0)
const floridaShare = computed(() => (total.value ? Math.round((100 * florida.value) / total.value) : 0))
const places = computed(() => states.value.filter((s) => s.key !== 'Florida').slice(0, 8))

// "Stuart M. Fullerton" and "S.M. Fullerton" → one person
function personKey(name) {
  const parts = String(name).replace(/\./g, '. ').split(/\s+/).filter(Boolean)
  if (parts.length < 2) return name.trim()
  const last = parts.pop()
  return parts.map((p) => p[0].toUpperCase() + '.').join('') + ' ' + last
}

onMounted(async () => {
  try {
    const [base, ord, who] = await Promise.all([
      facets({}, ['year', 'stateProvince', 'country'], 300),
      topTaxa({}, 'orderKey', 8),
      facets({}, ['recordedBy'], 40)
    ])
    total.value = base.count
    years.value = base.year
      .map((y) => ({ year: Number(y.key), count: y.count }))
      .filter((y) => y.year > 1800)
      .sort((a, b) => a.year - b.year)
    states.value = base.stateProvince
    countries.value = base.country
    orders.value = ord.items
    const merged = new Map()
    who.recordedBy.forEach(({ key, count }) => {
      const k = personKey(key)
      merged.set(k, (merged.get(k) || 0) + count)
    })
    collectors.value = [...merged]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.fl-timeline {
  width: 100%;
  height: auto;
  display: block;
}
.fl-timeline rect {
  fill: rgb(var(--fl-gold));
  transition: fill 0.2s ease;
}
.fl-timeline rect:hover,
.fl-timeline rect.peak {
  fill: rgb(var(--fl-ink));
}
.fl-axis {
  stroke: rgb(var(--color-base-border));
}
.fl-tick {
  font-size: 11px;
  fill: rgb(var(--color-base-soft));
}
.fl-small {
  font-size: 0.8rem;
  margin: 0.75rem 0 0;
}
.fl-mt {
  margin-top: 1.25rem;
}
.fl-bar-coral {
  background: rgb(var(--fl-coral));
}
.fl-bar-palm {
  background: rgb(var(--fl-palmetto));
}
</style>

<template>
  <div>
    <p v-if="loading" class="fl-muted">Loading the campus records from GBIF…</p>
    <p v-else-if="error" class="fl-muted">The live numbers from GBIF are not available right now.</p>

    <template v-else>
      <div class="fl-stats">
        <div class="fl-stat"><b>{{ fmt(total) }}</b><span>specimens from campus</span></div>
        <div class="fl-stat"><b>{{ share }}%</b><span>of the whole collection</span></div>
        <div class="fl-stat"><b>{{ firstYear }}–{{ lastYear }}</b><span>years sampled</span></div>
        <div class="fl-stat"><b>{{ peakMonth }}</b><span>busiest month</span></div>
      </div>

      <div class="fl-card">
        <h3 class="fl-h3">Through the year on campus</h3>
        <div class="fl-months" role="img" :aria-label="`Campus specimens by month; most in ${peakMonth}`">
          <div v-for="(m, i) in months" :key="i" class="fl-month" :class="{ now: i === thisMonth }">
            <b>{{ short(m) }}</b>
            <span :style="{ height: (100 * m) / maxMonth + '%' }" :title="`${MONTHS[i]}: ${fmt(m)} specimens`" />
            <small>{{ MONTHS[i] }}</small>
          </div>
        </div>
        <p class="fl-muted fl-small">The highlighted month is the current one.</p>
      </div>

      <div class="fl-grid fl-mt">
        <div class="fl-card">
          <h3 class="fl-h3">Orders</h3>
          <ul class="fl-bars">
            <li v-for="o in orders" :key="o.key">
              <span class="fl-bar-label">{{ o.name }}</span>
              <span class="fl-bar-track"><span class="fl-bar" :style="{ width: (100 * o.count) / orders[0].count + '%' }" /></span>
              <span class="fl-bar-n">{{ fmt(o.count) }}</span>
            </li>
          </ul>
        </div>
        <div class="fl-card">
          <h3 class="fl-h3">Families</h3>
          <ul class="fl-bars">
            <li v-for="f in families" :key="f.key">
              <span class="fl-bar-label">{{ f.name }}<small v-if="f.order"> · {{ f.order }}</small></span>
              <span class="fl-bar-track"><span class="fl-bar fl-bar-palm" :style="{ width: (100 * f.count) / families[0].count + '%' }" /></span>
              <span class="fl-bar-n">{{ fmt(f.count) }}</span>
            </li>
          </ul>
        </div>
        <div class="fl-card">
          <h3 class="fl-h3">Species most often collected</h3>
          <ol class="fl-list">
            <li v-for="s in species" :key="s.key">
              <a :href="gbifLink({ taxonKey: s.key, decimalLatitude: CAMPUS.lat, decimalLongitude: CAMPUS.lon })" target="_blank" rel="noopener"><i>{{ s.name }}</i></a>
              <small>{{ s.family }}</small>
              <span class="fl-bar-n">{{ fmt(s.count) }}</span>
            </li>
          </ol>
        </div>
      </div>

      <a class="fl-link fl-all" :href="gbifLink({ decimalLatitude: CAMPUS.lat, decimalLongitude: CAMPUS.lon })" target="_blank" rel="noopener">
        All {{ fmt(total) }} campus records on GBIF, with map ↗
      </a>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { CAMPUS, MONTHS, facets, fmt, gbifLink, topTaxa } from './useGbif.js'
import './florida.css'

const thisMonth = new Date().getMonth()
const loading = ref(true)
const error = ref(false)
const total = ref(0)
const all = ref(0)
const months = ref(Array(12).fill(0))
const yearsList = ref([])
const orders = ref([])
const families = ref([])
const species = ref([])

const share = computed(() => (all.value ? ((100 * total.value) / all.value).toFixed(0) : 0))
const maxMonth = computed(() => Math.max(1, ...months.value))
const peakMonth = computed(() => {
  const i = months.value.indexOf(Math.max(...months.value))
  return new Date(2000, i, 1).toLocaleDateString('en-US', { month: 'long' })
})
const firstYear = computed(() => Math.min(...yearsList.value))
const lastYear = computed(() => Math.max(...yearsList.value))
const short = (n) => (n >= 1000 ? Math.round(n / 1000) + 'k' : n || '')

onMounted(async () => {
  const f = { decimalLatitude: CAMPUS.lat, decimalLongitude: CAMPUS.lon }
  try {
    const [base, whole, ord, fam, sp] = await Promise.all([
      facets(f, ['month', 'year'], 200),
      facets({}, [], 0),
      topTaxa(f, 'orderKey', 6),
      topTaxa(f, 'familyKey', 8),
      topTaxa(f, 'speciesKey', 8)
    ])
    total.value = base.count
    all.value = whole.count
    const m = Array(12).fill(0)
    base.month.forEach(({ key, count }) => (m[Number(key) - 1] = count))
    months.value = m
    yearsList.value = base.year.map((y) => Number(y.key)).filter((y) => y > 1800)
    orders.value = ord.items
    families.value = fam.items
    species.value = sp.items
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.fl-months {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.4rem;
  height: 12rem;
  align-items: end;
}
.fl-month {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  gap: 0.25rem;
}
.fl-month b {
  font-size: 0.7rem;
  font-weight: 600;
  color: rgb(var(--color-base-soft));
}
.fl-month span {
  width: 100%;
  border-radius: 4px 4px 0 0;
  background: rgb(var(--fl-teal) / 0.45);
}
.fl-month.now span {
  background: rgb(var(--fl-coral));
}
.fl-month small {
  font-size: 0.72rem;
  color: rgb(var(--color-base-soft));
}
.fl-small {
  font-size: 0.8rem;
  margin: 0.75rem 0 0;
}
.fl-mt {
  margin-top: 1.25rem;
}
.fl-bar-palm {
  background: rgb(var(--fl-palmetto));
}
.fl-all {
  display: inline-block;
  margin-top: 1.5rem;
}
.fl-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.fl-list li {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas: 'name n' 'fam n';
  padding: 0.35rem 0;
  border-bottom: 1px solid rgb(var(--color-base-border));
  font-size: 0.88rem;
}
.fl-list li:last-child {
  border-bottom: 0;
}
.fl-list a {
  grid-area: name;
  color: rgb(var(--fl-ink));
}
.fl-list a:hover {
  color: rgb(var(--fl-teal));
  text-decoration: underline;
}
.fl-list small {
  grid-area: fam;
  color: rgb(var(--color-base-soft));
}
.fl-list .fl-bar-n {
  grid-area: n;
  align-self: center;
}
@media (max-width: 520px) {
  .fl-month b {
    display: none;
  }
}
</style>

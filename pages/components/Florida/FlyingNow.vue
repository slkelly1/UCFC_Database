<template>
  <section class="fn">
    <div class="fn-head">
      <div>
        <p class="fl-kicker">{{ isNow ? 'This week in the collection' : 'Through the year' }}</p>
        <h2 class="fl-h2">{{ isNow ? "What's flying now in Florida" : 'What flies in Florida in ' + windowShort }}</h2>
        <p class="fl-lead">
          Everything the UCFC collected in Florida between <strong>{{ windowLabel }}</strong>, in any year:
          <strong>{{ loading ? '…' : fmt(total) }}</strong> specimens<template v-if="filterLabel"> of {{ filterLabel }}</template>.
        </p>
      </div>
      <div class="fn-nav">
        <button type="button" class="fn-step" aria-label="Two weeks earlier" @click="shift(-STEP)">‹</button>
        <button type="button" class="fn-now" :disabled="isNow" @click="goNow">This week</button>
        <button type="button" class="fn-step" aria-label="Two weeks later" @click="shift(STEP)">›</button>
      </div>
    </div>

    <!-- Year strip: click a month to jump there -->
    <div class="fn-year" role="group" aria-label="Choose a time of year">
      <button
        v-for="(m, i) in months"
        :key="i"
        type="button"
        class="fn-month"
        :class="{ on: i === windowMonth }"
        :title="`${MONTHS[i]}: ${fmt(m)} Florida specimens`"
        @click="goMonth(i)"
      >
        <span class="fn-month-bar"><span :style="{ height: 6 + (94 * m) / maxMonth + '%' }" /></span>
        <small>{{ MONTHS[i] }}</small>
      </button>
    </div>

    <!-- Order filter -->
    <div class="fn-chips" role="group" aria-label="Filter by order">
      <button type="button" class="fn-chip" :class="{ on: !order }" @click="setOrder(null)">All orders</button>
      <button
        v-for="o in orders"
        :key="o.key"
        type="button"
        class="fn-chip"
        :class="{ on: order && order.key === o.key }"
        @click="setOrder(o)"
      >
        {{ o.name }} <small>{{ fmt(o.count) }}</small>
      </button>
    </div>

    <p v-if="error" class="fl-muted">The live numbers from GBIF are not available right now.</p>

    <div class="fn-grid" :class="{ busy: loading }">
      <!-- Families -->
      <div class="fl-card">
        <div class="fn-card-head">
          <h3 class="fl-h3">Families</h3>
          <button v-if="family" type="button" class="fn-clear" @click="setFamily(null)">Show all ×</button>
        </div>
        <ul class="fn-fams">
          <li v-for="f in families" :key="f.key">
            <button type="button" :class="{ on: family && family.key === f.key }" @click="setFamily(f)">
              <span class="fn-fam-name">{{ f.name }}<small v-if="!order && f.order"> · {{ f.order }}</small></span>
              <span class="fl-bar-track"><span class="fl-bar" :style="{ width: (100 * f.count) / (families[0]?.count || 1) + '%' }" /></span>
              <span class="fl-bar-n">{{ fmt(f.count) }}</span>
            </button>
          </li>
          <li v-if="!loading && !families.length" class="fl-muted fn-empty">Nothing collected in this window.</li>
        </ul>
        <p class="fl-muted fn-hint">Click a family to see its species.</p>
      </div>

      <!-- Species -->
      <div class="fl-card">
        <div class="fn-card-head">
          <h3 class="fl-h3">Species<template v-if="family"> of {{ family.name }}</template></h3>
        </div>
        <ol class="fn-species">
          <li v-for="(s, i) in species" :key="s.key">
            <span class="fn-rank">{{ i + 1 }}</span>
            <button type="button" class="fn-sp" @click="openSpecies(s)"><i>{{ s.name }}</i></button>
            <small>{{ s.family }}</small>
            <span class="fl-bar-n">{{ fmt(s.count) }}</span>
          </li>
          <li v-if="!loading && !species.length" class="fl-muted fn-empty">No species-level records here.</li>
        </ol>
        <RouterLink :to="searchLink" class="fl-link fn-more">Search all these specimens →</RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { makeAPIRequest } from '@/utils/request'
import { MONTHS, dayOfYear, facets, findOtu, fmt, gbifLink, topTaxa } from './useGbif.js'
import './florida.css'

const STEP = 14
const SPAN = 14
const router = useRouter()

const year = new Date().getFullYear()
const todayStart = Math.max(1, dayOfYear() - 6)
const start = ref(todayStart)
const order = ref(null)
const family = ref(null)

const loading = ref(true)
const error = ref(false)
const total = ref(0)
const orders = ref([])
const families = ref([])
const species = ref([])
const months = ref(Array(12).fill(0))

const end = computed(() => Math.min(366, start.value + SPAN - 1))
const isNow = computed(() => start.value === todayStart)
const dateOf = (d, opts = { month: 'long', day: 'numeric' }) =>
  new Date(Date.UTC(year, 0, d)).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' })
const windowLabel = computed(() => `${dateOf(start.value)} and ${dateOf(end.value)}`)
const windowShort = computed(() => `${dateOf(start.value, { month: 'short', day: 'numeric' })}–${dateOf(end.value, { month: 'short', day: 'numeric' })}`)
const windowMonth = computed(() => new Date(Date.UTC(year, 0, start.value + 7)).getUTCMonth())
const maxMonth = computed(() => Math.max(1, ...months.value))
const filterLabel = computed(() => (family.value ? family.value.name : order.value ? order.value.name : ''))

const searchLink = computed(() => {
  const m = windowMonth.value + 1
  const q = { month: m }
  if (family.value) q.taxon = family.value.name
  else if (order.value) q.taxon = order.value.name
  if (family.value || order.value) q.key = String((family.value || order.value).key)
  return { path: '/search', query: q }
})

function baseFilter() {
  const f = { stateProvince: 'Florida', startDayOfYear: `${start.value},${end.value}` }
  if (order.value) f.orderKey = order.value.key
  if (family.value) f.familyKey = family.value.key
  return f
}

let ticket = 0
async function load({ withOrders = false } = {}) {
  const my = ++ticket
  loading.value = true
  error.value = false
  try {
    const f = baseFilter()
    const famFilter = { ...f }
    delete famFilter.familyKey
    const jobs = [topTaxa(famFilter, 'familyKey', 8), topTaxa(f, 'speciesKey', 8)]
    if (withOrders) jobs.push(topTaxa({ stateProvince: 'Florida', startDayOfYear: `${start.value},${end.value}` }, 'orderKey', 6))
    const [fam, sp, ord] = await Promise.all(jobs)
    if (my !== ticket) return
    families.value = fam.items
    species.value = sp.items
    total.value = family.value ? sp.count : fam.count
    if (ord) orders.value = ord.items
  } catch {
    if (my === ticket) error.value = true
  } finally {
    if (my === ticket) loading.value = false
  }
}

function shift(days) {
  let s = start.value + days
  if (s < 1) s += 365
  if (s > 365) s -= 365
  start.value = s
  family.value = null
  load({ withOrders: true })
}
function goNow() {
  start.value = todayStart
  family.value = null
  load({ withOrders: true })
}
function goMonth(i) {
  start.value = dayOfYear(new Date(year, i, 1))
  family.value = null
  load({ withOrders: true })
}
function setOrder(o) {
  order.value = o
  family.value = null
  load()
}
function setFamily(f) {
  family.value = f && family.value && family.value.key === f.key ? null : f
  load()
}

async function openSpecies(s) {
  const id = await findOtu(makeAPIRequest, s.name)
  if (id) router.push({ name: 'otus-id-overview', params: { id } })
  else window.open(gbifLink({ taxonKey: s.key, stateProvince: 'Florida' }), '_blank', 'noopener')
}

onMounted(async () => {
  load({ withOrders: true })
  try {
    const mon = await facets({ stateProvince: 'Florida' }, ['month'], 12)
    const m = Array(12).fill(0)
    mon.month.forEach(({ key, count }) => (m[Number(key) - 1] = count))
    months.value = m
  } catch {
    // the strip stays flat
  }
})
</script>

<style scoped>
.fn {
  max-width: 72rem;
  margin: 0 auto;
  padding: 3.5rem 1rem;
}
.fn-head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.25rem;
}
.fn-head > div:first-child {
  max-width: 46rem;
}
.fn-nav {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 4px;
  border-radius: 999px;
  background: rgb(var(--fl-sand));
}
.fn-step {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
  font-size: 1.3rem;
  line-height: 1;
  color: rgb(var(--fl-ink));
  transition: background 0.2s ease;
}
.fn-step:hover {
  background: rgb(var(--fl-card));
}
.fn-now {
  padding: 0.45rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  background: rgb(255 201 4);
  color: #111;
}
.fn-now:disabled {
  background: rgb(var(--fl-card));
  color: rgb(var(--color-base-soft));
}
.fn-year {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.35rem;
  margin-top: 1.75rem;
  padding: 0.9rem 1rem 0.6rem;
  border-radius: 18px;
  background: rgb(var(--fl-card));
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 14px 32px -24px rgb(0 0 0 / 0.35);
}
.fn-month {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0;
  border-radius: 10px;
  transition: background 0.2s ease;
}
.fn-month:hover {
  background: rgb(255 201 4 / 0.12);
}
.fn-month-bar {
  display: flex;
  align-items: flex-end;
  width: 70%;
  height: 3.5rem;
}
.fn-month-bar span {
  width: 100%;
  border-radius: 4px 4px 2px 2px;
  background: rgb(var(--color-base-muted));
  transition: background 0.25s ease, height 0.5s ease;
}
.fn-month.on .fn-month-bar span {
  background: rgb(255 201 4);
}
.fn-month small {
  font-size: 0.72rem;
  color: rgb(var(--color-base-soft));
}
.fn-month.on small {
  color: rgb(var(--fl-ink));
  font-weight: 700;
}
.fn-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin: 1.25rem 0 1.25rem;
}
.fn-chip {
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 500;
  color: rgb(var(--fl-ink));
  background: rgb(var(--fl-card));
  box-shadow: inset 0 0 0 1px rgb(var(--color-base-border));
  transition: background 0.2s ease, box-shadow 0.2s ease;
}
.fn-chip small {
  color: rgb(var(--color-base-soft));
  margin-left: 0.15rem;
}
.fn-chip:hover {
  box-shadow: inset 0 0 0 1px rgb(255 201 4);
}
.fn-chip.on {
  background: #111;
  color: rgb(255 201 4);
  box-shadow: none;
}
.fn-chip.on small {
  color: rgb(255 201 4 / 0.7);
}
.fn-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
  transition: opacity 0.25s ease;
}
.fn-grid.busy {
  opacity: 0.55;
}
.fn-card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}
.fn-clear {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgb(var(--fl-teal-deep));
}
.fn-fams {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.2rem;
}
.fn-fams button {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(7rem, 12rem) 1fr auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.5rem;
  border-radius: 10px;
  font-size: 0.86rem;
  text-align: left;
  transition: background 0.2s ease;
}
.fn-fams button:hover {
  background: rgb(255 201 4 / 0.12);
}
.fn-fams button.on {
  background: rgb(255 201 4 / 0.25);
}
.fn-fam-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgb(var(--fl-ink));
}
.fn-fam-name small {
  color: rgb(var(--color-base-soft));
}
.fn-hint {
  font-size: 0.78rem;
  margin: 0.75rem 0 0;
}
.fn-species {
  list-style: none;
  margin: 0;
  padding: 0;
}
.fn-species li {
  display: grid;
  grid-template-columns: 1.6rem 1fr auto;
  grid-template-areas: 'rank name n' 'rank fam n';
  column-gap: 0.5rem;
  padding: 0.45rem 0;
  border-bottom: 1px solid rgb(var(--color-base-border) / 0.7);
}
.fn-species li:last-child {
  border-bottom: 0;
}
.fn-rank {
  grid-area: rank;
  font-weight: 700;
  color: rgb(var(--fl-teal-deep));
}
.fn-sp {
  grid-area: name;
  justify-self: start;
  text-align: left;
  color: rgb(var(--fl-ink));
  background: linear-gradient(rgb(255 201 4), rgb(255 201 4)) 0 100% / 0 2px no-repeat;
  transition: background-size 0.3s ease;
}
.fn-sp:hover {
  background-size: 100% 2px;
}
.fn-species small {
  grid-area: fam;
  font-size: 0.78rem;
  color: rgb(var(--color-base-soft));
}
.fn-species .fl-bar-n {
  grid-area: n;
  align-self: center;
}
.fn-empty {
  padding: 0.5rem 0;
  font-size: 0.88rem;
}
.fn-more {
  display: inline-block;
  margin-top: 0.9rem;
  font-size: 0.9rem;
}
@media (max-width: 560px) {
  .fn-month small {
    font-size: 0.6rem;
  }
  .fn-fams button {
    grid-template-columns: minmax(0, 1fr) 4rem auto;
  }
}
</style>

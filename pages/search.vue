<template>
  <div>
    <PageBand
      kicker="Search"
      title="Search the specimens"
      lede="Find specimens by name, place, date or collector. Every result is a real specimen in the Bug Closet, with the data from its labels."
    />

    <div class="fl-page sr">
      <!-- Filters -->
      <form class="sr-filters" @submit.prevent="run(0)">
        <label class="sr-field sr-taxon">
          <span>Taxon</span>
          <div class="sr-ac">
            <input
              v-model="taxonText"
              type="search"
              placeholder="e.g. Lasioglossum, Carabidae…"
              autocomplete="off"
              @input="onTaxonInput"
              @keydown.down.prevent="move(1)"
              @keydown.up.prevent="move(-1)"
              @keydown.enter.prevent="pickActive"
            />
            <ul v-if="suggestions.length" class="sr-sugg" role="listbox">
              <li
                v-for="(s, i) in suggestions"
                :key="s.key"
                :class="{ on: i === active }"
                role="option"
                @mousedown.prevent="pick(s)"
              >
                <i v-if="['SPECIES', 'GENUS', 'SUBGENUS'].includes(s.rank)">{{ s.name }}</i><span v-else>{{ s.name }}</span>
                <small>{{ s.rank.toLowerCase() }}<template v-if="s.family"> · {{ s.family }}</template></small>
              </li>
            </ul>
          </div>
        </label>

        <label class="sr-field">
          <span>Florida county</span>
          <select v-model="county">
            <option value="">Anywhere</option>
            <option v-for="c in counties" :key="c.gid" :value="c.gid">{{ c.name }}</option>
          </select>
        </label>

        <div class="sr-field sr-years">
          <span>Years</span>
          <div>
            <input v-model.number="yearFrom" type="number" min="1800" max="2100" placeholder="from" />
            <input v-model.number="yearTo" type="number" min="1800" max="2100" placeholder="to" />
          </div>
        </div>

        <label class="sr-field">
          <span>Month</span>
          <select v-model="month">
            <option value="">Any</option>
            <option v-for="(m, i) in MONTH_NAMES" :key="m" :value="i + 1">{{ m }}</option>
          </select>
        </label>

        <label class="sr-field">
          <span>Collector</span>
          <input v-model="collector" type="search" placeholder="e.g. S.M. Fullerton" />
        </label>

        <label class="sr-field">
          <span>Any text</span>
          <input v-model="text" type="search" placeholder="locality, catalog number…" />
        </label>

        <div class="sr-actions">
          <button type="submit" class="sr-btn">Search</button>
          <button type="button" class="sr-reset" @click="reset">Clear</button>
        </div>
      </form>

      <!-- Results -->
      <section class="sr-results" aria-live="polite">
        <div class="sr-head">
          <p class="sr-count">
            <template v-if="loading">Searching…</template>
            <template v-else-if="error">The search is not available right now.</template>
            <template v-else><b>{{ fmt(count) }}</b> specimens<template v-if="activeChips.length"> match</template></template>
          </p>
          <a v-if="count" :href="gbifUrl" target="_blank" rel="noopener" class="fl-link sr-gbif">Map and download on GBIF ↗</a>
        </div>

        <div v-if="activeChips.length" class="sr-chips">
          <button v-for="c in activeChips" :key="c.key" type="button" class="sr-chip" @click="c.clear">{{ c.label }} ×</button>
        </div>

        <!-- Refine by order -->
        <div v-if="orders.length > 1 && !taxonKey" class="sr-refine">
          <span>Refine:</span>
          <button v-for="o in orders" :key="o.key" type="button" @click="refineOrder(o)">
            {{ o.name }} <small>{{ fmt(o.count) }}</small>
          </button>
        </div>

        <ul class="sr-list">
          <li v-for="r in results" :key="r.key" class="sr-item">
            <div class="sr-item-main">
              <button type="button" class="sr-name" :class="{ italic: r.italic }" @click="openTaxon(r)">{{ r.name }}</button>
              <p class="sr-higher">{{ r.higher }}</p>
              <p class="sr-place">{{ r.place }}</p>
            </div>
            <div class="sr-item-meta">
              <span class="sr-cat">{{ r.catalog }}</span>
              <span v-if="r.date">{{ r.date }}</span>
              <span v-if="r.leg">leg. {{ r.leg }}</span>
              <a :href="'https://www.gbif.org/occurrence/' + r.key" target="_blank" rel="noopener" class="sr-rec">record ↗</a>
            </div>
          </li>
        </ul>

        <nav v-if="count > PER" class="sr-pages" aria-label="Pages">
          <button type="button" :disabled="offset === 0 || loading" @click="run(offset - PER)">← Previous</button>
          <span>Page {{ fmt(offset / PER + 1) }} of {{ fmt(Math.min(pages, 500)) }}</span>
          <button type="button" :disabled="offset + PER >= Math.min(count, 10000) || loading" @click="run(offset + PER)">Next →</button>
        </nav>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { makeAPIRequest } from '@/utils/request'
import PageBand from './components/Florida/PageBand.vue'
import shapes from './components/Florida/floridaCounties.js'
import { fmt, findOtu, gbifLink, names, searchOccurrences, suggestTaxa } from './components/Florida/useGbif.js'
import './components/Florida/florida.css'

const PER = 20
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const counties = [...shapes].sort((a, b) => a.name.localeCompare(b.name))
const countyName = Object.fromEntries(shapes.map((c) => [c.gid, c.name]))

const route = useRoute()
const router = useRouter()

// filters
const taxonText = ref('')
const taxonKey = ref('')
const county = ref('')
const yearFrom = ref('')
const yearTo = ref('')
const month = ref('')
const collector = ref('')
const text = ref('')

// results
const loading = ref(false)
const error = ref(false)
const count = ref(0)
const offset = ref(0)
const results = ref([])
const orders = ref([])
const pages = computed(() => Math.ceil(count.value / PER))

// taxon suggestions
const suggestions = ref([])
const active = ref(-1)
let timer
function onTaxonInput() {
  taxonKey.value = ''
  clearTimeout(timer)
  timer = setTimeout(async () => {
    suggestions.value = await suggestTaxa(taxonText.value.trim())
    active.value = -1
  }, 220)
}
function move(d) {
  if (!suggestions.value.length) return
  active.value = (active.value + d + suggestions.value.length) % suggestions.value.length
}
function pickActive() {
  if (active.value >= 0) pick(suggestions.value[active.value])
  else run(0)
}
function pick(s) {
  taxonKey.value = String(s.key)
  taxonText.value = s.name
  suggestions.value = []
  run(0)
}

function filters() {
  const f = {}
  if (taxonKey.value) f.taxonKey = taxonKey.value
  else if (taxonText.value.trim()) f.q = taxonText.value.trim()
  if (county.value) f.gadmLevel2Gid = county.value
  if (yearFrom.value || yearTo.value) f.year = `${yearFrom.value || 1800},${yearTo.value || new Date().getFullYear()}`
  if (month.value) f.month = month.value
  if (collector.value.trim()) f.recordedBy = collector.value.trim()
  if (text.value.trim()) f.q = [f.q, text.value.trim()].filter(Boolean).join(' ')
  return f
}

const activeChips = computed(() => {
  const c = []
  if (taxonText.value.trim()) c.push({ key: 't', label: taxonText.value.trim(), clear: () => ((taxonText.value = ''), (taxonKey.value = ''), run(0)) })
  if (county.value) c.push({ key: 'c', label: countyName[county.value] + ' County', clear: () => ((county.value = ''), run(0)) })
  if (yearFrom.value || yearTo.value) c.push({ key: 'y', label: `${yearFrom.value || '…'}–${yearTo.value || '…'}`, clear: () => ((yearFrom.value = ''), (yearTo.value = ''), run(0)) })
  if (month.value) c.push({ key: 'm', label: MONTH_NAMES[month.value - 1], clear: () => ((month.value = ''), run(0)) })
  if (collector.value.trim()) c.push({ key: 'l', label: 'leg. ' + collector.value.trim(), clear: () => ((collector.value = ''), run(0)) })
  if (text.value.trim()) c.push({ key: 'x', label: '“' + text.value.trim() + '”', clear: () => ((text.value = ''), run(0)) })
  return c
})

const gbifUrl = computed(() => {
  const f = filters()
  const map = { q: 'q', taxonKey: 'taxon_key', gadmLevel2Gid: 'gadm_gid', year: 'year', month: 'month', recordedBy: 'recorded_by' }
  const p = new URLSearchParams({ dataset_key: '262f8270-f9c2-4bc6-a562-8ed71c0790e6' })
  Object.entries(f).forEach(([k, v]) => p.append(map[k] || k, v))
  return 'https://www.gbif.org/occurrence/search?' + p
})

const ITALIC = ['SPECIES', 'SUBSPECIES', 'GENUS', 'SUBGENUS']
function shape(o) {
  const place = o.verbatimLocality || o.locality || [o.county && o.county + ' Co.', o.stateProvince, o.country].filter(Boolean).join(', ')
  return {
    key: o.key,
    name: o.acceptedScientificName || o.scientificName || 'Unidentified',
    plain: o.species || o.genus || o.family || o.order || '',
    taxonKey: o.speciesKey || o.genusKey || o.familyKey || o.orderKey,
    italic: ITALIC.includes(o.taxonRank),
    higher: [o.order, o.family].filter(Boolean).join(' · '),
    place,
    date: o.eventDate ? String(o.eventDate).slice(0, 10) : o.year || '',
    leg: (o.recordedBy || '').replace(/\s*\|\s*/g, ', '),
    catalog: o.catalogNumber || ''
  }
}

async function run(at = 0) {
  loading.value = true
  error.value = false
  offset.value = at
  suggestions.value = []
  syncUrl()
  try {
    const data = await searchOccurrences(filters(), { offset: at, limit: PER, facetFields: at === 0 ? ['orderKey'] : [] })
    count.value = data.count
    results.value = data.results.map(shape)
    if (at === 0) {
      const nm = await names(data.facets.orderKey.map((o) => o.key))
      orders.value = data.facets.orderKey.map((o) => ({ ...o, name: nm[o.key]?.name || o.key }))
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function refineOrder(o) {
  taxonKey.value = String(o.key)
  taxonText.value = o.name
  run(0)
}

function reset() {
  taxonText.value = ''
  taxonKey.value = ''
  county.value = ''
  yearFrom.value = ''
  yearTo.value = ''
  month.value = ''
  collector.value = ''
  text.value = ''
  run(0)
}

async function openTaxon(r) {
  const id = r.plain ? await findOtu(makeAPIRequest, r.plain) : null
  if (id) router.push({ name: 'otus-id-overview', params: { id } })
  else window.open('https://www.gbif.org/occurrence/' + r.key, '_blank', 'noopener')
}

// keep the search in the address bar, so it can be shared
function syncUrl() {
  const q = {}
  if (taxonText.value.trim()) q.taxon = taxonText.value.trim()
  if (taxonKey.value) q.key = taxonKey.value
  if (county.value) q.county = county.value
  if (yearFrom.value) q.from = yearFrom.value
  if (yearTo.value) q.to = yearTo.value
  if (month.value) q.month = month.value
  if (collector.value.trim()) q.leg = collector.value.trim()
  if (text.value.trim()) q.text = text.value.trim()
  if (offset.value) q.offset = offset.value
  router.replace({ query: q })
}

onMounted(() => {
  const q = route.query
  taxonText.value = q.taxon || ''
  taxonKey.value = q.key || ''
  county.value = q.county || ''
  yearFrom.value = q.from ? Number(q.from) : ''
  yearTo.value = q.to ? Number(q.to) : ''
  month.value = q.month ? Number(q.month) : ''
  collector.value = q.leg || ''
  text.value = q.text || ''
  run(Number(q.offset) || 0)
})
</script>

<style scoped>
.sr {
  display: grid;
  gap: 2.25rem;
  grid-template-columns: 17.5rem minmax(0, 1fr);
  align-items: start;
}
@media (max-width: 900px) {
  .sr {
    grid-template-columns: 1fr;
  }
}
.sr-filters {
  position: sticky;
  top: 1rem;
  display: grid;
  gap: 1rem;
  padding: 1.35rem;
  border-radius: 20px;
  background: rgb(var(--fl-card));
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 18px 40px -28px rgb(0 0 0 / 0.4);
}
@media (max-width: 900px) {
  .sr-filters {
    position: static;
  }
}
.sr-filters * {
  box-sizing: border-box;
  min-width: 0;
}
.sr-field {
  display: grid;
  gap: 0.35rem;
}
.sr-field > span {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgb(var(--color-base-lighter));
}
.sr-field input,
.sr-field select {
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 1px solid rgb(var(--color-base-border));
  border-radius: 10px;
  background: rgb(var(--color-base-background));
  color: rgb(var(--fl-ink));
  font-size: 0.9rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.sr-field input:focus,
.sr-field select:focus {
  outline: none;
  border-color: rgb(255 201 4);
  box-shadow: 0 0 0 4px rgb(255 201 4 / 0.25);
}
.sr-years div {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.sr-ac {
  position: relative;
}
.sr-sugg {
  position: absolute;
  z-index: 20;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  margin: 0;
  padding: 0.35rem;
  list-style: none;
  border-radius: 14px;
  background: rgb(var(--fl-card));
  color: rgb(var(--fl-ink));
  box-shadow: 0 18px 40px -16px rgb(0 0 0 / 0.45);
}
.sr-sugg li {
  display: flex;
  flex-direction: column;
  padding: 0.45rem 0.65rem;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
}
.sr-sugg li small {
  color: rgb(var(--color-base-soft));
  font-size: 0.75rem;
}
.sr-sugg li.on,
.sr-sugg li:hover {
  background: rgb(255 201 4 / 0.2);
}
.sr-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.35rem;
}
.sr-btn {
  flex: 1;
  padding: 0.65rem;
  border-radius: 999px;
  font-weight: 600;
  background: rgb(255 201 4);
  color: #111;
  box-shadow: 0 8px 20px -10px rgb(201 150 0 / 0.9);
  transition: transform 0.2s ease;
}
.sr-btn:hover {
  transform: translateY(-1px);
}
.sr-reset {
  padding: 0.65rem 1rem;
  border-radius: 999px;
  font-weight: 600;
  color: rgb(var(--color-base-lighter));
  background: rgb(var(--fl-sand));
}
.sr-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}
.sr-count {
  margin: 0;
  font-size: 1.05rem;
  color: rgb(var(--color-base-lighter));
}
.sr-count b {
  font-size: 1.6rem;
  font-weight: 800;
  color: rgb(var(--fl-ink));
}
.sr-gbif {
  font-size: 0.9rem;
}
.sr-chips,
.sr-refine {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.9rem;
}
.sr-chip {
  padding: 0.3rem 0.8rem;
  font-size: 0.82rem;
  font-weight: 600;
  background: rgb(255 201 4 / 0.25);
  color: rgb(var(--fl-ink));
  border-radius: 999px;
  transition: background 0.2s ease;
}
.sr-chip:hover {
  background: rgb(255 201 4 / 0.45);
}
.sr-refine span {
  font-size: 0.8rem;
  color: rgb(var(--color-base-soft));
}
.sr-refine button {
  padding: 0.3rem 0.8rem;
  font-size: 0.82rem;
  border-radius: 999px;
  background: rgb(var(--fl-card));
  color: rgb(var(--fl-ink));
  box-shadow: inset 0 0 0 1px rgb(var(--color-base-border));
  transition: box-shadow 0.2s ease;
}
.sr-refine button:hover {
  box-shadow: inset 0 0 0 1px rgb(255 201 4), 0 0 0 3px rgb(255 201 4 / 0.2);
}
.sr-refine small {
  color: rgb(var(--color-base-soft));
}
.sr-list {
  list-style: none;
  margin: 1.4rem 0 0;
  padding: 0.35rem;
  border-radius: 20px;
  background: rgb(var(--fl-card));
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 18px 40px -30px rgb(0 0 0 / 0.4);
}
.sr-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 14px;
  transition: background 0.2s ease;
}
.sr-item + .sr-item {
  box-shadow: 0 -1px 0 rgb(var(--color-base-border) / 0.7);
}
.sr-item:hover {
  background: rgb(255 201 4 / 0.08);
}
.sr-name {
  font-weight: 650;
  color: rgb(var(--fl-ink));
  text-align: left;
  padding: 0;
  border: 0;
  background: linear-gradient(rgb(255 201 4), rgb(255 201 4)) 0 100% / 0 2px no-repeat;
  transition: background-size 0.3s ease;
}
.sr-name.italic {
  font-style: italic;
}
.sr-name:hover {
  background-size: 100% 2px;
}
.sr-higher {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: rgb(var(--color-base-soft));
}
.sr-place {
  margin: 0.35rem 0 0;
  font-size: 0.88rem;
  color: rgb(var(--color-base-lighter));
}
.sr-item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: rgb(var(--color-base-soft));
  text-align: right;
}
.sr-cat {
  font-weight: 600;
  font-size: 0.74rem;
  font-variant-numeric: tabular-nums;
  background: rgb(255 201 4 / 0.22);
  color: rgb(var(--fl-teal-deep));
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
}
.sr-rec {
  color: rgb(var(--fl-teal-deep));
  font-weight: 600;
}
.sr-pages {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.4rem;
  font-size: 0.88rem;
  color: rgb(var(--color-base-soft));
}
.sr-pages button {
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  font-weight: 600;
  background: rgb(var(--fl-card));
  color: rgb(var(--fl-ink));
  box-shadow: inset 0 0 0 1px rgb(var(--color-base-border));
}
.sr-pages button:hover:not(:disabled) {
  box-shadow: inset 0 0 0 1px rgb(255 201 4), 0 0 0 3px rgb(255 201 4 / 0.2);
}
.sr-pages button:disabled {
  opacity: 0.4;
}
@media (max-width: 560px) {
  .sr-item {
    grid-template-columns: 1fr;
  }
  .sr-item-meta {
    align-items: flex-start;
    text-align: left;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.6rem;
  }
}
</style>

<template>
  <div>
    <PageBand
      kicker="Recent additions"
      title="Fresh from the drawers"
      lede="The specimens most recently added to the database, newest first. Each card is one pinned insect, with the data from its labels."
    />

    <div class="fl-page">
      <div class="na-bar">
        <p class="na-summary">
          <template v-if="items.length">Showing the latest <strong>{{ fmt(items.length) }}</strong> specimens; the newest was added {{ ago(items[0]?.created) }}.</template>
        </p>
        <div class="na-view" role="group" aria-label="Show labels">
          <button type="button" :class="{ on: !showLabels }" @click="showLabels = false">Data</button>
          <button type="button" :class="{ on: showLabels }" @click="showLabels = true">Original labels</button>
        </div>
      </div>

      <p v-if="error" class="fl-muted">The latest specimens could not be loaded right now.</p>

      <ul class="na-grid">
        <li v-for="s in items" :key="s.id" class="na-card">
          <div class="na-top">
            <span class="na-cat">{{ s.catalog || 'UCFC' }}</span>
            <span class="na-added" :title="new Date(s.created).toLocaleString()">added {{ ago(s.created) }}</span>
          </div>

          <RouterLink v-if="s.otu" :to="{ name: 'otus-id-overview', params: { id: s.otu } }" class="na-name" :class="{ italic: s.italic }">
            {{ s.name }}
          </RouterLink>
          <p v-else class="na-name" :class="{ italic: s.italic }">{{ s.name }}</p>
          <p class="na-higher">{{ s.higher }}</p>

          <pre v-if="showLabels && s.label" class="na-label">{{ s.label }}</pre>
          <dl v-else class="na-data">
            <div v-if="s.place"><dt>Where</dt><dd>{{ s.place }}</dd></div>
            <div v-if="s.date"><dt>When</dt><dd>{{ s.date }}</dd></div>
            <div v-if="s.leg"><dt>Leg.</dt><dd>{{ s.leg }}</dd></div>
            <div v-if="s.det"><dt>Det.</dt><dd>{{ s.det }}</dd></div>
          </dl>
        </li>
        <template v-if="loading">
          <li v-for="n in 6" :key="'sk' + n" class="na-card na-skel" />
        </template>
      </ul>

      <div class="na-more">
        <button v-if="!loading && !done" type="button" class="na-btn" @click="load">Show {{ PER }} more</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { makeAPIRequest } from '@/utils/request'
import PageBand from './components/Florida/PageBand.vue'
import { fmt } from './components/Florida/useGbif.js'
import './components/Florida/florida.css'

const PER = 24
const items = ref([])
const page = ref(0)
const loading = ref(false)
const done = ref(false)
const error = ref(false)
const showLabels = ref(false)

const RANK_ITALIC = ['species', 'subspecies', 'genus', 'subgenus']

function shape(co) {
  const d = co.dwc || {}
  const place = [d.verbatimLocality || d.locality, !d.verbatimLocality && d.county ? d.county + ' Co.' : '', !d.verbatimLocality ? d.stateProvince : '']
    .filter(Boolean)
    .join(', ')
  return {
    id: co.id,
    created: co.created_at,
    catalog: d.catalogNumber || '',
    name: d.scientificName || d.genus || d.family || d.order || 'Unidentified',
    italic: RANK_ITALIC.includes(String(d.taxonRank || '').toLowerCase()),
    higher: [d.order, d.family].filter(Boolean).join(' · '),
    otu: d.otu_id || null,
    place,
    date: d.verbatimEventDate || d.eventDate || '',
    leg: (d.recordedBy || '').replace(/\s*\|\s*/g, ', '),
    det: d.identifiedBy ? d.identifiedBy + (d.dateIdentified ? ', ' + String(d.dateIdentified).slice(0, 4) : '') : '',
    label: d.verbatimLabel || ''
  }
}

function ago(iso) {
  if (!iso) return ''
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 864e5)
  if (days < 1) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 45) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

async function load() {
  loading.value = true
  error.value = false
  try {
    const { data } = await makeAPIRequest.get('/collection_objects', {
      params: { recent: true, recent_target: 'created_at', per: PER, page: page.value + 1, extend: ['dwc_fields'] }
    })
    const list = (Array.isArray(data) ? data : []).map(shape)
    items.value.push(...list)
    page.value += 1
    if (list.length < PER) done.value = true
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.na-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.75rem;
}
.na-summary {
  margin: 0;
  color: rgb(var(--color-base-lighter));
}
.na-view {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: rgb(var(--fl-sand));
}
.na-view button {
  padding: 0.4rem 1rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: rgb(var(--color-base-lighter));
  transition: background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease;
}
.na-view button.on {
  background: rgb(var(--fl-card));
  color: rgb(var(--fl-ink));
  box-shadow: 0 2px 8px -3px rgb(0 0 0 / 0.25);
}
.na-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
}
.na-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1.15rem 1.2rem 1.25rem;
  background: rgb(var(--fl-card));
  border-radius: 18px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 14px 30px -24px rgb(0 0 0 / 0.35);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.na-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 22px 40px -24px rgb(0 0 0 / 0.42);
}
.na-skel {
  min-height: 12rem;
  animation: na-pulse 1.3s ease-in-out infinite;
}
@keyframes na-pulse {
  50% {
    opacity: 0.5;
  }
}
.na-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.7rem;
}
.na-cat {
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  font-variant-numeric: tabular-nums;
  background: rgb(255 201 4 / 0.22);
  color: rgb(var(--fl-teal-deep));
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
}
.na-added {
  font-size: 0.75rem;
  color: rgb(var(--color-base-soft));
  white-space: nowrap;
}
.na-name {
  font-size: 1.06rem;
  font-weight: 650;
  line-height: 1.3;
  color: rgb(var(--fl-ink));
  margin: 0;
}
a.na-name {
  background-image: linear-gradient(rgb(255 201 4), rgb(255 201 4));
  background-size: 0 2px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 0.3s ease;
}
a.na-name:hover {
  background-size: 100% 2px;
}
.na-name.italic {
  font-style: italic;
}
.na-higher {
  margin: 0.2rem 0 0.85rem;
  font-size: 0.82rem;
  color: rgb(var(--color-base-soft));
}
.na-data {
  margin: 0;
  display: grid;
  gap: 0.4rem;
  font-size: 0.87rem;
}
.na-data div {
  display: grid;
  grid-template-columns: 3.4rem 1fr;
  gap: 0.5rem;
}
.na-data dt {
  color: rgb(var(--color-base-soft));
  font-size: 0.8rem;
}
.na-data dd {
  margin: 0;
  color: rgb(var(--fl-ink));
  overflow-wrap: anywhere;
}
.na-label {
  margin: 0;
  padding: 0.85rem 0.95rem;
  background: rgb(255 250 232);
  color: #2a2a2a;
  border-radius: 12px;
  font-family: 'Courier New', Courier, ui-monospace, monospace;
  font-size: 0.78rem;
  line-height: 1.5;
  white-space: pre-wrap;
  box-shadow: inset 0 0 0 1px rgb(201 150 0 / 0.18);
}
.na-more {
  display: flex;
  justify-content: center;
  margin-top: 2.25rem;
}
.na-btn {
  font-weight: 600;
  padding: 0.75rem 1.6rem;
  border-radius: 999px;
  background: rgb(255 201 4);
  color: #111;
  box-shadow: 0 10px 24px -12px rgb(201 150 0 / 0.9);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.na-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 28px -12px rgb(201 150 0 / 0.9);
}
</style>

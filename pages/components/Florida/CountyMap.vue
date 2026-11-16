<template>
  <div class="fl-county">
    <!-- Map -->
    <div class="fl-card fl-map-card">
      <svg :viewBox="VIEWBOX" class="fl-map" role="img" aria-label="Map of Florida counties shaded by number of UCFC records">
        <g>
          <path
            v-for="c in shapes"
            :key="c.gid"
            :d="c.d"
            class="fl-county-shape"
            :class="{ on: c.gid === selected, empty: !counts[c.gid] }"
            :style="{ fillOpacity: opacity(counts[c.gid]) }"
            tabindex="0"
            :aria-label="`${c.name} County: ${fmt(counts[c.gid] || 0)} records`"
            @mouseenter="hover = c"
            @mouseleave="hover = null"
            @focus="hover = c"
            @blur="hover = null"
            @click="select(c.gid)"
            @keydown.enter="select(c.gid)"
          />
        </g>
        <g v-if="hover" pointer-events="none">
          <rect
            :x="tipX - 4"
            :y="hover.cy - 34"
            :width="tipW"
            height="26"
            rx="6"
            class="fl-tip-bg"
          />
          <text :x="tipX + 4" :y="hover.cy - 16" class="fl-tip">
            <tspan font-weight="700">{{ hover.name }}</tspan>
            <tspan> · {{ fmt(counts[hover.gid] || 0) }}</tspan>
          </text>
        </g>
      </svg>
      <div class="fl-legend">
        <span>fewer</span>
        <i v-for="o in [0.15, 0.35, 0.55, 0.75, 1]" :key="o" :style="{ opacity: o }" />
        <span>more records</span>
      </div>
      <p class="fl-muted fl-note">
        {{ fmt(withRecords) }} of 67 counties have UCFC specimens. Click a county to see what was collected there.
      </p>
    </div>

    <!-- Detail -->
    <div class="fl-card fl-detail">
      <template v-if="detail">
        <p class="fl-kicker">County</p>
        <h3 class="fl-h2">{{ detailName }}</h3>
        <div class="fl-stats fl-stats-sm">
          <div class="fl-stat">
            <b>{{ fmt(detail.count) }}</b><span>specimens</span>
          </div>
          <div class="fl-stat">
            <b>{{ share }}%</b><span>of all specimens from Florida</span>
          </div>
        </div>

        <h4 class="fl-h3">Orders</h4>
        <ul class="fl-bars">
          <li v-for="o in detail.orders" :key="o.key">
            <span class="fl-bar-label">{{ o.name }}</span>
            <span class="fl-bar-track"><span class="fl-bar" :style="{ width: (100 * o.count) / detail.orders[0].count + '%' }" /></span>
            <span class="fl-bar-n">{{ fmt(o.count) }}</span>
          </li>
        </ul>

        <h4 class="fl-h3 fl-mt">Most collected species</h4>
        <ol class="fl-list">
          <li v-for="s in detail.species" :key="s.key">
            <a :href="gbifLink({ taxonKey: s.key, gadmLevel2Gid: selected })" target="_blank" rel="noopener"><i>{{ s.name }}</i></a>
            <small>{{ s.family }}</small>
            <span class="fl-bar-n">{{ fmt(s.count) }}</span>
          </li>
        </ol>

        <a class="fl-link fl-mt-block" :href="gbifLink({ gadmLevel2Gid: selected })" target="_blank" rel="noopener">
          All {{ fmt(detail.count) }} records from {{ detailName }} on GBIF ↗
        </a>
      </template>
      <p v-else-if="loadingDetail" class="fl-muted">Loading…</p>
      <p v-else class="fl-muted">Click a county on the map.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import shapes, { VIEWBOX } from './floridaCounties.js'
import { FLORIDA_GID, facets, fmt, gbifLink, topTaxa } from './useGbif.js'
import './florida.css'

const counts = ref({})
const total = ref(0)
const selected = ref('')
const hover = ref(null)
const detail = ref(null)
const loadingDetail = ref(false)

const byGid = Object.fromEntries(shapes.map((s) => [s.gid, s]))
const detailName = computed(() => (byGid[selected.value]?.name || '') + ' County')
const withRecords = computed(() => Object.values(counts.value).filter(Boolean).length)
const share = computed(() =>
  total.value ? ((100 * (counts.value[selected.value] || 0)) / total.value).toFixed(1) : '0'
)

// log scale, so small counties are still visible next to Orange County
const maxLog = computed(() => Math.log10(1 + Math.max(1, ...Object.values(counts.value))))
const opacity = (n) => (n ? 0.12 + (0.88 * Math.log10(1 + n)) / maxLog.value : 1)

const tipW = computed(() => (hover.value ? 26 + 7 * (hover.value.name.length + fmt(counts.value[hover.value.gid] || 0).length + 3) : 0))
const tipX = computed(() => (hover.value ? Math.min(Math.max(hover.value.cx - tipW.value / 2, 4), 636 - tipW.value) : 0))

async function select(gid) {
  selected.value = gid
  detail.value = null
  loadingDetail.value = true
  try {
    const f = { gadmLevel2Gid: gid }
    const [orders, species] = await Promise.all([topTaxa(f, 'orderKey', 6), topTaxa(f, 'speciesKey', 8)])
    if (selected.value !== gid) return
    detail.value = { count: orders.count, orders: orders.items, species: species.items }
  } finally {
    loadingDetail.value = false
  }
}

onMounted(async () => {
  const data = await facets({ gadmLevel1Gid: FLORIDA_GID }, ['gadmLevel2Gid'], 80)
  total.value = data.count
  counts.value = Object.fromEntries(data.gadmLevel2Gid.map((c) => [c.key, c.count]))
  const top = data.gadmLevel2Gid[0]?.key
  if (top) select(top)
})
</script>

<style scoped>
.fl-county {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  align-items: start;
}
@media (max-width: 900px) {
  .fl-county {
    grid-template-columns: 1fr;
  }
}
.fl-map {
  width: 100%;
  height: auto;
  display: block;
}
.fl-county-shape {
  fill: rgb(var(--fl-teal));
  stroke: rgb(var(--fl-card));
  stroke-width: 0.8;
  cursor: pointer;
  outline: none;
  transition: fill-opacity 0.3s;
}
.fl-county-shape.empty {
  fill: rgb(var(--fl-sand));
}
.fl-county-shape:hover,
.fl-county-shape:focus-visible {
  stroke: rgb(var(--fl-ink));
  stroke-width: 1.5;
}
.fl-county-shape.on {
  fill: rgb(var(--fl-coral));
  fill-opacity: 1 !important;
  stroke: rgb(var(--fl-ink));
  stroke-width: 1.5;
}
.fl-tip-bg {
  fill: rgb(var(--fl-ink));
  opacity: 0.92;
}
.fl-tip {
  fill: rgb(var(--fl-card));
  font-size: 12px;
}
.fl-legend {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: rgb(var(--color-base-soft));
  margin-top: 0.5rem;
}
.fl-legend i {
  width: 1.4rem;
  height: 0.6rem;
  border-radius: 2px;
  background: rgb(var(--fl-teal));
}
.fl-note {
  font-size: 0.8rem;
  margin: 0.5rem 0 0;
}
.fl-stats-sm {
  margin: 1rem 0 1.25rem;
}
.fl-stats-sm b {
  font-size: 1.35rem;
}
.fl-mt {
  margin-top: 1.25rem;
}
.fl-mt-block {
  display: inline-block;
  margin-top: 1rem;
  font-size: 0.9rem;
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
</style>

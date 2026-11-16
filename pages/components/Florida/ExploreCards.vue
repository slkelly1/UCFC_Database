<template>
  <section class="ex">
    <div class="ex-inner">
      <div class="ex-head">
        <p class="ex-kicker">Explore the collection</p>
        <h2 class="ex-title">Florida, through half a million specimens</h2>
      </div>

      <div class="ex-grid">
        <!-- 01 Florida -->
        <RouterLink to="/florida" class="ex-card">
          <div class="ex-visual">
            <svg :viewBox="VIEWBOX" class="ex-map" aria-hidden="true">
              <path
                v-for="c in shapes"
                :key="c.gid"
                :d="c.d"
                :style="{ fillOpacity: countyOpacity(counts[c.gid]) }"
              />
            </svg>
          </div>
          <div class="ex-body">
            <span class="ex-num">01</span>
            <h3>Florida, county by county</h3>
            <p>A map of the 67 counties: how many specimens each one has, and which species were collected there.</p>
            <span class="ex-go">Open the map <i>→</i></span>
          </div>
        </RouterLink>

        <!-- 02 Campus -->
        <RouterLink to="/campus" class="ex-card">
          <div class="ex-visual ex-visual-bars">
            <div class="ex-bars" aria-hidden="true">
              <span
                v-for="(m, i) in campusMonths"
                :key="i"
                :class="{ now: i === thisMonth }"
                :style="{ height: 8 + (92 * m) / maxCampus + '%' }"
              />
            </div>
            <div class="ex-bars-axis" aria-hidden="true">
              <small v-for="(l, i) in 'JFMAMJJASOND'" :key="i">{{ l }}</small>
            </div>
          </div>
          <div class="ex-body">
            <span class="ex-num">02</span>
            <h3>Insects of the UCF campus</h3>
            <p>What has been found on our own campus and arboretum, and when: {{ campusTotal ? fmt(campusTotal) : 'over 100,000' }} specimens, month by month.</p>
            <span class="ex-go">Visit the campus <i>→</i></span>
          </div>
        </RouterLink>

        <!-- 03 Numbers -->
        <RouterLink to="/numbers" class="ex-card">
          <div class="ex-visual ex-visual-num">
            <b class="ex-big">{{ total ? fmt(total) : '575,959' }}</b>
            <svg viewBox="0 0 300 60" preserveAspectRatio="none" class="ex-spark" aria-hidden="true">
              <path :d="spark" />
            </svg>
            <small class="ex-spark-label">specimens by year collected</small>
          </div>
          <div class="ex-body">
            <span class="ex-num">03</span>
            <h3>The collection in numbers</h3>
            <p>Orders, decades of collecting, and the people who built the UCFC, specimen by specimen.</p>
            <span class="ex-go">See the numbers <i>→</i></span>
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import shapes, { VIEWBOX } from './floridaCounties.js'
import { CAMPUS, FLORIDA_GID, facets, fmt } from './useGbif.js'
import './florida.css'

const thisMonth = new Date().getMonth()
const counts = ref({})
const campusMonths = ref(Array(12).fill(1))
const campusTotal = ref(0)
const total = ref(0)
const years = ref([])

const maxLog = computed(() => Math.log10(1 + Math.max(1, ...Object.values(counts.value))))
const countyOpacity = (n) => (n ? 0.25 + (0.75 * Math.log10(1 + n)) / maxLog.value : 0.08)
const maxCampus = computed(() => Math.max(1, ...campusMonths.value))

// area sparkline of specimens per year
const spark = computed(() => {
  const ys = years.value
  if (ys.length < 2) return ''
  const x0 = ys[0].year
  const x1 = ys[ys.length - 1].year
  const max = Math.max(...ys.map((y) => y.count))
  const pts = ys.map((y) => [((y.year - x0) / (x1 - x0)) * 300, 60 - (56 * y.count) / max])
  return `M0,60 L${pts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' L')} L300,60 Z`
})

onMounted(async () => {
  try {
    const [fl, campus, all] = await Promise.all([
      facets({ gadmLevel1Gid: FLORIDA_GID }, ['gadmLevel2Gid'], 80),
      facets({ decimalLatitude: CAMPUS.lat, decimalLongitude: CAMPUS.lon }, ['month'], 12),
      facets({}, ['year'], 300)
    ])
    counts.value = Object.fromEntries(fl.gadmLevel2Gid.map((c) => [c.key, c.count]))
    const m = Array(12).fill(0)
    campus.month.forEach(({ key, count }) => (m[Number(key) - 1] = count))
    campusMonths.value = m
    campusTotal.value = campus.count
    total.value = all.count
    years.value = all.year
      .map((y) => ({ year: Number(y.key), count: y.count }))
      .filter((y) => y.year >= 1970)
      .sort((a, b) => a.year - b.year)
  } catch {
    // the cards still work without the live pictures
  }
})
</script>

<style scoped>
.ex {
  background: #111;
  color: #f4f1ea;
}
.ex-inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 3.5rem 1rem 4rem;
}
.ex-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  background: rgb(255 255 255 / 0.08);
  color: rgb(244 241 234 / 0.85);
  padding: 0.3rem 0.8rem 0.3rem 0.6rem;
  border-radius: 999px;
  margin: 0 0 1rem;
}
.ex-kicker::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: rgb(255 201 4);
}
.ex-title {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -0.025em;
  color: #fff;
  margin: 0;
  max-width: 40rem;
}
.ex-grid {
  display: grid;
  gap: 1.25rem;
  margin-top: 2.25rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
@media (max-width: 900px) {
  .ex-grid {
    grid-template-columns: 1fr;
  }
}
.ex-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #1c1c1c;
  border-radius: 20px;
  color: inherit;
  transition: transform 0.3s ease, background 0.3s ease;
}
.ex-card:hover {
  transform: translateY(-4px);
  background: #222;
}
.ex-visual {
  height: 11rem;
  padding: 1rem;
  border-bottom: 1px solid #2a2a2a;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ex-map {
  height: 100%;
  width: auto;
  max-width: 100%;
}
.ex-map path {
  fill: rgb(255 201 4);
  stroke: #1b1b1b;
  stroke-width: 1;
}
.ex-visual-bars {
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-end;
  gap: 0.35rem;
}
.ex-bars {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 0.3rem;
  align-items: end;
}
.ex-bars span {
  background: rgb(255 201 4 / 0.45);
  border-radius: 2px 2px 0 0;
  transition: height 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.ex-bars span.now {
  background: rgb(255 201 4);
}
.ex-bars-axis {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  text-align: center;
  font-size: 0.65rem;
  color: rgb(244 241 234 / 0.5);
}
.ex-visual-num {
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-end;
  gap: 0.25rem;
}
.ex-big {
  font-size: 2.6rem;
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1;
  color: rgb(255 201 4);
  font-variant-numeric: tabular-nums;
}
.ex-spark {
  width: 100%;
  height: 3.75rem;
}
.ex-spark path {
  fill: rgb(255 201 4 / 0.35);
  stroke: rgb(255 201 4);
  stroke-width: 1.5;
  vector-effect: non-scaling-stroke;
}
.ex-spark-label {
  font-size: 0.68rem;
  color: rgb(244 241 234 / 0.5);
}
.ex-body {
  padding: 1.25rem 1.25rem 1.4rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.ex-num {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgb(255 201 4);
  letter-spacing: 0.1em;
}
.ex-body h3 {
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
  color: #fff;
  margin: 0.35rem 0 0.5rem;
}
.ex-body p {
  font-size: 0.92rem;
  line-height: 1.55;
  color: rgb(244 241 234 / 0.72);
  margin: 0 0 1.1rem;
  flex: 1;
}
.ex-go {
  font-weight: 600;
  font-size: 0.9rem;
  color: rgb(255 201 4);
}
.ex-go i {
  display: inline-block;
  font-style: normal;
  transition: transform 0.2s ease;
}
.ex-card:hover .ex-go i {
  transform: translateX(4px);
}
</style>

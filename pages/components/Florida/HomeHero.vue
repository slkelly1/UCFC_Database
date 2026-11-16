<template>
  <section class="hh">
    <div class="hh-inner">
      <div class="hh-text">
        <p class="hh-kicker">University of Central Florida · Collection of Arthropods</p>
        <h1 class="hh-title">Bug<br />Closet</h1>
        <p class="hh-lead">
          More than half a million insects and their relatives, most of them from Florida, all databased and searchable
          online. One of the largest fully digitized arthropod collections in the world.
        </p>

        <div class="hh-search">
          <AutocompleteOtu class="w-full" placeholder="Search a species, genus or family…" />
        </div>

        <div class="hh-actions">
          <RouterLink to="/florida" class="hh-btn">Explore Florida →</RouterLink>
          <RouterLink :to="browseLink" class="hh-link">Browse the tree of life</RouterLink>
          <a href="https://sciences.ucf.edu/biology/bugcloset/" target="_blank" rel="noopener" class="hh-link">
            Our history ↗
          </a>
        </div>
      </div>

      <!-- A specimen label, pinned: the collection's numbers written the way a label would be -->
      <figure class="hh-label" aria-label="The collection at a glance">
        <span class="hh-pin" aria-hidden="true" />
        <p class="hh-label-head">UCFC · Orlando, Florida</p>
        <p class="hh-label-big">{{ stats.total ? fmt(stats.total) : '575,000+' }}</p>
        <p class="hh-label-sub">specimens databased</p>
        <dl class="hh-label-rows">
          <div><dt>Florida</dt><dd>{{ stats.florida ? stats.florida + '%' : '—' }}</dd></div>
          <div><dt>Counties</dt><dd>{{ stats.counties || '—' }} of 67</dd></div>
          <div><dt>UCF campus</dt><dd>{{ stats.campus ? fmt(stats.campus) : '—' }}</dd></div>
          <div><dt>Countries</dt><dd>{{ stats.countries || '—' }}</dd></div>
        </dl>
        <figcaption>live · GBIF</figcaption>
      </figure>
    </div>
  </section>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import { CAMPUS, FLORIDA_GID, facets, fmt } from './useGbif.js'
import './florida.css'

// "Browse" opens the ranked taxonomic tree
const browseLink = '/tree'

const stats = reactive({ total: 0, florida: 0, counties: 0, campus: 0, countries: 0 })

onMounted(async () => {
  try {
    const [all, fl, campus] = await Promise.all([
      facets({}, ['country', 'stateProvince'], 300),
      facets({ gadmLevel1Gid: FLORIDA_GID }, ['gadmLevel2Gid'], 80),
      facets({ decimalLatitude: CAMPUS.lat, decimalLongitude: CAMPUS.lon }, [], 0)
    ])
    stats.total = all.count
    const florida = all.stateProvince.find((s) => s.key === 'Florida')?.count || 0
    stats.florida = Math.round((100 * florida) / all.count)
    stats.countries = all.country.length
    stats.counties = fl.gadmLevel2Gid.length
    stats.campus = campus.count
  } catch {
    // keep the placeholders
  }
})
</script>

<style scoped>
/* UCF gold page, black type: bright and open */
.hh {
  background: rgb(255 201 4);
  color: #111;
  overflow: hidden;
}
.hh-inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 3.5rem 1rem 3.75rem;
  display: grid;
  gap: 3rem;
  grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
  align-items: center;
}
@media (max-width: 900px) {
  .hh-inner {
    grid-template-columns: 1fr;
    gap: 2.5rem;
    padding-top: 2.5rem;
  }
}
.hh-kicker {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  background: rgb(255 255 255 / 0.55);
  color: #111;
  padding: 0.3rem 0.85rem 0.3rem 0.6rem;
  border-radius: 999px;
  margin: 0 0 1.25rem;
}
.hh-kicker::before {
  content: '';
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #111;
}
.hh-title {
  font-size: clamp(4rem, 11vw, 8.5rem);
  font-weight: 800;
  line-height: 0.82;
  letter-spacing: -0.05em;
  text-transform: uppercase;
  margin: 0;
}
.hh-lead {
  margin: 1.5rem 0 0;
  max-width: 34rem;
  font-size: 1.08rem;
  line-height: 1.6;
  font-weight: 500;
}
.hh-search {
  margin-top: 1.75rem;
  max-width: 34rem;
  padding: 0.35rem 0.5rem;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 16px 34px -18px rgb(0 0 0 / 0.45);
}
.hh-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1.4rem;
  margin-top: 1.75rem;
}
.hh-btn {
  background: #111;
  color: rgb(255 201 4);
  font-weight: 600;
  padding: 0.7rem 1.3rem;
  border-radius: 999px;
  transition: transform 0.2s ease;
}
.hh-btn:hover {
  transform: translateY(-2px);
}
.hh-link {
  font-weight: 700;
  text-decoration: underline;
  text-decoration-thickness: 2px;
  text-underline-offset: 4px;
}
.hh-link:hover {
  text-decoration-thickness: 3px;
}

/* the label */
.hh-label {
  position: relative;
  margin: 0 auto;
  width: 100%;
  max-width: 21rem;
  background: #fffdf6;
  color: #111;
  padding: 1.6rem 1.5rem 1.1rem;
  border-radius: 6px;
  transform: rotate(2.2deg);
  box-shadow: 0 24px 44px -22px rgb(0 0 0 / 0.55);
  font-family: 'Courier New', Courier, ui-monospace, monospace;
}
.hh-pin {
  position: absolute;
  top: -9px;
  left: 50%;
  width: 18px;
  height: 18px;
  margin-left: -9px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #666 0%, #111 60%);
  box-shadow: 0 2px 3px rgb(0 0 0 / 0.4);
}
.hh-label-head {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border-bottom: 1.5px dashed #111;
  padding-bottom: 0.5rem;
  margin: 0;
}
.hh-label-big {
  font-family: inherit;
  font-size: 2.6rem;
  font-weight: 700;
  line-height: 1;
  margin: 0.9rem 0 0;
  font-variant-numeric: tabular-nums;
}
.hh-label-sub {
  font-size: 0.85rem;
  margin: 0.2rem 0 0.9rem;
}
.hh-label-rows {
  margin: 0;
  border-top: 1.5px dashed #111;
  padding-top: 0.6rem;
}
.hh-label-rows div {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 0.9rem;
  padding: 0.2rem 0;
}
.hh-label-rows dt {
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.hh-label-rows dd {
  margin: 0;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.hh-label figcaption {
  margin-top: 0.75rem;
  font-size: 0.68rem;
  text-align: right;
  opacity: 0.6;
}
</style>

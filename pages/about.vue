<template>
  <div>
    <PageBand
      kicker="About"
      title="About the Bug Closet"
      lede="The University of Central Florida Collection of Arthropods (UCFC), known on campus as the Bug Closet, is the insect collection of UCF's Department of Biology, and one of the largest fully databased arthropod collections in the world."
    />

    <div class="fl-page ab">
      <!-- Mission + numbers -->
      <section class="ab-intro">
        <div class="ab-text">
          <h2 class="fl-h2">A collection built to be used</h2>
          <p>
            The UCFC holds more than half a million specimens, most of them collected in Florida. Every specimen is
            databased and published openly, so the collection serves research, teaching and conservation far beyond
            Orlando.
          </p>
          <p>
            This database is the collection's online catalogue. Search a name, browse the tree of life, explore Florida
            county by county, or follow what the curators add each week. All the records are also shared with the
            Global Biodiversity Information Facility (GBIF).
          </p>
          <p>
            For the history of the Bug Closet, visits and loans, see the
            <a class="fl-link" href="https://sciences.ucf.edu/biology/bugcloset/" target="_blank" rel="noopener">official UCFC page ↗</a>.
          </p>
        </div>

        <aside class="ab-glance">
          <p class="ab-glance-h">The UCFC at a glance</p>
          <dl>
            <div><dt>Specimens online</dt><dd>{{ stats.total ? fmt(stats.total) : '575,000+' }}</dd></div>
            <div><dt>From Florida</dt><dd>{{ stats.florida ? stats.florida + '%' : '—' }}</dd></div>
            <div><dt>Countries</dt><dd>{{ stats.countries || '—' }}</dd></div>
            <div><dt>Years of collecting</dt><dd>{{ stats.years || '—' }}</dd></div>
          </dl>
          <RouterLink to="/numbers" class="ab-glance-go">More numbers →</RouterLink>
        </aside>
      </section>

      <!-- Team -->
      <section class="ab-team">
        <p class="fl-kicker">The team</p>
        <h2 class="fl-h2">Who looks after the collection</h2>
        <div class="ab-people">
          <article v-for="p in team" :key="p.name" class="ab-person">
            <img :src="p.photo" :alt="p.name" loading="lazy" />
            <div>
              <h3>{{ p.name }}</h3>
              <p class="ab-role">{{ p.title }}</p>
              <p class="ab-since">{{ p.description }}</p>
            </div>
          </article>
        </div>
      </section>

      <!-- Cite -->
      <section class="ab-cite">
        <div>
          <p class="fl-kicker">Using the data</p>
          <h2 class="fl-h2">How to cite the collection</h2>
          <p class="fl-muted">
            If you use UCFC records in a paper, report or thesis, please cite the dataset. Its DOI always points to the
            current version.
          </p>
        </div>
        <div class="ab-cite-box">
          <p class="ab-cite-text">{{ citation || 'Loading the citation from GBIF…' }}</p>
          <div class="ab-cite-actions">
            <button type="button" class="ab-btn" :disabled="!citation" @click="copy">{{ copied ? 'Copied ✓' : 'Copy citation' }}</button>
            <a v-if="doi" :href="'https://doi.org/' + doi" target="_blank" rel="noopener" class="ab-btn ab-btn-line">doi:{{ doi }} ↗</a>
          </div>
        </div>
      </section>

      <!-- Links -->
      <section class="ab-links">
        <a href="https://www.gbif.org/dataset/262f8270-f9c2-4bc6-a562-8ed71c0790e6" target="_blank" rel="noopener">
          <b>Dataset on GBIF</b><span>All records, maps and downloads</span>
        </a>
        <a href="https://www.gbif.org/publisher/f9846278-7e1b-449b-b92b-417fab3a5a20" target="_blank" rel="noopener">
          <b>GBIF publisher page</b><span>Everything the UCFC shares with GBIF</span>
        </a>
        <a href="https://sciences.ucf.edu/biology/bugcloset/" target="_blank" rel="noopener">
          <b>Official UCFC page</b><span>History, visits and loans</span>
        </a>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import PageBand from './components/Florida/PageBand.vue'
import { team } from './components/about/people.js'
import { datasetInfo, facets, fmt } from './components/Florida/useGbif.js'
import './components/Florida/florida.css'

const stats = reactive({ total: 0, florida: 0, countries: 0, years: '' })
const citation = ref('')
const doi = ref('')
const copied = ref(false)

async function copy() {
  try {
    await navigator.clipboard.writeText(citation.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // clipboard blocked
  }
}

onMounted(async () => {
  try {
    const [all, ds] = await Promise.all([facets({}, ['country', 'stateProvince', 'year'], 300), datasetInfo()])
    stats.total = all.count
    const fl = all.stateProvince.find((s) => s.key === 'Florida')?.count || 0
    stats.florida = Math.round((100 * fl) / all.count)
    stats.countries = all.country.length
    const ys = all.year.map((y) => Number(y.key)).filter((y) => y > 1800)
    if (ys.length) stats.years = `${Math.min(...ys)}–${Math.max(...ys)}`
    citation.value = ds.citation
    doi.value = ds.doi
  } catch {
    // keep placeholders
  }
})
</script>

<style scoped>
.ab {
  display: grid;
  gap: 4.5rem;
}
.ab-intro {
  display: grid;
  gap: 3rem;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  align-items: start;
}
@media (max-width: 860px) {
  .ab-intro {
    grid-template-columns: 1fr;
  }
}
.ab-text p {
  margin: 1rem 0 0;
  font-size: 1.05rem;
  line-height: 1.75;
  color: rgb(var(--color-base-lighter));
}
.ab-glance {
  border-radius: 20px;
  padding: 1.6rem 1.6rem 1.4rem;
  color: #f4f1ea;
  background: #171717;
  box-shadow: 0 24px 48px -28px rgb(0 0 0 / 0.55);
}
.ab-glance-h {
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: rgb(255 214 90);
  margin: 0 0 0.5rem;
}
.ab-glance dl {
  margin: 0;
}
.ab-glance dl div {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid rgb(255 255 255 / 0.08);
}
.ab-glance dl div:last-child {
  border-bottom: 0;
}
.ab-glance dt {
  font-size: 0.9rem;
  color: rgb(244 241 234 / 0.7);
}
.ab-glance dd {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
}
.ab-glance-go {
  display: inline-flex;
  margin-top: 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  color: rgb(255 214 90);
}
.ab-glance-go:hover {
  color: #fff;
}
.ab-people {
  display: grid;
  gap: 1.25rem;
  margin-top: 1.75rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
}
.ab-person {
  display: flex;
  align-items: center;
  gap: 1.1rem;
  padding: 1.1rem 1.2rem;
  background: rgb(var(--fl-card));
  border-radius: 18px;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 14px 32px -24px rgb(0 0 0 / 0.35);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.ab-person:hover {
  transform: translateY(-3px);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 22px 40px -24px rgb(0 0 0 / 0.4);
}
.ab-person img {
  width: 5.25rem;
  height: 5.25rem;
  flex: none;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 4px rgb(255 201 4 / 0.35);
}
.ab-person h3 {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
  color: rgb(var(--fl-ink));
}
.ab-role {
  margin: 0.15rem 0 0;
  font-weight: 500;
  color: rgb(var(--fl-teal-deep));
}
.ab-since {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: rgb(var(--color-base-soft));
}
.ab-cite {
  display: grid;
  gap: 2rem;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  align-items: center;
}
@media (max-width: 860px) {
  .ab-cite {
    grid-template-columns: 1fr;
  }
}
.ab-cite .fl-muted {
  margin: 0.75rem 0 0;
  line-height: 1.65;
}
.ab-cite-box {
  border-radius: 18px;
  background: rgb(255 246 214);
  border: 1px solid rgb(255 201 4 / 0.35);
  padding: 1.4rem 1.5rem;
}
:global(.dark) .ab-cite-box {
  background: rgb(var(--fl-card));
}
.ab-cite-text {
  margin: 0;
  font-size: 0.98rem;
  line-height: 1.7;
  color: rgb(var(--fl-ink));
}
.ab-cite-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1.1rem;
}
.ab-btn {
  font-weight: 600;
  font-size: 0.88rem;
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  background: rgb(255 201 4);
  color: #111;
  box-shadow: 0 6px 16px -8px rgb(201 150 0 / 0.8);
  transition: transform 0.2s ease;
}
.ab-btn:hover {
  transform: translateY(-1px);
}
.ab-btn:disabled {
  opacity: 0.5;
}
.ab-btn-line {
  background: transparent;
  color: rgb(var(--fl-ink));
  box-shadow: inset 0 0 0 1px rgb(var(--color-base-border));
}
.ab-links {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
}
.ab-links a {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1.2rem 1.3rem;
  border-radius: 16px;
  background: rgb(var(--fl-card));
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 12px 28px -22px rgb(0 0 0 / 0.35);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.ab-links a:hover {
  transform: translateY(-3px);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.04), 0 20px 36px -22px rgb(0 0 0 / 0.4);
}
.ab-links b {
  color: rgb(var(--fl-ink));
  font-weight: 700;
}
.ab-links b::after {
  content: ' ↗';
  color: rgb(var(--fl-teal));
}
.ab-links span {
  font-size: 0.88rem;
  color: rgb(var(--color-base-soft));
}
</style>

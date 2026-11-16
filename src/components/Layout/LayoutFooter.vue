<template>
  <footer class="ucf-footer">
    <div class="ucf-footer-band" aria-hidden="true" />
    <div class="ucf-footer-inner">
      <!-- Identity -->
      <div class="ucf-footer-id">
        <p class="ucf-footer-name">Bug Closet</p>
        <p class="ucf-footer-full">University of Central Florida<br />Collection of Arthropods (UCFC)</p>
        <p class="ucf-footer-place">Department of Biology · Orlando, Florida</p>
      </div>

      <!-- Explore -->
      <nav class="ucf-footer-col" aria-label="Explore">
        <p class="ucf-footer-h">Explore</p>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/tree">Tree of life</RouterLink>
        <RouterLink to="/florida">Florida by county</RouterLink>
        <RouterLink to="/campus">Insects of the UCF campus</RouterLink>
        <RouterLink to="/numbers">The collection in numbers</RouterLink>
        <RouterLink to="/newspecimens">Recent additions</RouterLink>
        <RouterLink to="/search">Search the specimens</RouterLink>
      </nav>

      <!-- The collection -->
      <nav class="ucf-footer-col" aria-label="The collection">
        <p class="ucf-footer-h">The collection</p>
        <a href="https://sciences.ucf.edu/biology/bugcloset/" target="_blank" rel="noopener">History of the Bug Closet ↗</a>
        <a href="https://www.gbif.org/dataset/262f8270-f9c2-4bc6-a562-8ed71c0790e6" target="_blank" rel="noopener">Dataset on GBIF ↗</a>
        <RouterLink to="/about">About this database</RouterLink>
        <TrackerReport label="Report a problem" button-class="ucf-footer-report" />
      </nav>

      <!-- Built with -->
      <div class="ucf-footer-col">
        <p class="ucf-footer-h">Built with</p>
        <a href="https://taxonworks.org/" target="_blank" rel="noopener">TaxonWorks ↗</a>
        <a href="https://github.com/SpeciesFileGroup/taxonpages" target="_blank" rel="noopener">TaxonPages ↗</a>
        <a href="https://speciesfilegroup.org" target="_blank" rel="noopener">Species File Group ↗</a>
        <FooterAnalytics class="ucf-footer-small" />
      </div>
    </div>

    <div class="ucf-footer-bottom">
      <div class="ucf-footer-bottom-inner">
        <FooterCitation />
        <FooterCopyright />
        <p>© {{ year }} University of Central Florida Collection of Arthropods</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import FooterCitation from '@/components/Footer/FooterCitation.vue'
import FooterCopyright from '@/components/Footer/FooterCopyright.vue'
import FooterAnalytics from '@/components/Footer/FooterAnalytics.vue'

const year = new Date().getFullYear()
</script>

<style scoped>
.ucf-footer {
  background: #111;
  color: rgb(244 241 234 / 0.8);
  font-size: 0.9rem;
}
/* gold and black stripes, like UCF's pegasus banners */
.ucf-footer-band {
  height: 10px;
  background: repeating-linear-gradient(-45deg, rgb(255 201 4) 0 14px, #111 14px 28px);
}
.ucf-footer-inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 3rem 1rem 2.5rem;
  display: grid;
  gap: 2rem;
  grid-template-columns: 1.4fr repeat(3, 1fr);
}
@media (max-width: 900px) {
  .ucf-footer-inner {
    grid-template-columns: 1fr 1fr;
  }
}
@media (max-width: 520px) {
  .ucf-footer-inner {
    grid-template-columns: 1fr;
  }
}
.ucf-footer-name {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 0.9;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: rgb(255 201 4);
  margin: 0;
}
.ucf-footer-full {
  margin: 0.75rem 0 0;
  color: #fff;
  font-weight: 600;
  line-height: 1.4;
}
.ucf-footer-place {
  margin: 0.5rem 0 0;
  font-size: 0.82rem;
  color: rgb(244 241 234 / 0.6);
}
.ucf-footer-col {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.45rem;
}
.ucf-footer-h {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgb(255 201 4);
  margin: 0 0 0.35rem;
}
.ucf-footer-col a,
.ucf-footer-col :deep(.ucf-footer-report) {
  color: rgb(244 241 234 / 0.85);
  padding: 0;
}
.ucf-footer-col a:hover,
.ucf-footer-col :deep(.ucf-footer-report:hover) {
  color: rgb(255 201 4);
}
.ucf-footer-small {
  font-size: 0.78rem;
  font-style: italic;
  color: rgb(244 241 234 / 0.55);
}
.ucf-footer-bottom {
  border-top: 1px solid rgb(255 255 255 / 0.12);
}
.ucf-footer-bottom-inner {
  max-width: 72rem;
  margin: 0 auto;
  padding: 1rem 1rem 1.5rem;
  font-size: 0.78rem;
  color: rgb(244 241 234 / 0.55);
  display: grid;
  gap: 0.35rem;
}
.ucf-footer-bottom-inner :deep(a) {
  color: rgb(244 241 234 / 0.75);
  text-decoration: underline;
}
</style>

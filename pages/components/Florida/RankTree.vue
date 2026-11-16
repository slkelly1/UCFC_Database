<template>
  <div class="rt">
    <p v-if="loading" class="fl-muted">Loading the classification from GBIF…</p>
    <p v-else-if="error" class="fl-muted">The live classification from GBIF is not available right now.</p>
    <ul v-else class="rt-list rt-root" role="tree" aria-label="Taxonomic tree of the UCFC">
      <RankNode v-for="(n, i) in roots" :key="n.key" :node="n" :index="i" :siblings="roots" />
    </ul>
  </div>
</template>

<script setup>
import { defineComponent, h, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { makeAPIRequest } from '@/utils/request'
import { facets, fmt, gbifLink, names } from './useGbif.js'
import './florida.css'

const router = useRouter()

// Each rank, the GBIF facet that lists the next rank down, and the filter that selects a node
const NEXT = { CLASS: 'orderKey', ORDER: 'familyKey', FAMILY: 'genusKey', GENUS: 'speciesKey' }
const RANK_OF = { orderKey: 'ORDER', familyKey: 'FAMILY', genusKey: 'GENUS', speciesKey: 'SPECIES' }
const FILTER = { CLASS: 'classKey', ORDER: 'orderKey', FAMILY: 'familyKey', GENUS: 'genusKey', SPECIES: 'speciesKey' }
const LABEL = { CLASS: 'Class', ORDER: 'Order', FAMILY: 'Family', GENUS: 'Genus', SPECIES: 'Species' }
const PAGE = 25

const loading = ref(true)
const error = ref(false)
const roots = ref([])

function makeNode(item, rank) {
  return reactive({
    key: item.key,
    rank,
    count: item.count,
    name: item.name || '…',
    children: null, // null = not loaded yet
    all: [], // every child key + count, names loaded page by page
    shown: 0,
    open: false,
    busy: false
  })
}

async function loadNames(list, rank) {
  const nm = await names(list.map((x) => x.key))
  return list.map((x) => makeNode({ ...x, name: nm[x.key]?.name }, rank))
}

async function expand(node) {
  if (node.rank === 'SPECIES') return
  node.open = !node.open
  if (!node.open || node.children) return
  node.busy = true
  try {
    const field = NEXT[node.rank]
    const data = await facets({ [FILTER[node.rank]]: node.key }, [field], 1000)
    node.all = data[field]
    node.children = await loadNames(node.all.slice(0, PAGE), RANK_OF[field])
    node.shown = node.children.length
  } finally {
    node.busy = false
  }
}

async function more(node) {
  node.busy = true
  try {
    const next = node.all.slice(node.shown, node.shown + PAGE)
    node.children.push(...(await loadNames(next, node.children[0]?.rank || RANK_OF[NEXT[node.rank]])))
    node.shown = node.children.length
  } finally {
    node.busy = false
  }
}

// Open the TaxonPages page of a name, found through the project's OTUs
const plain = (s) => String(s).replace(/\s*\([^)]*\)/g, '').replace(/<[^>]+>/g, '').replace(/[✓]/g, '').trim()
async function openPage(node) {
  try {
    const { data } = await makeAPIRequest.get('/otus/autocomplete', {
      params: { term: node.name, having_taxon_name_only: true }
    })
    const hit = (data || []).find((o) => plain(o.label) === node.name) || (data || [])[0]
    if (hit) return router.push({ name: 'otus-id-overview', params: { id: hit.otu_valid_id || hit.id } })
  } catch {
    // fall through to GBIF
  }
  window.open(gbifLink({ taxonKey: node.key }), '_blank', 'noopener')
}

const RankNode = defineComponent({
  name: 'RankNode',
  props: { node: Object, index: Number, siblings: Array, depth: { type: Number, default: 0 } },
  setup(props) {
    return () => {
      const n = props.node
      const top = props.siblings[0]?.count || 1
      const leaf = n.rank === 'SPECIES'
      const italic = n.rank === 'GENUS' || n.rank === 'SPECIES'
      const left = n.all.length - (n.children?.length || 0)
      const indent = { '--d': props.depth }
      return h('li', { class: ['rt-node', 'rt-' + n.rank.toLowerCase(), { open: n.open }], role: 'treeitem', 'aria-expanded': leaf ? undefined : String(n.open) }, [
        h('div', { class: 'rt-row', style: indent }, [
          h('div', { class: 'rt-head' }, [
            leaf
              ? h('span', { class: 'rt-dot', 'aria-hidden': 'true' })
              : h(
                  'button',
                  {
                    type: 'button',
                    class: ['rt-chev', { open: n.open, busy: n.busy && !n.children }],
                    'aria-label': (n.open ? 'Collapse ' : 'Expand ') + n.name,
                    onClick: () => expand(n)
                  },
                  [h('svg', { viewBox: '0 0 16 16', 'aria-hidden': 'true' }, [h('path', { d: 'M6 3.5 10.5 8 6 12.5' })])]
                ),
            h(
              'button',
              { type: 'button', class: ['rt-name', { italic }], title: 'Open the page of ' + n.name, onClick: () => openPage(n) },
              n.name
            ),
            h('span', { class: 'rt-rank' }, LABEL[n.rank])
          ]),
          h('span', { class: 'rt-bar-track', 'aria-hidden': 'true' }, [
            h('span', { class: 'rt-bar', style: { width: Math.max(0.8, (100 * n.count) / top) + '%' } })
          ]),
          h('span', { class: 'rt-count' }, [fmt(n.count), h('small', null, ' #' + (props.index + 1))])
        ]),
        n.open && n.children
          ? h('ul', { class: 'rt-list', role: 'group' }, [
              ...n.children.map((c, i) => h(RankNode, { key: c.key, node: c, index: i, siblings: n.children, depth: props.depth + 1 })),
              left > 0
                ? h('li', { class: 'rt-more', style: { '--d': props.depth + 1 } }, [
                    h(
                      'button',
                      { type: 'button', disabled: n.busy, onClick: () => more(n) },
                      n.busy ? 'Loading…' : `Show ${Math.min(PAGE, left)} more · ${fmt(left)} left`
                    )
                  ])
                : null
            ])
          : null
      ])
    }
  }
})

onMounted(async () => {
  try {
    const data = await facets({}, ['classKey'], 50)
    roots.value = await loadNames(data.classKey, 'CLASS')
    // open the insects straight away
    if (roots.value[0]) await expand(roots.value[0])
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style>
/* not scoped: the rows are drawn by a render function, which scoped styles do not reach */
.rt {
  --rt-step: 1.4rem;
}
.rt-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.rt-list .rt-list > li {
  animation: rt-in 0.28s ease both;
}
@keyframes rt-in {
  from {
    opacity: 0;
    transform: translateY(-3px);
  }
}
.rt-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(6rem, 34%) 6.5rem;
  align-items: center;
  gap: 1.25rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid rgb(var(--color-base-border) / 0.6);
  transition: background 0.2s ease;
  position: relative;
}
/* faint guide lines, one per level, running the full height of the row */
.rt-row::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: -1px;
  left: calc(0.75rem + 0.72rem);
  width: calc(var(--d) * var(--rt-step));
  background-image: repeating-linear-gradient(
    90deg,
    rgb(var(--color-base-border)) 0 1px,
    transparent 1px var(--rt-step)
  );
  pointer-events: none;
}
.rt-row:hover {
  background: rgb(var(--fl-teal-soft) / 0.55);
}
.rt-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
  padding-left: calc(var(--d) * var(--rt-step));
}
.rt-chev {
  flex: none;
  width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid rgb(var(--color-base-border));
  background: rgb(var(--fl-card));
  color: rgb(var(--fl-ink));
  transition: background 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
}
.rt-chev svg {
  width: 0.85rem;
  height: 0.85rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.25s ease;
}
.rt-chev:hover {
  border-color: rgb(var(--fl-teal));
}
.rt-chev.open {
  background: rgb(var(--fl-gold));
  border-color: rgb(var(--fl-gold));
  color: #111;
}
.rt-chev.open svg {
  transform: rotate(90deg);
}
.rt-chev.busy svg {
  animation: rt-spin 0.8s linear infinite;
}
@keyframes rt-spin {
  to {
    transform: rotate(360deg);
  }
}
.rt-dot {
  flex: none;
  width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.rt-dot::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgb(var(--fl-teal));
}
.rt-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  font-weight: 600;
  color: rgb(var(--fl-ink));
  background: none;
  border: 0;
  padding: 0;
  background-image: linear-gradient(rgb(var(--fl-gold)), rgb(var(--fl-gold)));
  background-size: 0 2px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size 0.25s ease;
}
.rt-name:hover {
  background-size: 100% 2px;
}
.rt-name.italic {
  font-style: italic;
  font-weight: 500;
}
.rt-rank {
  flex: none;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgb(var(--color-base-soft));
}
.rt-bar-track {
  height: 6px;
  border-radius: 999px;
  background: rgb(var(--fl-sand));
  overflow: hidden;
}
.rt-bar {
  display: block;
  height: 100%;
  border-radius: 999px;
  background: rgb(var(--fl-gold));
  transition: width 0.6s cubic-bezier(0.2, 0.7, 0.2, 1);
}
.rt-count {
  text-align: right;
  font-size: 0.85rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: rgb(var(--fl-ink));
}
.rt-count small {
  margin-left: 0.35rem;
  font-size: 0.68rem;
  font-weight: 500;
  color: rgb(var(--color-base-soft));
}
/* the upper ranks read as headings */
.rt-class > .rt-row .rt-name {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}
.rt-order > .rt-row .rt-name {
  font-size: 1.05rem;
  font-weight: 700;
}
.rt-class > .rt-row .rt-bar,
.rt-order > .rt-row .rt-bar {
  background: rgb(var(--fl-ink));
}
.rt-class > .rt-row .rt-bar-track,
.rt-order > .rt-row .rt-bar-track {
  height: 8px;
}
.rt-node.open > .rt-row {
  background: rgb(var(--fl-gold) / 0.08);
}
.rt-more {
  padding: 0.55rem 0.75rem 0.7rem calc(0.75rem + var(--d) * var(--rt-step) + 2.1rem);
  border-bottom: 1px solid rgb(var(--color-base-border) / 0.6);
}
.rt-more button {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgb(var(--fl-teal-deep));
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  border: 1px solid rgb(var(--color-base-border));
  background: rgb(var(--fl-card));
  transition: border-color 0.2s ease;
}
.rt-more button:hover {
  border-color: rgb(var(--fl-gold));
}
@media (max-width: 640px) {
  .rt {
    --rt-step: 0.9rem;
  }
  .rt-row {
    grid-template-columns: minmax(0, 1fr) 4.5rem;
    gap: 0.5rem;
    padding: 0.5rem 0.25rem;
  }
  .rt-bar-track,
  .rt-rank,
  .rt-count small {
    display: none;
  }
}
</style>

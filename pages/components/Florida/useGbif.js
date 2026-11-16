// Live numbers for the UCFC pages, from the UCFC dataset on GBIF.
// GBIF's occurrence search returns counts ("facets") for the whole collection in one
// call, so the pages need no server and stay current with each GBIF publication.
export const DATASET_KEY = '262f8270-f9c2-4bc6-a562-8ed71c0790e6'
export const FLORIDA_GID = 'USA.10_1'
const API = 'https://api.gbif.org/v1'

// UCF Orlando main campus and arboretum (approximate box)
export const CAMPUS = { lat: '28.585,28.612', lon: '-81.215,-81.18' }

const memo = new Map()

function cacheGet(key) {
  if (memo.has(key)) return memo.get(key)
  try {
    const raw = sessionStorage.getItem('ucfc2:' + key)
    if (raw) return JSON.parse(raw)
  } catch {
    // storage blocked
  }
  return null
}
function cacheSet(key, value) {
  memo.set(key, value)
  try {
    sessionStorage.setItem('ucfc2:' + key, JSON.stringify(value))
  } catch {
    // full or blocked: memory cache only
  }
}

/**
 * Counts for the UCFC records matching `filters`.
 *   facets({ stateProvince: 'Florida' }, ['familyKey'], 10)
 * → { count, familyKey: [{ key, count }] }
 */
export async function facets(filters = {}, fields = [], limit = 10) {
  const params = new URLSearchParams({ datasetKey: DATASET_KEY, limit: '0', facetLimit: String(limit) })
  Object.entries(filters).forEach(([k, v]) => v != null && v !== '' && params.append(k, v))
  fields.forEach((f) => params.append('facet', f))
  const key = params.toString()
  const hit = cacheGet(key)
  if (hit) return hit
  const res = await fetch(`${API}/occurrence/search?${key}`)
  if (!res.ok) throw new Error('GBIF ' + res.status)
  const data = await res.json()
  const out = { count: data.count }
  // GBIF names facet fields like GADM_LEVEL_2_GID; match them loosely
  const squash = (s) => String(s).replace(/_/g, '').toLowerCase()
  const byField = Object.fromEntries((data.facets || []).map((f) => [squash(f.field), f.counts]))
  fields.forEach((f) => {
    out[f] = (byField[squash(f)] || []).map((c) => ({ key: c.name, count: c.count }))
  })
  cacheSet(key, out)
  return out
}

/** Scientific / vernacular names for GBIF taxon keys (cached). */
export async function names(keys = []) {
  const todo = keys.filter((k) => !cacheGet('sp:' + k))
  await Promise.all(
    todo.map(async (k) => {
      try {
        const r = await fetch(`${API}/species/${k}`)
        const s = await r.json()
        cacheSet('sp:' + k, {
          name: s.canonicalName || s.scientificName || String(k),
          rank: s.rank,
          family: s.family || '',
          order: s.order || ''
        })
      } catch {
        cacheSet('sp:' + k, { name: String(k) })
      }
    })
  )
  return Object.fromEntries(keys.map((k) => [k, cacheGet('sp:' + k)]))
}

/** Facet + names in one go: [{ key, count, name, family, order }] */
export async function topTaxa(filters, field, limit = 10) {
  const data = await facets(filters, [field], limit)
  const list = data[field] || []
  const nm = await names(list.map((x) => x.key))
  return { count: data.count, items: list.map((x) => ({ ...x, ...nm[x.key] })) }
}

/** Link to the matching UCFC records on GBIF */
export function gbifLink(filters = {}) {
  const map = {
    taxonKey: 'taxon_key',
    stateProvince: 'state_province',
    gadmLevel2Gid: 'gadm_gid',
    month: 'month',
    decimalLatitude: 'decimal_latitude',
    decimalLongitude: 'decimal_longitude',
    year: 'year',
    recordedBy: 'recorded_by'
  }
  const p = new URLSearchParams({ dataset_key: DATASET_KEY })
  Object.entries(filters).forEach(([k, v]) => v != null && p.append(map[k] || k, v))
  return `https://www.gbif.org/occurrence/search?${p}`
}

export const fmt = (n) => Number(n || 0).toLocaleString('en-US')

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Day of the year (1–366) for a date */
export function dayOfYear(d = new Date()) {
  const start = Date.UTC(d.getFullYear(), 0, 0)
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - start) / 864e5)
}

/** Specimen search in the UCFC dataset: results, total and facet counts */
export async function searchOccurrences(filters = {}, { offset = 0, limit = 20, facetFields = [] } = {}) {
  const params = new URLSearchParams({ datasetKey: DATASET_KEY, limit: String(limit), offset: String(offset) })
  Object.entries(filters).forEach(([k, v]) => v != null && v !== '' && params.append(k, v))
  facetFields.forEach((f) => params.append('facet', f))
  if (facetFields.length) params.append('facetLimit', '8')
  const res = await fetch(`${API}/occurrence/search?${params}`)
  if (!res.ok) throw new Error('GBIF ' + res.status)
  const data = await res.json()
  const squash = (s) => String(s).replace(/_/g, '').toLowerCase()
  const fc = Object.fromEntries((data.facets || []).map((f) => [squash(f.field), f.counts]))
  return {
    count: data.count,
    results: data.results || [],
    facets: Object.fromEntries(facetFields.map((f) => [f, (fc[squash(f)] || []).map((c) => ({ key: c.name, count: c.count }))]))
  }
}

/** Taxon names as you type (GBIF backbone) */
export async function suggestTaxa(q) {
  if (!q || q.length < 2) return []
  const res = await fetch(
    `${API}/species/suggest?datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c&limit=8&q=${encodeURIComponent(q)}`
  )
  if (!res.ok) return []
  return (await res.json()).map((s) => ({ key: s.key, name: s.canonicalName || s.scientificName, rank: s.rank, family: s.family || '' }))
}

/** The UCFC dataset record on GBIF (citation, DOI) */
export async function datasetInfo() {
  const hit = cacheGet('dataset')
  if (hit) return hit
  const res = await fetch(`${API}/dataset/${DATASET_KEY}`)
  const d = await res.json()
  const out = { citation: d.citation?.text || '', doi: d.doi || '', title: d.title || '' }
  cacheSet('dataset', out)
  return out
}

/** Find the TaxonPages page (OTU) for a name; returns its id or null */
export async function findOtu(makeAPIRequest, name) {
  const plain = (s) =>
    String(s)
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/✓/g, '')
      .trim()
  try {
    const { data } = await makeAPIRequest.get('/otus/autocomplete', { params: { term: name, having_taxon_name_only: true } })
    const hit = (data || []).find((o) => plain(o.label) === name) || (data || [])[0]
    return hit ? hit.otu_valid_id || hit.id : null
  } catch {
    return null
  }
}

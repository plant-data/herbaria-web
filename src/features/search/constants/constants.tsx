import { BASE_API_URL } from '@/config'

const FLORITALY_URL = 'https://dryades.units.it/floritaly/index.php?procedure=taxon_page&tipo=all&id='
const MIN_YEAR = 1800
const MAX_YEAR = new Date().getFullYear()

const MONTHS = [
  { id: 1, value: 'months.january' },
  { id: 2, value: 'months.february' },
  { id: 3, value: 'months.march' },
  { id: 4, value: 'months.april' },
  { id: 5, value: 'months.may' },
  { id: 6, value: 'months.june' },
  { id: 7, value: 'months.july' },
  { id: 8, value: 'months.august' },
  { id: 9, value: 'months.september' },
  { id: 10, value: 'months.october' },
  { id: 11, value: 'months.november' },
  { id: 12, value: 'months.december' },
]

const HERBARIA = [
  { id: 'PI', value: 'herbaria.pi' },
  { id: 'HCI', value: 'herbaria.hci' },
  { id: 'TSB', value: 'herbaria.tsb' },
]

const MAP_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      minzoom: 0,
      maxzoom: 22, // Or your preferred max zoom
    },
  ],
}

const ZOOM = 5
const BBOX: [number, number, number, number] = [5, 20, 30, 50]

const SKIP = 0

const SEARCH_CONFIG = {
  data: {
    url: `${BASE_API_URL}occurrences/search`,
    key: 'specimens-data',
  },
  map: {
    url: `${BASE_API_URL}map/clusters`,
    key: 'specimens-map',
  },
  graph: {
    url: `${BASE_API_URL}group/search`,
    key: 'specimens-graph',
  },
  point: {
    url: `${BASE_API_URL}occurrences/search`,
    key: 'point-data',
  },
} as const

const COMMON_QUERY_OPTIONS = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  retry: false,
  staleTime: 24 * 60 * 60 * 1000,
  gcTime: 24 * 60 * 60 * 1000,
  placeholderData: (previousData: any) => previousData,
}

export {
  FLORITALY_URL,
  MIN_YEAR,
  MAX_YEAR,
  MONTHS,
  HERBARIA,
  MAP_STYLE,
  ZOOM,
  BBOX,
  SKIP,
  SEARCH_CONFIG,
  COMMON_QUERY_OPTIONS,
}

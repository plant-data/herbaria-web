const MIN_YEAR = 1800;
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
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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

export {MIN_YEAR, MAX_YEAR, MONTHS, MAP_STYLE};

export const HERBARIA_CONFIG = [
  {
    id: 'RO',
    // The local backend scopes a collection by integer dataset_id (no public
    // name->id endpoint), so the id is carried here. RO = dataset 3.
    datasetId: 3,
    translationKey: 'herbaria.ro',
    image: 'images/pi.png',
    description: 'herbaria-pages.ro.home.hero.short-description',
    badgeLabel: 'Herbarium RO',
    homeImages: [
      'https://plantdataresources.it/images/Erbari/2025/04/16/CP2/CP2_20250416_BATCH_0001/JPG/RO-00481468.jpg',
      'https://plantdataresources.it/images/Erbari/2025/04/15/CP2/CP2_20250415_BATCH_0001/JPG/RO-00439863.jpg',
      'https://plantdataresources.it/images/Erbari/2025/03/25/CP1/CP1_20250325_BATCH_0001/JPG/RO-00291223.jpg',
    ],
    ringColor: 'oklch(0.6 0.15 240)', // blue
    hero: {
      badge: 'Herbarium RO',
      title: 'herbaria-pages.ro.home.hero.title',
      description: 'herbaria-pages.ro.home.hero.description',
      images: [
        'https://plantdataresources.it/images/Erbari/2025/04/16/CP2/CP2_20250416_BATCH_0001/JPG/RO-00481468.jpg',
        'https://plantdataresources.it/images/Erbari/2025/04/15/CP2/CP2_20250415_BATCH_0001/JPG/RO-00439863.jpg',
        'https://plantdataresources.it/images/Erbari/2025/03/25/CP1/CP1_20250325_BATCH_0001/JPG/RO-00291223.jpg',
      ],
    },
    stats: [
      {
        label: 'herbaria-pages.ro.home.stats.specimens',
        value: '481,675',
      },
      {
        label: 'herbaria-pages.ro.home.stats.georeferenced',
        value: '~100%',
      },
      {
        label: 'herbaria-pages.ro.home.stats.years',
        value: '200+',
      },
    ],
    sections: [
      {
        badge: 'herbaria-pages.ro.home.section-1.badge',
        image: '',
        title: 'herbaria-pages.ro.home.section-1.title',
        description: 'herbaria-pages.ro.home.section-1.description',
      },
      {
        badge: 'herbaria-pages.ro.home.section-2.badge',
        image: 'images/herb-imgs/pi/pi-map.png',
        title: 'herbaria-pages.ro.home.section-2.title',
        description: 'herbaria-pages.ro.home.section-2.description',
      },
      {
        badge: 'herbaria-pages.ro.home.section-3.badge',
        image: 'images/herb-imgs/pi/pi-time.png',
        title: 'herbaria-pages.ro.home.section-3.title',
        description: 'herbaria-pages.ro.home.section-3.description',
      },
    ],
  },
  {
    id: 'SIENA-HUS',
    // SIENA-HUS = dataset 2.
    datasetId: 2,
    translationKey: 'herbaria.siena-hus',
    image: 'images/fi.jpg',
    description: 'herbaria-pages.siena-hus.home.hero.short-description',
    badgeLabel: 'Herbarium SIENA-HUS',
    homeImages: [
      'https://plantdataresources.it/images/Erbari/2025/12/03/CP1/CP1_20251203_SIENA_BATCH_0001/JPG/SIENA-HUS-094230.jpg',
      'https://plantdataresources.it/images/Erbari/2025/12/04/CP2/CP2_20251204_SIENA_BATCH_0001/JPG/SIENA-HUS-090450.jpg',
      'https://plantdataresources.it/images/Erbari/2025/12/01/CP2/CP2_20251201_SIENA_BATCH_0001/JPG/SIENA-HUS-079178.jpg',
    ],
    ringColor: 'oklch(0.6 0.2541 175.76)',
    hero: {
      badge: 'herbaria-pages.siena-hus.home.hero.badge',
      title: 'herbaria-pages.siena-hus.home.hero.title',
      description: 'herbaria-pages.siena-hus.home.hero.description',
      images: [
        'https://plantdataresources.it/images/Erbari/2025/12/03/CP1/CP1_20251203_SIENA_BATCH_0001/JPG/SIENA-HUS-094230.jpg',
        'https://plantdataresources.it/images/Erbari/2025/12/04/CP2/CP2_20251204_SIENA_BATCH_0001/JPG/SIENA-HUS-090450.jpg',
        'https://plantdataresources.it/images/Erbari/2025/12/01/CP2/CP2_20251201_SIENA_BATCH_0001/JPG/SIENA-HUS-079178.jpg',
      ],
    },
    stats: [
      {
        label: 'herbaria-pages.ro.home.stats.specimens',
        value: '55,672',
      },
      {
        label: 'herbaria-pages.ro.home.stats.georeferenced',
        value: '~100%',
      },
      {
        label: 'herbaria-pages.ro.home.stats.years',
        value: '200+',
      },
    ],
    sections: [
      {
        badge: 'herbaria-pages.siena-hus.home.section-1.badge',
        image: '',
        title: 'herbaria-pages.siena-hus.home.section-1.title',
        description: 'herbaria-pages.siena-hus.home.section-1.description',
      },
      {
        badge: 'herbaria-pages.siena-hus.home.section-2.badge',
        image: 'images/herb-imgs/fi-hci/fi-map.png',
        title: 'herbaria-pages.siena-hus.home.section-2.title',
        description: 'herbaria-pages.siena-hus.home.section-2.description',
      },
      {
        badge: 'herbaria-pages.siena-hus.home.section-3.badge',
        image: 'images/herb-imgs/fi-hci/fi-time.png',
        title: 'herbaria-pages.siena-hus.home.section-3.title',
        description: 'herbaria-pages.siena-hus.home.section-3.description',
      },
    ],
  },
] as const

/**
 * The integer dataset_id the local backend scopes by, for a collection code
 * (the `$herbariaId` URL segment / stored institutionCode). Undefined for 'all'
 * or an unknown code — meaning "no dataset filter".
 */
export function datasetIdForCode(code: string): number | undefined {
  return HERBARIA_CONFIG.find((herbarium) => herbarium.id === code)?.datasetId
}

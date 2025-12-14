export const HERBARIA_CONFIG = [
  {
    id: 'PI',
    translationKey: 'herbaria.pi',
    image: 'images/pi.png',
    description: 'herbaria-pages.pi.home.hero.short-description',
    badgeLabel: 'Herbarium PI',
    homeImages: [
      'public/images/herb-imgs/pi/1619743.jpg',
      'public/images/herb-imgs/pi/2139006.jpg',
      'https://object.jacq.org/europeana/PI/2204769.jpg',
    ],
    ringColor: 'oklch(0.6 0.15 240)', // blue
    hero: {
      badge: 'Herbarium PI',
      title: 'herbaria-pages.pi.home.hero.title',
      description: 'herbaria-pages.pi.home.hero.description',
      images: [
        'public/images/herb-imgs/pi/1619743.jpg',
        'public/images/herb-imgs/pi/2139006.jpg',
        'https://object.jacq.org/europeana/PI/2204769.jpg',
      ],
    },
    sections: [
      {
        badge: 'herbaria-pages.pi.home.section-1.badge',
        image: '',
        title: 'herbaria-pages.pi.home.section-1.title',
        description: 'herbaria-pages.pi.home.section-1.description',
      },
      {
        badge: 'herbaria-pages.pi.home.section-2.badge',
        image: 'images/herb-imgs/pi-map.png',
        title: 'herbaria-pages.pi.home.section-2.title',
        description: 'herbaria-pages.pi.home.section-2.description',
      },
      {
        badge: 'herbaria-pages.pi.home.section-3.badge',
        image: 'images/herb-imgs/pi-time.png',
        title: 'herbaria-pages.pi.home.section-3.title',
        description: 'herbaria-pages.pi.home.section-3.description',
      },
    ],
  },
  /* {
    id: 'TSB',
    translationKey: 'herbaria.tsb',
    image: 'images/tsb.png',
    description: "Discover botanical specimens from the Trieste Science Museum's specialized collection",
    badgeLabel: 'Herbarium TSB',
    homeImages: [
      'https://object.jacq.org/europeana/PI/1310678.jpg',
      'https://object.jacq.org/europeana/PI/2145582.jpg',
      'https://object.jacq.org/europeana/PI/2204769.jpg',
    ],
    ringColor: 'oklch(0.7 0.2 50)', // orange
  }, */
  {
    id: 'FI-HCI',
    translationKey: 'herbaria.fi-hci',
    image: 'images/fi.jpg',
    description: 'herbaria-pages.fi-hci.home.hero.short-description',
    badgeLabel: 'Herbarium FI-HCI',
    homeImages: [
      'public/images/herb-imgs/fi-hci/FI-HCI-00230552.jpg',
      'public/images/herb-imgs/fi-hci/FI-HCI-00308337.jpg',
      'public/images/herb-imgs/fi-hci/FI-HCI-00035529.jpg',
    ],
    ringColor: 'oklch(0.6 0.2541 175.76)',
    hero: {
      badge: 'herbaria-pages.fi-hci.home.hero.badge',
      title: 'herbaria-pages.fi-hci.home.hero.title',
      description: 'herbaria-pages.fi-hci.home.hero.description',
      images: [
        'public/images/herb-imgs/fi-hci/FI-HCI-00230552.jpg',
        'public/images/herb-imgs/fi-hci/FI-HCI-00308337.jpg',
        'public/images/herb-imgs/fi-hci/FI-HCI-00035529.jpg',
      ],
    },
    sections: [
      {
        badge: 'herbaria-pages.fi-hci.home.section-1.badge',
        image: '',
        title: 'herbaria-pages.fi-hci.home.section-1.title',
        description: 'herbaria-pages.fi-hci.home.section-1.description',
      },
      {
        badge: 'herbaria-pages.fi-hci.home.section-2.badge',
        image: 'images/herb-imgs/fi-map.png',
        title: 'herbaria-pages.fi-hci.home.section-2.title',
        description: 'herbaria-pages.fi-hci.home.section-2.description',
      },
      {
        badge: 'herbaria-pages.fi-hci.home.section-3.badge',
        image: 'images/herb-imgs/fi-time.png',
        title: 'herbaria-pages.fi-hci.home.section-3.title',
        description: 'herbaria-pages.fi-hci.home.section-3.description',
      },
    ],
  },
] as const

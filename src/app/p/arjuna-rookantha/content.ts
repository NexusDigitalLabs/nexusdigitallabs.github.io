/** Unlisted artist portfolio data. Do not import from site catalogs or sitemap. */

export const ARTIST = {
  name: 'Arjuna Rookantha',
  studioName: 'Arjuna Rookantha Studios',
  tagline: 'Singer | Songwriter | Music Composer | Vocal Coach',
  location: 'Sri Lanka',
  portraitUrl: 'https://i.ytimg.com/vi/44XXpDb13lA/maxresdefault.jpg',
  bio: [
    'Arjuna Rookantha is a Sri Lankan singer-songwriter, composer, and vocal coach whose contemporary Sinhala music blends storytelling with expressive, experimental sound.',
    'Raised in a family of musicians, he first performed with a band at age 13 and later reached a national audience as the runner-up of Sirasa Super Star Season 3. Alongside original releases and live performances, he helps vocal students develop authentic voices rooted in emotion and storytelling.',
  ],
} as const;

export const CONTACT = {
  phoneDisplay: '+94 77 706 9526',
  whatsappUrl:
    'https://wa.me/94777069526?text=Hello%20Arjuna%20Rookantha%20Studios%2C%20I%20would%20like%20to%20make%20a%20booking%20inquiry.',
} as const;

export const SOCIAL_LINKS = [
  {
    key: 'youtube',
    label: 'YouTube',
    href: 'https://www.youtube.com/@ArjunaRookantha',
  },
  {
    key: 'spotify',
    label: 'Spotify',
    href: 'https://open.spotify.com/artist/2mvjnhBEUmrPuyghtU0Mhw',
  },
  {
    key: 'apple-music',
    label: 'Apple Music',
    href: 'https://music.apple.com/us/artist/arjuna-rookantha/659104605',
  },
  {
    key: 'facebook',
    label: 'Facebook',
    href: 'https://www.facebook.com/arjunarookanthaofficial/',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    href: 'https://www.instagram.com/arjuna_rookantha/',
  },
] as const;

export const STATS = [
  { value: '10+', label: 'Years of music' },
  { value: '7', label: 'Featured tracks' },
  { value: 'Live', label: 'Events & coaching' },
] as const;

export type Track = {
  title: string;
  subtitle: string;
  /** Omitted when no release year has been verified. */
  year?: string;
  /** Verified YouTube watch URL, when one exists. */
  watchUrl?: string;
};

export const TRACKS: Track[] = [
  {
    title: 'Roo Chaaya',
    subtitle: 'Latest single',
    year: '2025',
  },
  {
    title: 'Nanaprakarai',
    subtitle: 'feat. Hirushi',
    year: '2024',
  },
  {
    title: 'Prathirawe',
    subtitle: 'ප්‍රතිරාවේ',
    year: '2018',
    watchUrl: 'https://www.youtube.com/watch?v=xMYV1tYE8OQ',
  },
  {
    title: 'Himidiri Yaame',
    subtitle: 'හිමිදිරි යාමේ',
    year: '2014',
  },
  {
    title: 'Sodi Lamahasa',
    subtitle: 'සෝඩි ළමාහස',
    year: '2012',
    watchUrl: 'https://www.youtube.com/watch?v=44XXpDb13lA',
  },
  {
    title: 'Sarpaya',
    subtitle: 'සර්පයා',
  },
  {
    title: 'Saminde',
    subtitle: 'සමින්දේ',
  },
];

export type FeaturedVideo = {
  title: string;
  note: string;
  videoId: string;
  watchUrl: string;
  /** Owner-controlled: false when YouTube blocks off-site playback for this video. */
  embeddable: boolean;
};

export const FEATURED_VIDEOS: FeaturedVideo[] = [
  {
    title: 'Sodi Lamahasa',
    note: 'Official music video',
    videoId: '44XXpDb13lA',
    watchUrl: 'https://www.youtube.com/watch?v=44XXpDb13lA',
    embeddable: true,
  },
  {
    title: 'Prathirawe',
    note: 'Official audio',
    videoId: 'xMYV1tYE8OQ',
    watchUrl: 'https://www.youtube.com/watch?v=xMYV1tYE8OQ',
    embeddable: false,
  },
];

export const GALLERY_SLOTS = [
  {
    title: 'Live Performances',
    description: 'On stage with band and acoustic arrangements.',
  },
  {
    title: 'Studio Sessions',
    description: 'Writing, recording, and shaping original music.',
  },
  {
    title: 'Artist Portraits',
    description: 'Promotional photography and creative direction.',
  },
] as const;

export const SERVICES = [
  {
    title: 'Music Composition & Production',
    description:
      'Original music shaped from early ideas through arrangement and production.',
  },
  {
    title: 'Vocal Training & Coaching',
    description:
      'Personal guidance focused on technique, confidence, authenticity, and storytelling.',
  },
  {
    title: 'Live Band & Acoustic Performances',
    description:
      'Tailored musical performances for concerts, private events, and special occasions.',
  },
  {
    title: 'Jingles & Commercial Music',
    description:
      'Distinctive compositions and vocal production for brands and creative campaigns.',
  },
] as const;

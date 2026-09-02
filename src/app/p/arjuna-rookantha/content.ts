/** Unlisted artist portfolio data. Do not import from site catalogs or sitemap. */

export const ARTIST = {
  name: 'Arjuna Rookantha',
  studioName: 'Arjuna Rookantha Studios',
  tagline: 'Singer | Songwriter | Music Composer | Vocal Coach',
  location: 'Sri Lanka',
  /** Wide live shot behind the hero. */
  coverUrl: '/p/arjuna-rookantha/cover.jpg',
  /** Studio headshot used beside the biography. */
  portraitUrl: '/p/arjuna-rookantha/portrait.jpg',
  bio: [
    'Arjuna Rookantha is a Sri Lankan singer-songwriter, composer, and vocal coach whose contemporary Sinhala music blends storytelling with expressive, experimental sound.',
    'Raised in a family of musicians, he first performed with a band at age 13 and later reached a national audience as the runner-up of Sirasa Super Star Season 3. Alongside original releases and live performances, he helps vocal students develop authentic voices rooted in emotion and storytelling.',
  ],
} as const;

export const CONTACT = {
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
  { value: '6', label: 'Official releases' },
  { value: 'Live', label: 'Events & coaching' },
] as const;

export type Track = {
  title: string;
  subtitle: string;
  year: string;
  genre: string;
  appleMusicUrl: string;
  artworkUrl: string;
  /** Verified YouTube watch URL, when one exists. */
  watchUrl?: string;
};

export const TRACKS: Track[] = [
  {
    title: 'Roo Chaaya',
    subtitle: 'with Hirushi',
    year: '2025',
    genre: 'Pop',
    appleMusicUrl:
      'https://music.apple.com/us/album/roo-chaaya/1801554738?i=1801554739',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/d3/4d/39/d34d3934-0c29-6804-f730-a06b6eea793b/764656209681_cover.jpg/800x800bb.jpg',
  },
  {
    title: 'Nanaprakarai',
    subtitle: 'feat. Hirushi',
    year: '2024',
    genre: 'Experimental',
    appleMusicUrl:
      'https://music.apple.com/us/album/nanaprakarai-feat-hirushi/1775458667?i=1775458668',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/89/3f/23/893f23ae-43db-d8ca-0f0f-1caa176483e8/797885483843_cover.jpg/800x800bb.jpg',
  },
  {
    title: 'Prathiraawe',
    subtitle: 'ප්‍රතිරාවේ',
    year: '2018',
    genre: 'Classical',
    appleMusicUrl:
      'https://music.apple.com/us/album/prathiraawe/1690405575?i=1690405996',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/84/3e/16/843e1645-46d2-7d66-ae11-1cf3f17c9e55/617513600100_cover.jpg/800x800bb.jpg',
    watchUrl: 'https://www.youtube.com/watch?v=xMYV1tYE8OQ',
  },
  {
    title: 'Himidiri Yaame',
    subtitle: 'හිමිදිරි යාමේ',
    year: '2014',
    genre: 'Classical',
    appleMusicUrl:
      'https://music.apple.com/us/album/himidiri-yaame/1699629931?i=1699629932',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/9b/40/7d/9b407d1e-b71b-54d1-8d5a-ad2d0431698e/617513708349_cover.jpg/800x800bb.jpg',
  },
  {
    title: 'Kiri Sudu Sele',
    subtitle: 'කිරි සුදු සේලේ',
    year: '2012',
    genre: 'Pop',
    appleMusicUrl:
      'https://music.apple.com/us/album/kiri-sudu-sele/662777245?i=662777363',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music4/v4/6f/dc/58/6fdc58ce-a1a5-6c4c-5e15-4a8fa589e7e1/887396159655.jpg/800x800bb.jpg',
  },
  {
    title: 'Sodi Lama Hasa',
    subtitle: 'සෝඩි ළමාහස',
    year: '2012',
    genre: 'Pop',
    appleMusicUrl:
      'https://music.apple.com/us/album/sodi-lama-hasa/660025163?i=660025165',
    artworkUrl:
      'https://is1-ssl.mzstatic.com/image/thumb/Music/v4/07/89/f9/0789f946-c811-c711-5583-fcb7da7f3f3a/887396163669.jpg/800x800bb.jpg',
    watchUrl: 'https://www.youtube.com/watch?v=44XXpDb13lA',
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
    imageUrl: '/p/arjuna-rookantha/live.jpg',
  },
  {
    title: 'Studio Sessions',
    description: 'Writing, recording, and shaping original music.',
    imageUrl: '/p/arjuna-rookantha/studio.jpg',
  },
  {
    title: 'Artist Portraits',
    description: 'Promotional photography and creative direction.',
    imageUrl: '/p/arjuna-rookantha/portrait.jpg',
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

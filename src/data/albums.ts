export interface AlbumMeta {
  name: string;
  year: number;
  themeColor: string; // Tailwind background / gradient
  accentColor: string;
  badgeColor: string;
}

export const ALBUMS: Record<string, AlbumMeta> = {
  'Jay': {
    name: 'Jay',
    year: 2000,
    themeColor: 'from-amber-900 via-stone-800 to-black',
    accentColor: '#d4af37',
    badgeColor: 'bg-amber-900/60 text-amber-300 border-amber-700',
  },
  '范特西': {
    name: '范特西',
    year: 2001,
    themeColor: 'from-red-950 via-zinc-900 to-black',
    accentColor: '#e53e3e',
    badgeColor: 'bg-red-950/60 text-red-300 border-red-700',
  },
  '八度空間': {
    name: '八度空間',
    year: 2002,
    themeColor: 'from-slate-900 via-neutral-900 to-black',
    accentColor: '#94a3b8',
    badgeColor: 'bg-slate-900/60 text-slate-300 border-slate-700',
  },
  '葉惠美': {
    name: '葉惠美',
    year: 2003,
    themeColor: 'from-stone-900 via-orange-950 to-black',
    accentColor: '#f59e0b',
    badgeColor: 'bg-orange-950/60 text-orange-300 border-orange-700',
  },
  '七里香': {
    name: '七里香',
    year: 2004,
    themeColor: 'from-emerald-950 via-teal-950 to-black',
    accentColor: '#10b981',
    badgeColor: 'bg-emerald-950/60 text-emerald-300 border-emerald-700',
  },
  '11月的蕭邦': {
    name: '11月的蕭邦',
    year: 2005,
    themeColor: 'from-amber-950 via-yellow-950 to-black',
    accentColor: '#fbbf24',
    badgeColor: 'bg-amber-950/60 text-amber-300 border-amber-700',
  },
  '依然范特西': {
    name: '依然范特西',
    year: 2006,
    themeColor: 'from-rose-950 via-purple-950 to-black',
    accentColor: '#fb7185',
    badgeColor: 'bg-rose-950/60 text-rose-300 border-rose-700',
  },
  '我很忙': {
    name: '我很忙',
    year: 2007,
    themeColor: 'from-yellow-950 via-amber-900 to-black',
    accentColor: '#f59e0b',
    badgeColor: 'bg-yellow-950/60 text-yellow-300 border-yellow-700',
  },
  '魔杰座': {
    name: '魔杰座',
    year: 2008,
    themeColor: 'from-indigo-950 via-violet-950 to-black',
    accentColor: '#818cf8',
    badgeColor: 'bg-indigo-950/60 text-indigo-300 border-indigo-700',
  },
  '跨時代': {
    name: '跨時代',
    year: 2010,
    themeColor: 'from-purple-950 via-stone-950 to-black',
    accentColor: '#c084fc',
    badgeColor: 'bg-purple-950/60 text-purple-300 border-purple-700',
  },
  '驚嘆號': {
    name: '驚嘆號',
    year: 2011,
    themeColor: 'from-cyan-950 via-sky-950 to-black',
    accentColor: '#38bdf8',
    badgeColor: 'bg-cyan-950/60 text-cyan-300 border-cyan-700',
  },
  '12新作': {
    name: '12新作',
    year: 2012,
    themeColor: 'from-yellow-900 via-stone-900 to-black',
    accentColor: '#eab308',
    badgeColor: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
  },
  '哎呦，不錯哦': {
    name: '哎呦，不錯哦',
    year: 2014,
    themeColor: 'from-neutral-900 via-stone-950 to-black',
    accentColor: '#d4af37',
    badgeColor: 'bg-neutral-900/60 text-neutral-300 border-neutral-700',
  },
  '周杰倫的床邊故事': {
    name: '周杰倫的床邊故事',
    year: 2016,
    themeColor: 'from-blue-950 via-indigo-950 to-black',
    accentColor: '#60a5fa',
    badgeColor: 'bg-blue-950/60 text-blue-300 border-blue-700',
  },
  '最偉大的作品': {
    name: '最偉大的作品',
    year: 2022,
    themeColor: 'from-amber-950 via-stone-900 to-black',
    accentColor: '#d4af37',
    badgeColor: 'bg-amber-950/60 text-amber-200 border-amber-600',
  },
  '太陽之子': {
    name: '太陽之子',
    year: 2026,
    themeColor: 'from-orange-950 via-red-950 to-black',
    accentColor: '#f97316',
    badgeColor: 'bg-orange-950/60 text-orange-300 border-orange-700',
  },
};

export const ALBUM_LIST: AlbumMeta[] = Object.values(ALBUMS).sort((a, b) => a.year - b.year);

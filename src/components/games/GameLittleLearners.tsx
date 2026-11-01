'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ACTIVITIES,
  COLORS,
  LETTERS,
  cheer,
  generateRound,
  levelUpText,
  nextSkill,
  nudge,
  poolSize,
  skillKey,
  stageInfo,
  type Activity,
  type Choice,
  type Level,
  type Round,
  type Shape,
} from '@/lib/games/little-learners';
import {
  DRAW_ACTIVITIES,
  drawCheer,
  generateDrawRound,
  type DrawActivity,
  type DrawRound,
} from '@/lib/games/little-learners-draw';
import { getBuddy, sometimesWithName, withName, type BuddyKind, type BuddyMood } from '@/lib/games/little-learners-buddy';
import LittleLearnersDraw from './LittleLearnersDraw';
import { BUDDY_CSS, BuddyFace, BuddyWelcome } from './LittleBuddy';

const STORAGE_KEY = 'ndl-little-learners';
/** Muted / no-speech fallback for how long a cheer stays up before the next round. */
const NEXT_ROUND_MS = 1900;
/** Let the chime finish before the voice starts, so they don't talk over each other. */
const SFX_GAP_MS = 420;
/** Short breath after the cheer ends, before the next question. */
const AFTER_CHEER_MS = 450;
/** Some browsers never fire onend; never wait longer than this for a cheer. */
const SPEECH_TIMEOUT_MS = 6000;
const MILESTONE_EVERY = 5;
/** After this many wrong taps in one round, the right answer gently glows. */
const HINT_AFTER = 2;
/** The "try again" message clears itself so it never lingers over the choices. */
const NUDGE_MS = 3000;
/** How long the buddy holds a reaction before going back to bobbing about. */
const MOOD_MS = 1900;

type AnyActivity = Activity | DrawActivity;
const isDraw = (a: AnyActivity): a is DrawActivity => (DRAW_ACTIVITIES as readonly string[]).includes(a);

const ACTIVITY_META: Record<AnyActivity, { title: string; icon: string; bg: string; ink: string }> = {
  numbers: { title: 'Numbers', icon: '123', bg: '#fde68a', ink: '#92400e' },
  letters: { title: 'Letters', icon: 'ABC', bg: '#bfdbfe', ink: '#1e3a8a' },
  shapes: { title: 'Shapes', icon: '🔺', bg: '#fbcfe8', ink: '#9d174d' },
  colors: { title: 'Colours', icon: '🎨', bg: '#bbf7d0', ink: '#166534' },
  counting: { title: 'Counting', icon: '🖐️', bg: '#fed7aa', ink: '#9a3412' },
  matching: { title: 'Matching', icon: '🧩', bg: '#ddd6fe', ink: '#5b21b6' },
  dots: { title: 'Dot to Dot', icon: '1·2·3', bg: '#a5f3fc', ink: '#155e75' },
  lines: { title: 'Lines & Patterns', icon: '〰️', bg: '#c7d2fe', ink: '#3730a3' },
  trace: { title: 'Trace It', icon: '✍️', bg: '#d9f99d', ink: '#3f6212' },
  scribble: { title: 'Colour Inside', icon: '🖍️', bg: '#f5d0fe', ink: '#86198f' },
};

/** Shapes get varied colours so the shape — not the colour — is what the child looks for. */
const SHAPE_FILLS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#eab308'];

/** `name` is null until the welcome screen has been answered (an empty string means skipped). */
/** `skills` holds a score per level + game; it decides how many items are in play (see poolSize). */
type Saved = {
  level: Level;
  muted: boolean;
  stars: number;
  name: string | null;
  buddy: BuddyKind;
  skills: Record<string, number>;
};

function loadSaved(): Saved {
  const fallback: Saved = { level: 'little', muted: false, stars: 0, name: null, buddy: getBuddy(undefined).id, skills: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const p = JSON.parse(raw) as Partial<Saved>;
    return {
      level: p.level === 'big' ? 'big' : 'little',
      muted: p.muted === true,
      stars: Number.isFinite(p.stars) ? Math.max(0, Number(p.stars)) : 0,
      skills: Object.fromEntries(
        Object.entries(p.skills && typeof p.skills === 'object' ? p.skills : {}).filter(
          ([, v]) => Number.isFinite(v) && Number(v) >= 0,
        ),
      ) as Record<string, number>,
      name: typeof p.name === 'string' ? p.name : null,
      buddy: getBuddy(p.buddy).id,
    };
  } catch {
    return fallback;
  }
}

// macOS ships joke/character voices (Zarvox, Bubbles, Fred…) that some browsers list first.
const NOVELTY_VOICES =
  /albert|bad news|bahh|bells|boing|bubbles|cellos|wobble|zarvox|trinoids|whisper|good news|jester|organ|superstar|ralph|fred|junior|kathy|grandma|grandpa|rocko|eddy|reed|sandy|shelley|flo\b/i;

/** Higher = more natural. Neural/online voices (Edge "Natural", Chrome "Google", Apple "Enhanced/Premium") win. */
function scoreVoice(v: Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'localService'>): number {
  if (!/^en\b|^en[-_]/i.test(v.lang) || NOVELTY_VOICES.test(v.name)) return -1;
  let score = 0;
  if (/natural|neural|premium|enhanced/i.test(v.name)) score += 50;
  if (/google/i.test(v.name)) score += 30;
  if (/online/i.test(v.name) || v.localService === false) score += 10;
  if (/samantha|ava|allison|susan|serena|karen|moira|tessa|aria|jenny|libby|sonia|zira|emma|ana\b/i.test(v.name)) score += 15;
  if (/en[-_]us/i.test(v.lang)) score += 6;
  else if (/en[-_]gb/i.test(v.lang)) score += 5;
  else if (/en[-_]au/i.test(v.lang)) score += 3;
  return score;
}

let chosenVoice: SpeechSynthesisVoice | null | undefined;
function pickVoice(): SpeechSynthesisVoice | null {
  if (chosenVoice !== undefined) return chosenVoice;
  const voices = window.speechSynthesis.getVoices();
  // Chrome fills the list asynchronously; don't cache an empty answer.
  if (voices.length === 0) return null;
  const best = voices.map((v) => ({ v, s: scoreVoice(v) })).filter((x) => x.s >= 0).sort((a, b) => b.s - a.s)[0];
  chosenVoice = best?.v ?? null;
  return chosenVoice;
}
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    chosenVoice = undefined;
  });
}

function speak(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const voice = pickVoice();
  if (voice) u.voice = voice;
  u.lang = voice?.lang ?? 'en-US';
  // Natural voices sound robotic when pitch-shifted; a slightly slower pace is enough for toddlers.
  u.rate = 0.92;
  u.pitch = 1;
  if (onEnd) {
    u.onend = onEnd;
    u.onerror = onEnd;
  }
  synth.speak(u);
}

let audioCtx: AudioContext | null = null;
function playTones(freqs: number[], type: OscillatorType, step: number, volume: number) {
  try {
    audioCtx ??= new AudioContext();
    const ctx = audioCtx;
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + i * step;
      osc.type = type;
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + step * 1.8);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + step * 2);
    });
  } catch {
    // Audio is a nice-to-have; ignore browsers that block it.
  }
}

const sounds = {
  right: () => playTones([523, 659, 784, 1047], 'sine', 0.1, 0.18),
  // A soft "boop-boop" rather than a buzzer — wrong should never feel scary.
  wrong: () => playTones([392, 330], 'triangle', 0.16, 0.12),
  pop: () => playTones([880], 'sine', 0.06, 0.08),
};

function starPoints(cx: number, cy: number, outer: number, inner: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

function ShapeIcon({ shape, fill }: { shape: Shape; fill: string }) {
  const common = { fill, stroke: 'rgba(0,0,0,0.15)', strokeWidth: 3 };
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      {shape === 'circle' && <circle cx="50" cy="50" r="40" {...common} />}
      {shape === 'square' && <rect x="12" y="12" width="76" height="76" rx="6" {...common} />}
      {shape === 'triangle' && <polygon points="50,10 92,88 8,88" strokeLinejoin="round" {...common} />}
      {shape === 'star' && <polygon points={starPoints(50, 53, 44, 19)} strokeLinejoin="round" {...common} />}
      {shape === 'heart' && (
        <path d="M50 88 C 20 66, 4 46, 17 26 C 29 9, 47 13, 50 30 C 53 13, 71 9, 83 26 C 96 46, 80 66, 50 88 Z" {...common} />
      )}
      {shape === 'rectangle' && <rect x="5" y="27" width="90" height="46" rx="4" {...common} />}
      {shape === 'oval' && <ellipse cx="50" cy="50" rx="45" ry="30" {...common} />}
      {shape === 'diamond' && <polygon points="50,5 90,50 50,95 10,50" strokeLinejoin="round" {...common} />}
    </svg>
  );
}

function ChoiceFace({ round, choice, index }: { round: Round; choice: Choice; index: number }) {
  switch (round.activity) {
    case 'numbers':
    case 'counting':
    case 'letters':
      return <span className="ll-glyph">{choice.id}</span>;
    case 'shapes':
      return (
        <span className="ll-shape">
          <ShapeIcon shape={choice.id as Shape} fill={SHAPE_FILLS[index % SHAPE_FILLS.length]} />
        </span>
      );
    case 'colors':
      return <span className="ll-blob" style={{ background: COLORS[choice.id] }} />;
    case 'matching':
      return <span className="ll-emoji">{choice.id}</span>;
  }
}

function Burst({ big }: { big: boolean }) {
  const pieces = big ? ['⭐', '🎉', '🌟', '🎈', '💖', '✨'] : ['⭐', '✨', '🌟'];
  const count = big ? 18 : 10;
  return (
    <div className="ll-burst" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const angle = (360 / count) * i;
        const dist = (big ? 180 : 120) + (i % 3) * 30;
        return (
          <span
            key={i}
            style={{ ['--a' as string]: `${angle}deg`, ['--d' as string]: `${dist}px`, animationDelay: `${(i % 4) * 40}ms` }}
          >
            {pieces[i % pieces.length]}
          </span>
        );
      })}
    </div>
  );
}

type Feedback = { kind: 'right' | 'wrong' | 'milestone' | 'levelup'; text: string } | null;

/** Each age group has its own look, so it's obvious at a glance which one is on. */
const THEME_DECOR: Record<Level, { label: string; decor: string[] }> = {
  little: { label: '🌼 Little Garden', decor: ['☁️', '🌼', '🦋', '🌷', '🐝'] },
  big: { label: '🦁 Big Jungle', decor: ['🌴', '🦜', '🌿', '🐾', '🍃'] },
};

export default function GameLittleLearners() {
  // Loaded via GameLoader with ssr:false, so localStorage is available on first render.
  const [saved] = useState(loadSaved);
  const [level, setLevel] = useState<Level>(saved.level);
  const [muted, setMuted] = useState(saved.muted);
  const [stars, setStars] = useState(saved.stars);
  const [skills, setSkills] = useState(saved.skills);
  const [name, setName] = useState(saved.name ?? '');
  const [buddyId, setBuddyId] = useState<BuddyKind>(saved.buddy);
  const [askName, setAskName] = useState(saved.name === null);
  const [mood, setMood] = useState<{ mood: BuddyMood; key: number }>({ mood: 'idle', key: 0 });
  const [activity, setActivity] = useState<AnyActivity | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [drawRound, setDrawRound] = useState<DrawRound | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [counted, setCounted] = useState<number[]>([]);
  const [shakeKey, setShakeKey] = useState(0);
  /** Bumped whenever the screen moves on, so late speech callbacks from an old round are ignored. */
  const seq = useRef(0);
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [dockFloating, setDockFloating] = useState(false);
  const dockObserver = useRef<IntersectionObserver | null>(null);
  /**
   * The buddy's home is right under the tiles or board. When that spot is off screen (a tall
   * board on a short phone) the buddy floats at the bottom edge instead, so it is always seen.
   */
  const dockSlotRef = useCallback((node: HTMLDivElement | null) => {
    dockObserver.current?.disconnect();
    dockObserver.current = null;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    dockObserver.current = new IntersectionObserver(([entry]) => setDockFloating(entry.intersectionRatio < 0.95), {
      threshold: [0, 0.5, 0.95, 1],
    });
    dockObserver.current.observe(node);
  }, []);
  const buddy = getBuddy(buddyId);

  useEffect(() => {
    try {
      // Until the welcome screen is answered, keep `name` null so it shows again next visit.
      const savedName = askName && !name ? null : name;
      window.localStorage.setItem(
        STORAGE_KEY, JSON.stringify({ level, muted, stars, name: savedName, buddy: buddyId, skills }),
      );
    } catch {
      // Private mode or blocked storage — progress just won't persist.
    }
  }, [level, muted, stars, name, buddyId, askName, skills]);

  useEffect(
    () => () => {
      seq.current++;
      if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
      if (moodTimer.current) clearTimeout(moodTimer.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
    },
    [],
  );

  /** Speak `text` (optionally after `delay`), then call `then` once the voice is done — or after a fallback when muted. */
  const say = useCallback(
    (text: string, opts: { delay?: number; then?: () => void } = {}) => {
      const id = seq.current;
      const { delay = 0, then } = opts;
      let done = false;
      const finish = () => {
        if (done || seq.current !== id) return;
        done = true;
        if (then) setTimeout(() => seq.current === id && then(), AFTER_CHEER_MS);
      };
      if (muted || !('speechSynthesis' in window)) {
        if (then) setTimeout(() => seq.current === id && then(), NEXT_ROUND_MS);
        return;
      }
      setTimeout(() => {
        if (seq.current !== id) return;
        speak(text, finish);
        if (then) setTimeout(finish, SPEECH_TIMEOUT_MS);
      }, delay);
    },
    [muted],
  );
  const sfx = useCallback(
    (name: keyof typeof sounds) => {
      if (!muted) sounds[name]();
    },
    [muted],
  );

  /** `skill` decides how many items are in play; `focusNewest` features an item that just unlocked. */
  const startRound = useCallback(
    (a: Activity, skill: number, previousId?: string, focusNewest = false) => {
      seq.current++;
      const r = generateRound(a, level, Math.random, previousId, { size: poolSize(a, level, skill), focusNewest });
      setRound(r);
      setWrongIds([]);
      setSolved(false);
      setFeedback(null);
      setCounted([]);
      say(r.say);
    },
    [level, say],
  );

  const startDraw = useCallback(
    (a: DrawActivity, previousId?: string) => {
      seq.current++;
      const r = generateDrawRound(a, level, Math.random, previousId);
      setDrawRound(r);
      setSolved(false);
      setFeedback(null);
      say(r.say);
    },
    [level, say],
  );

  /** New screen, fresh buddy: drop any reaction still playing from the last one. */
  const calmBuddy = () => {
    if (moodTimer.current) clearTimeout(moodTimer.current);
    setMood((prev) => ({ mood: 'idle', key: prev.key + 1 }));
  };

  const openActivity = (a: AnyActivity) => {
    calmBuddy();
    setActivity(a);
    if (isDraw(a)) {
      setRound(null);
      startDraw(a);
    } else {
      setDrawRound(null);
      startRound(a, skills[skillKey(level, a)] ?? 0);
    }
  };

  const goHome = () => {
    seq.current++;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setActivity(null);
    setRound(null);
    setDrawRound(null);
    setFeedback(null);
    calmBuddy();
  };

  /** The buddy reacts, then settles back to idle. */
  const react = (m: BuddyMood) => {
    setMood((prev) => ({ mood: m, key: prev.key + 1 }));
    if (moodTimer.current) clearTimeout(moodTimer.current);
    moodTimer.current = setTimeout(() => setMood((prev) => ({ mood: 'idle', key: prev.key + 1 })), MOOD_MS);
  };
  const personal = (text: string) => sometimesWithName(text, name);

  /** Star, chime and cheer; `next` runs once the cheer has been said. */
  const celebrate = (text: string, next: () => void, levelUp?: string) => {
    const nextStars = stars + 1;
    const milestone = nextStars % MILESTONE_EVERY === 0;
    // A level-up names the new item, so it wins over the every-fifth-star cheer.
    const line = levelUp
      ? withName(levelUp, name)
      : milestone
        ? withName(`Wow! ${nextStars} stars! You're a super star!`, name)
        : personal(text);
    react(levelUp || milestone ? 'cheer' : 'happy');
    setSolved(true);
    setStars(nextStars);
    sfx('right');
    setFeedback({ kind: levelUp ? 'levelup' : milestone ? 'milestone' : 'right', text: line });
    say(line, { delay: SFX_GAP_MS, then: next });
  };

  /** Red but kind: a soft boop, a "let's try again" message that clears itself. */
  const encourage = (raw: string) => {
    const text = personal(raw);
    sfx('wrong');
    react('oops');
    setFeedback({ kind: 'wrong', text });
    setShakeKey((k) => k + 1);
    say(text, { delay: SFX_GAP_MS });
    if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    nudgeTimer.current = setTimeout(() => setFeedback((f) => (f?.kind === 'wrong' ? null : f)), NUDGE_MS);
  };

  const onPick = (choice: Choice) => {
    if (!round || !activity || solved || wrongIds.includes(choice.id)) return;

    if (choice.id === round.target.id) {
      const a = round.activity;
      const key = skillKey(level, a);
      const before = skills[key] ?? 0;
      const after = nextSkill(before, wrongIds.length, HINT_AFTER);
      const grew = poolSize(a, level, after) > poolSize(a, level, before);
      setSkills((sk) => ({ ...sk, [key]: after }));
      celebrate(
        cheer(a, round.target),
        () => startRound(a, after, round.target.id, grew),
        grew ? levelUpText(a, level, after) : undefined,
      );
      return;
    }

    setWrongIds((ids) => [...ids, choice.id]);
    encourage(nudge(round.activity, choice));
  };

  const onCountTap = (i: number) => {
    if (!round || solved || counted.includes(i)) return;
    const next = [...counted, i];
    setCounted(next);
    sfx('pop');
    react('nod');
    say(String(next.length));
  };

  const finishWelcome = (newName: string, kind: BuddyKind) => {
    setName(newName);
    setBuddyId(kind);
    setAskName(false);
    react('happy');
    const b = getBuddy(kind);
    say(newName ? `Hi ${newName}! I'm ${b.name}. Let's play!` : `Hi! I'm ${b.name}. Let's play!`);
  };

  const pokeBuddy = () => {
    react('happy');
    sfx('pop');
    say(name ? `Hee hee! Hi ${name}!` : 'Hee hee! That tickles!');
  };

  const meta = activity ? ACTIVITY_META[activity] : null;
  const current = round ?? drawRound;
  const stage = round ? stageInfo(round.activity, level, skills[skillKey(level, round.activity)] ?? 0) : null;
  const theme = THEME_DECOR[level];
  const showHint = wrongIds.length >= HINT_AFTER && !solved;

  return (
    <div className="ll-root" data-theme={level}>
      <div className="ll-decor" aria-hidden="true">
        {theme.decor.map((e, i) => (
          <span key={`${level}-${i}`} className={`ll-decor-${i}`}>
            {e}
          </span>
        ))}
      </div>
      <style>{CSS + BUDDY_CSS}</style>

      {askName ? (
        <div className="ll-wrap">
          <BuddyWelcome initialName={name} initialBuddy={buddyId} onDone={finishWelcome} onSay={(t) => say(t)} />
        </div>
      ) : !activity || !current || !meta ? (
        <div className="ll-wrap">
          <header className="ll-hero">
            <p className="ll-kicker">NexusDigitalLabs · {theme.label}</p>
            <h1 className="ll-title">
              <span style={{ color: '#ef4444' }}>L</span>
              <span style={{ color: '#f97316' }}>i</span>
              <span style={{ color: '#eab308' }}>t</span>
              <span style={{ color: '#22c55e' }}>t</span>
              <span style={{ color: '#3b82f6' }}>l</span>
              <span style={{ color: '#a855f7' }}>e</span> Learners
            </h1>
            <div className="ll-greet">
              <button type="button" className="ll-greet-buddy" onClick={pokeBuddy} aria-label={`${buddy.name} says hi`}>
                <BuddyFace key={mood.key} buddy={buddy} mood={mood.mood} wave={mood.mood === 'idle'} />
              </button>
              <p className="ll-sub">
                {name ? (
                  <>
                    Hi <strong style={{ color: buddy.ink }}>{name}</strong>! Tap a game to play! 🌈
                  </>
                ) : (
                  'Tap a game to play! 🌈'
                )}
              </p>
            </div>
          </header>

          <div className="ll-levels" role="radiogroup" aria-label="Choose an age group">
            {(
              [
                ['little', '🐣', 'Little', 'Ages 2–3'],
                ['big', '🦁', 'Big', 'Ages 4–5'],
              ] as const
            ).map(([id, icon, label, ages]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={level === id}
                className={`ll-level${level === id ? ' is-on' : ''}`}
                onClick={() => {
                  setLevel(id);
                  sfx('pop');
                }}
              >
                <span className="ll-level-icon">{icon}</span>
                <span>
                  <strong>{label}</strong>
                  <small>{ages}</small>
                </span>
              </button>
            ))}
          </div>

          <h2 className="ll-section">👆 Tap &amp; learn</h2>
          <div className="ll-menu">
            {ACTIVITIES.map((a) => {
              const m = ACTIVITY_META[a];
              return (
                <button
                  key={a}
                  type="button"
                  className="ll-card"
                  style={{ background: m.bg, color: m.ink }}
                  onClick={() => openActivity(a)}
                >
                  <span className="ll-card-icon">{m.icon}</span>
                  <span className="ll-card-title">{m.title}</span>
                </button>
              );
            })}
          </div>

          <h2 className="ll-section">✏️ Draw &amp; trace</h2>
          <div className="ll-menu is-draw">
            {DRAW_ACTIVITIES.map((a) => {
              const m = ACTIVITY_META[a];
              return (
                <button
                  key={a}
                  type="button"
                  className="ll-card"
                  style={{ background: m.bg, color: m.ink }}
                  onClick={() => openActivity(a)}
                >
                  <span className="ll-card-icon">{m.icon}</span>
                  <span className="ll-card-title">{m.title}</span>
                </button>
              );
            })}
          </div>

          <div className="ll-footer-row">
            <span className="ll-star-pill" aria-label={`${stars} stars collected`}>
              ⭐ {stars}
            </span>
            <button type="button" className="ll-icon-btn" onClick={() => setMuted((m) => !m)} aria-pressed={muted}>
              {muted ? '🔇 Sound off' : '🔊 Sound on'}
            </button>
            <button type="button" className="ll-icon-btn" onClick={() => setAskName(true)}>
              ✏️ {name ? 'Name & friend' : 'Add a name'}
            </button>
            <Link href="/games/" className="ll-icon-btn">
              ← All games
            </Link>
          </div>
        </div>
      ) : (
        <div className="ll-wrap is-play">
          <div className="ll-topbar">
            <button type="button" className="ll-round-btn" onClick={goHome} aria-label="Back to all games">
              🏠
            </button>
            <span className="ll-activity-pill" style={{ background: meta.bg, color: meta.ink }}>
              <span className="ll-pill-text">
                {meta.icon} {meta.title}
              </span>
              {round && stage && (
                <span className="ll-lv" aria-label={`Level ${stage.stage} of ${stage.stages}`}>
                  Lv {stage.stage}
                </span>
              )}
            </span>
            <span className="ll-star-pill" aria-label={`${stars} stars collected`}>
              ⭐ {stars}
            </span>
            <button
              type="button"
              className="ll-round-btn"
              onClick={() => setMuted((m) => !m)}
              aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
              aria-pressed={muted}
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>

          <div className="ll-question" style={{ borderColor: meta.bg }}>
            <button type="button" className="ll-say-btn" onClick={() => say(current.say)} aria-label="Say it again">
              🔈
            </button>
            <h2 className="ll-prompt">
              {round?.activity === 'colors' ? (
                <>
                  Find{' '}
                  <span
                    className="ll-color-word"
                    style={{
                      color: round.target.id === 'white' ? '#64748b' : COLORS[round.target.id],
                      textShadow: round.target.id === 'yellow' ? '0 0 2px #92400e' : undefined,
                    }}
                  >
                    {round.target.name}
                  </span>
                </>
              ) : (
                current.prompt
              )}
            </h2>

            {round?.activity === 'letters' && round.emoji && (
              <p className="ll-letter-hint">
                <span className="ll-letter-hint-emoji">{round.emoji}</span>
                {round.target.id === 'X' ? (
                  <>
                    X is at the end of <strong>{LETTERS.X.word}</strong>
                  </>
                ) : (
                  <>
                    {round.target.id} is for <strong>{LETTERS[round.target.id].word}</strong>
                  </>
                )}
              </p>
            )}

            {round?.activity === 'matching' && round.emoji && <div className="ll-match-target">{round.emoji}</div>}

            {round?.activity === 'counting' && round.emoji && round.count && (
              <>
                <div className="ll-count-grid" data-many={round.count > 5 ? 'true' : undefined}>
                  {Array.from({ length: round.count }, (_, i) => {
                    const pos = counted.indexOf(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`ll-count-item${pos >= 0 ? ' is-counted' : ''}`}
                        onClick={() => onCountTap(i)}
                        aria-label={pos >= 0 ? `Counted ${pos + 1}` : 'Tap to count'}
                      >
                        {round.emoji}
                        {pos >= 0 && <span className="ll-count-badge">{pos + 1}</span>}
                      </button>
                    );
                  })}
                </div>
                <p className="ll-tip">Tip: tap each one to count it!</p>
              </>
            )}
          </div>

          {drawRound && (
            <div className="ll-draw">
              <LittleLearnersDraw
                key={drawRound.key}
                round={drawRound}
                level={level}
                onWin={() => celebrate(drawCheer(drawRound), () => startDraw(drawRound.activity, drawRound.figureId))}
                onOops={encourage}
                onPop={(word) => {
                  sfx('pop');
                  react('nod');
                  if (word) say(word);
                }}
                onNext={() => startDraw(drawRound.activity, drawRound.figureId)}
              />
              {solved && <Burst big={feedback?.kind === 'milestone' || feedback?.kind === 'levelup'} />}
            </div>
          )}

          {round && (
          <div className={`ll-choices n-${round.choices.length}`}>
            {round.choices.map((c, i) => {
              const isWrong = wrongIds.includes(c.id);
              const isRight = solved && c.id === round.target.id;
              const isHint = showHint && c.id === round.target.id;
              const lastWrong = isWrong && wrongIds[wrongIds.length - 1] === c.id;
              return (
                <button
                  key={lastWrong ? `${c.id}-${shakeKey}` : c.id}
                  type="button"
                  className={['ll-choice', isWrong && 'is-wrong', isRight && 'is-right', isHint && 'is-hint']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onPick(c)}
                  aria-label={c.name}
                  aria-disabled={isWrong || solved}
                >
                  <ChoiceFace round={round} choice={c} index={i} />
                  {isWrong && <span className="ll-mark ll-mark-wrong">↺</span>}
                  {isRight && <span className="ll-mark ll-mark-right">✓</span>}
                  {isRight && <Burst big={feedback?.kind === 'milestone' || feedback?.kind === 'levelup'} />}
                </button>
              );
            })}
          </div>
          )}

          {/* The buddy lives in the corner and "says" every message in a speech bubble. */}
          <div className="ll-dock-slot" ref={dockSlotRef}>
          <div className={`ll-dock${dockFloating ? ' is-floating' : ''}`}>
            <button type="button" className="ll-dock-buddy" onClick={pokeBuddy} aria-label={`${buddy.name} says hi`}>
              <BuddyFace key={mood.key} buddy={buddy} mood={mood.mood} />
            </button>
            <div className="ll-feedback-slot" aria-live="polite">
              {feedback && (
                <p key={feedback.text + shakeKey} className={`ll-feedback is-${feedback.kind}`}>
                  {feedback.kind === 'milestone' && <span className="ll-feedback-icon">🏆</span>}
                  {feedback.kind === 'levelup' && <span className="ll-feedback-icon">🆙</span>}
                  {feedback.text}
                </p>
              )}
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}

const CSS = `
.ll-root {
  --ll-bg: #fff8ec;
  --ll-ink: #1f2937;
  --ll-soft: #6b7280;
  --ll-card: #ffffff;
  --ll-red: #dc2626;
  --ll-red-bg: #fee2e2;
  --ll-green: #16a34a;
  --ll-green-bg: #dcfce7;
  /* Little Garden: warm cream, pastel sun, sky and blossom. */
  --ll-blob1: rgba(253,230,138,.55);
  --ll-blob2: rgba(191,219,254,.6);
  --ll-blob3: rgba(251,207,232,.55);
  --ll-pattern: transparent;
  --ll-accent: #f59e0b;
  --ll-accent-bg: #fffbeb;
  --ll-tile-bd: #e5e7eb;
  --ll-radius: 28px;
  position: relative;
  background:
    radial-gradient(circle at 10% 10%, var(--ll-blob1) 0 120px, transparent 121px),
    radial-gradient(circle at 92% 18%, var(--ll-blob2) 0 90px, transparent 91px),
    radial-gradient(circle at 85% 92%, var(--ll-blob3) 0 140px, transparent 141px),
    radial-gradient(var(--ll-pattern) 1.6px, transparent 1.8px) 0 0 / 26px 26px,
    var(--ll-bg);
  transition: background-color .3s;
  color: var(--ll-ink);
  min-height: 100vh;
  font-family: ui-rounded, "SF Pro Rounded", "Nunito", "Comic Sans MS", system-ui, sans-serif;
  overflow-x: hidden;
  -webkit-tap-highlight-color: transparent;
  /* Little fingers drag a lot; never let that turn into text selection. */
  user-select: none;
  -webkit-user-select: none;
}
.ll-wrap { position: relative; z-index: 1; max-width: 860px; margin: 0 auto; padding: 24px 16px 48px; }

/* Big Jungle: leafy mint with a dotted canopy, teal accents and crisper tiles. */
.ll-root[data-theme="big"] {
  --ll-bg: #ecfdf5;
  --ll-blob1: rgba(110,231,183,.45);
  --ll-blob2: rgba(125,211,252,.45);
  --ll-blob3: rgba(253,186,116,.45);
  --ll-pattern: rgba(13,148,136,.12);
  --ll-accent: #0d9488;
  --ll-accent-bg: #f0fdfa;
  --ll-tile-bd: #cbd5e1;
  --ll-radius: 20px;
}
.ll-decor { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
.ll-decor span { position: absolute; font-size: clamp(1.8rem, 6vw, 3rem); opacity: .4; animation: ll-float 6s ease-in-out infinite; }
.ll-decor-0 { top: 90px; left: 4%; }
.ll-decor-1 { top: 260px; right: 5%; animation-delay: -1.5s !important; }
.ll-decor-2 { top: 520px; left: 6%; animation-delay: -3s !important; }
.ll-decor-3 { top: 760px; right: 8%; animation-delay: -4.5s !important; }
.ll-decor-4 { top: 1000px; left: 10%; animation-delay: -2s !important; }
.ll-pill-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.ll-lv { flex: none; margin-left: 8px; padding: 2px 9px; border-radius: 999px; background: rgba(255,255,255,.75); font-size: .8em; vertical-align: middle; }
.ll-root button { font-family: inherit; cursor: pointer; touch-action: manipulation; }

.ll-hero { text-align: center; margin: 8px 0 20px; }
.ll-kicker { font-size: .7rem; letter-spacing: .15em; text-transform: uppercase; font-weight: 700; color: var(--ll-soft); margin: 0 0 6px; }
.ll-title { font-size: clamp(2.4rem, 8vw, 4rem); font-weight: 900; margin: 0; line-height: 1.05; letter-spacing: -.01em; }
.ll-sub { font-size: clamp(1.1rem, 3.5vw, 1.4rem); margin: 8px 0 0; color: var(--ll-soft); font-weight: 600; }

.ll-levels { display: flex; justify-content: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
.ll-level { display: flex; align-items: center; gap: 10px; padding: 10px 18px; border-radius: 999px; border: 3px solid #e5e7eb; background: var(--ll-card); color: var(--ll-ink); text-align: left; }
.ll-level strong { display: block; font-size: 1.05rem; }
.ll-level small { display: block; color: var(--ll-soft); font-size: .8rem; font-weight: 600; }
.ll-level-icon { font-size: 1.8rem; }
.ll-level.is-on { border-color: var(--ll-accent); background: var(--ll-accent-bg); box-shadow: 0 4px 0 var(--ll-accent); }

.ll-section { font-size: clamp(1.1rem, 4vw, 1.35rem); font-weight: 900; margin: 22px 4px 10px; color: var(--ll-ink); }
.ll-section:first-of-type { margin-top: 4px; }
.ll-menu { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
@media (min-width: 640px) { .ll-menu { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; } .ll-menu.is-draw { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.ll-card { border: none; border-radius: 28px; padding: 22px 10px; display: flex; flex-direction: column; align-items: center; gap: 8px; box-shadow: 0 6px 0 rgba(0,0,0,.12); transition: transform .12s ease, box-shadow .12s ease; }
.ll-card:hover { transform: translateY(-3px) rotate(-1deg); }
.ll-card:active { transform: translateY(4px); box-shadow: 0 2px 0 rgba(0,0,0,.12); }
.ll-card-icon { font-size: clamp(2.2rem, 9vw, 3.2rem); font-weight: 900; line-height: 1.1; }
.ll-card-title { font-size: clamp(1.1rem, 4vw, 1.4rem); font-weight: 800; }

.ll-footer-row { display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
.ll-icon-btn { border: 2px solid #e5e7eb; background: var(--ll-card); color: var(--ll-ink); border-radius: 999px; padding: 8px 16px; font-weight: 700; font-size: .95rem; text-decoration: none; }
.ll-star-pill { background: #fef3c7; color: #92400e; border-radius: 999px; padding: 8px 16px; font-weight: 900; font-size: 1.1rem; white-space: nowrap; }

.ll-topbar { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.ll-activity-pill { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; text-align: center; border-radius: 999px; padding: 10px 14px; font-weight: 900; font-size: clamp(1rem, 4vw, 1.25rem); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ll-round-btn { width: 52px; height: 52px; flex: none; border-radius: 50%; border: 3px solid #e5e7eb; background: var(--ll-card); font-size: 1.5rem; display: grid; place-items: center; }

.ll-question { position: relative; background: var(--ll-card); border: 4px solid; border-radius: 28px; padding: 20px 16px 18px; text-align: center; box-shadow: 0 6px 0 rgba(0,0,0,.06); margin-bottom: 18px; }
.ll-say-btn { position: absolute; top: 10px; right: 10px; width: 44px; height: 44px; border-radius: 50%; border: none; background: #f3f4f6; font-size: 1.3rem; }
.ll-prompt { font-size: clamp(1.6rem, 6vw, 2.4rem); font-weight: 900; margin: 0 40px; line-height: 1.15; }
.ll-color-word { text-transform: uppercase; }
.ll-letter-hint { margin: 10px 0 0; font-size: clamp(1.1rem, 4vw, 1.4rem); color: var(--ll-soft); font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 10px; }
.ll-letter-hint-emoji { font-size: 2.2rem; }
.ll-letter-hint strong { color: var(--ll-ink); }
.ll-match-target { font-size: clamp(4.5rem, 20vw, 7rem); line-height: 1.1; margin-top: 8px; animation: ll-float 2.4s ease-in-out infinite; }

.ll-count-grid { display: grid; grid-template-columns: repeat(5, minmax(0, 64px)); justify-content: center; gap: 8px; margin-top: 14px; }
.ll-count-item { position: relative; border: none; background: transparent; font-size: clamp(2.2rem, 10vw, 3rem); line-height: 1; padding: 4px; border-radius: 16px; transition: transform .15s; }
.ll-count-item.is-counted { background: #fef3c7; transform: scale(.92); }
.ll-count-badge { position: absolute; top: -6px; right: -6px; background: #f59e0b; color: white; font-size: .85rem; font-weight: 900; width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; }
.ll-tip { margin: 10px 0 0; color: var(--ll-soft); font-size: .95rem; font-weight: 600; }

.ll-choices { display: grid; gap: 14px; }
.ll-choices.n-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.ll-choices.n-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
@media (min-width: 640px) { .ll-choices.n-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); } .ll-choices { gap: 18px; } }
.ll-choice { position: relative; aspect-ratio: 1; border-radius: var(--ll-radius); border: 5px solid var(--ll-tile-bd); background: var(--ll-card); display: grid; place-items: center; padding: 10%; box-shadow: 0 6px 0 var(--ll-tile-bd); transition: transform .12s ease, opacity .25s, box-shadow .12s; color: var(--ll-ink); }
.ll-choice:hover { transform: translateY(-3px); }
.ll-choice:active { transform: translateY(4px); box-shadow: 0 2px 0 #e5e7eb; }
.ll-glyph { font-size: clamp(3.2rem, 15vw, 5.5rem); font-weight: 900; line-height: 1; }
.ll-emoji { font-size: clamp(3rem, 14vw, 5rem); line-height: 1; }
.ll-shape { width: 100%; height: 100%; display: block; }
.ll-blob { width: 82%; height: 82%; border-radius: 50%; box-shadow: inset 0 -8px 0 rgba(0,0,0,.12), 0 0 0 3px rgba(0,0,0,.08); }

/* Wrong: red, but kind — a wiggle, a red ring, a "try again" arrow, and the tile rests so the child can narrow down. */
.ll-choice.is-wrong { border-color: var(--ll-red); background: var(--ll-red-bg); box-shadow: 0 6px 0 #fca5a5; animation: ll-wiggle .5s ease; }
/* Colour blobs keep full opacity — fading would change the colour being taught. */
.ll-choice.is-wrong > :first-child:not(.ll-blob) { opacity: .45; }
.ll-choice.is-right { border-color: var(--ll-green); background: var(--ll-green-bg); box-shadow: 0 6px 0 #86efac; animation: ll-bounce .6s ease; z-index: 2; }
.ll-choice.is-hint { animation: ll-glow 1.2s ease-in-out infinite; }
.ll-mark { position: absolute; top: -12px; right: -12px; width: 40px; height: 40px; border-radius: 50%; color: white; font-weight: 900; font-size: 1.4rem; display: grid; place-items: center; box-shadow: 0 3px 0 rgba(0,0,0,.15); }
.ll-mark-wrong { background: var(--ll-red); }
.ll-mark-right { background: var(--ll-green); }

/* The buddy's home: right under the tiles or board. The slot keeps its height when the buddy floats. */
.ll-dock-slot { margin-top: 18px; min-height: clamp(110px, 30vw, 140px); }
.ll-dock { z-index: 40; display: flex; align-items: center; gap: 6px; min-height: inherit; pointer-events: none; }
.ll-dock.is-floating { position: fixed; left: max(10px, calc(50% - 440px)); right: 10px; bottom: 8px; min-height: 0; }
.ll-dock.is-floating .ll-dock-buddy { width: clamp(76px, 20vw, 100px); }
.ll-dock-buddy { pointer-events: auto; flex: none; width: clamp(100px, 27vw, 128px); aspect-ratio: 120 / 132; border: none; background: none; padding: 0; filter: drop-shadow(0 4px 6px rgba(0,0,0,.08)); }
.ll-feedback-slot { min-width: 0; max-width: 560px; }
.ll-feedback { position: relative; --bb: #e5e7eb; --bg: #fff; background: var(--bg); border: 3px solid var(--bb); }
.ll-feedback::before { content: ""; position: absolute; left: -10px; top: 50%; margin-top: -8px; width: 16px; height: 16px; background: var(--bg); border-left: 3px solid var(--bb); border-bottom: 3px solid var(--bb); transform: rotate(45deg); }
.ll-feedback { pointer-events: none; box-shadow: 0 6px 18px rgba(0,0,0,.1); display: flex; align-items: center; gap: 10px; margin: 0; padding: 12px 18px; border-radius: 24px; font-weight: 800; font-size: clamp(1rem, 4vw, 1.3rem); line-height: 1.25; text-align: left; animation: ll-pop .35s ease; transform-origin: 0 100%; }
.ll-feedback-icon { font-size: 1.8rem; }
.ll-feedback.is-wrong { --bg: var(--ll-red-bg); --bb: #fca5a5; color: var(--ll-red); }
.ll-feedback.is-right { --bg: var(--ll-green-bg); --bb: #86efac; color: var(--ll-green); }
.ll-feedback.is-levelup { --bg: #ede9fe; --bb: #c4b5fd; color: #6d28d9; font-size: clamp(1.1rem, 4.5vw, 1.5rem); }
.ll-feedback.is-milestone { --bg: #fef3c7; --bb: #fcd34d; color: #b45309; font-size: clamp(1.1rem, 4.5vw, 1.5rem); }

.ll-greet { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 6px; }
.ll-greet .ll-sub { margin: 0; }
.ll-greet-buddy { width: clamp(70px, 18vw, 92px); aspect-ratio: 120 / 132; flex: none; border: none; background: none; padding: 0; }

.ll-draw { position: relative; }
.ll-burst { position: absolute; inset: 50% auto auto 50%; pointer-events: none; }
.ll-burst span { position: absolute; left: 0; top: 0; font-size: 1.6rem; transform: translate(-50%, -50%); animation: ll-fly .9s ease-out forwards; }

@keyframes ll-wiggle { 0%,100% { transform: translateX(0) rotate(0); } 20% { transform: translateX(-8px) rotate(-4deg); } 40% { transform: translateX(8px) rotate(4deg); } 60% { transform: translateX(-5px) rotate(-2deg); } 80% { transform: translateX(5px) rotate(2deg); } }
@keyframes ll-bounce { 0% { transform: scale(1); } 35% { transform: scale(1.15); } 60% { transform: scale(.95); } 100% { transform: scale(1.04); } }
@keyframes ll-glow { 0%,100% { box-shadow: 0 6px 0 #e5e7eb, 0 0 0 0 rgba(250,204,21,.0); } 50% { box-shadow: 0 6px 0 #e5e7eb, 0 0 0 10px rgba(250,204,21,.55); } }
@keyframes ll-pop { from { transform: scale(.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes ll-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
@keyframes ll-fly { 0% { opacity: 1; transform: translate(-50%, -50%) rotate(var(--a)) translateY(0) scale(.6); } 100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--a)) translateY(calc(-1 * var(--d))) scale(1.2); } }

@media (prefers-reduced-motion: reduce) {
  .ll-root *, .ll-root *::before, .ll-root *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition: none !important; }
}
`;

'use client';

import { useState, type FormEvent } from 'react';
import {
  BUDDIES,
  NAME_MAX,
  cleanName,
  getBuddy,
  type Buddy,
  type BuddyKind,
  type BuddyMood,
} from '@/lib/games/little-learners-buddy';

function Ears({ b }: { b: Buddy }) {
  switch (b.id) {
    case 'kitty':
      return (
        <g>
          <polygon points="22,56 28,12 54,38" fill={b.body} strokeLinejoin="round" />
          <polygon points="98,56 92,12 66,38" fill={b.body} strokeLinejoin="round" />
          <polygon points="29,46 32,24 45,38" fill={b.belly} />
          <polygon points="91,46 88,24 75,38" fill={b.belly} />
        </g>
      );
    case 'bunny':
      return (
        <g>
          <ellipse cx="44" cy="24" rx="10" ry="27" fill={b.body} transform="rotate(-12 44 44)" />
          <ellipse cx="76" cy="24" rx="10" ry="27" fill={b.body} transform="rotate(12 76 44)" />
          <ellipse cx="44" cy="26" rx="5" ry="18" fill={b.belly} transform="rotate(-12 44 44)" />
          <ellipse cx="76" cy="26" rx="5" ry="18" fill={b.belly} transform="rotate(12 76 44)" />
        </g>
      );
    case 'bear':
      return (
        <g>
          <circle cx="28" cy="40" r="14" fill={b.body} />
          <circle cx="92" cy="40" r="14" fill={b.body} />
          <circle cx="28" cy="40" r="7" fill={b.belly} />
          <circle cx="92" cy="40" r="7" fill={b.belly} />
        </g>
      );
    case 'sprout':
      return (
        <g>
          <path d="M60 38 Q58 24 62 12" fill="none" stroke="#15803d" strokeWidth="3.5" strokeLinecap="round" />
          <ellipse cx="51" cy="14" rx="10" ry="5.5" fill="#4ade80" transform="rotate(25 51 14)" />
          <ellipse cx="72" cy="11" rx="10" ry="5.5" fill="#4ade80" transform="rotate(-25 72 11)" />
        </g>
      );
  }
}

function Eyes({ mood }: { mood: BuddyMood }) {
  if (mood === 'happy' || mood === 'cheer') {
    return (
      <g fill="none" stroke="#1f2937" strokeWidth="3.5" strokeLinecap="round">
        <path d="M39 68 Q46 59 53 68" />
        <path d="M67 68 Q74 59 81 68" />
      </g>
    );
  }
  const big = mood === 'oops';
  const rx = big ? 6.5 : 5.2;
  const ry = big ? 7.5 : 6.6;
  return (
    <g className="lb-eyes">
      {[46, 74].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="66" rx={rx} ry={ry} fill="#1f2937" />
          <circle cx={x + 1.8} cy="63.4" r={big ? 2.4 : 1.9} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

function Mouth({ mood }: { mood: BuddyMood }) {
  if (mood === 'happy' || mood === 'cheer') {
    return (
      <g>
        <path d="M49 79 Q60 98 71 79 Z" fill="#7f1d1d" strokeLinejoin="round" />
        <ellipse cx="60" cy="89" rx="5.5" ry="3.2" fill="#fb7185" />
      </g>
    );
  }
  if (mood === 'oops') return <ellipse cx="60" cy="84" rx="4" ry="4.8" fill="#7f1d1d" />;
  return <path d="M53 80 Q60 87 67 80" fill="none" stroke="#1f2937" strokeWidth="3" strokeLinecap="round" />;
}

/** The buddy creature. `mood` picks the face and the animation; remount it (via `key`) to replay one. */
export function BuddyFace({ buddy, mood = 'idle', wave = false }: { buddy: Buddy; mood?: BuddyMood; wave?: boolean }) {
  const b = buddy;
  return (
    <svg className={`lb-svg is-${mood}${wave ? ' is-wave' : ''}`} viewBox="0 0 120 132" aria-hidden="true">
      <ellipse cx="60" cy="125" rx="30" ry="4.5" fill="rgba(0,0,0,.1)" className="lb-shadow" />
      <g className="lb-body">
        <Ears b={b} />
        <ellipse className="lb-arm lb-arm-l" cx="20" cy="84" rx="8.5" ry="13" fill={b.body} />
        <ellipse className="lb-arm lb-arm-r" cx="100" cy="84" rx="8.5" ry="13" fill={b.body} />
        <ellipse cx="44" cy="114" rx="12" ry="7" fill={b.body} />
        <ellipse cx="76" cy="114" rx="12" ry="7" fill={b.body} />
        <ellipse cx="60" cy="74" rx="42" ry="40" fill={b.body} />
        <ellipse cx="60" cy="90" rx="25" ry="19" fill={b.belly} />
        <ellipse cx="34" cy="80" rx="7.5" ry="4.5" fill="#fb7185" opacity=".45" />
        <ellipse cx="86" cy="80" rx="7.5" ry="4.5" fill="#fb7185" opacity=".45" />
        <Eyes mood={mood} />
        <Mouth mood={mood} />
      </g>
      {(mood === 'happy' || mood === 'cheer') && (
        <g className="lb-sparkles" fill="#facc15">
          <path d="M14 26 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" />
          <path d="M104 18 l2.4 5.6 5.6 2.4 -5.6 2.4 -2.4 5.6 -2.4 -5.6 -5.6 -2.4 5.6 -2.4z" />
          {mood === 'cheer' && <path d="M108 62 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#f472b6" />}
        </g>
      )}
      {mood === 'oops' && (
        <path
          className="lb-heart"
          d="M104 40 C104 34 96 32 94 38 C92 32 84 34 84 40 C84 46 94 52 94 52 C94 52 104 46 104 40 Z"
          fill="#f472b6"
        />
      )}
    </svg>
  );
}

type WelcomeProps = {
  initialName: string;
  initialBuddy: BuddyKind;
  onDone: (name: string, buddy: BuddyKind) => void;
  /** Speak a short line (the buddy introducing itself). */
  onSay: (text: string) => void;
};

/** First screen: a grown-up types the child's name or nickname and the child picks a buddy. */
export function BuddyWelcome({ initialName, initialBuddy, onDone, onSay }: WelcomeProps) {
  const [name, setName] = useState(initialName);
  const [kind, setKind] = useState<BuddyKind>(initialBuddy);
  const [hop, setHop] = useState(0);
  const buddy = getBuddy(kind);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onDone(cleanName(name), kind);
  };

  return (
    <form className="lb-welcome" onSubmit={submit}>
      <div className="lb-welcome-hero">
        <div className="lb-welcome-buddy">
          <BuddyFace key={hop} buddy={buddy} mood={hop ? 'happy' : 'idle'} wave />
        </div>
        <p className="lb-bubble">
          Hi! I&apos;m <strong style={{ color: buddy.ink }}>{buddy.name}</strong>.<br />
          What&apos;s your name?
        </p>
      </div>

      <label className="lb-name">
        <span className="lb-label">Name or nickname</span>
        <input
          type="text"
          value={name}
          maxLength={NAME_MAX}
          autoComplete="off"
          autoCapitalize="words"
          spellCheck={false}
          enterKeyHint="go"
          placeholder="e.g. Mia, Little Bear…"
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <p className="lb-label">Pick a friend</p>
      <div className="lb-pick" role="radiogroup" aria-label="Pick a friend">
        {BUDDIES.map((b) => (
          <button
            key={b.id}
            type="button"
            role="radio"
            aria-checked={kind === b.id}
            className={`lb-pick-btn${kind === b.id ? ' is-on' : ''}`}
            style={{ ['--lb-ring' as string]: b.ink, background: b.belly }}
            onClick={() => {
              setKind(b.id);
              setHop((h) => h + 1);
              onSay(`I'm ${b.name}!`);
            }}
          >
            <BuddyFace buddy={b} />
            <span style={{ color: b.ink }}>{b.name}</span>
          </button>
        ))}
      </div>

      <button type="submit" className="lb-go">
        Let&apos;s play! ▶
      </button>
      <p className="lb-note">For grown-ups: the name stays on this device only. Leave it blank to skip.</p>
    </form>
  );
}

export const BUDDY_CSS = `
.lb-svg { display: block; width: 100%; height: 100%; overflow: visible; }
.lb-svg .lb-body, .lb-svg .lb-arm, .lb-svg .lb-eyes, .lb-svg .lb-sparkles, .lb-svg .lb-heart, .lb-svg .lb-shadow { transform-box: fill-box; }
.lb-svg .lb-body { transform-origin: 50% 100%; }
.lb-svg .lb-shadow { transform-origin: center; }
.lb-svg .lb-arm-l { transform-origin: 50% 8%; }
.lb-svg .lb-arm-r { transform-origin: 50% 8%; }
.lb-svg .lb-eyes { transform-origin: center; animation: lb-blink 4.2s infinite; }

.lb-svg.is-idle .lb-body { animation: lb-bob 2.6s ease-in-out infinite; }
.lb-svg.is-nod .lb-body { animation: lb-squish .4s ease; }
.lb-svg.is-happy .lb-body { animation: lb-jump .8s ease; }
.lb-svg.is-happy .lb-shadow, .lb-svg.is-cheer .lb-shadow { animation: lb-shadow .8s ease; }
.lb-svg.is-happy .lb-arm-l, .lb-svg.is-cheer .lb-arm-l { transform: rotate(150deg); }
.lb-svg.is-happy .lb-arm-r, .lb-svg.is-cheer .lb-arm-r { transform: rotate(-150deg); }
.lb-svg.is-cheer .lb-body { animation: lb-spin 1.1s ease; }
.lb-svg.is-oops .lb-body { animation: lb-tilt 1s ease; }
.lb-svg.is-oops .lb-arm-l { transform: rotate(-30deg); }
.lb-svg.is-oops .lb-arm-r { transform: rotate(30deg); }
.lb-svg.is-wave .lb-arm-r { animation: lb-wave 1.6s ease-in-out infinite; }
.lb-svg .lb-sparkles { transform-origin: center; animation: lb-twinkle .9s ease; }
.lb-svg .lb-heart { transform-origin: center; animation: lb-float 1.4s ease forwards; }

@keyframes lb-blink { 0%, 46%, 50%, 100% { transform: scaleY(1); } 48% { transform: scaleY(.1); } }
@keyframes lb-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes lb-squish { 0%,100% { transform: scale(1); } 40% { transform: scale(1.06, .92); } }
@keyframes lb-jump { 0% { transform: scale(1); } 15% { transform: scale(1.08, .88); } 45% { transform: translateY(-22px) scale(.96, 1.06); } 75% { transform: translateY(0) scale(1.06, .94); } 100% { transform: none; } }
@keyframes lb-shadow { 45% { transform: scale(.6); opacity: .5; } }
@keyframes lb-spin { 0% { transform: none; } 40% { transform: translateY(-26px) rotate(180deg); } 75% { transform: translateY(0) rotate(360deg) scale(1.06, .94); } 100% { transform: rotate(360deg); } }
@keyframes lb-tilt { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-9deg); } 55% { transform: rotate(6deg); } 80% { transform: rotate(-3deg); } }
@keyframes lb-wave { 0%,100% { transform: rotate(-140deg); } 50% { transform: rotate(-170deg); } }
@keyframes lb-twinkle { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.3); opacity: 1; } 100% { transform: scale(1); } }
@keyframes lb-float { 0% { transform: translateY(6px) scale(.4); opacity: 0; } 30% { opacity: 1; transform: translateY(0) scale(1.1); } 100% { transform: translateY(-14px) scale(1); opacity: 0; } }

.lb-welcome { max-width: 520px; margin: 0 auto; display: flex; flex-direction: column; gap: 14px; }
.lb-welcome-hero { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 8px; }
.lb-welcome-buddy { width: clamp(110px, 32vw, 150px); flex: none; }
.lb-bubble { position: relative; background: #fff; border: 3px solid #e5e7eb; border-radius: 24px; padding: 14px 18px; margin: 0; font-size: clamp(1.15rem, 4.5vw, 1.5rem); font-weight: 800; line-height: 1.3; box-shadow: 0 5px 0 rgba(0,0,0,.05); }
.lb-bubble::before { content: ""; position: absolute; left: -12px; top: 50%; width: 18px; height: 18px; background: #fff; border-left: 3px solid #e5e7eb; border-bottom: 3px solid #e5e7eb; transform: translateY(-50%) rotate(45deg); }
.lb-label { display: block; font-weight: 800; font-size: .95rem; color: var(--ll-soft); margin: 0 0 6px 6px; }
.lb-name input { width: 100%; box-sizing: border-box; font: inherit; font-size: clamp(1.3rem, 5vw, 1.6rem); font-weight: 800; padding: 14px 20px; border-radius: 999px; border: 3px solid #e5e7eb; background: #fff; color: var(--ll-ink); user-select: text; -webkit-user-select: text; }
.lb-name input:focus { outline: none; border-color: #f59e0b; box-shadow: 0 0 0 4px rgba(245,158,11,.25); }
.lb-pick { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
.lb-pick-btn { border: 3px solid transparent; border-radius: 22px; padding: 10px 4px 8px; display: flex; flex-direction: column; align-items: center; gap: 4px; font-weight: 900; font-size: 1rem; box-shadow: 0 4px 0 rgba(0,0,0,.08); }
.lb-pick-btn svg { width: 64px; height: 70px; }
.lb-pick-btn.is-on { border-color: var(--lb-ring); transform: translateY(-3px); box-shadow: 0 6px 0 var(--lb-ring); }
.lb-go { margin-top: 6px; border: none; border-radius: 999px; padding: 16px; font-size: clamp(1.3rem, 5vw, 1.6rem); font-weight: 900; color: #fff; background: #16a34a; box-shadow: 0 6px 0 #15803d; }
.lb-go:active { transform: translateY(4px); box-shadow: 0 2px 0 #15803d; }
.lb-note { margin: 0; text-align: center; font-size: .85rem; font-weight: 600; color: var(--ll-soft); }

@media (prefers-reduced-motion: reduce) {
  .lb-svg *, .lb-svg { animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
}
`;

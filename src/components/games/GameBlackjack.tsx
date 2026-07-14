'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import UsernameGate from './UsernameGate';
import GameHelpModal from './GameHelpModal';

// ── Card engine types ──────────────────────────────────────────────────────────
interface Card {
  face: string;
  suit: string;
  value: number;
}

type Phase = 'idle' | 'player' | 'dealer' | 'result';
type Outcome = 'blackjack' | 'win' | 'bust' | 'dealer_bj' | 'lose' | 'push';

const SUITS  = ['♠', '♣', '♥', '♦'];
const FACES  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const VALUES: Record<string, number> = { A:11,'2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,J:10,Q:10,K:10 };
const RED_SUITS = new Set(['♥','♦']);

function buildDeck(): Card[] {
  return SUITS.flatMap((suit) => FACES.map((face) => ({ face, suit, value: VALUES[face] })));
}

function shuffle(deck: Card[]): Card[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function calcHand(hand: Card[]): number {
  let total = 0, aces = 0;
  for (const c of hand) { total += c.value; if (c.face === 'A') aces++; }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function isBlackjack(hand: Card[]): boolean {
  return hand.length === 2 && calcHand(hand) === 21;
}

// ── Card visual components ─────────────────────────────────────────────────────
function CardBack() {
  return (
    <div style={{
      width: '68px', height: '100px', border: '1px solid #e2e8f0',
      background: '#0f172a', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: '5px',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.03) 0px,rgba(255,255,255,0.03) 2px,transparent 2px,transparent 8px)',
      }} />
    </div>
  );
}

function CardFace({ card }: { card: Card }) {
  const isRed = RED_SUITS.has(card.suit);
  const color = isRed ? '#ef4444' : '#0f172a';
  return (
    <div style={{
      width: '68px', height: '100px', border: '1px solid #e2e8f0', background: '#fff',
      borderRadius: 0, display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', padding: '6px', flexShrink: 0,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      animation: 'cardDeal 0.18s ease-out',
    }}>
      <div>
        <span style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1, color }}>{card.face}</span>
        <span style={{ fontSize: '0.75rem', color }}>{card.suit}</span>
      </div>
      <div style={{ fontSize: '1.75rem', lineHeight: 1, textAlign: 'center', padding: '4px 0', color }}>{card.suit}</div>
      <div style={{ transform: 'rotate(180deg)' }}>
        <span style={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1, color }}>{card.face}</span>
        <span style={{ fontSize: '0.75rem', color }}>{card.suit}</span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function GameBlackjack() {
  const { username, setUsername, getHighScore, saveScore, loaded } = useGameState();

  const [deck,   setDeck]   = useState<Card[]>([]);
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [chips,  setChips]  = useState(1000);
  const [best,   setBest]   = useState(0);
  const [bet,    setBet]    = useState(0);
  const [phase,  setPhase]  = useState<Phase>('idle');
  const [dealerRevealed, setDealerRevealed] = useState(false);
  const [result, setResult] = useState<{ outcome: Outcome; delta: number } | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  // We need mutable refs for the dealer draw timeout chain
  const deckRef    = useRef<Card[]>([]);
  const dealerRef  = useRef<Card[]>([]);
  const chipsRef   = useRef(1000);
  const betRef     = useRef(0);

  useEffect(() => {
    if (loaded && username) {
      const hs = getHighScore('blackjack');
      setBest(hs);
      const d = shuffle(buildDeck());
      deckRef.current = d;
      setDeck(d);
    }
  }, [loaded, username, getHighScore]);

  // Sync refs
  useEffect(() => { deckRef.current    = deck;   }, [deck]);
  useEffect(() => { dealerRef.current  = dealer; }, [dealer]);
  useEffect(() => { chipsRef.current   = chips;  }, [chips]);
  useEffect(() => { betRef.current     = bet;    }, [bet]);

  // ── Bet helpers ────────────────────────────────────────────────────────────
  const addBet = (amount: number) => {
    if (phase !== 'idle') return;
    setBet((b) => { const nb = b + amount; return nb > chips ? b : nb; });
  };
  const clearBet = () => { if (phase !== 'idle') return; setBet(0); };

  // ── Deal ──────────────────────────────────────────────────────────────────
  const deal = () => {
    if (bet === 0 || bet > chips) return;

    let d = deckRef.current.length < 15 ? shuffle(buildDeck()) : [...deckRef.current];
    const pop = () => { const c = d.pop()!; return c; };

    const p = [pop(), pop()];
    const dl = [pop(), pop()];
    d = [...d];

    setDeck(d); deckRef.current = d;
    setPlayer(p);
    setDealer(dl); dealerRef.current = dl;
    setDealerRevealed(false);
    setChips((c) => { const nc = c - bet; chipsRef.current = nc; return nc; });
    setResult(null);

    const pBJ = isBlackjack(p);
    const dBJ = isBlackjack(dl);

    if (pBJ || dBJ) {
      setDealerRevealed(true);
      setPhase('result');
      if (pBJ && dBJ) settle('push', p, dl, bet);
      else if (pBJ)   settle('blackjack', p, dl, bet);
      else             settle('dealer_bj', p, dl, bet);
      return;
    }

    setPhase('player');
  };

  // ── Hit ───────────────────────────────────────────────────────────────────
  const hit = () => {
    if (phase !== 'player') return;
    const d = [...deckRef.current];
    const card = d.pop()!;
    const newPlayer = [...player, card];
    setDeck(d); deckRef.current = d;
    setPlayer(newPlayer);

    if (calcHand(newPlayer) > 21) {
      setDealerRevealed(true);
      setPhase('result');
      settle('bust', newPlayer, dealer, bet);
    }
  };

  // ── Stand ─────────────────────────────────────────────────────────────────
  const stand = () => { if (phase !== 'player') return; runDealer(dealer, player, bet); };

  // ── Double ────────────────────────────────────────────────────────────────
  const doubleDown = () => {
    if (phase !== 'player' || bet > chips) return;
    const d = [...deckRef.current];
    const card = d.pop()!;
    const newPlayer = [...player, card];
    const newBet = bet * 2;
    setDeck(d); deckRef.current = d;
    setPlayer(newPlayer);
    setChips((c) => { const nc = c - bet; chipsRef.current = nc; return nc; });
    setBet(newBet); betRef.current = newBet;

    if (calcHand(newPlayer) > 21) {
      setDealerRevealed(true);
      setPhase('result');
      settle('bust', newPlayer, dealer, newBet);
    } else {
      runDealer(dealer, newPlayer, newBet);
    }
  };

  // ── Dealer draw loop ──────────────────────────────────────────────────────
  const runDealer = (initialDealer: Card[], finalPlayer: Card[], finalBet: number) => {
    setPhase('dealer');
    setDealerRevealed(true);

    let d = [...deckRef.current];
    let dl = [...initialDealer];

    const drawNext = () => {
      if (calcHand(dl) < 17) {
        const card = d.pop()!;
        dl = [...dl, card];
        d  = [...d];
        setDeck(d); deckRef.current = d;
        setDealer(dl); dealerRef.current = dl;
        setTimeout(drawNext, 450);
      } else {
        const ps = calcHand(finalPlayer);
        const ds = calcHand(dl);
        let outcome: Outcome;
        if (ds > 21)      outcome = 'win';
        else if (ps > ds) outcome = 'win';
        else if (ps < ds) outcome = 'lose';
        else               outcome = 'push';
        setPhase('result');
        settle(outcome, finalPlayer, dl, finalBet);
      }
    };

    setTimeout(drawNext, 350);
  };

  // ── Settle ────────────────────────────────────────────────────────────────
  const settle = useCallback((outcome: Outcome, _p: Card[], _d: Card[], finalBet: number) => {
    const betReturn: Record<Outcome, number> = {
      blackjack: Math.round(finalBet * 2.5),
      win:   finalBet * 2,
      push:  finalBet,
      bust:  0, dealer_bj: 0, lose: 0,
    };
    const returned = betReturn[outcome] ?? 0;
    const delta = outcome === 'push' ? 0 : (returned - finalBet);

    setChips((c) => {
      const nc = c + returned;
      chipsRef.current = nc;
      setBest((b) => {
        const nb = Math.max(b, nc);
        if (nb > b) saveScore('blackjack', nb);
        return nb;
      });
      return nc;
    });

    setResult({ outcome, delta });
  }, [saveScore]);

  // ── Reset round ───────────────────────────────────────────────────────────
  const resetRound = () => {
    setPlayer([]); setDealer([]);
    setBet(0); betRef.current = 0;
    setPhase('idle');
    setDealerRevealed(false);
    setResult(null);

    // Bust-out reset
    if (chipsRef.current <= 0) {
      setChips(1000); chipsRef.current = 1000;
    }
  };

  if (!loaded) return null;
  if (!username) return <UsernameGate onSubmit={setUsername} />;

  const slbl = 'text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-slate-400';

  const playerScore = player.length ? calcHand(player) : null;
  const dealerScore = dealer.length ? calcHand(dealer) : null;

  const resultMeta: Record<Outcome, { cls: string; title: string }> = {
    blackjack: { cls: 'win',  title: `🂡 Blackjack! +${Math.round(bet * 1.5)}` },
    win:       { cls: 'win',  title: `You Win! +${bet}` },
    push:      { cls: 'push', title: 'Push — Bet Returned' },
    bust:      { cls: 'lose', title: `Bust! −${bet}` },
    dealer_bj: { cls: 'lose', title: `Dealer Blackjack! −${bet}` },
    lose:      { cls: 'lose', title: `Dealer Wins! −${bet}` },
  };

  return (
    <>
      <style>{`@keyframes cardDeal{from{transform:scale(0.8) translateY(-8px);opacity:0.6;}to{transform:scale(1) translateY(0);opacity:1;}}`}</style>

      <GameHelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Blackjack">
        <p style={{ marginBottom: '1rem' }}>
          Beat the dealer by getting a hand total closer to <strong style={{ color: '#f8fafc' }}>21</strong> without going over (<em>busting</em>). You start with <strong style={{ color: '#f8fafc' }}>500 chips</strong>.
        </p>
        <p style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>Card Values</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          <li><strong style={{ color: '#f8fafc' }}>Number cards (2–10)</strong> — face value</li>
          <li><strong style={{ color: '#f8fafc' }}>J / Q / K</strong> — worth 10</li>
          <li><strong style={{ color: '#f8fafc' }}>Ace</strong> — worth 11, reduced to 1 if you would bust</li>
        </ul>
        <p style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>Actions</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          <li><strong style={{ color: '#f8fafc' }}>Hit</strong> — draw another card</li>
          <li><strong style={{ color: '#f8fafc' }}>Stand</strong> — end your turn, dealer plays</li>
          <li><strong style={{ color: '#f8fafc' }}>Double Down</strong> — double your bet, receive one more card, then stand</li>
        </ul>
        <p style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>Dealer Rules</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          <li>Dealer must draw until reaching <strong style={{ color: '#f8fafc' }}>17 or higher</strong></li>
          <li>Dealer&apos;s first card is hidden until you stand</li>
        </ul>
        <p style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>Payouts</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <li><strong style={{ color: '#4ade80' }}>Blackjack</strong> (Ace + 10-value on deal) — pays 1.5× your bet</li>
          <li><strong style={{ color: '#f8fafc' }}>Win</strong> — pays 1× your bet</li>
          <li><strong style={{ color: '#f8fafc' }}>Push</strong> (tie) — bet returned</li>
          <li><strong style={{ color: '#f87171' }}>Bust / Lose</strong> — bet forfeited</li>
        </ul>
      </GameHelpModal>

      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: '#0b0f19' }}>
        <div className="max-w-lg mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/games/" style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4ade80', textDecoration: 'none' }}>
                ← Games
              </Link>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem' }}>Blackjack</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                  padding: '0 0.875rem', height: '36px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.07em',
                  textTransform: 'uppercase', color: '#94a3b8', whiteSpace: 'nowrap',
                }}
              >
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01"/>
                </svg>
                How to Play
              </button>
              {[{ label: 'Chips', val: chips.toLocaleString('en-US') }, { label: 'Best', val: best.toString() }].map(({ label, val }) => (
                <div key={label} style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', padding: '0.5rem 1rem', textAlign: 'center', minWidth: '76px' }}>
                  <div style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#475569' }}>{label}</div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: '#0b0f19', minHeight: 'calc(100vh - 64px - 80px)' }}>
      <div className="max-w-lg mx-auto px-6 py-8 space-y-4">

        {/* Dealer hand */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem' }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569' }}>Dealer</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: dealerRevealed && dealerScore !== null ? (dealerScore > 21 ? '#ef4444' : dealerScore === 21 ? '#4ade80' : '#f8fafc') : '#f8fafc' }}>
              {dealerRevealed && dealerScore !== null ? dealerScore : dealer.length ? '?' : '—'}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap min-h-[104px] items-end">
            {dealer.map((c, i) =>
              i === 0 && !dealerRevealed ? <CardBack key={i} /> : <CardFace key={i} card={c} />
            )}
          </div>
        </div>

        {/* Result banner */}
        {result && (
          <div style={{
            border: `1px solid ${resultMeta[result.outcome].cls === 'win' ? 'rgba(74,222,128,0.35)' : resultMeta[result.outcome].cls === 'lose' ? 'rgba(239,68,68,0.35)' : 'rgba(255,255,255,0.1)'}`,
            background: resultMeta[result.outcome].cls === 'win' ? 'rgba(74,222,128,0.08)' : resultMeta[result.outcome].cls === 'lose' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
            padding: '1rem 1.5rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: resultMeta[result.outcome].cls === 'win' ? '#4ade80' : resultMeta[result.outcome].cls === 'lose' ? '#ef4444' : '#f8fafc' }}>{resultMeta[result.outcome].title}</div>
            <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.25rem' }}>
              Your hand: {playerScore} · Dealer: {dealerScore} · Chips: {chips.toLocaleString('en-US')}
            </div>
          </div>
        )}

        {/* Player hand */}
        <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem' }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569' }}>You</span>
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: playerScore !== null ? (playerScore > 21 ? '#ef4444' : playerScore === 21 ? '#4ade80' : '#f8fafc') : '#f8fafc' }}>
              {playerScore ?? '—'}
            </span>
          </div>
          <div className="flex gap-2 flex-wrap min-h-[104px] items-end">
            {player.map((c, i) => <CardFace key={i} card={c} />)}
          </div>
        </div>

        {/* Bet controls (idle phase) */}
        {phase === 'idle' && (
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#0d1117', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569', marginBottom: '0.75rem' }}>Place Your Bet</p>
            <div className="flex gap-2 mb-4 flex-wrap">
              {[5, 10, 25, 50, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => addBet(v)}
                  style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  {v}
                </button>
              ))}
              <button
                type="button"
                onClick={clearBet}
                style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', padding: '0 0.75rem', height: '44px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#64748b' }}
              >
                Clear
              </button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 400, marginBottom: '0.125rem' }}>Current bet</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{bet}</p>
              </div>
              <button
                type="button"
                onClick={deal}
                disabled={bet === 0}
                style={{ background: '#f8fafc', color: '#0f172a', padding: '0.75rem 2.5rem', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', opacity: bet === 0 ? 0.35 : 1 }}
              >
                Deal
              </button>
            </div>
          </div>
        )}

        {/* Action buttons (player phase) */}
        {phase === 'player' && (
          <div className="flex gap-2">
            <button type="button" onClick={hit}
              style={{ flex: 1, padding: '0.75rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: '#f8fafc', color: '#0f172a', border: 'none', cursor: 'pointer' }}>
              Hit
            </button>
            <button type="button" onClick={stand}
              style={{ flex: 1, padding: '0.75rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}>
              Stand
            </button>
            <button type="button" onClick={doubleDown} disabled={bet > chips}
              style={{ flex: 1, padding: '0.75rem', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', opacity: bet > chips ? 0.35 : 1 }}>
              Double
            </button>
          </div>
        )}

        {/* Next hand button (result phase) */}
        {phase === 'result' && (
          <div className="text-center">
            <button
              type="button"
              onClick={resetRound}
              style={{ background: '#f8fafc', color: '#0f172a', padding: '0.75rem 2.5rem', border: 'none', cursor: 'pointer', fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}
            >
              Next Hand
            </button>
          </div>
        )}

      </div>
      </div>
    </>
  );
}

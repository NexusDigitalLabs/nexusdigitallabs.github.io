'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameState } from '@/hooks/useGameState';
import {
  GameChipButton,
  GameHeader,
  GamePageBody,
  GamePanel,
  GamePrimaryButton,
  GameSecondaryButton,
} from './game-ui';
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
    <div
      className="rounded-xl shrink-0 relative overflow-hidden"
      style={{
        width: '68px',
        height: '100px',
        border: '1px solid var(--ndl-border)',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      }}
    >
      <div
        className="absolute inset-1.5 rounded-lg"
        style={{
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.04) 0px,rgba(255,255,255,0.04) 2px,transparent 2px,transparent 8px)',
        }}
      />
    </div>
  );
}

function CardFace({ card }: { card: Card }) {
  const isRed = RED_SUITS.has(card.suit);
  const color = isRed ? '#ef4444' : '#0f172a';
  return (
    <div
      className="rounded-xl flex flex-col justify-between p-1.5 shrink-0"
      style={{
        width: '68px',
        height: '100px',
        border: '1px solid var(--ndl-border)',
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        animation: 'cardDeal 0.18s ease-out',
      }}
    >
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
          Beat the dealer by getting a hand total closer to <strong style={{ color: 'var(--ndl-text)' }}>21</strong> without going over (<em>busting</em>). You start with <strong style={{ color: 'var(--ndl-text)' }}>500 chips</strong>.
        </p>
        <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.5rem' }}>Card Values</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          <li><strong style={{ color: 'var(--ndl-text)' }}>Number cards (2–10)</strong> — face value</li>
          <li><strong style={{ color: 'var(--ndl-text)' }}>J / Q / K</strong> — worth 10</li>
          <li><strong style={{ color: 'var(--ndl-text)' }}>Ace</strong> — worth 11, reduced to 1 if you would bust</li>
        </ul>
        <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.5rem' }}>Actions</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          <li><strong style={{ color: 'var(--ndl-text)' }}>Hit</strong> — draw another card</li>
          <li><strong style={{ color: 'var(--ndl-text)' }}>Stand</strong> — end your turn, dealer plays</li>
          <li><strong style={{ color: 'var(--ndl-text)' }}>Double Down</strong> — double your bet, receive one more card, then stand</li>
        </ul>
        <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.5rem' }}>Dealer Rules</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          <li>Dealer must draw until reaching <strong style={{ color: 'var(--ndl-text)' }}>17 or higher</strong></li>
          <li>Dealer&apos;s first card is hidden until you stand</li>
        </ul>
        <p style={{ fontWeight: 700, color: 'var(--ndl-text)', marginBottom: '0.5rem' }}>Payouts</p>
        <ul style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <li><strong style={{ color: '#4ade80' }}>Blackjack</strong> (Ace + 10-value on deal) — pays 1.5× your bet</li>
          <li><strong style={{ color: 'var(--ndl-text)' }}>Win</strong> — pays 1× your bet</li>
          <li><strong style={{ color: 'var(--ndl-text)' }}>Push</strong> (tie) — bet returned</li>
          <li><strong style={{ color: '#f87171' }}>Bust / Lose</strong> — bet forfeited</li>
        </ul>
      </GameHelpModal>

      <GameHeader
        title="Blackjack"
        onHelp={() => setShowHelp(true)}
        stats={[
          { label: 'Chips', value: chips.toLocaleString('en-US') },
          { label: 'Best', value: best.toLocaleString('en-US') },
        ]}
      />

      <GamePageBody>
      <div className="space-y-4">

        <GamePanel
          title="Dealer"
          trailing={
            <span
              className="text-2xl font-extrabold tabular-nums"
              style={{
                color: dealerRevealed && dealerScore !== null
                  ? (dealerScore > 21 ? '#ef4444' : dealerScore === 21 ? '#4ade80' : 'var(--ndl-text)')
                  : 'var(--ndl-text)',
              }}
            >
              {dealerRevealed && dealerScore !== null ? dealerScore : dealer.length ? '?' : '—'}
            </span>
          }
        >
          <div className="flex gap-2 flex-wrap min-h-[104px] items-end">
            {dealer.map((c, i) =>
              i === 0 && !dealerRevealed ? <CardBack key={i} /> : <CardFace key={i} card={c} />
            )}
          </div>
        </GamePanel>

        {result && (
          <div
            className="rounded-2xl px-5 py-4 text-center"
            style={{
              border: `1px solid ${resultMeta[result.outcome].cls === 'win' ? 'rgba(74,222,128,0.35)' : resultMeta[result.outcome].cls === 'lose' ? 'rgba(239,68,68,0.35)' : 'var(--ndl-border)'}`,
              background: resultMeta[result.outcome].cls === 'win' ? 'rgba(74,222,128,0.08)' : resultMeta[result.outcome].cls === 'lose' ? 'rgba(239,68,68,0.08)' : 'var(--ndl-surface-2)',
            }}
          >
            <div
              className="text-xl font-extrabold"
              style={{ color: resultMeta[result.outcome].cls === 'win' ? '#4ade80' : resultMeta[result.outcome].cls === 'lose' ? '#ef4444' : 'var(--ndl-text)' }}
            >
              {resultMeta[result.outcome].title}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--ndl-faint)' }}>
              Your hand: {playerScore} · Dealer: {dealerScore} · Chips: {chips.toLocaleString('en-US')}
            </div>
          </div>
        )}

        <GamePanel
          title="You"
          trailing={
            <span
              className="text-2xl font-extrabold tabular-nums"
              style={{
                color: playerScore !== null
                  ? (playerScore > 21 ? '#ef4444' : playerScore === 21 ? '#4ade80' : 'var(--ndl-text)')
                  : 'var(--ndl-text)',
              }}
            >
              {playerScore ?? '—'}
            </span>
          }
        >
          <div className="flex gap-2 flex-wrap min-h-[104px] items-end">
            {player.map((c, i) => <CardFace key={i} card={c} />)}
          </div>
        </GamePanel>

        {phase === 'idle' && (
          <GamePanel title="Place your bet">
            <div className="flex gap-2 mb-4 flex-wrap items-center">
              {[5, 10, 25, 50, 100].map((v) => (
                <GameChipButton key={v} value={v} onClick={() => addBet(v)} />
              ))}
              <GameSecondaryButton onClick={clearBet}>Clear</GameSecondaryButton>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs mb-0.5" style={{ color: 'var(--ndl-faint)' }}>Current bet</p>
                <p className="text-2xl font-extrabold tabular-nums m-0" style={{ color: 'var(--ndl-text)' }}>{bet}</p>
              </div>
              <GamePrimaryButton onClick={deal} disabled={bet === 0}>
                Deal
              </GamePrimaryButton>
            </div>
          </GamePanel>
        )}

        {phase === 'player' && (
          <div className="flex gap-2">
            <div className="flex-1">
              <GamePrimaryButton onClick={hit} fullWidth>Hit</GamePrimaryButton>
            </div>
            <GameSecondaryButton onClick={stand}>Stand</GameSecondaryButton>
            <GameSecondaryButton onClick={doubleDown} disabled={bet > chips}>Double</GameSecondaryButton>
          </div>
        )}

        {phase === 'result' && (
          <div className="text-center">
            <GamePrimaryButton onClick={resetRound}>Next Hand</GamePrimaryButton>
          </div>
        )}

      </div>
      </GamePageBody>
    </>
  );
}

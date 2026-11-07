/**
 * Little Learners sound effects, synthesised with Web Audio so there are no files to download.
 * Every sound is scheduled on a given context, so the same code plays live or renders offline (for checks).
 */

export type SoundName =
  | 'chime'
  | 'crowd'
  | 'horn'
  | 'tada'
  | 'xylo'
  | 'fanfare'
  | 'wrong'
  | 'pop';

/** Success sounds picked at random, so a right answer never sounds the same twice in a row. */
export const SUCCESS_SOUNDS = ['chime', 'crowd', 'horn', 'tada', 'xylo'] as const satisfies readonly SoundName[];

type Ctx = BaseAudioContext;

const noiseBuffers = new WeakMap<Ctx, AudioBuffer>();
function noise(c: Ctx): AudioBuffer {
  let buf = noiseBuffers.get(c);
  if (!buf) {
    buf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffers.set(c, buf);
  }
  return buf;
}

function envelope(c: Ctx, out: AudioNode, t: number, peak: number, attack: number, release: number): GainNode {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + release);
  g.connect(out);
  return g;
}

function tones(c: Ctx, out: AudioNode, t0: number, freqs: number[], type: OscillatorType, step: number, volume: number) {
  freqs.forEach((f, i) => {
    const t = t0 + i * step;
    const osc = c.createOscillator();
    osc.type = type;
    osc.frequency.value = f;
    osc.connect(envelope(c, out, t, volume, 0.02, step * 1.8));
    osc.start(t);
    osc.stop(t + step * 2 + 0.05);
  });
}

/** A "yaaay" crowd swell: rising band-passed noise with a couple of happy whistles. */
function crowd(c: Ctx, out: AudioNode, t0: number) {
  const src = c.createBufferSource();
  src.buffer = noise(c);
  src.loop = true;
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 1.4;
  bp.frequency.setValueAtTime(600, t0);
  bp.frequency.exponentialRampToValueAtTime(1400, t0 + 0.5);
  bp.frequency.exponentialRampToValueAtTime(1000, t0 + 1.1);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.45, t0 + 0.3);
  g.gain.setValueAtTime(0.45, t0 + 0.6);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);
  src.connect(bp).connect(g).connect(out);
  src.start(t0);
  src.stop(t0 + 1.25);
  [0.15, 0.55].forEach((d, i) => {
    const t = t0 + d;
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1700 + i * 300, t);
    osc.frequency.exponentialRampToValueAtTime(2700 + i * 200, t + 0.25);
    osc.connect(envelope(c, out, t, 0.06, 0.03, 0.28));
    osc.start(t);
    osc.stop(t + 0.35);
  });
}

/** A party horn: toot, toooot, with a wobble. */
function horn(c: Ctx, out: AudioNode, t0: number) {
  [
    [0, 0.14],
    [0.22, 0.55],
  ].forEach(([d, len]) => {
    const t = t0 + d;
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(330, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.12);
    const lfo = c.createOscillator();
    lfo.frequency.value = 11;
    const depth = c.createGain();
    depth.gain.value = 18;
    lfo.connect(depth).connect(osc.frequency);
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1600;
    osc.connect(lp).connect(envelope(c, out, t, 0.22, 0.02, len));
    osc.start(t);
    lfo.start(t);
    osc.stop(t + len + 0.05);
    lfo.stop(t + len + 0.05);
  });
}

/** "Ta-daaa!": a short pickup note into a bright major chord. */
function tada(c: Ctx, out: AudioNode, t0: number) {
  const note = (freqs: number[], t: number, len: number, vol: number) =>
    freqs.forEach((f) => {
      const osc = c.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = f;
      const lp = c.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 2200;
      osc.connect(lp).connect(envelope(c, out, t, vol, 0.02, len));
      osc.start(t);
      osc.stop(t + len + 0.05);
    });
  note([392], t0, 0.12, 0.16);
  note([523, 659, 784, 1047], t0 + 0.16, 0.8, 0.09);
}

export function scheduleSound(c: Ctx, out: AudioNode, name: SoundName, t0: number) {
  switch (name) {
    case 'chime':
      return tones(c, out, t0, [523, 659, 784, 1047], 'sine', 0.1, 0.18);
    case 'crowd':
      return crowd(c, out, t0);
    case 'horn':
      return horn(c, out, t0);
    case 'tada':
      return tada(c, out, t0);
    case 'xylo':
      return tones(c, out, t0, [784, 880, 1047, 1175, 1319, 1568], 'triangle', 0.07, 0.22);
    case 'fanfare':
      // Level-ups and big milestones: ta-da with a cheering crowd.
      tada(c, out, t0);
      return crowd(c, out, t0 + 0.1);
    case 'wrong':
      // A soft "boop-boop" rather than a buzzer — wrong should never feel scary.
      return tones(c, out, t0, [392, 330], 'triangle', 0.16, 0.12);
    case 'pop':
      return tones(c, out, t0, [880], 'sine', 0.06, 0.08);
  }
}

let live: AudioContext | null = null;
export function playSound(name: SoundName) {
  try {
    live ??= new AudioContext();
    if (live.state === 'suspended') void live.resume();
    scheduleSound(live, live.destination, name, live.currentTime + 0.01);
  } catch {
    // Audio is a nice-to-have; ignore browsers that block it.
  }
}

const SHOUTS = ['Hooray!', 'Yay!', 'Woohoo!', 'Yippee!'];

/** A success sound plus a short voiced shout ("Yay!") to say over it. */
export type Cheer = { sound: SoundName; shout: string };

/** Picks from `items` at random, avoiding `last` so nothing repeats twice in a row. */
function pickFresh<T>(items: readonly T[], last: T | null, rng: () => number): T {
  const options = items.filter((x) => x !== last);
  return options[Math.floor(rng() * options.length)];
}

let lastSound: SoundName | null = null;
let lastShout: string | null = null;

/** A shout on its own (used with the level-up fanfare). */
export function randomShout(rng: () => number = Math.random): string {
  lastShout = pickFresh(SHOUTS, lastShout, rng);
  return lastShout;
}

/** A random success sound and shout, neither the same as the time before. */
export function randomCheer(rng: () => number = Math.random): Cheer {
  lastSound = pickFresh<SoundName>(SUCCESS_SOUNDS, lastSound, rng);
  return { sound: lastSound, shout: randomShout(rng) };
}

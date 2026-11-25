// Sizzle & Serve — tiny WebAudio bleeps. No audio files, no network.

let ctx = null;

function audio() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  return ctx;
}

export function unlockAudio() {
  const ac = audio();
  if (ac && ac.state === 'suspended') ac.resume();
}

function blip(freq, dur, type, vol) {
  const ac = audio();
  if (!ac || ac.state !== 'running') return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + dur);
}

export function playClick() { blip(660, 0.06, 'square', 0.05); }
export function playPop() { blip(440, 0.08, 'sine', 0.08); }
export function playGood() {
  blip(523, 0.09, 'sine', 0.1);
  setTimeout(() => blip(784, 0.12, 'sine', 0.1), 90);
}
export function playBad() { blip(160, 0.2, 'sawtooth', 0.07); }
export function playTick() { blip(880, 0.04, 'square', 0.03); }

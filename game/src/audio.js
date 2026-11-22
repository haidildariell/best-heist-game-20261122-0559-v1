// GILDED MIDNIGHT — every sound is synthesized, no audio files.
// A low gallery hum, soft steps, the coin's ring, the idol's chime, the
// alarm's rise, and a short sting when a guard's hand closes on the thief.
export function makeAudio() {
  return { ctx: null, master: null, muted: false, humNodes: null, alarmOn: false, alarmNodes: null };
}

export function ensureAudio(audio) {
  if (audio.ctx) {
    if (audio.ctx.state === 'suspended') audio.ctx.resume();
    return;
  }
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audio.ctx = new Ctx();
  audio.master = audio.ctx.createGain();
  audio.master.gain.value = 0.5;
  audio.master.connect(audio.ctx.destination);
  startGalleryHum(audio);
}

function startGalleryHum(audio) {
  const ctx = audio.ctx;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 52;
  const gain = ctx.createGain();
  gain.gain.value = 0.045;
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.11;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.02;
  lfo.connect(lfoGain);
  lfoGain.connect(gain.gain);
  osc.connect(gain);
  gain.connect(audio.master);
  osc.start();
  lfo.start();
  audio.humNodes = { osc, lfo };
}

function blip(audio, freq, dur, type, vol, slideTo) {
  if (!audio.ctx || audio.muted) return;
  const ctx = audio.ctx;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ctx.currentTime + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
  osc.connect(gain);
  gain.connect(audio.master);
  osc.start();
  osc.stop(ctx.currentTime + dur + 0.02);
}

export function playStep(audio, sneaking) {
  blip(audio, sneaking ? 140 : 190, 0.06, 'triangle', sneaking ? 0.03 : 0.07, 90);
}

export function playCoinRing(audio) {
  blip(audio, 1568, 0.5, 'sine', 0.16, 1568);
  blip(audio, 2093, 0.4, 'sine', 0.1, 2093);
}

export function playPickup(audio, big) {
  blip(audio, 660, 0.12, 'sine', 0.16, 660);
  blip(audio, 990, 0.2, 'sine', 0.16, 990);
  if (big) blip(audio, 1320, 0.45, 'sine', 0.18, 1320);
}

export function playEmp(audio) {
  blip(audio, 880, 0.35, 'sawtooth', 0.1, 110);
}

export function playSpotted(audio) {
  blip(audio, 220, 0.18, 'square', 0.12, 440);
}

export function playCaught(audio) {
  blip(audio, 330, 0.5, 'sawtooth', 0.16, 82);
}

export function playWin(audio) {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => blip(audio, f, 0.35, 'sine', 0.16, f), i * 110);
  });
}

export function setAlarmSound(audio, on) {
  if (!audio.ctx) return;
  if (on === audio.alarmOn) return;
  audio.alarmOn = on;
  if (on) {
    const ctx = audio.ctx;
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 620;
    const gain = ctx.createGain();
    gain.gain.value = 0.035;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 2.2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 180;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(gain);
    gain.connect(audio.master);
    osc.start();
    lfo.start();
    audio.alarmNodes = { osc, lfo };
  } else if (audio.alarmNodes) {
    try {
      audio.alarmNodes.osc.stop();
      audio.alarmNodes.lfo.stop();
    } catch { /* already stopped */ }
    audio.alarmNodes = null;
  }
}

export function toggleMute(audio) {
  audio.muted = !audio.muted;
  if (audio.master) audio.master.gain.value = audio.muted ? 0 : 0.5;
  return audio.muted;
}

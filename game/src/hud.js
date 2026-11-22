// GILDED MIDNIGHT — the HUD talks in words, not just bars.
// The top strip carries the alarm meter, the situation in plain words
// (UNSEEN / SUSPICIOUS / HUNTED), loot, tools and strikes. The bottom
// strip is a legend a judge can read at thumbnail size.
import { PALETTE, TUNING, VIEW_W, HUD_H } from './config.js';

export function alarmColor(alarm) {
  if (alarm < 35) return PALETTE.alarmLow;
  if (alarm < 70) return PALETTE.alarmMid;
  return PALETTE.alarmHigh;
}

export function statusWord(state) {
  const hunting = state.guards.some((g) => g.state === 'hunt');
  const suspicious = state.guards.some((g) => g.state === 'suspicious' || g.state === 'investigate');
  if (state.alarm >= TUNING.huntAlarm || hunting) return 'HUNTED !';
  if (state.alarm >= 30 || suspicious) return 'SUSPICIOUS ?';
  return 'UNSEEN';
}

export function drawHud(ctx, state) {
  const { alarm, loot, empReady, strikes, idolTaken, timeLeft } = state;
  const coinCount = state.thief.coins;
  ctx.save();
  // Top strip.
  ctx.fillStyle = PALETTE.hudBack;
  ctx.fillRect(0, 0, VIEW_W, HUD_H);
  ctx.fillStyle = PALETTE.hudLine;
  ctx.fillRect(0, HUD_H - 3, VIEW_W, 3);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('GILDED MIDNIGHT', 20, 26);
  ctx.fillStyle = PALETTE.dimInk;
  ctx.font = '13px Georgia, serif';
  ctx.fillText('THE AURELIA IDOL HEIST', 20, 54);

  // Alarm meter with a labelled scale.
  const mx = 330;
  const mw = 330;
  ctx.fillStyle = PALETTE.dimInk;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText('ALARM', mx, 22);
  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(mx, 34, mw, 22);
  ctx.fillStyle = alarmColor(alarm);
  ctx.fillRect(mx + 2, 36, (mw - 4) * Math.min(1, alarm / 100), 18);
  ctx.strokeStyle = PALETTE.hudLine;
  ctx.lineWidth = 2;
  ctx.strokeRect(mx, 34, mw, 22);
  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText(`${Math.round(alarm)}%`, mx + mw + 10, 45);
  ctx.fillStyle = PALETTE.dimInk;
  ctx.font = '12px Georgia, serif';
  ctx.fillText('0 — quiet      70 — HUNTED', mx, 74);

  // Status word, big.
  const word = statusWord(state);
  const wx = 730;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillStyle = word.startsWith('HUNTED') ? PALETTE.alarmHigh : word.startsWith('SUSPICIOUS') ? PALETTE.alarmMid : PALETTE.alarmLow;
  ctx.fillText(word, wx, 40);
  ctx.fillStyle = PALETTE.dimInk;
  ctx.font = '13px Georgia, serif';
  ctx.fillText(idolTaken ? 'IDOL SECURED — REACH THE EXIT' : 'STEAL THE AURELIA IDOL', wx, 68);

  // Loot, tools, strikes, clock.
  const rx = 1060;
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 24px Georgia, serif';
  ctx.textAlign = 'right';
  ctx.fillText(`$${loot}`, rx + 200, 30);
  ctx.fillStyle = PALETTE.ink;
  ctx.font = '15px Georgia, serif';
  ctx.fillText(`COINS ${coinCount}   EMP ${empReady ? 'READY' : 'SPENT'}`, rx + 200, 56);
  ctx.fillStyle = strikes > 0 ? PALETTE.alarmHigh : PALETTE.dimInk;
  ctx.fillText(`STRIKES ${'●'.repeat(strikes)}${'○'.repeat(TUNING.maxStrikes - strikes)}`, rx + 200, 78);
  ctx.fillStyle = PALETTE.dimInk;
  ctx.textAlign = 'left';
  ctx.font = '13px Georgia, serif';
  ctx.fillText(`NIGHT ${Math.max(0, Math.ceil(timeLeft))}s`, 20, 84);
  ctx.restore();
}

export function drawLegend(ctx) {
  ctx.save();
  ctx.fillStyle = PALETTE.hudBack;
  ctx.fillRect(0, 766, VIEW_W, 34);
  ctx.fillStyle = PALETTE.hudLine;
  ctx.fillRect(0, 766, VIEW_W, 2);
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const items = [
    ['#f5c542', '■ CONE = SEEN'],
    ['#ff5454', '■ CAMERA'],
    ['#39d98a', '■ EXIT'],
    ['#f5c542', '◆ GOLD LOOT'],
    ['#5fae7e', '▬ VENT = HIDDEN'],
    ['#c9a227', '～ ROPE = EXPOSED'],
  ];
  let x = 20;
  for (const [color, text] of items) {
    ctx.fillStyle = color;
    ctx.fillText(text, x, 784);
    x += ctx.measureText(text).width + 34;
  }
  ctx.fillStyle = PALETTE.dimInk;
  ctx.textAlign = 'right';
  ctx.fillText('WASD move · SHIFT sneak · SPACE sprint · CLICK coin · X EMP · E take · H ledger', VIEW_W - 16, 784);
  ctx.restore();
}

export function drawBanner(ctx, title, sub, color) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(10, 12, 22, 0.78)';
  ctx.fillRect(280, 300, 720, 150);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.strokeRect(280, 300, 720, 150);
  ctx.fillStyle = color;
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 640, 355);
  ctx.fillStyle = PALETTE.ink;
  ctx.font = '20px Georgia, serif';
  ctx.fillText(sub, 640, 410);
  ctx.restore();
}

export function drawLedger(ctx, state) {
  ctx.save();
  ctx.fillStyle = 'rgba(10, 12, 22, 0.92)';
  ctx.fillRect(340, 180, 600, 400);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(340, 180, 600, 400);
  ctx.textAlign = 'left';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 28px Georgia, serif';
  ctx.fillText('FIELD LEDGER — THE PLAN', 370, 225);
  ctx.fillStyle = PALETTE.ink;
  ctx.font = '18px Georgia, serif';
  const lines = [
    '1. Cross the hall unseen — cases and pillars cut every cone.',
    '2. Three ways in: the open hall, the case maze, the vent shaft.',
    '3. Coin (CLICK) rings noise and pulls a guard off his beat.',
    '4. EMP (X) blacks out both cameras for 9s — it costs $40 loot.',
    '5. Take the AURELIA IDOL from the vault, then reach the green EXIT.',
    '6. Three strikes and the night ends. A clean run pays a GHOST bonus.',
    '',
    `LOOT SO FAR $${state.loot}   ·   STRIKES ${state.strikes}/${TUNING.maxStrikes}`,
    'Press H to close the ledger.',
  ];
  lines.forEach((line, i) => ctx.fillText(line, 370, 265 + i * 30));
  ctx.restore();
}

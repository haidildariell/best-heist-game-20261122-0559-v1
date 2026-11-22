// GILDED MIDNIGHT — the loop and the rules of the night.
// One room, one idol, one exit. Steal the Aurelia Idol from the vault and
// reach the green EXIT. Guards patrol, cameras sweep, the alarm climbs
// whenever eyes land on the thief — three strikes and the night is over.
import { PALETTE, TUNING, VIEW_W, VIEW_H } from './config.js';
import { GALLERY, GUARD_POSTS, CAMERA_POSTS, SIDE_LOOT, IDOL, EXIT_DOOR, ENTRY_DOOR } from './level.js';
import { makeGuard, updateGuard, guardCaughtThief } from './guards.js';
import { makeCamera, updateCamera, cameraSeesThief, disableAllCameras, cameraAngle } from './cameras.js';
import { makeThief, moveThief, decayNoise, throwCoin, updateCoin, thiefNear, thiefInExit } from './thief.js';
import { makeInput, attachInput, moveVector, consumePress, endFrameInput } from './input.js';
import { makeAudio, ensureAudio, playStep, playCoinRing, playPickup, playEmp, playSpotted, playCaught, playWin, setAlarmSound, toggleMute } from './audio.js';
import { drawHud, drawLegend, drawBanner, drawLedger, statusWord } from './hud.js';
import { renderWorld } from './render.js';
import { applyShot, shotFromUrl } from './shots.js';

export function makeGameState() {
  return {
    phase: 'title', // title | playing | caught | won | busted
    time: 0,
    frozenTime: null,
    alarm: 0,
    loot: 0,
    strikes: 0,
    idolTaken: false,
    ghostBonus: 0,
    takenLoot: new Set(),
    guards: GUARD_POSTS.map(makeGuard),
    cameras: CAMERA_POSTS.map(makeCamera),
    thief: makeThief(),
    coins: [],
    empReady: true,
    spottedEver: false,
    timeLeft: 300,
    ledgerOpen: false,
    caughtTimer: 0,
    stepTimer: 0,
    message: '',
    messageTimer: 0,
  };
}

export function anyHunting(state) {
  return state.guards.some((g) => g.state === 'hunt');
}

export function anySuspicious(state) {
  return state.guards.some((g) => g.state === 'suspicious' || g.state === 'investigate');
}

export function resetNight(state) {
  const fresh = makeGameState();
  fresh.phase = 'playing';
  Object.assign(state, fresh);
}

function onGuardSpotted(state, audio, guard) {
  state.alarm = Math.min(100, state.alarm + TUNING.alarmPerSpot);
  state.spottedEver = true;
  state.message = `${guard.name} SPOTTED YOU!`;
  state.messageTimer = 2;
  playSpotted(audio);
}

function catchThief(state, audio) {
  state.strikes += 1;
  playCaught(audio);
  if (state.strikes >= TUNING.maxStrikes) {
    state.phase = 'busted';
    return;
  }
  state.phase = 'caught';
  state.caughtTimer = 1.8;
  state.alarm = 35;
  state.thief.x = ENTRY_DOOR.x + ENTRY_DOOR.w / 2;
  state.thief.y = ENTRY_DOOR.y + 18;
  state.thief.inVent = false;
  for (const g of state.guards) {
    g.state = 'patrol';
    g.suspicion = 0;
    g.x = g.waypoints[0].x;
    g.y = g.waypoints[0].y;
    g.wpIndex = 1;
  }
}

function tryTake(state, audio) {
  const thief = state.thief;
  if (!state.idolTaken && thiefNear(IDOL.x, IDOL.y, thief, 46)) {
    state.idolTaken = true;
    state.loot += TUNING.idolValue;
    state.message = 'THE AURELIA IDOL IS YOURS — RUN!';
    state.messageTimer = 3;
    playPickup(audio, true);
    return;
  }
  for (const loot of SIDE_LOOT) {
    if (!state.takenLoot.has(loot.id) && thiefNear(loot.x, loot.y, thief, 40)) {
      state.takenLoot.add(loot.id);
      state.loot += loot.value;
      state.message = `${loot.label} — +$${loot.value}`;
      state.messageTimer = 2;
      playPickup(audio, false);
      return;
    }
  }
  if (state.idolTaken && thiefInExit(thief, EXIT_DOOR)) {
    state.phase = 'won';
    if (!state.spottedEver) state.ghostBonus = TUNING.ghostBonus;
    playWin(audio);
  }
}

function updatePlaying(state, audio, input, dt) {
  const thief = state.thief;
  state.time += dt;
  state.timeLeft = Math.max(0, state.timeLeft - dt);
  if (state.timeLeft <= 0) {
    state.phase = 'busted';
    return;
  }
  const { dx, dy } = moveVector(input);
  thief.sneaking = input.keys.has('shift');
  thief.sprinting = input.keys.has(' ') && !thief.sneaking && (dx !== 0 || dy !== 0);
  moveThief(thief, dx, dy, dt);
  decayNoise(thief, dt);
  if (thief.moving && !thief.inVent) {
    state.stepTimer -= dt * (thief.sprinting ? 2 : 1);
    if (state.stepTimer <= 0) {
      state.stepTimer = thief.sneaking ? 0.55 : 0.38;
      playStep(audio, thief.sneaking);
    }
  }
  // Coin: click the floor or press Q.
  if (input.clicked || consumePress(input, 'q')) {
    const coin = throwCoin(thief, input.mouseX, input.mouseY);
    if (coin) {
      state.coins.push(coin);
      playCoinRing(audio);
      for (const g of state.guards) {
        if (Math.hypot(g.x - coin.x, g.y - coin.y) < TUNING.coinNoiseRadius && g.state !== 'hunt') {
          g.state = 'investigate';
          g.investigateX = coin.x;
          g.investigateY = coin.y;
        }
      }
    }
  }
  // EMP: X, costs loot, blacks out the cameras.
  if (consumePress(input, 'x') && state.empReady) {
    if (state.loot >= TUNING.empCost) {
      state.loot -= TUNING.empCost;
      state.empReady = false;
      disableAllCameras(state.cameras, TUNING.empDisableSeconds);
      state.message = `EMP — CAMERAS DARK FOR ${TUNING.empDisableSeconds}s (-$${TUNING.empCost})`;
      state.messageTimer = 2.5;
      playEmp(audio);
    } else {
      state.message = `EMP NEEDS $${TUNING.empCost} LOOT — STEAL MORE FIRST`;
      state.messageTimer = 2;
    }
  }
  if (consumePress(input, 'e')) tryTake(state, audio);
  if (consumePress(input, 'h')) state.ledgerOpen = !state.ledgerOpen;
  if (consumePress(input, 'm')) toggleMute(audio);
  if (consumePress(input, 'r')) {
    resetNight(state);
    return;
  }
  state.coins = state.coins.filter((c) => updateCoin(c, dt));
  for (const cam of state.cameras) updateCamera(cam, dt);
  // Cameras feed the alarm directly.
  for (const cam of state.cameras) {
    if (cameraSeesThief(cam, state.time, thief)) {
      state.alarm = Math.min(100, state.alarm + 30 * dt);
      if (!state.spottedEver) {
        state.spottedEver = true;
        state.message = 'CCTV HAS YOU!';
        state.messageTimer = 2;
        playSpotted(audio);
      }
      const nearest = state.guards[0];
      if (nearest.state === 'patrol') {
        nearest.state = 'investigate';
        nearest.investigateX = thief.x;
        nearest.investigateY = thief.y;
      }
    }
  }
  for (const g of state.guards) {
    updateGuard(g, dt, thief, (guard) => onGuardSpotted(state, audio, guard));
    if (guardCaughtThief(g, thief)) {
      catchThief(state, audio);
      return;
    }
  }
  state.alarm = Math.max(0, state.alarm - TUNING.alarmDecay * dt);
  setAlarmSound(audio, anyHunting(state) || state.alarm >= TUNING.huntAlarm);
  if (state.messageTimer > 0) state.messageTimer -= dt;
  // Walking into the exit with the idol wins at once.
  if (state.idolTaken && thiefInExit(thief, EXIT_DOOR)) {
    state.phase = 'won';
    if (!state.spottedEver) state.ghostBonus = TUNING.ghostBonus;
    playWin(audio);
  }
}

function drawTitle(ctx, state) {
  renderWorld(ctx, state, state.frozenTime ?? state.time);
  ctx.save();
  ctx.fillStyle = 'rgba(10, 12, 22, 0.72)';
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 64px Georgia, serif';
  ctx.fillText('GILDED MIDNIGHT', 640, 260);
  ctx.fillStyle = PALETTE.ink;
  ctx.font = '26px Georgia, serif';
  ctx.fillText('THE AURELIA IDOL HEIST', 640, 310);
  ctx.font = '19px Georgia, serif';
  ctx.fillText('One gallery. Three guards. Two cameras. One golden idol.', 640, 360);
  ctx.fillText('Steal it. Reach the green EXIT. Never get seen.', 640, 392);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 22px Georgia, serif';
  ctx.fillText('PRESS ANY KEY TO BEGIN THE NIGHT', 640, 460);
  ctx.fillStyle = PALETTE.dimInk;
  ctx.font = '16px Georgia, serif';
  ctx.fillText('WASD move · SHIFT sneak · SPACE sprint · CLICK throw a coin · X EMP · E take · H ledger', 640, 510);
  ctx.fillText('Cones are honest: cases and pillars cut them dead. The vent hides you. The rope does not.', 640, 540);
  ctx.restore();
}

function drawScene(ctx, state, audio) {
  const t = state.frozenTime ?? state.time;
  if (state.phase === 'title') {
    drawTitle(ctx, state);
    return;
  }
  renderWorld(ctx, state, t);
  drawHud(ctx, state);
  drawLegend(ctx);
  if (state.messageTimer > 0) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.gold;
    ctx.font = 'bold 22px Georgia, serif';
    ctx.fillText(state.message, 640, 150);
    ctx.restore();
  }
  if (state.ledgerOpen) drawLedger(ctx, state);
  if (state.phase === 'caught') {
    drawBanner(ctx, 'CAUGHT!', `Strike ${state.strikes} of ${TUNING.maxStrikes} — back to the service door.`, '#ff5454');
  } else if (state.phase === 'won') {
    const total = state.loot + state.ghostBonus;
    drawBanner(ctx, 'CLEAN GETAWAY', `Loot $${state.loot}${state.ghostBonus ? ` + GHOST BONUS $${state.ghostBonus}` : ''}  =  $${total}   ·   press R for another night`, '#39d98a');
  } else if (state.phase === 'busted') {
    drawBanner(ctx, 'BUSTED', 'Three strikes — the gallery keeps its idol tonight. Press R to try again.', '#ff5454');
  }
}

export function startGame() {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  canvas.width = VIEW_W;
  canvas.height = VIEW_H;
  const state = makeGameState();
  const audio = makeAudio();
  const input = makeInput();
  attachInput(input, canvas, () => ensureAudio(audio));
  const shot = shotFromUrl();
  if (shot) applyShot(state, shot);
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (state.frozenTime === null) {
      if (state.phase === 'title') {
        state.time += dt;
        if (input.pressed.size > 0 || input.clicked) {
          ensureAudio(audio);
          state.phase = 'playing';
        }
      } else if (state.phase === 'playing') {
        updatePlaying(state, audio, input, dt);
      } else if (state.phase === 'caught') {
        state.time += dt;
        state.caughtTimer -= dt;
        if (state.caughtTimer <= 0) state.phase = 'playing';
      } else if (state.phase === 'won' || state.phase === 'busted') {
        state.time += dt;
        if (consumePress(input, 'r')) resetNight(state);
      }
    }
    drawScene(ctx, state, audio);
    endFrameInput(input);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

if (typeof document !== 'undefined') {
  startGame();
}

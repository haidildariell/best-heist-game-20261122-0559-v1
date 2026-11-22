// GILDED MIDNIGHT — the three posed scenes behind ?shot=.
// Each shot freezes the same game mid-moment so the screenshots are
// deterministic: the cover shows the whole heist in one frame — thief
// behind cover, a coin pulling a guard, cones cut by cases, both cameras
// sweeping, the idol glowing, and the alarm halfway up.
import { TUNING } from './config.js';

export function applyShot(state, shot) {
  if (shot === 'start') {
    // The cover: live gameplay, no title overlay — the whole heist in one
    // frame the moment the night begins.
    state.phase = 'playing';
    state.frozenTime = 1.2;
    state.thief.x = 355;
    state.thief.y = 728;
    state.thief.angle = -Math.PI / 2;
    state.guards[0].x = 640;
    state.guards[0].y = 380;
    state.guards[0].angle = 0;
    state.guards[1].x = 980;
    state.guards[1].y = 300;
    state.guards[1].angle = Math.PI;
    state.guards[2].x = 420;
    state.guards[2].y = 650;
    state.guards[2].angle = -Math.PI / 2;
    state.alarm = 0;
    state.loot = 0;
    return;
  }
  if (shot === 'play') {
    state.phase = 'playing';
    state.frozenTime = 2.6;
    // The thief crouches behind the Jade Case, mid-sneak.
    state.thief.x = 620;
    state.thief.y = 285;
    state.thief.angle = Math.PI / 4;
    state.thief.sneaking = true;
    // A coin rings in the open hall; MARA turns toward it, suspicious.
    // Her cone crosses open carpet, so it reads at thumbnail size.
    state.coins.push({ x: 840, y: 440, ttl: 1.2, ring: 0.5 });
    state.guards[0].x = 730;
    state.guards[0].y = 350;
    state.guards[0].angle = Math.atan2(440 - 350, 840 - 730);
    state.guards[0].state = 'suspicious';
    state.guards[0].suspicion = 62;
    state.guards[0].investigateX = 840;
    state.guards[0].investigateY = 440;
    // DARIO patrols the vault corridor, cone dying on the Pearl Case.
    state.guards[1].x = 1000;
    state.guards[1].y = 380;
    state.guards[1].angle = -Math.PI / 2;
    // SELIN sweeps the south wing.
    state.guards[2].x = 520;
    state.guards[2].y = 640;
    state.guards[2].angle = Math.PI;
    state.alarm = 45;
    state.loot = 120;
    state.takenLoot.add('painting-north');
    state.thief.coins = 2;
    state.noiseX = 840;
    state.noiseY = 440;
    state.noiseRadius = TUNING.coinNoiseRadius;
    state.thief.noise = 0.9;
    return;
  }
  if (shot === 'end') {
    state.phase = 'won';
    state.frozenTime = 0.8;
    state.idolTaken = true;
    state.loot = 820;
    state.ghostBonus = TUNING.ghostBonus;
    state.thief.x = 190;
    state.thief.y = 722;
    state.thief.angle = Math.PI;
    state.guards[0].x = 640;
    state.guards[0].y = 380;
    state.guards[0].angle = Math.PI;
    state.guards[1].x = 1180;
    state.guards[1].y = 420;
    state.guards[1].angle = Math.PI / 2;
    state.guards[2].x = 300;
    state.guards[2].y = 620;
    state.guards[2].angle = 0;
    state.alarm = 12;
  }
}

export function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('shot');
}

// GILDED MIDNIGHT — the thief: movement, noise and the two tools.
// Walk is quiet, sneak is quieter and slower, sprint is fast and loud.
// A thrown coin rings a circle of noise that pulls guards off their beat;
// an EMP blacks out every camera for a few seconds, and costs loot.
import { TUNING } from './config.js';
import { GALLERY, TALL_COVER, VENT, pointInRect, pointInVent, rectsCollide } from './level.js';

export function makeThief() {
  return {
    x: 355,
    y: 728,
    angle: -Math.PI / 2,
    sneaking: false,
    sprinting: false,
    moving: false,
    inVent: false,
    coins: TUNING.coinCount,
    noise: 0, // 0 silent .. 1 loud, decays fast
    noiseX: 0,
    noiseY: 0,
    noiseRadius: 0,
  };
}

function blockedAt(x, y, r) {
  const box = { x: x - r, y: y - r, w: r * 2, h: r * 2 };
  if (x - r < GALLERY.bounds.x || x + r > GALLERY.bounds.x + GALLERY.bounds.w) return true;
  if (y - r < GALLERY.bounds.y || y + r > GALLERY.bounds.y + GALLERY.bounds.h) return true;
  for (const c of TALL_COVER) {
    if (rectsCollide(box, c)) return true;
  }
  return false;
}

export function moveThief(thief, dx, dy, dt) {
  thief.moving = dx !== 0 || dy !== 0;
  if (!thief.moving) return;
  const len = Math.hypot(dx, dy);
  const nx = dx / len;
  const ny = dy / len;
  thief.angle = Math.atan2(ny, nx);
  let speed = TUNING.thiefWalk;
  if (thief.sneaking) speed = TUNING.thiefSneak;
  if (thief.sprinting) speed = TUNING.thiefSprint;
  // The vent is a crawl: slow, but invisible.
  if (thief.inVent) speed = TUNING.thiefSneak * 0.7;
  const step = speed * dt;
  const r = TUNING.thiefRadius;
  if (!blockedAt(thief.x + nx * step, thief.y, r)) thief.x += nx * step;
  if (!blockedAt(thief.x, thief.y + ny * step, r)) thief.y += ny * step;
  thief.inVent = pointInVent(thief.x, thief.y);
  if (thief.sprinting) {
    thief.noise = 1;
    thief.noiseX = thief.x;
    thief.noiseY = thief.y;
    thief.noiseRadius = 90;
  }
}

export function decayNoise(thief, dt) {
  thief.noise = Math.max(0, thief.noise - dt * 2.2);
}

export function throwCoin(thief, tx, ty) {
  if (thief.coins <= 0) return null;
  thief.coins -= 1;
  const coin = { x: tx, y: ty, ttl: 1.6, ring: 0 };
  thief.noise = 1;
  thief.noiseX = tx;
  thief.noiseY = ty;
  thief.noiseRadius = TUNING.coinNoiseRadius;
  return coin;
}

export function updateCoin(coin, dt) {
  coin.ttl -= dt;
  coin.ring = Math.min(1, coin.ring + dt * 2.4);
  return coin.ttl > 0;
}

export function thiefNear(px, py, thief, reach = 34) {
  return Math.hypot(px - thief.x, py - thief.y) < reach;
}

export function thiefInExit(thief, exitDoor) {
  return pointInRect(thief.x, thief.y, exitDoor);
}

export function thiefInVaultDoor(thief) {
  // The vault door gap on the west wall of the vault shell.
  return thief.x > 1020 && thief.x < 1060 && thief.y > 214 && thief.y < 244;
}

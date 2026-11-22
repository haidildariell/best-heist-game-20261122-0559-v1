// GILDED MIDNIGHT — everything the eye sees.
// Floor, carpet and trim first; then cones (yellow for guards, red for
// cameras, honestly cut by tall cover); then the room, the loot, the thief
// and the guards, with a name over every guard and a label on every prize.
import { PALETTE, VIEW_W, VIEW_H, TUNING, HUD_H } from './config.js';
import { GALLERY, TALL_COVER, ROPES, VENT, VAULT, IDOL, EXIT_DOOR, ENTRY_DOOR, SIDE_LOOT } from './level.js';
import { conePolygon, angleDifference } from './vision.js';
import { cameraAngle } from './cameras.js';
import { guardStateWord } from './guards.js';

function drawFloor(ctx, time) {
  const b = GALLERY.bounds;
  ctx.fillStyle = PALETTE.wall;
  ctx.fillRect(0, HUD_H, VIEW_W, VIEW_H - HUD_H);
  // Checkerboard marble.
  const tile = 64;
  for (let y = b.y; y < b.y + b.h; y += tile) {
    for (let x = b.x; x < b.x + b.w; x += tile) {
      const even = ((x - b.x) / tile + (y - b.y) / tile) % 2 === 0;
      ctx.fillStyle = even ? PALETTE.floorA : PALETTE.floorB;
      ctx.fillRect(x, y, tile, tile);
    }
  }
  // Crimson carpet down the hall.
  ctx.fillStyle = PALETTE.carpet;
  ctx.fillRect(60, 380, 1160, 90);
  ctx.strokeStyle = PALETTE.floorTrim;
  ctx.lineWidth = 3;
  ctx.strokeRect(60, 380, 1160, 90);
  // Gold trim around the room.
  ctx.strokeStyle = PALETTE.floorTrim;
  ctx.lineWidth = 4;
  ctx.strokeRect(b.x, b.y, b.w, b.h);
}

function drawVent(ctx) {
  ctx.fillStyle = PALETTE.vent;
  ctx.fillRect(VENT.x, VENT.y, VENT.w, VENT.h);
  ctx.strokeStyle = PALETTE.ventEdge;
  ctx.lineWidth = 2;
  ctx.strokeRect(VENT.x, VENT.y, VENT.w, VENT.h);
  ctx.fillStyle = PALETTE.ventEdge;
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('VENT — CRAWL UNSEEN', VENT.x + VENT.w / 2, VENT.y + 20);
  // Grates at both ends.
  ctx.fillStyle = '#0a0e1a';
  ctx.fillRect(VENT.x + 2, VENT.y + 4, 18, 22);
  ctx.fillRect(VENT.exitX - 10, VENT.y + 4, 18, 22);
}

function drawTallCover(ctx) {
  for (const c of TALL_COVER) {
    ctx.fillStyle = PALETTE.tallCover;
    ctx.fillRect(c.x, c.y, c.w, c.h);
    ctx.fillStyle = PALETTE.tallCoverTop;
    ctx.fillRect(c.x, c.y, c.w, 10);
    ctx.strokeStyle = '#0a0e1a';
    ctx.lineWidth = 2;
    ctx.strokeRect(c.x, c.y, c.w, c.h);
    if (c.w > 90) {
      ctx.fillStyle = PALETTE.dimInk;
      ctx.font = 'bold 11px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.label, c.x + c.w / 2, c.y + c.h / 2 + 4);
    }
  }
}

function drawRopes(ctx) {
  ctx.strokeStyle = PALETTE.rope;
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);
  for (const r of ROPES) {
    ctx.beginPath();
    ctx.moveTo(r.x1, r.y1);
    ctx.lineTo(r.x2, r.y2);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

function drawVaultAndLoot(ctx, state, time) {
  // Vault shell glow.
  ctx.fillStyle = '#2a2118';
  ctx.fillRect(VAULT.x, VAULT.y, VAULT.w, VAULT.h);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 3;
  ctx.strokeRect(VAULT.x, VAULT.y, VAULT.w, VAULT.h);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 14px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE VAULT', VAULT.x + VAULT.w / 2, VAULT.y + 22);
  if (!state.idolTaken) {
    const pulse = 0.6 + 0.4 * Math.sin(time * 3);
    ctx.save();
    ctx.globalAlpha = 0.35 + 0.3 * pulse;
    ctx.fillStyle = PALETTE.goldGlow;
    ctx.beginPath();
    ctx.arc(IDOL.x, IDOL.y, 30 + 6 * pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(IDOL.x, IDOL.y, IDOL.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7a5c10';
    ctx.beginPath();
    ctx.arc(IDOL.x, IDOL.y - 4, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.ink;
    ctx.font = 'bold 15px Georgia, serif';
    ctx.fillText('AURELIA IDOL — $500', IDOL.x, IDOL.y + 34);
  } else {
    ctx.fillStyle = PALETTE.dimInk;
    ctx.font = 'bold 14px Georgia, serif';
    ctx.fillText('EMPTY PEDESTAL', VAULT.x + VAULT.w / 2, VAULT.y + 80);
  }
  // Side loot.
  for (const loot of SIDE_LOOT) {
    if (state.takenLoot.has(loot.id)) continue;
    if (loot.kind === 'painting') {
      ctx.fillStyle = '#3a2c14';
      ctx.fillRect(loot.x - 34, loot.y - 20, 68, 40);
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 3;
      ctx.strokeRect(loot.x - 34, loot.y - 20, 68, 40);
      ctx.fillStyle = '#7fb2d9';
      ctx.fillRect(loot.x - 28, loot.y - 14, 56, 28);
      ctx.fillStyle = PALETTE.ink;
      ctx.font = 'bold 11px Georgia, serif';
      ctx.fillText(loot.label, loot.x, loot.y + 34);
      ctx.fillStyle = PALETTE.gold;
      ctx.fillText(`$${loot.value}`, loot.x, loot.y + 48);
    } else {
      ctx.fillStyle = PALETTE.goldGlow;
      ctx.beginPath();
      ctx.arc(loot.x, loot.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2a6db0';
      ctx.beginPath();
      ctx.arc(loot.x, loot.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.ink;
      ctx.font = 'bold 11px Georgia, serif';
      ctx.fillText(loot.label, loot.x, loot.y + 26);
      ctx.fillStyle = PALETTE.gold;
      ctx.fillText(`$${loot.value}`, loot.x, loot.y + 40);
    }
  }
}

function drawDoors(ctx, state, time) {
  // EXIT door, green and loud.
  const pulse = 0.7 + 0.3 * Math.sin(time * 2.5);
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = PALETTE.exitGlow;
  ctx.fillRect(EXIT_DOOR.x - 6, EXIT_DOOR.y - 6, EXIT_DOOR.w + 12, EXIT_DOOR.h + 12);
  ctx.restore();
  ctx.fillStyle = PALETTE.exit;
  ctx.fillRect(EXIT_DOOR.x, EXIT_DOOR.y, EXIT_DOOR.w, EXIT_DOOR.h);
  ctx.strokeStyle = PALETTE.exitGlow;
  ctx.lineWidth = 3;
  ctx.strokeRect(EXIT_DOOR.x, EXIT_DOOR.y, EXIT_DOOR.w, EXIT_DOOR.h);
  ctx.fillStyle = '#eafff1';
  ctx.font = 'bold 22px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', EXIT_DOOR.x + EXIT_DOOR.w / 2, EXIT_DOOR.y + EXIT_DOOR.h / 2 + 8);
  if (state.idolTaken) {
    ctx.fillStyle = PALETTE.exitGlow;
    ctx.font = 'bold 13px Georgia, serif';
    ctx.fillText('◀ GET OUT — THIS WAY', EXIT_DOOR.x + EXIT_DOOR.w / 2, EXIT_DOOR.y - 10);
  }
  // Entry door.
  ctx.fillStyle = '#3a2c14';
  ctx.fillRect(ENTRY_DOOR.x, ENTRY_DOOR.y, ENTRY_DOOR.w, ENTRY_DOOR.h);
  ctx.strokeStyle = PALETTE.floorTrim;
  ctx.lineWidth = 2;
  ctx.strokeRect(ENTRY_DOOR.x, ENTRY_DOOR.y, ENTRY_DOOR.w, ENTRY_DOOR.h);
  ctx.fillStyle = PALETTE.dimInk;
  ctx.font = 'bold 12px Georgia, serif';
  ctx.fillText('SERVICE DOOR', ENTRY_DOOR.x + ENTRY_DOOR.w / 2, ENTRY_DOOR.y + 32);
}

function drawCone(ctx, pts, fill, edge) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawGuard(ctx, g, time) {
  const hunting = g.state === 'hunt';
  ctx.save();
  ctx.translate(g.x, g.y);
  ctx.rotate(g.angle);
  ctx.fillStyle = hunting ? '#ff5454' : PALETTE.guardCoat;
  ctx.beginPath();
  ctx.arc(0, 0, TUNING.guardRadius + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.guard;
  ctx.beginPath();
  ctx.arc(4, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  // Name, state and suspicion ring.
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText(g.name, g.x, g.y - 24);
  ctx.fillStyle = hunting ? '#ff5454' : g.state === 'patrol' ? PALETTE.dimInk : PALETTE.alarmMid;
  ctx.font = 'bold 11px Georgia, serif';
  ctx.fillText(guardStateWord(g), g.x, g.y + 28);
  if (g.suspicion > 1) {
    ctx.strokeStyle = '#ff5454';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(g.x, g.y, 22, -Math.PI / 2, -Math.PI / 2 + (g.suspicion / 100) * Math.PI * 2);
    ctx.stroke();
  }
}

function drawCamera(ctx, cam, time) {
  const angle = cameraAngle(cam, time);
  ctx.save();
  ctx.translate(cam.x, cam.y);
  ctx.fillStyle = cam.disabled > 0 ? '#555' : '#d8d8d8';
  ctx.fillRect(-8, -8, 16, 16);
  ctx.rotate(angle);
  ctx.fillStyle = cam.disabled > 0 ? '#555' : '#ff5454';
  ctx.beginPath();
  ctx.moveTo(8, -5);
  ctx.lineTo(20, 0);
  ctx.lineTo(8, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.textAlign = 'center';
  ctx.fillStyle = cam.disabled > 0 ? PALETTE.dimInk : '#ff8a8a';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.fillText(cam.disabled > 0 ? `CCTV — OFF ${Math.ceil(cam.disabled)}s` : 'CCTV', cam.x, cam.y - 16);
}

function drawThief(ctx, thief, time) {
  ctx.save();
  ctx.translate(thief.x, thief.y);
  if (thief.inVent) ctx.globalAlpha = 0.45;
  ctx.rotate(thief.angle);
  // A hooded figure: dark cloak, gold trim, pale mask.
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.arc(0, 0, TUNING.thiefRadius + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.thiefTrim;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f2ead8';
  ctx.beginPath();
  ctx.arc(5, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.textAlign = 'center';
  ctx.fillStyle = PALETTE.ink;
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillText(thief.sneaking ? 'YOU — SNEAKING' : thief.sprinting ? 'YOU — LOUD!' : 'YOU', thief.x, thief.y - 24);
  if (thief.inVent) {
    ctx.fillStyle = PALETTE.ventEdge;
    ctx.font = 'bold 11px Georgia, serif';
    ctx.fillText('HIDDEN IN VENT', thief.x, thief.y + 28);
  }
}

function drawNoiseRing(ctx, thief, coins) {
  if (thief.noise > 0.05) {
    ctx.save();
    ctx.globalAlpha = thief.noise * 0.8;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(thief.noiseX, thief.noiseY, thief.noiseRadius * (1 + (1 - thief.noise) * 0.4), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  for (const coin of coins) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, coin.ttl);
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 12 + coin.ring * 60, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.gold;
    ctx.beginPath();
    ctx.arc(coin.x, coin.y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export function renderWorld(ctx, state, time) {
  drawFloor(ctx, time);
  drawVent(ctx);
  // Cones under the furniture so cover reads as cover.
  for (const g of state.guards) {
    const pts = conePolygon(g.x, g.y, g.angle, TUNING.coneRange, TUNING.coneHalfAngle);
    drawCone(ctx, pts, PALETTE.cone, PALETTE.coneEdge);
  }
  for (const cam of state.cameras) {
    if (cam.disabled > 0) continue;
    const pts = conePolygon(cam.x, cam.y, cameraAngle(cam, time), TUNING.cameraRange, TUNING.cameraHalfAngle);
    drawCone(ctx, pts, PALETTE.cameraCone, PALETTE.cameraConeEdge);
  }
  drawRopes(ctx);
  drawVaultAndLoot(ctx, state, time);
  drawDoors(ctx, state, time);
  drawTallCover(ctx);
  drawNoiseRing(ctx, state.thief, state.coins);
  for (const cam of state.cameras) drawCamera(ctx, cam, time);
  for (const g of state.guards) drawGuard(ctx, g, time);
  drawThief(ctx, state.thief, time);
}

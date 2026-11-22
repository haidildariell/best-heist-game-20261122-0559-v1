// GILDED MIDNIGHT — honest vision.
// A cone is a fan of rays; each ray stops at the first tall cover it hits,
// so a guard's cone is visibly cut short by a case or a pillar. Nothing
// here guesses: line of sight is a segment-vs-rectangle test.
import { TALL_COVER } from './level.js';

function rayHitsRect(ox, oy, dx, dy, r) {
  // Slab test: returns the distance along the ray to the rect, or Infinity.
  // The rect is inset by half a pixel so a ray grazing an edge exactly
  // does not count as blocked — an edge is not a wall.
  let tMin = 0;
  let tMax = Infinity;
  const slabs = [
    [ox, dx, r.x + 0.5, r.x + r.w - 0.5],
    [oy, dy, r.y + 0.5, r.y + r.h - 0.5],
  ];
  for (const [o, d, lo, hi] of slabs) {
    if (Math.abs(d) < 1e-9) {
      if (o < lo || o > hi) return Infinity;
    } else {
      let t1 = (lo - o) / d;
      let t2 = (hi - o) / d;
      if (t1 > t2) [t1, t2] = [t2, t1];
      tMin = Math.max(tMin, t1);
      tMax = Math.min(tMax, t2);
      if (tMin > tMax) return Infinity;
    }
  }
  return tMin;
}

export function rayBlockDistance(ox, oy, angle, maxDist) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  let best = maxDist;
  for (const r of TALL_COVER) {
    const t = rayHitsRect(ox, oy, dx, dy, r);
    if (t < best) best = t;
  }
  return best;
}

export function hasLineOfSight(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  if (dist < 1) return true;
  const blocked = rayBlockDistance(ax, ay, Math.atan2(dy, dx), dist);
  return blocked >= dist - 0.5;
}

export function conePolygon(ox, oy, angle, range, halfAngle, steps = 26) {
  const pts = [{ x: ox, y: oy }];
  for (let i = 0; i <= steps; i++) {
    const a = angle - halfAngle + (2 * halfAngle * i) / steps;
    const d = rayBlockDistance(ox, oy, a, range);
    pts.push({ x: ox + Math.cos(a) * d, y: oy + Math.sin(a) * d });
  }
  return pts;
}

export function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function pointInCone(px, py, ox, oy, angle, range, halfAngle) {
  const dx = px - ox;
  const dy = py - oy;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (Math.abs(angleDifference(Math.atan2(dy, dx), angle)) > halfAngle) return false;
  return hasLineOfSight(ox, oy, px, py);
}

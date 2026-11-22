// GILDED MIDNIGHT — guard patrols and the suspicion ladder.
// A guard walks his beat, pauses to look, and only believes his eyes when
// the thief stays inside his cone. Suspicion drains the moment the thief
// breaks line of sight, so a near miss is a scare, not a sentence.
import { TUNING } from './config.js';
import { pointInCone, angleDifference } from './vision.js';
import { pointInVent } from './level.js';

export function makeGuard(post) {
  return {
    name: post.name,
    x: post.start.x,
    y: post.start.y,
    angle: Math.PI / 2,
    waypoints: post.waypoints,
    wpIndex: 1,
    pause: 0,
    state: 'patrol', // patrol | suspicious | investigate | hunt
    suspicion: 0,
    investigateX: 0,
    investigateY: 0,
    lookTimer: 0,
  };
}

export function guardSeesThief(g, thief) {
  if (thief.inVent) return false;
  if (thief.sneaking) {
    // A sneaking thief is harder to spot: shorter effective cone.
    return pointInCone(thief.x, thief.y, g.x, g.y, g.angle, TUNING.coneRange * 0.62, TUNING.coneHalfAngle);
  }
  return pointInCone(thief.x, thief.y, g.x, g.y, g.angle, TUNING.coneRange, TUNING.coneHalfAngle);
}

function moveToward(g, tx, ty, speed, dt) {
  const dx = tx - g.x;
  const dy = ty - g.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return true;
  const step = Math.min(dist, speed * dt);
  g.x += (dx / dist) * step;
  g.y += (dy / dist) * step;
  g.angle = Math.atan2(dy, dx);
  return dist - step < 2;
}

export function updateGuard(g, dt, thief, onSpotted) {
  const sees = guardSeesThief(g, thief);
  if (sees) {
    g.suspicion = Math.min(100, g.suspicion + TUNING.suspectPerSecond * dt);
    g.investigateX = thief.x;
    g.investigateY = thief.y;
    if (g.suspicion >= 100 && g.state !== 'hunt') {
      g.state = 'hunt';
      onSpotted(g);
    } else if (g.suspicion >= 35 && g.state === 'patrol') {
      g.state = 'suspicious';
    }
  } else {
    g.suspicion = Math.max(0, g.suspicion - TUNING.suspectDecay * dt);
    if (g.state === 'suspicious' && g.suspicion <= 0) g.state = 'patrol';
  }

  if (g.state === 'hunt') {
    const arrived = moveToward(g, thief.x, thief.y, TUNING.guardHunt, dt);
    if (!sees && g.suspicion <= 0) g.state = 'investigate';
    if (arrived) return;
  } else if (g.state === 'investigate') {
    const arrived = moveToward(g, g.investigateX, g.investigateY, TUNING.guardWalk * 1.3, dt);
    if (arrived) {
      g.lookTimer += dt;
      g.angle += dt * 1.8;
      if (g.lookTimer > 2.4) {
        g.lookTimer = 0;
        g.state = 'patrol';
      }
    }
  } else if (g.state === 'suspicious') {
    // Freeze, stare at the last seen spot, then go and check it.
    g.angle = Math.atan2(g.investigateY - g.y, g.investigateX - g.x);
    if (g.suspicion >= 60) g.state = 'investigate';
  } else {
    // Patrol: walk the beat, pause and look around at each waypoint.
    if (g.pause > 0) {
      g.pause -= dt;
      g.angle += dt * 0.9;
    } else {
      const wp = g.waypoints[g.wpIndex];
      const arrived = moveToward(g, wp.x, wp.y, TUNING.guardWalk, dt);
      if (arrived) {
        g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
        g.pause = 1.1;
      }
    }
  }
}

export function guardStateWord(g) {
  if (g.state === 'hunt') return 'HUNTING';
  if (g.state === 'investigate') return 'SEARCHING';
  if (g.state === 'suspicious') return 'SUSPICIOUS';
  return 'PATROL';
}

export function guardCaughtThief(g, thief) {
  return Math.hypot(g.x - thief.x, g.y - thief.y) < TUNING.guardRadius + TUNING.thiefRadius - 2;
}

export function thiefHiddenInVent(thief) {
  return pointInVent(thief.x, thief.y);
}

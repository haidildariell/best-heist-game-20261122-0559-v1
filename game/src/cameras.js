// GILDED MIDNIGHT — the two CCTV eyes.
// A camera sweeps its arc on a fixed rhythm and sees exactly like a guard,
// only in red. An EMP burst blacks it out for a few seconds — the one
// moment the vault door is safe to cross.
import { TUNING } from './config.js';
import { pointInCone } from './vision.js';

export function makeCamera(post) {
  return {
    id: post.id,
    x: post.x,
    y: post.y,
    baseAngle: post.baseAngle,
    arc: post.arc,
    phase: post.id === 'cam-vault' ? 0 : 1.7,
    disabled: 0,
  };
}

export function cameraAngle(cam, time) {
  return cam.baseAngle + Math.sin(time * TUNING.cameraSweep + cam.phase) * cam.arc;
}

export function cameraSeesThief(cam, time, thief) {
  if (cam.disabled > 0) return false;
  if (thief.inVent) return false;
  return pointInCone(thief.x, thief.y, cam.x, cam.y, cameraAngle(cam, time), TUNING.cameraRange, TUNING.cameraHalfAngle);
}

export function updateCamera(cam, dt) {
  if (cam.disabled > 0) cam.disabled = Math.max(0, cam.disabled - dt);
}

export function disableAllCameras(cameras, seconds) {
  for (const cam of cameras) cam.disabled = seconds;
}

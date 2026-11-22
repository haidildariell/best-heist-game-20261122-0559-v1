// GILDED MIDNIGHT — the Aurelia Gallery as data.
// One room, three ways through it: the open hall, the case maze, and the
// vent shaft along the north wall. Tall cover blocks sight; velvet rope
// does not — it only marks where a thief should not be seen standing.
import { FLOOR_BOTTOM, FLOOR_TOP } from './config.js';

export const GALLERY = {
  name: 'THE AURELIA GALLERY — NIGHT WING',
  bounds: { x: 24, y: FLOOR_TOP + 8, w: 1232, h: FLOOR_BOTTOM - FLOOR_TOP - 16 },
};

// Tall cover: display cases, pillars, the vault shell. Vision cones die here.
export const TALL_COVER = [
  { x: 300, y: 210, w: 150, h: 70, label: 'RUBY CASE' },
  { x: 560, y: 190, w: 150, h: 70, label: 'JADE CASE' },
  { x: 820, y: 210, w: 130, h: 70, label: 'PEARL CASE' },
  { x: 430, y: 430, w: 150, h: 70, label: 'IVORY CASE' },
  { x: 700, y: 450, w: 150, h: 70, label: 'ONYX CASE' },
  { x: 950, y: 430, w: 120, h: 70, label: 'TOPAZ CASE' },
  { x: 180, y: 330, w: 60, h: 60, label: 'PILLAR' },
  { x: 640, y: 320, w: 60, h: 60, label: 'PILLAR' },
  { x: 1080, y: 330, w: 60, h: 60, label: 'PILLAR' },
  { x: 330, y: 600, w: 60, h: 60, label: 'PILLAR' },
  { x: 880, y: 600, w: 60, h: 60, label: 'PILLAR' },
  // The vault shell: solid except for the door gap on its west side.
  { x: 1020, y: 130, w: 220, h: 26, label: 'VAULT WALL' },
  { x: 1020, y: 300, w: 220, h: 26, label: 'VAULT WALL' },
  { x: 1214, y: 130, w: 26, h: 196, label: 'VAULT WALL' },
  { x: 1020, y: 130, w: 26, h: 84, label: 'VAULT WALL' },
  { x: 1020, y: 244, w: 26, h: 82, label: 'VAULT WALL' },
];

// Velvet ropes: low, decorative, never block a cone. Crossing one in the
// open is what gets a thief noticed.
export const ROPES = [
  { x1: 300, y1: 300, x2: 450, y2: 300 },
  { x1: 560, y1: 280, x2: 710, y2: 280 },
  { x1: 820, y1: 300, x2: 950, y2: 300 },
  { x1: 430, y1: 520, x2: 580, y2: 520 },
  { x1: 700, y1: 540, x2: 850, y2: 540 },
];

// The vent shaft: a thief inside it cannot be seen at all, but crawls slow.
export const VENT = { x: 120, y: 112, w: 820, h: 30, entryX: 150, exitX: 900 };

export const VAULT = { x: 1046, y: 156, w: 168, h: 144 };
export const IDOL = { x: 1130, y: 228, r: 16 };
export const EXIT_DOOR = { x: 36, y: 690, w: 130, h: 66 };
export const ENTRY_DOOR = { x: 300, y: 700, w: 110, h: 56 };

export const SIDE_LOOT = [
  { id: 'painting-north', kind: 'painting', x: 500, y: 128, value: 120, label: 'MOONLIT CANAL' },
  { id: 'painting-west', kind: 'painting', x: 52, y: 480, value: 120, label: 'THE DUCHESS' },
  { id: 'gem-south', kind: 'gem', x: 620, y: 700, value: 80, label: 'STAR SAPPHIRE' },
  { id: 'gem-east', kind: 'gem', x: 1180, y: 560, value: 80, label: 'FIRE OPAL' },
];

export const GUARD_POSTS = [
  {
    name: 'MARA',
    start: { x: 375, y: 380 },
    waypoints: [
      { x: 375, y: 380 },
      { x: 640, y: 380 },
      { x: 900, y: 380 },
      { x: 900, y: 560 },
      { x: 375, y: 560 },
    ],
  },
  {
    name: 'DARIO',
    start: { x: 980, y: 180 },
    waypoints: [
      { x: 980, y: 180 },
      { x: 980, y: 380 },
      { x: 1140, y: 380 },
      { x: 1140, y: 180 },
    ],
  },
  {
    name: 'SELIN',
    start: { x: 220, y: 620 },
    waypoints: [
      { x: 220, y: 620 },
      { x: 620, y: 620 },
      { x: 620, y: 700 },
      { x: 220, y: 700 },
    ],
  },
];

export const CAMERA_POSTS = [
  { id: 'cam-vault', x: 1000, y: 140, baseAngle: Math.PI / 2, arc: 1.1 },
  { id: 'cam-hall', x: 640, y: 120, baseAngle: Math.PI / 2, arc: 1.4 },
];

export function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function pointInVent(px, py) {
  return pointInRect(px, py, VENT);
}

export function rectsCollide(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

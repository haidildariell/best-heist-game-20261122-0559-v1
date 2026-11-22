// GILDED MIDNIGHT — tuning table and palette.
// One place owns every number the rest of the game reads, so balancing the
// heist means editing this file and nothing else.
export const VIEW_W = 1280;
export const VIEW_H = 800;
export const HUD_H = 96;
export const FLOOR_TOP = HUD_H;
export const FLOOR_BOTTOM = VIEW_H - 34;

export const TUNING = {
  thiefWalk: 165,
  thiefSneak: 95,
  thiefSprint: 265,
  thiefRadius: 13,
  guardWalk: 78,
  guardHunt: 150,
  guardRadius: 14,
  coneRange: 250,
  coneHalfAngle: 0.46,
  cameraRange: 230,
  cameraHalfAngle: 0.38,
  cameraSweep: 0.55,
  suspectPerSecond: 55,
  suspectDecay: 26,
  alarmPerSpot: 34,
  alarmDecay: 4,
  huntAlarm: 70,
  coinCount: 3,
  coinNoiseRadius: 170,
  empCost: 40,
  empDisableSeconds: 9,
  maxStrikes: 3,
  idolValue: 500,
  paintingValue: 120,
  gemValue: 80,
  ghostBonus: 250,
};

export const PALETTE = {
  wall: '#1c2438',
  wallEdge: '#3d5178',
  floorA: '#232c42',
  floorB: '#20273a',
  floorTrim: '#8a6d2f',
  carpet: '#4a2b3a',
  tallCover: '#31435f',
  tallCoverTop: '#4a6288',
  rope: '#c9a227',
  vent: '#2e4a3a',
  ventEdge: '#5fae7e',
  exit: '#1f7a44',
  exitGlow: '#39d98a',
  gold: '#f5c542',
  goldGlow: '#ffe98a',
  guard: '#e8e4d8',
  guardCoat: '#8c2f39',
  cone: 'rgba(245, 197, 66, 0.30)',
  coneEdge: 'rgba(245, 197, 66, 0.75)',
  cameraCone: 'rgba(255, 84, 84, 0.28)',
  cameraConeEdge: 'rgba(255, 84, 84, 0.8)',
  thief: '#2b2f3a',
  thiefTrim: '#f5c542',
  hudBack: '#12172a',
  hudLine: '#3d5178',
  ink: '#f2ead8',
  dimInk: '#aab4cc',
  alarmLow: '#39d98a',
  alarmMid: '#f5c542',
  alarmHigh: '#ff5454',
};

export const GUARD_NAMES = ['MARA', 'DARIO', 'SELIN'];

# GILDED MIDNIGHT — The Aurelia Idol Heist

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/haidildariell/best-heist-game-20261122-0559-v1/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/haidildariell/best-heist-game-20261122-0559-v1/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

Bounty: [Make the best heist game — best-heist-game-20261122-0559 on make.fun](https://make.fun/bounty/best-heist-game-20261122-0559)

A top-down heist game about stealing a golden idol. You are a thief in the
Aurelia Gallery at night: cross one guarded hall, take the idol from the
vault, and reach the green EXIT unseen.

## How it plays

- **Cones you can trust.** Every guard's vision cone is ray-cast against
  the tall display cases and pillars, so a cone visibly dies on the cover
  you hide behind. Two red CCTV cameras sweep the same way — and the same
  cover blocks them.
- **Detection that talks.** The top strip states the situation in plain
  words — UNSEEN, SUSPICIOUS ?, HUNTED ! — beside a labelled alarm meter.
  Suspicion drains when you break line of sight, so a near miss is a scare,
  not a death sentence.
- **Three ways through.** The open hall, the case maze, or the vent shaft
  along the north wall — slow, but invisible inside it.
- **Tools at a cost.** A thrown coin (CLICK) rings noise that pulls a guard
  off his patrol; an EMP (X) blacks out both cameras for 9 seconds and
  costs $40 of your loot.
- **Strikes and ghosts.** Caught means a strike and a walk back to the
  service door; three strikes end the night. Finish never spotted for the
  GHOST bonus.

## Controls

WASD / arrows move · SHIFT sneak · SPACE sprint (loud) · CLICK throw a coin ·
X EMP · E take / use exit · H field ledger · M mute · R retry

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to the
  output directory and writes `dossier.json` with the vendored library.
- `serve.ts` — a tiny local server (`node serve.ts`, http://localhost:8080).
- `game/` — the game itself, plain static files, no build step, no network.
  Its source is split one job per file under `game/src/`: `config.js`
  (tuning and palette), `level.js` (the gallery as data), `vision.js`
  (ray-cast cones and line of sight), `guards.js` (patrols and suspicion),
  `cameras.js` (the sweeping CCTV eyes), `thief.js` (movement, noise and
  tools), `input.js` (keyboard and mouse), `audio.js` (synthesized sound),
  `hud.js` (the talking HUD, banner and ledger), `render.js` (the room),
  `shots.js` (the posed scenes behind `?shot=start|play|end`), `main.js`
  (the loop and the rules of the night).
- `screenshots/` — three renders of the game itself: the title, a coin
  pulling MARA off her patrol while the alarm climbs, and the clean getaway.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

## License

MIT — see `LICENSE`.

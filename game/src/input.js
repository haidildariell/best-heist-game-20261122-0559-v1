// GILDED MIDNIGHT — keyboard and mouse, nothing else.
// WASD/arrows move, SHIFT sneaks, SPACE sprints, E takes and uses, Q or a
// click throws a coin, X fires the EMP, H opens the field ledger, R retries.
export function makeInput() {
  return {
    keys: new Set(),
    mouseX: 640,
    mouseY: 400,
    clicked: false,
    pressed: new Set(), // edge-triggered keys, consumed once per frame
  };
}

export function attachInput(input, canvas, onFirstGesture) {
  let gestured = false;
  const gesture = () => {
    if (!gestured) {
      gestured = true;
      onFirstGesture();
    }
  };
  window.addEventListener('keydown', (e) => {
    gesture();
    const k = e.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
    if (!e.repeat) input.pressed.add(k);
    input.keys.add(k);
  });
  window.addEventListener('keyup', (e) => input.keys.delete(e.key.toLowerCase()));
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    input.mouseX = ((e.clientX - rect.left) / rect.width) * canvas.width;
    input.mouseY = ((e.clientY - rect.top) / rect.height) * canvas.height;
  });
  canvas.addEventListener('mousedown', (e) => {
    gesture();
    if (e.button === 0) input.clicked = true;
  });
  window.addEventListener('blur', () => input.keys.clear());
}

export function moveVector(input) {
  let dx = 0;
  let dy = 0;
  if (input.keys.has('a') || input.keys.has('arrowleft')) dx -= 1;
  if (input.keys.has('d') || input.keys.has('arrowright')) dx += 1;
  if (input.keys.has('w') || input.keys.has('arrowup')) dy -= 1;
  if (input.keys.has('s') || input.keys.has('arrowdown')) dy += 1;
  return { dx, dy };
}

export function consumePress(input, key) {
  if (input.pressed.has(key)) {
    input.pressed.delete(key);
    return true;
  }
  return false;
}

export function endFrameInput(input) {
  input.pressed.clear();
  input.clicked = false;
}

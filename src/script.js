let c = a.getContext("2d"), 
w=window,
M=Math,
r = M.random,
ruleSets = [
  {id: 2, name: "🧱📄✂️  Rock, Paper, Scissors", rules: '✂️ cuts 📄 covers 🧱 crushes ✂️'},
],
SIZE = 0,
SPEED = 3,
gameOn = false,
targetMap = {},
chosen = ruleSets[0],
center = {},
emojis = [],
killFeed = [],
pieces = (new Array(90)).fill().map(() => ({o:'', x: 0, y: 0})),
myInterval = null,
gameRestartTimeout = null,
gameStartTimeout = null;
let init = () => {
  w.addEventListener('resize', resize);
  resize();
  ruleSets.map(r => r.rulesArr = r.rules.split(' '));
  if (!myInterval) myInterval = setInterval(update, 50);
  start();
};
const initEmojis = () => {
  const size = chosen.rulesArr.length;
  targetMap = {};
  let emoji;
  for (let i = 0; i < chosen.rulesArr.length; i += 2) {
    emoji = chosen.rulesArr[i];
    if (!targetMap[emoji]) targetMap[emoji] = [];
    if (i < size - 1) targetMap[emoji].push(chosen.rulesArr[i + 2]);
  }
  emojis = Object.keys(targetMap);
};
const start = () => {
  initEmojis();
  let o;
  for (i = 0; i < 90; i++) {
    o = pieces[i];
    o.o = emojis[i % emojis.length];
    o.x = r() * innerWidth;
    o.y = r() * innerHeight
  }
  killFeed = [];
  if (gameRestartTimeout) clearTimeout(gameRestartTimeout);
  if (gameStartTimeout) clearTimeout(gameStartTimeout);
  resize();
  gameOn = false;

  const isLizardSpock = chosen.id === 1;
  tempY = center.y - (SIZE * 2);
  write(chosen.name, center.x, tempY + SIZE * 1.5, SIZE * (isLizardSpock ? .8 : 1), true);
  gameStartTimeout = setTimeout(() => gameOn = true, 3000);
};
let pieceMap = {};

let isTarget = (p1, p2) => p2.o && targetMap[p1.o] && targetMap[p1.o].includes(p2.o);
let t = Date.now(), elapsed = 0, targets, weakness, closest, pangle, winIndex, tempY;
let update = () => {
  if (!gameOn) return;
  elapsed = Date.now() - t;
  clear();
  pieces.sort((a, b) => a.y - b.y);
  pieces.map(p => {
    if (!p.o) return;
    c.fillText(p.o, p.x - SIZE / 2, p.y + SIZE / 2 + ((elapsed + emojis.indexOf(p.o)) % 5));
    targets = pieces.filter(p2 => isTarget(p, p2));
    if (targets.length > 0) {
      targets.sort((a, b) => dist(p, a) - dist(p, b));
      closest = targets[0];
      pangle = angle(p, closest);
      p.x += SPEED * M.cos(pangle);
      p.y += SPEED * M.sin(pangle);
  
      if (dist(p, closest) < 3) {
        winIndex = chosen.rulesArr.indexOf(p.o, chosen.rulesArr.indexOf(closest.o));
        killFeed.unshift(getFeed(p.o, closest.o));
        closest.o = '';
        c.fillText(chosen.collision || '💥', p.x - SIZE / 2, p.y + SIZE / 2);
      }
    }
    else {
      weakness = pieces.filter(p2 => !isTarget(p, p2));
      if (weakness.length > 0) {
        weakness.sort((a, b) => dist(p, a) - dist(p, b));
        closest = weakness[0];
        pangle = revertAngle(angle(p, closest));
        p.x += (SPEED / 3) * M.cos(pangle);
        p.y += (SPEED / 3) * M.sin(pangle);
      }
    }
  });

  tempY = 0;
  emojis.map((o, i) => {
    pieceMap[o] = pieces.filter(p => p.o === o);
    tempY = (SIZE) + (i * SIZE * 1.2);
  });
  tempY += SIZE * 1.2;

  if (isEndGame()) {
    gameRestartTimeout = setTimeout(start, 5000);
    gameOn = false;
  }
};
let getFeed = (a, b) => {
  let stop = false;
  let startIndex = 0;
  while (!stop) {
    indexA = chosen.rulesArr.indexOf(a, startIndex);
    if (indexA === -1) stop = true;
    if (b == chosen.rulesArr[indexA + 2]) {
      return `${a} ${chosen.rulesArr[indexA + 1]} ${b}`;
    }
    startIndex = indexA + 2;
  }
  return `${a} defeated ${b}`;
};


let isEndGame = () => emojis.filter(o => didWin(o)).length === 1;
let isDead = o => !pieceMap[o] || pieceMap[o].length === 0;
let didWin = p => {
  if (emojis.filter(o => o !== p && isDead(o)).length === emojis.length - 1) {
    write(p + ' WINS', center.x, center.y, SIZE * 3, true);
    return true;
  }
  return false;
};
onload = () => init();
const resize = () => {
  a.width = innerWidth;
  a.height = innerHeight;
  SIZE = M.min(a.width, a.height) / 15;
  c.font = SIZE + 'px serif';
  center.x = innerWidth / 2
  center.y = innerHeight / 2;
};
let clear = () => {
  c.fillStyle = "#888";
  c.rect(0, 0, innerWidth, innerHeight);
  c.fill();
};
let write = (str, x, y, fontSize, centered) => {
  if (!(y < innerHeight && y > 0 && x > 0 && x < innerWidth)) return; 
  c.font = fontSize + 'px serif';
  if (centered) x -= c.measureText(str).width / 2;
  c.fillText(str, x, y);
};
let dist = (p1, p2) => {
  let a = p1.x - p2.x,
  b = p1.y - p2.y;
  return M.sqrt(a * a + b * b);
};
let angle = (p1, p2) => M.atan2(p2.y - p1.y, p2.x - p1.x);
let revertAngle = radians => (radians + M.PI) % (2 * Math.PI);

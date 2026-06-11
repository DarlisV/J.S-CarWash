/* ══════════════════════════════════════════════════════════
   JS.Jesus Car Wash — Script de Animación
   Experiencia scroll tipo Apple: carro lavándose
══════════════════════════════════════════════════════════ */

'use strict';

/* ── Escenas ── */
const SCENES = [
  {
    label: 'JS.Jesus Car Wash · Santo Domingo',
    title: 'El lavado que tu carro merece',
    desc:  'Scrollea para ver el proceso completo de principio a fin.',
    phase: 'intro',
  },
  {
    label: 'Estado inicial',
    title: 'Así entra tu carro',
    desc:  'El polvo, el barro y la mugre del día a día se acumulan. Así comienza cada trabajo.',
    phase: 'dirty',
  },
  {
    label: 'Paso 1 — Pre-lavado',
    title: 'Agua a presión',
    desc:  'Chorros a alta presión eliminan la suciedad superficial y preparan la carrocería.',
    phase: 'water',
  },
  {
    label: 'Paso 2 — Jabón',
    title: 'Espuma activa',
    desc:  'Espuma de alta densidad penetra cada superficie y disuelve grasa y residuos adheridos.',
    phase: 'foam',
  },
  {
    label: 'Paso 3 — Enjuague',
    title: 'Enjuague total',
    desc:  'Enjuague completo que arrastra toda la espuma. La carrocería queda lista.',
    phase: 'rinse',
  },
  {
    label: 'Paso 4 — Secado',
    title: 'Microfibra premium',
    desc:  'Secado manual con paño de microfibra. Sin marcas, sin rayaduras.',
    phase: 'dry',
  },
  {
    label: 'Resultado final',
    title: 'Brillo total, carro limpio',
    desc:  'Tu vehículo luce como el primer día. Esto es JS.Jesus Car Wash.',
    phase: 'shine',
  },
];

/* ── Canvas ── */
const canvas = document.getElementById('car-canvas');
const ctx    = canvas.getContext('2d');

let W = 0, H = 0;
const DPR = Math.min(window.devicePixelRatio || 1, 2);

/* Estado global de animación */
let currentPhase  = 'intro';
let phaseProgress = 0;
let frameTime     = 0;
let particles     = [];
let foamBubbles   = [];
let dryOffset     = 0;

/* ── Resize ── */
function resize() {
  W = canvas.clientWidth;
  H = canvas.clientHeight;
  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  buildParticles();
  buildFoam();
}

/* ── Partículas de suciedad ── */
function buildParticles() {
  particles = Array.from({ length: 90 }, () => ({
    ox: (Math.random() - 0.5) * 340,
    oy: (Math.random() - 0.5) * 85 + 10,
    r:  2 + Math.random() * 5.5,
    a:  0.25 + Math.random() * 0.5,
    c:  Math.random() > 0.5 ? '#5c4820' : '#3d2f0e',
  }));
}

/* ── Burbujas de espuma ── */
function buildFoam() {
  foamBubbles = Array.from({ length: 130 }, () => ({
    ox: (Math.random() - 0.5) * 360,
    oy: (Math.random() - 0.5) * 100 + 5,
    r:  3 + Math.random() * 13,
    a:  0.3 + Math.random() * 0.55,
    speed: 0.15 + Math.random() * 0.3,
    phase: Math.random() * Math.PI * 2,
  }));
}

/* ── Helpers ── */
const lerp = (a, b, t) => a + (b - a) * clamp(t, 0, 1);
const clamp = (v, mn, mx) => Math.max(mn, Math.min(mx, v));

function hexLerp(a, b, t) {
  const p = h => [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
  const [ar,ag,ab] = p(a), [br,bg,bb] = p(b);
  const r = Math.round(lerp(ar,br,t)).toString(16).padStart(2,'0');
  const g = Math.round(lerp(ag,bg,t)).toString(16).padStart(2,'0');
  const bx= Math.round(lerp(ab,bb,t)).toString(16).padStart(2,'0');
  return `#${r}${g}${bx}`;
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y,   x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x,   y+h, r);
  ctx.arcTo(x,   y+h, x,   y,   r);
  ctx.arcTo(x,   y,   x+w, y,   r);
  ctx.closePath();
}

/* ── Cuánto barro tiene el carro (0=limpio, 1=sucio) ── */
function dirtyLevel() {
  switch (currentPhase) {
    case 'intro':  return 0.08;
    case 'dirty':  return 0.08 + 0.92 * phaseProgress;
    case 'water':  return lerp(1, 0.35, phaseProgress);
    case 'foam':   return lerp(0.35, 0.05, phaseProgress);
    case 'rinse':  return lerp(0.05, 0, phaseProgress);
    default:       return 0;
  }
}

/* ═══════════════════════
   DIBUJO DEL CARRO
═══════════════════════ */
function drawCar() {
  const cx = W / 2;
  const cy = H / 2 - H * 0.03;
  const sc = Math.min(W, H) * 0.0026;
  const dl = dirtyLevel();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(sc, sc);

  /* Sombra base */
  const sg = ctx.createRadialGradient(0, 95, 0, 0, 95, 150);
  sg.addColorStop(0, 'rgba(0,0,0,0.38)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.translate(0, 0);
  ctx.scale(1, 0.18);
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(0, 530, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* Color de carrocería: azul limpio → sucio amarronado */
  const bodyColor = hexLerp('#1e4db0', '#2a1c08', dl);
  const roofColor = hexLerp('#1a40a0', '#211506', dl);

  /* Carrocería */
  ctx.save();
  rr(ctx, -162, 6, 324, 76, 12);
  ctx.fillStyle = bodyColor;
  ctx.fill();
  ctx.restore();

  /* Techo */
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(-105, 6);
  ctx.bezierCurveTo(-88, -55, 88, -55, 105, 6);
  ctx.closePath();
  ctx.fillStyle = roofColor;
  ctx.fill();
  ctx.restore();

  /* Ventanas */
  const winA = lerp(0.78, 0.22, dl);
  ctx.save();
  ctx.globalAlpha = winA;
  const winPanels = [
    { x: -100, y: 6, w: 60,  h: 45, rx: 4 },
    { x: -36,  y: 6, w: 86,  h: 50, rx: 4 },
    { x:  56,  y: 6, w: 50,  h: 45, rx: 4 },
  ];
  winPanels.forEach(p => {
    rr(ctx, p.x, p.y - p.h, p.w, p.h, p.rx);
    ctx.fillStyle = '#bae6fd';
    ctx.fill();
  });
  ctx.restore();

  /* Faro delantero */
  ctx.save();
  ctx.globalAlpha = lerp(0.92, 0.25, dl);
  rr(ctx, 142, 18, 24, 14, 5);
  ctx.fillStyle = '#fef3c7';
  ctx.fill();
  ctx.restore();

  /* Faro trasero */
  ctx.save();
  ctx.globalAlpha = lerp(0.88, 0.22, dl);
  rr(ctx, -166, 18, 20, 14, 5);
  ctx.fillStyle = '#fca5a5';
  ctx.fill();
  ctx.restore();

  /* Ruedas */
  drawWheel(ctx, -115, 85, dl);
  drawWheel(ctx,  115, 85, dl);

  /* Reflejo del capó — solo cuando limpio */
  const refA = lerp(0, 1, 1 - dl);
  if (refA > 0.02) {
    ctx.save();
    const rg = ctx.createLinearGradient(-100, 0, 100, 40);
    rg.addColorStop(0, `rgba(255,255,255,0)`);
    rg.addColorStop(0.45, `rgba(255,255,255,${0.18 * refA})`);
    rg.addColorStop(1, `rgba(255,255,255,0)`);
    rr(ctx, -162, 6, 324, 40, 12);
    ctx.fillStyle = rg;
    ctx.fill();
    ctx.restore();
  }

  ctx.restore(); /* /translate+scale */
}

function drawWheel(ctx, x, y, dl) {
  ctx.save();
  ctx.translate(x, y);
  /* Neumático */
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.fillStyle = hexLerp('#111111', '#1a1005', dl);
  ctx.fill();
  /* Llanta */
  ctx.beginPath();
  ctx.arc(0, 0, 17, 0, Math.PI * 2);
  ctx.fillStyle = hexLerp('#c0c8d8', '#6a5030', dl);
  ctx.fill();
  /* Buje */
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = hexLerp('#e8ecf4', '#3a2810', dl);
  ctx.fill();
  ctx.restore();
}

/* ═══════════════════════
   EFECTOS DE FASE
═══════════════════════ */

/* Suciedad */
function drawDirt(alpha) {
  if (alpha <= 0.01) return;
  const cx = W/2, cy = H/2 - H*0.03;
  const sc = Math.min(W,H) * 0.0026;
  ctx.save();
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(cx + p.ox * sc, cy + p.oy * sc, p.r * Math.min(sc,1), 0, Math.PI*2);
    ctx.fillStyle = p.c;
    ctx.globalAlpha = alpha * p.a;
    ctx.fill();
  });
  ctx.restore();
}

/* Agua */
function drawWater(prog, t) {
  if (prog <= 0.01) return;
  const cx = W/2, cy = H/2;
  const sc = Math.min(W,H) * 0.0026;
  const top   = cy - H*0.03 - 55*sc;
  const bot   = cy - H*0.03 + 10*sc;
  const left  = cx - 162*sc;
  const right = cx + 162*sc;
  const n = 14;

  ctx.save();
  for (let i = 0; i < n; i++) {
    const x = left + (right - left) * (i / (n-1));
    const p = ((t * 0.0035 + i * 0.22) % 1);
    const y1 = top - 55*sc * (1-p);
    const y2 = bot * p + top * (1-p);

    ctx.strokeStyle = `rgba(100,190,255,${prog * (0.4 + 0.4 * Math.sin(t*0.012 + i))})`;
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.globalAlpha = prog;
    ctx.beginPath();
    ctx.moveTo(x, y1);
    ctx.lineTo(x, y2);
    ctx.stroke();

    /* Splash al impactar */
    if (p > 0.82) {
      const sp = (p - 0.82) / 0.18;
      ctx.globalAlpha = prog * (1 - sp) * 0.7;
      for (let s = 0; s < 5; s++) {
        const a = (Math.PI*2/5)*s + t*0.006;
        const d = 7*sc*sp;
        ctx.beginPath();
        ctx.arc(x + Math.cos(a)*d, bot + Math.sin(a)*d*0.35, 2, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(150,215,255,0.8)';
        ctx.fill();
      }
    }
  }

  /* Destello azul lateral */
  const bg = ctx.createLinearGradient(cx-25, 0, cx+25, 0);
  bg.addColorStop(0, 'rgba(37,99,235,0)');
  bg.addColorStop(0.5, `rgba(37,99,235,${0.07*prog})`);
  bg.addColorStop(1, 'rgba(37,99,235,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = bg;
  ctx.fillRect(cx-25, 0, 50, H);
  ctx.restore();
}

/* Espuma */
function drawFoam(prog, t) {
  if (prog <= 0.01) return;
  const cx = W/2, cy = H/2 - H*0.03;
  const sc = Math.min(W,H) * 0.0026;

  ctx.save();
  foamBubbles.forEach(b => {
    const drift = Math.sin(t * 0.002 * b.speed + b.phase) * 4;
    const bx = cx + b.ox * sc + drift;
    const by = cy + b.oy * sc - (t * 0.04 * b.speed % (120*sc));

    ctx.beginPath();
    ctx.arc(bx, by, b.r, 0, Math.PI*2);
    ctx.fillStyle   = `rgba(255,255,255,${prog * b.a * 0.32})`;
    ctx.strokeStyle = `rgba(200,230,255,${prog * b.a * 0.58})`;
    ctx.lineWidth   = 0.8;
    ctx.fill();
    ctx.stroke();

    /* Highlight interior */
    const pulse = 0.5 + 0.5*Math.sin(t*0.006 + b.phase);
    ctx.beginPath();
    ctx.arc(bx - b.r*0.28, by - b.r*0.28, b.r*0.24, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,255,255,${prog * 0.38 * pulse})`;
    ctx.fill();
  });
  ctx.restore();
}

/* Enjuague */
function drawRinse(prog, t) {
  if (prog <= 0.01) return;
  const cx = W/2, cy = H/2;
  const sc = Math.min(W,H) * 0.0026;
  const top  = cy - H*0.03 - 60*sc;
  const left  = cx - 162*sc;
  const right = cx + 162*sc;
  const n = 22;

  ctx.save();
  ctx.globalAlpha = prog;
  for (let i = 0; i < n; i++) {
    const x = left + (right-left)*(i/(n-1)) + Math.sin(t*0.004+i)*3*sc;
    const sp = 0.003 + Math.random()*0.002;
    const p  = ((t*sp + i*0.14) % 1);
    const y  = top + (H*0.55)*p;

    ctx.strokeStyle = `rgba(80,170,255,${0.25 + 0.35*Math.sin(t*0.009+i)})`;
    ctx.lineWidth   = 1.5;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  /* Charco en el piso */
  const floorY = cy + H*0.12;
  const pg = ctx.createLinearGradient(left, floorY, right, floorY);
  pg.addColorStop(0, 'rgba(37,99,235,0)');
  pg.addColorStop(0.5, `rgba(37,99,235,${0.14*prog})`);
  pg.addColorStop(1, 'rgba(37,99,235,0)');
  rr(ctx, left, floorY, right-left, 12*sc, 6*sc);
  ctx.fillStyle = pg;
  ctx.fill();

  ctx.restore();
}

/* Secado */
function drawDry(prog, t) {
  if (prog <= 0.01) return;
  const cx = W/2, cy = H/2 - H*0.03;
  const sc = Math.min(W,H) * 0.0026;
  const left  = cx - 164*sc;
  const right = cx + 164*sc;
  const top   = cy - 56*sc;
  const bot   = cy + 78*sc;
  const width = right - left;

  dryOffset = (t * 0.7) % (width + 60*sc);
  const wx = left + dryOffset - 30*sc;

  ctx.save();
  ctx.globalAlpha = prog * 0.72;

  /* Franja de microfibra */
  const wg = ctx.createLinearGradient(wx, 0, wx + 60*sc, 0);
  wg.addColorStop(0, 'rgba(220,235,255,0)');
  wg.addColorStop(0.5, 'rgba(220,235,255,0.38)');
  wg.addColorStop(1, 'rgba(220,235,255,0)');
  ctx.fillStyle = wg;
  ctx.fillRect(wx, top, 60*sc, bot - top);

  /* Rastro brillante detrás */
  const tg = ctx.createLinearGradient(left, 0, wx, 0);
  tg.addColorStop(0, 'rgba(255,255,255,0.02)');
  tg.addColorStop(1, `rgba(255,255,255,${0.1*prog})`);
  ctx.fillStyle = tg;
  ctx.fillRect(left, top, Math.max(0, wx - left), bot - top);

  ctx.restore();
}

/* Brillo */
function drawShine(prog, t) {
  if (prog <= 0.01) return;
  const cx = W/2, cy = H/2 - H*0.03;
  const sc = Math.min(W,H) * 0.0026;

  /* Halo central */
  const pulse = 0.6 + 0.4*Math.sin(t*0.007);
  const hx = cx + 95*sc, hy = cy - 18*sc;
  const hg = ctx.createRadialGradient(hx, hy, 0, hx, hy, 55*sc);
  hg.addColorStop(0, `rgba(255,255,255,${0.88*prog*pulse})`);
  hg.addColorStop(0.35, `rgba(147,197,253,${0.35*prog*pulse})`);
  hg.addColorStop(1, 'rgba(147,197,253,0)');
  ctx.save();
  ctx.fillStyle = hg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  /* Rayos */
  const N = 8;
  for (let i = 0; i < N; i++) {
    const angle = (Math.PI*2/N)*i + t*0.002;
    const p2 = 0.5 + 0.5*Math.sin(t*0.005 + i*0.9);
    ctx.save();
    ctx.globalAlpha = prog * 0.5 * p2;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 1.5;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(hx + Math.cos(angle)*10*sc, hy + Math.sin(angle)*10*sc);
    ctx.lineTo(hx + Math.cos(angle)*0.18*W, hy + Math.sin(angle)*0.18*W);
    ctx.stroke();
    ctx.restore();
  }

  /* Destellos ✦ */
  const sparks = [
    [0.63, 0.38], [0.44, 0.45], [0.70, 0.52], [0.55, 0.34], [0.72, 0.42],
  ];
  sparks.forEach(([sx, sy], i) => {
    const sa = (0.5 + 0.5*Math.sin(t*0.008 + i*1.6)) * prog;
    const bx = W*sx, by = H*sy;
    const sz = 7*sc*sa;
    ctx.save();
    ctx.globalAlpha = sa;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 1.8;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(bx, by-sz*2);   ctx.lineTo(bx, by+sz*2);
    ctx.moveTo(bx-sz*2, by);   ctx.lineTo(bx+sz*2, by);
    ctx.stroke();
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(bx-sz, by-sz);  ctx.lineTo(bx+sz, by+sz);
    ctx.moveTo(bx+sz, by-sz);  ctx.lineTo(bx-sz, by+sz);
    ctx.stroke();
    ctx.restore();
  });
}

/* Fondo */
function drawBg(t) {
  const ph = currentPhase;
  const pr = phaseProgress;

  let c1 = '#050810', c2 = '#0a1020';
  if (ph === 'water' || ph === 'rinse') {
    c1 = hexLerp('#050810', '#04142a', pr);
    c2 = hexLerp('#0a1020', '#082040', pr);
  } else if (ph === 'foam') {
    c1 = hexLerp('#050810', '#071228', pr);
    c2 = hexLerp('#0a1020', '#0e2245', pr);
  } else if (ph === 'shine') {
    c1 = hexLerp('#050810', '#071630', pr);
    c2 = hexLerp('#0a1020', '#0e2850', pr);
  }

  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  /* Grid sutil */
  ctx.save();
  ctx.strokeStyle = 'rgba(37,99,235,0.04)';
  ctx.lineWidth = 1;
  const gs = 52;
  for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  ctx.restore();

  /* Piso reflectante */
  const fy = H/2 + H*0.12;
  const fg = ctx.createLinearGradient(0, fy, 0, fy+75);
  fg.addColorStop(0, 'rgba(37,99,235,0.07)');
  fg.addColorStop(1, 'rgba(37,99,235,0)');
  ctx.fillStyle = fg;
  ctx.fillRect(0, fy, W, 75);

  ctx.save();
  ctx.strokeStyle = 'rgba(96,165,250,0.13)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W*0.12, fy); ctx.lineTo(W*0.88, fy);
  ctx.stroke();
  ctx.restore();
}

/* ═══════════════════════
   LOOP PRINCIPAL
═══════════════════════ */
function render() {
  requestAnimationFrame(render);
  frameTime++;

  ctx.clearRect(0, 0, W, H);

  drawBg(frameTime);
  drawCar();

  const ph = currentPhase;
  const pr = phaseProgress;

  switch (ph) {
    case 'dirty':
      drawDirt(pr);
      break;
    case 'water':
      drawDirt(lerp(1, 0, pr * 0.8));
      drawWater(pr, frameTime);
      break;
    case 'foam':
      drawDirt(lerp(0.35, 0, pr));
      drawFoam(pr, frameTime);
      break;
    case 'rinse':
      drawFoam(lerp(1, 0, pr), frameTime);
      drawRinse(pr, frameTime);
      break;
    case 'dry':
      drawRinse(lerp(1, 0, pr * 0.85), frameTime);
      drawDry(pr, frameTime);
      break;
    case 'shine':
      drawShine(pr, frameTime);
      break;
  }
}

/* ═══════════════════════
   SCROLL LOGIC
═══════════════════════ */
const expEl      = document.getElementById('scroll-experience');
const fillEl     = document.getElementById('progress-fill');
const labelEl    = document.getElementById('scene-label');
const titleEl    = document.getElementById('scene-title');
const descEl     = document.getElementById('scene-desc');
const textEl     = document.getElementById('scene-text');
const hintEl     = document.getElementById('scroll-hint');

let lastScene = -1;

function onScroll() {
  const rect   = expEl.getBoundingClientRect();
  const total  = expEl.offsetHeight - window.innerHeight;
  const scrolled = clamp(-rect.top, 0, total);
  const pct    = scrolled / total;

  fillEl.style.width = (pct * 100) + '%';

  if (scrolled > 100) hintEl.classList.add('hidden');
  else hintEl.classList.remove('hidden');

  const n      = SCENES.length;
  const sf     = pct * (n - 1);
  const idx    = clamp(Math.floor(sf), 0, n - 1);
  const frac   = sf - idx;

  currentPhase  = SCENES[idx].phase;
  phaseProgress = frac;

  if (idx !== lastScene) {
    lastScene = idx;
    const sc = SCENES[idx];

    textEl.style.opacity   = '0';
    textEl.style.transform = 'translateX(-50%) translateY(12px)';

    setTimeout(() => {
      labelEl.textContent = sc.label;
      titleEl.textContent = sc.title;
      descEl.textContent  = sc.desc;
      textEl.style.opacity   = '1';
      textEl.style.transform = 'translateX(-50%) translateY(0)';
    }, 220);
  }
}

/* ═══════════════════════
   REVEAL DE CARDS
═══════════════════════ */
function setupReveal() {
  const cards = document.querySelectorAll('.svc-card');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay) || 0;
        setTimeout(() => e.target.classList.add('visible'), delay);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  cards.forEach(c => io.observe(c));
}

/* ═══════════════════════
   INIT
═══════════════════════ */
function init() {
  resize();
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Transición del texto de escena */
  textEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';

  /* Texto inicial */
  labelEl.textContent = SCENES[0].label;
  titleEl.textContent = SCENES[0].title;
  descEl.textContent  = SCENES[0].desc;

  setupReveal();
  render();
  onScroll();
}

window.addEventListener('DOMContentLoaded', init);

/* ══════════════════════════════════════════════
   INTRO — Pluto TV Style
══════════════════════════════════════════════ */

function buildIntroParticles() {
  const bg = document.getElementById('intro-bg');
  if (!bg) return;
  const count = 22;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'intro-particle';
    const size = 60 + Math.random() * 180;
    p.style.cssText = `
      width:  ${size}px;
      height: ${size}px;
      left:   ${Math.random() * 100}%;
      animation-duration:   ${5 + Math.random() * 8}s;
      animation-delay:     -${Math.random() * 10}s;
      opacity: ${0.2 + Math.random() * 0.5};
    `;
    bg.appendChild(p);
  }
}

function launchIntro() {
  buildIntroParticles();
  const screen = document.getElementById('intro-screen');
  if (!screen) return;

  /* Sale a los ~2.8s (barra de carga termina en ~2.6s) */
  setTimeout(() => {
    screen.classList.add('exit');
    /* Quitar del DOM luego de la transición */
    setTimeout(() => screen.remove(), 950);
  }, 2800);
}

/* Arrancamos el intro en DOMContentLoaded, antes que el init del canvas */
document.addEventListener('DOMContentLoaded', () => {
  launchIntro();
});

/* ══════════════════════════════════════════════
   ANTES/DESPUÉS — Subida de fotos propias
══════════════════════════════════════════════ */

function setupPhotoUploads() {
  const panels = document.querySelectorAll('.ba-panel');

  panels.forEach(panel => {
    const fileInput = panel.querySelector('.ba-file-input');
    const photoImg  = panel.querySelector('.ba-photo');
    const removeBtn = panel.querySelector('.ba-remove');

    if (!fileInput || !photoImg) return;

    /* Subir foto */
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen.');
        return;
      }

      const url = URL.createObjectURL(file);

      /* Liberar URL anterior si existía */
      if (photoImg.dataset.objectUrl) {
        URL.revokeObjectURL(photoImg.dataset.objectUrl);
      }

      photoImg.src = url;
      photoImg.dataset.objectUrl = url;
      panel.classList.add('has-photo');
    });

    /* Quitar foto */
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        if (photoImg.dataset.objectUrl) {
          URL.revokeObjectURL(photoImg.dataset.objectUrl);
          delete photoImg.dataset.objectUrl;
        }
        photoImg.removeAttribute('src');
        panel.classList.remove('has-photo');
        fileInput.value = '';
      });
    }
  });
}

/* Engancha junto al resto del init */
document.addEventListener('DOMContentLoaded', () => {
  setupPhotoUploads();
});
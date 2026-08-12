/**
 * Lightweight canvas confetti burst — no external dependencies.
 * Uses HH Goa palette: acid yellow, hot pink, white, cyan.
 */

const COLORS = ['#e2f542', '#e8368f', '#f4f0e8', '#00f5ff', '#f0c040'];
const GRAVITY = 0.35;
const DRAG = 0.97;
const DURATION_MS = 2200;

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

function createParticle(x, y) {
  const angle = randomBetween(-Math.PI * 0.9, -Math.PI * 0.1);
  const speed = randomBetween(6, 18);
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: randomBetween(5, 11),
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
    rotation: randomBetween(0, Math.PI * 2),
    rotationSpeed: randomBetween(-0.2, 0.2),
    alpha: 1,
  };
}

/**
 * Fire a confetti burst from the bottom-center of the screen.
 * Creates a temporary canvas overlay, animates, then cleans up.
 */
export function fireConfetti() {
  // Create overlay canvas
  const canvas = document.createElement('canvas');
  canvas.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    pointer-events: none;
    z-index: 9999;
  `;
  document.body.appendChild(canvas);

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();

  const ctx = canvas.getContext('2d');
  const originX = canvas.width / 2;
  const originY = canvas.height * 0.85;

  // Spawn particles
  const COUNT = 90;
  const particles = Array.from({ length: COUNT }, () => createParticle(originX, originY));

  const start = performance.now();
  let raf;

  function tick(now) {
    const elapsed = now - start;
    if (elapsed > DURATION_MS) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.body.removeChild(canvas);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const progress = elapsed / DURATION_MS;

    particles.forEach((p) => {
      // Physics
      p.vx *= DRAG;
      p.vy = p.vy * DRAG + GRAVITY;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.rotationSpeed;
      p.alpha = Math.max(0, 1 - Math.pow(progress, 1.5) * 1.4);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);
}

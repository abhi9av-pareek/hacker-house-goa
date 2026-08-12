/**
 * Squad renderer — unified HH Goa composition for 1–3 people.
 * Output: 1350×1080 (landscape/wide).
 *
 * Templates: 'classic' | 'neon' | 'minimal' | 'vintage'
 */
import {
  COLORS,
  drawGrid,
  drawCornerMarks,
  drawCrosshair,
  drawImageCover,
  withClipRect,
  drawText,
  drawRule,
  drawPhotoVignette,
  drawHashtag,
} from './primitives.js';
import { applyStamp } from './stamps.js';

const W = 1350;
const H = 1080;
const DPR = 2;

// ── Template palettes ──────────────────────────────────────────────────────

const TEMPLATES = {
  classic: {
    bg: '#0d1a10',
    bgAlt: '#111c14',
    accent: '#e2f542',
    accentPink: '#e8368f',
    white: '#f4f0e8',
    muted: '#7a9e82',
    line: 'rgba(226,245,66,0.18)',
    dark: '#050c07',
    showGrid: true,
    scanlines: true,
  },
  neon: {
    bg: '#050a0f',
    bgAlt: '#08111a',
    accent: '#00f5ff',
    accentPink: '#ff2d78',
    white: '#e8f4ff',
    muted: '#4a7a9b',
    line: 'rgba(0,245,255,0.18)',
    dark: '#000509',
    showGrid: true,
    scanlines: true,
    glow: true,
  },
  minimal: {
    bg: '#0a0a0a',
    bgAlt: '#111111',
    accent: '#ffffff',
    accentPink: '#e8368f',
    white: '#ffffff',
    muted: '#666666',
    line: 'rgba(255,255,255,0.12)',
    dark: '#000000',
    showGrid: false,
    scanlines: false,
  },
  vintage: {
    bg: '#1a1208',
    bgAlt: '#221a0a',
    accent: '#f0c040',
    accentPink: '#c0522a',
    white: '#f5ead5',
    muted: '#8a7055',
    line: 'rgba(240,192,64,0.2)',
    dark: '#0a0800',
    showGrid: true,
    scanlines: false,
    grain: true,
  },
};

function drawGrain(ctx, W, H) {
  ctx.save();
  ctx.globalAlpha = 0.06;
  for (let i = 0; i < W * H * 0.003; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const s = Math.random() * 2 + 0.5;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,1)' : 'rgba(0,0,0,1)';
    ctx.fillRect(x, y, s, s);
  }
  ctx.restore();
}

export function renderSquad(canvas, { people, template = 'classic', stamp = null }) {
  canvas.width = W * DPR;
  canvas.height = H * DPR;

  const ctx = canvas.getContext('2d');
  ctx.scale(DPR, DPR);

  const T = TEMPLATES[template] || TEMPLATES.classic;
  const count = Math.min(people.length, 3);

  // ── Background ──────────────────────────────────────────────────────────
  ctx.fillStyle = T.bg;
  ctx.fillRect(0, 0, W, H);
  if (T.showGrid) drawGrid(ctx, W, H, 0.04, T.accent);

  // ── Header ───────────────────────────────────────────────────────────────
  const headerH = 130;
  ctx.fillStyle = T.bgAlt;
  ctx.fillRect(0, 0, W, headerH);
  drawRule(ctx, 0, headerH, W, T.line, 1);

  // Left: wordmark compact
  if (T.glow) {
    ctx.save();
    ctx.shadowColor = T.accent;
    ctx.shadowBlur = 18;
    drawText(ctx, 'HH GOA', 52, 34, {
      font: `900 58px "Space Grotesk", Arial Black, sans-serif`,
      fill: T.white,
      align: 'left',
      baseline: 'top',
    });
    ctx.restore();
  } else {
    drawText(ctx, 'HH GOA', 52, 34, {
      font: `900 58px "Space Grotesk", Arial Black, sans-serif`,
      fill: T.white,
      align: 'left',
      baseline: 'top',
    });
  }
  drawText(ctx, '2026', 52, 98, {
    font: `700 20px "Space Mono", monospace`,
    fill: T.accent,
    align: 'left',
    baseline: 'top',
  });

  // Center tagline
  drawText(ctx, 'BUILDING THE FUTURE. TOGETHER.', W / 2, 52, {
    font: `700 16px "Space Mono", monospace`,
    fill: T.muted,
    align: 'center',
    baseline: 'top',
  });
  drawText(ctx, `${count} BUILDER${count === 1 ? '' : 'S'} · GOA, INDIA · 28–31 OCT`, W / 2, 80, {
    font: `800 15px "Space Mono", monospace`,
    fill: T.accent,
    align: 'center',
    baseline: 'top',
  });

  // Right: meta
  drawText(ctx, '#FrameInGoa', W - 52, 42, {
    font: `800 22px "Space Grotesk", Arial, sans-serif`,
    fill: T.accentPink,
    align: 'right',
    baseline: 'top',
  });
  drawText(ctx, 'SQUAD FRAME', W - 52, 74, {
    font: `700 14px "Space Mono", monospace`,
    fill: T.muted,
    align: 'right',
    baseline: 'top',
  });

  // ── Photo cards ──────────────────────────────────────────────────────────
  const cardPad = 52;
  const cardGap = 16;
  const totalCardW = W - cardPad * 2;
  const cardW = count === 1
    ? totalCardW
    : count === 2
      ? (totalCardW - cardGap) / 2
      : (totalCardW - cardGap * 2) / 3;
  const cardTop = headerH + 24;
  const cardBottom = H - 140;
  const cardH = cardBottom - cardTop;
  const cardR = template === 'minimal' ? 2 : 10;

  for (let idx = 0; idx < count; idx++) {
    const person = people[idx];
    const cx = cardPad + idx * (cardW + cardGap);
    const cy = cardTop;

    if (T.glow) {
      ctx.save();
      ctx.shadowColor = T.accent;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = T.accent;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cardW, cardH, cardR);
      ctx.stroke();
      ctx.restore();
    }

    // Photo
    if (person.image) {
      withClipRect(ctx, cx, cy, cardW, cardH, cardR, (c) => {
        drawImageCover(c, person.image, cx, cy, cardW, cardH, person.adjust || {});
      });
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(cx, cy, cardW, cardH, cardR);
      ctx.clip();
      drawPhotoVignette(ctx, cx, cy, cardW, cardH, 'bottom', T.bg);
      ctx.restore();
    } else {
      ctx.fillStyle = T.bgAlt;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cardW, cardH, cardR);
      ctx.fill();

      drawText(ctx, `BUILDER ${idx + 1}`, cx + cardW / 2, cy + cardH / 2 - 20, {
        font: `900 32px "Space Grotesk", Arial Black, sans-serif`,
        fill: T.accent,
        align: 'center',
        baseline: 'middle',
        alpha: 0.2,
      });
    }

    // Corner marks
    drawCornerMarks(ctx, cx, cy, cardW, cardH, T.accent, 24, 2);

    // Index badge
    ctx.save();
    ctx.fillStyle = T.accent;
    ctx.fillRect(cx + cardW - 44, cy + 14, 30, 22);
    drawText(ctx, `0${idx + 1}`, cx + cardW - 29, cy + 17, {
      font: `800 12px "Space Mono", monospace`,
      fill: T.dark,
      align: 'center',
      baseline: 'top',
    });
    ctx.restore();

    // Name over photo
    const nameInCard = (person.name || `BUILDER ${idx + 1}`).toUpperCase();
    const roleInCard = (person.role || '').toUpperCase();

    let nameFontSize = count === 1 ? 44 : count === 2 ? 36 : 26;
    ctx.font = `900 ${nameFontSize}px "Space Grotesk", Arial Black, sans-serif`;
    while (ctx.measureText(nameInCard).width > cardW - 24 && nameFontSize > 16) {
      nameFontSize -= 1;
      ctx.font = `900 ${nameFontSize}px "Space Grotesk", Arial Black, sans-serif`;
    }

    drawText(ctx, nameInCard, cx + 14, cy + cardH - (roleInCard ? 62 : 34), {
      font: `900 ${nameFontSize}px "Space Grotesk", Arial Black, sans-serif`,
      fill: T.white,
      align: 'left',
      baseline: 'top',
    });

    if (roleInCard) {
      let roleFontSize = count === 1 ? 22 : count === 2 ? 18 : 14;
      ctx.font = `700 ${roleFontSize}px "Space Mono", monospace`;
      while (ctx.measureText(roleInCard).width > cardW - 24 && roleFontSize > 10) {
        roleFontSize -= 1;
        ctx.font = `700 ${roleFontSize}px "Space Mono", monospace`;
      }
      drawText(ctx, roleInCard, cx + 14, cy + cardH - 30, {
        font: `700 ${roleFontSize}px "Space Mono", monospace`,
        fill: T.accent,
        align: 'left',
        baseline: 'top',
      });
    }
  }

  // ── Footer accent bar ─────────────────────────────────────────────────────
  const footerY = cardBottom + 20;
  drawRule(ctx, 0, footerY, W, T.line, 1);

  ctx.fillStyle = T.accent;
  if (T.glow) {
    ctx.save();
    ctx.shadowColor = T.accent;
    ctx.shadowBlur = 20;
    ctx.fillStyle = T.accent;
    ctx.fillRect(0, H - 72, W, 72);
    ctx.restore();
  }
  ctx.fillRect(0, H - 72, W, 72);

  drawText(ctx, '#FrameInGoa', 52, H - 72 + 36, {
    font: `900 32px "Space Grotesk", Arial Black, sans-serif`,
    fill: T.dark,
    align: 'left',
    baseline: 'middle',
  });

  drawText(ctx, 'HACKER HOUSE GOA 2026', W - 52, H - 72 + 28, {
    font: `800 18px "Space Grotesk", Arial Black, sans-serif`,
    fill: T.dark,
    align: 'right',
    baseline: 'middle',
    alpha: 0.7,
  });

  drawText(ctx, '247 BUILDERS · 04 DAYS · 1 RHYTHM', W - 52, H - 72 + 52, {
    font: `700 13px "Space Mono", monospace`,
    fill: T.dark,
    align: 'right',
    baseline: 'middle',
    alpha: 0.55,
  });

  // ── Grain / scanlines ─────────────────────────────────────────────────────
  if (T.grain) drawGrain(ctx, W, H);
  if (T.scanlines) {
    for (let y = 0; y < H; y += 3) {
      ctx.fillStyle = 'rgba(0,0,0,0.03)';
      ctx.fillRect(0, y, W, 1);
    }
  }

  // ── Stamp overlay ─────────────────────────────────────────────────────────
  if (stamp) applyStamp(ctx, W, H, stamp);
}

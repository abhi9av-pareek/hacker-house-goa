/**
 * Shared canvas drawing primitives for HH Goa 2026 renderers.
 * All coordinates are in canvas units (already DPI-scaled by the caller).
 */

export const COLORS = {
  bg: '#0d1a10',           // Near-black forest green
  bgAlt: '#111c14',        // Slightly lighter panel
  accent: '#e2f542',       // Acid yellow-green (matches HH Goa)
  accentPink: '#e8368f',   // Hot pink (Hindi गोवा text color)
  white: '#f4f0e8',        // Warm off-white
  muted: '#7a9e82',        // Muted green-white
  line: 'rgba(226,245,66,0.18)',  // Accent-tinted thin rule
  lineWhite: 'rgba(244,240,232,0.12)',
  dark: '#050c07',
};

/**
 * Draw a hairline grid across the entire canvas (very subtle).
 */
export function drawGrid(ctx, W, H, opacity = 0.055, accentColor = '#e2f542') {
  ctx.save();
  // Convert hex accent to rgb for rgba usage
  const r = parseInt(accentColor.slice(1, 3), 16) || 226;
  const g = parseInt(accentColor.slice(3, 5), 16) || 245;
  const b = parseInt(accentColor.slice(5, 7), 16) || 66;
  ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
  ctx.lineWidth = 0.5;
  const step = 60;
  for (let x = 0; x < W; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y < H; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draw corner registration marks (L-shaped).
 */
export function drawCornerMarks(ctx, x, y, w, h, color = COLORS.accent, len = 36, lw = 2.5) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.lineCap = 'square';
  const corners = [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]];
  corners.forEach(([cx, cy, sx, sy]) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + sy * len);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + sx * len, cy);
    ctx.stroke();
  });
  ctx.restore();
}

/**
 * Draw a crosshair mark.
 */
export function drawCrosshair(ctx, cx, cy, size = 12, color = COLORS.accent, opacity = 0.5) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = opacity;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - size, cy); ctx.lineTo(cx + size, cy);
  ctx.moveTo(cx, cy - size); ctx.lineTo(cx, cy + size);
  ctx.stroke();
  // small circle
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw text with precise control.
 */
export function drawText(ctx, text, x, y, {
  font = '700 28px "Space Grotesk", Arial, sans-serif',
  fill = COLORS.white,
  align = 'left',
  baseline = 'top',
  alpha = 1,
  letterSpacing = 0,
} = {}) {
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.globalAlpha = alpha;
  if (letterSpacing && ctx.letterSpacing !== undefined) {
    ctx.letterSpacing = `${letterSpacing}px`;
  }
  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Draw image to cover a rect (object-fit: cover), centered.
 * adjust: { scale: 1, offsetX: 0, offsetY: 0 }
 *   offsetX/offsetY: -1 to +1 — fraction of image overflow to shift
 *   scale: 1.0+ — zoom multiplier on top of cover ratio
 */
export function drawImageCover(ctx, img, x, y, w, h, adjust = {}) {
  if (!img) return;
  const { scale = 1, offsetX = 0, offsetY = 0 } = adjust;
  const ratio = Math.max(w / img.width, h / img.height) * scale;
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  // overflow: how much larger the image is than the frame
  const overflowX = dw - w;
  const overflowY = dh - h;
  // offset shifts the image within the overflow range
  const ox = (overflowX / 2) * offsetX;
  const oy = (overflowY / 2) * offsetY;
  const dx = x + (w - dw) / 2 + ox;
  const dy = y + (h - dh) / 2 + oy;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Draw a filled rectangle with a clip.
 */
export function withClipRect(ctx, x, y, w, h, radius, fn) {
  ctx.save();
  ctx.beginPath();
  if (radius) {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.clip();
  fn(ctx);
  ctx.restore();
}

/**
 * Draw the HH GOA wordmark in the upper-left (canvas units).
 * Replicates the condensed serif "HACKER HOUSE" feel with our text.
 */
export function drawWordmark(ctx, x, y, scale = 1) {
  const S = scale;
  // "HH" — big weight
  drawText(ctx, 'HH', x, y, {
    font: `900 ${Math.round(90 * S)}px "Space Grotesk", Arial Black, sans-serif`,
    fill: COLORS.white,
    align: 'left',
    baseline: 'top',
  });
  // "GOA" — accent color
  drawText(ctx, 'GOA', x, y + Math.round(84 * S), {
    font: `900 ${Math.round(90 * S)}px "Space Grotesk", Arial Black, sans-serif`,
    fill: COLORS.accent,
    align: 'left',
    baseline: 'top',
  });
  // "2026" — small monospace
  drawText(ctx, '2026', x + Math.round(4 * S), y + Math.round(170 * S), {
    font: `700 ${Math.round(26 * S)}px "Space Mono", monospace`,
    fill: COLORS.muted,
    align: 'left',
    baseline: 'top',
    letterSpacing: 2 * S,
  });
}

/**
 * Draw thin horizontal rule.
 */
export function drawRule(ctx, x, y, w, color = COLORS.line, lw = 1) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw the "GOA, INDIA · 28–31 OCT 2026" tag block in the top-right.
 */
export function drawMetaTag(ctx, x, y, scale = 1) {
  const S = scale;
  drawText(ctx, 'GOA, INDIA', x, y, {
    font: `700 ${Math.round(20 * S)}px "Space Mono", monospace`,
    fill: COLORS.muted,
    align: 'right',
    baseline: 'top',
  });
  drawText(ctx, '28–31 OCT 2026', x, y + Math.round(30 * S), {
    font: `700 ${Math.round(20 * S)}px "Space Mono", monospace`,
    fill: COLORS.accent,
    align: 'right',
    baseline: 'top',
  });
}

/**
 * Draw the #FrameInGoa hashtag (usually bottom-right).
 */
export function drawHashtag(ctx, x, y, scale = 1, align = 'right') {
  const S = scale;
  drawText(ctx, '#FrameInGoa', x, y, {
    font: `800 ${Math.round(22 * S)}px "Space Grotesk", Arial, sans-serif`,
    fill: COLORS.accentPink,
    align,
    baseline: 'top',
  });
}

/**
 * Draw a solid accent bar (usually at the bottom).
 */
export function drawAccentBar(ctx, x, y, w, h, text1 = '', text2 = '', scale = 1) {
  const S = scale;
  ctx.save();
  ctx.fillStyle = COLORS.accent;
  ctx.fillRect(x, y, w, h);
  if (text1) {
    drawText(ctx, text1, x + Math.round(24 * S), y + h / 2, {
      font: `900 ${Math.round(22 * S)}px "Space Grotesk", Arial Black, sans-serif`,
      fill: COLORS.dark,
      align: 'left',
      baseline: 'middle',
    });
  }
  if (text2) {
    drawText(ctx, text2, x + w - Math.round(24 * S), y + h / 2, {
      font: `800 ${Math.round(16 * S)}px "Space Mono", monospace`,
      fill: COLORS.dark,
      align: 'right',
      baseline: 'middle',
    });
  }
  ctx.restore();
}

/**
 * Overlay a dark gradient vignette at bottom of image area
 * to make text over photos more legible.
 */
export function drawPhotoVignette(ctx, x, y, w, h, direction = 'bottom', bgColor = '#0d1a10') {
  ctx.save();
  // Parse hex bg color to rgb
  let r = 13, g = 26, b = 16;
  if (bgColor && bgColor.startsWith('#') && bgColor.length >= 7) {
    r = parseInt(bgColor.slice(1, 3), 16);
    g = parseInt(bgColor.slice(3, 5), 16);
    b = parseInt(bgColor.slice(5, 7), 16);
  }
  let grad;
  if (direction === 'bottom') {
    grad = ctx.createLinearGradient(x, y + h * 0.5, x, y + h);
    grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0.92)`);
  } else {
    grad = ctx.createLinearGradient(x, y, x, y + h * 0.5);
    grad.addColorStop(0, `rgba(${r},${g},${b},0.92)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},0)`);
  }
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

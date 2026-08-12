/**
 * Share utilities: Web Share API + X (Twitter) compose URL fallback.
 */

/**
 * Try native share (mobile), then fall back to X compose.
 */
export async function shareToX({ canvas, name }) {
  const caption = `Just built my HH Goa 2026 identity. Are you in? 🌊\n#FrameInGoa #HHGoa2026`;

  // Try native Web Share API first (mobile browsers)
  if (navigator.share && navigator.canShare) {
    try {
      const blob = await canvasToBlob(canvas);
      const file = new File([blob], 'hh-goa-2026.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'HH Goa 2026 · Frame Generator',
          text: caption,
          files: [file],
        });
        return { method: 'native' };
      }
    } catch (e) {
      if (e?.name === 'AbortError') return { method: 'cancelled' };
      // Fall through to X intent
    }
  }

  // Open X compose with pre-filled caption
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent('https://hhgoa.com')}`;
  window.open(tweetUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
  return { method: 'x-intent' };
}

/**
 * Download the canvas as PNG
 */
export async function downloadPNG(canvas, filename) {
  const blob = await canvasToBlob(canvas);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = filename;
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create image blob'));
      },
      'image/png'
    );
  });
}

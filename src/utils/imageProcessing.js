import heic2any from 'heic2any';

const MAX_DIMENSION = 3840; // 4K max for input

/**
 * Load an image file, converting HEIC if needed, and return an HTMLImageElement + object URL.
 */
export async function loadImageFile(file) {
  if (!file) throw new Error('No file provided');

  const isHeic = /heic|heif/i.test(file.type) || /\.hei[cf]$/i.test(file.name);

  let blob = file;
  if (isHeic) {
    try {
      const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
      blob = Array.isArray(converted) ? converted[0] : converted;
    } catch (e) {
      throw new Error('Could not convert HEIC image. Please try a JPG or PNG instead.');
    }
  }

  if (!blob.type.startsWith('image/')) {
    throw new Error('Unsupported file type. Please use JPG, PNG, or HEIC.');
  }

  if (blob.size > 50 * 1024 * 1024) {
    throw new Error('Image is too large (max 50MB). Please use a smaller file.');
  }

  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Failed to decode image. The file may be corrupted.'));
      i.src = url;
    });
    return { image: img, url };
  } catch (err) {
    URL.revokeObjectURL(url);
    throw err;
  }
}

/**
 * Draw an image to cover a rectangle, centered, with optional scale and offset.
 */
export function drawImageCover(ctx, img, x, y, w, h, scale = 1, offsetX = 0, offsetY = 0) {
  const ratio = Math.max(w / img.width, h / img.height) * scale;
  const dw = img.width * ratio;
  const dh = img.height * ratio;
  const dx = x + (w - dw) / 2 + offsetX;
  const dy = y + (h - dh) / 2 + offsetY;
  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Safe filename from a display name
 */
export function safeName(name) {
  return (name || 'builder')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'builder';
}

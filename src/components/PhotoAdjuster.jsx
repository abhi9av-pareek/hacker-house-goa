import React, { useCallback, useEffect, useRef } from 'react';

const DEFAULT_ADJUST = { offsetX: 0, offsetY: 0, scale: 1 };

/**
 * PhotoAdjuster — drag to pan, slider to zoom.
 *
 * adjust: { offsetX: -1..1, offsetY: -1..1, scale: 1..2.5 }
 *   offsetX/Y: -1 = shift fully left/up, 0 = center, +1 = shift fully right/down
 *   (matches the canvas renderer's drawImageCover convention)
 */
export default function PhotoAdjuster({ objectUrl, adjust = DEFAULT_ADJUST, onChange, compact = false }) {
  const { offsetX = 0, offsetY = 0, scale = 1 } = adjust;
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const startData = useRef({ x: 0, y: 0, ox: 0, oy: 0 });

  // ── Event helpers ─────────────────────────────────────────────────────────
  const getClientXY = (e) =>
    e.touches ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : { x: e.clientX, y: e.clientY };

  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;
    const pt = getClientXY(e);
    startData.current = { x: pt.x, y: pt.y, ox: offsetX, oy: offsetY };
  }, [offsetX, offsetY]);

  const onPointerMove = useCallback((e) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pt = getClientXY(e);
    // Sensitivity: dragging the full container width maps to 2 units (full -1 to +1 range)
    const dx = (pt.x - startData.current.x) / rect.width * 2;
    const dy = (pt.y - startData.current.y) / rect.height * 2;
    onChange({
      ...adjust,
      offsetX: Math.max(-1, Math.min(1, startData.current.ox + dx)),
      offsetY: Math.max(-1, Math.min(1, startData.current.oy + dy)),
    });
  }, [adjust, onChange]);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchmove', onPointerMove, { passive: false });
    window.addEventListener('touchend', onPointerUp);
    return () => {
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
    };
  }, [onPointerMove, onPointerUp]);

  // ── CSS preview ────────────────────────────────────────────────────────────
  // Map our offsetX/Y (-1..1) → CSS objectPosition (0%..100%)
  // offsetX = +1 → shows left edge (0%)  |  offsetX = -1 → shows right edge (100%)
  const posX = `${((1 - offsetX) / 2) * 100}%`;
  const posY = `${((1 - offsetY) / 2) * 100}%`;
  const isDefault = offsetX === 0 && offsetY === 0 && scale === 1;

  return (
    <div className={`photo-adjuster${compact ? ' compact' : ''}`}>
      <div className="adjuster-header">
        <span className="adjuster-label">ADJUST PHOTO</span>
        {!isDefault && (
          <button
            className="adjuster-reset"
            onClick={() => onChange(DEFAULT_ADJUST)}
            type="button"
            aria-label="Reset photo position"
          >
            RESET
          </button>
        )}
      </div>

      {/* Draggable preview */}
      <div
        ref={containerRef}
        className="adjuster-viewport"
        onMouseDown={onPointerDown}
        onTouchStart={onPointerDown}
        role="img"
        aria-label="Drag to reposition photo"
        title="Drag to reposition"
      >
        <img
          src={objectUrl}
          alt=""
          draggable={false}
          className="adjuster-img"
          style={{
            objectPosition: `${posX} ${posY}`,
            transform: scale !== 1 ? `scale(${scale})` : 'none',
            transformOrigin: `${posX} ${posY}`,
          }}
        />
        {/* Reticle crosshair center marker */}
        <div className="adjuster-reticle" aria-hidden="true">
          <div className="adjuster-reticle-h" />
          <div className="adjuster-reticle-v" />
          <div className="adjuster-reticle-dot" />
        </div>
        <div className="adjuster-drag-hint" aria-hidden="true">DRAG TO PAN</div>
      </div>

      {/* Zoom slider */}
      <div className="adjuster-zoom-row">
        <span className="adjuster-zoom-label">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8.5 8.5L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M3 5h4M5 3v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          ZOOM
        </span>
        <input
          type="range"
          min="1"
          max="2.5"
          step="0.05"
          value={scale}
          onChange={(e) => onChange({ ...adjust, scale: parseFloat(e.target.value) })}
          className="adjuster-slider"
          aria-label={`Zoom: ${scale.toFixed(1)}×`}
        />
        <span className="adjuster-zoom-value">{scale.toFixed(1)}×</span>
      </div>
    </div>
  );
}

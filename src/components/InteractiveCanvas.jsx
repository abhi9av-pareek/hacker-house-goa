import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * InteractiveCanvas — Instagram-style direct canvas touch/drag/pinch adjustment.
 * Supports:
 *   - 1 finger / mouse drag to pan image (offsetX, offsetY)
 *   - 2 finger pinch to zoom image (scale)
 *   - Mouse wheel scroll to zoom
 *   - Direct visual hint & quick inline zoom/reset controls
 */
export default function InteractiveCanvas({
  canvasRef,
  hasImage,
  adjust = { offsetX: 0, offsetY: 0, scale: 1 },
  onAdjustChange,
  template,
  canGenerate,
}) {
  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const startPinchDist = useRef(null);
  const startPinchScale = useRef(1);
  const [isInteracting, setIsInteracting] = useState(false);

  const { offsetX = 0, offsetY = 0, scale = 1 } = adjust;

  // ── Touch distance helper for pinch zoom ──────────────────────────────────
  const getTouchDistance = (e) => {
    if (!e.touches || e.touches.length < 2) return null;
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.hypot(dx, dy);
  };

  // ── Pointer Down / Touch Start ────────────────────────────────────────────
  const handlePointerDown = useCallback(
    (e) => {
      if (!hasImage || !onAdjustChange) return;

      // Handle 2-finger pinch
      if (e.touches && e.touches.length === 2) {
        const dist = getTouchDistance(e);
        if (dist) {
          startPinchDist.current = dist;
          startPinchScale.current = scale;
        }
        return;
      }

      // Single touch / mouse drag
      isDragging.current = true;
      setIsInteracting(true);
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startPos.current = { x: clientX, y: clientY, ox: offsetX, oy: offsetY };
    },
    [hasImage, onAdjustChange, offsetX, offsetY, scale]
  );

  // ── Pointer Move / Touch Move ─────────────────────────────────────────────
  const handlePointerMove = useCallback(
    (e) => {
      if (!hasImage || !onAdjustChange) return;

      // Pinch zoom handling
      if (e.touches && e.touches.length === 2 && startPinchDist.current) {
        e.preventDefault();
        const dist = getTouchDistance(e);
        if (dist) {
          const ratio = dist / startPinchDist.current;
          const newScale = Math.max(1, Math.min(2.5, startPinchScale.current * ratio));
          onAdjustChange({ ...adjust, scale: parseFloat(newScale.toFixed(2)) });
        }
        return;
      }

      // Single finger / mouse pan
      if (!isDragging.current || !containerRef.current) return;
      if (e.cancelable) e.preventDefault();

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const dx = ((clientX - startPos.current.x) / rect.width) * 2.2;
      const dy = ((clientY - startPos.current.y) / rect.height) * 2.2;

      onAdjustChange({
        ...adjust,
        offsetX: Math.max(-1, Math.min(1, startPos.current.ox + dx)),
        offsetY: Math.max(-1, Math.min(1, startPos.current.oy + dy)),
      });
    },
    [hasImage, onAdjustChange, adjust]
  );

  // ── Pointer Up / Touch End ────────────────────────────────────────────────
  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
    startPinchDist.current = null;
    setIsInteracting(false);
  }, []);

  // ── Wheel Zoom ────────────────────────────────────────────────────────────
  const handleWheel = useCallback(
    (e) => {
      if (!hasImage || !onAdjustChange) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      const newScale = Math.max(1, Math.min(2.5, scale + delta));
      onAdjustChange({ ...adjust, scale: parseFloat(newScale.toFixed(2)) });
    },
    [hasImage, onAdjustChange, adjust, scale]
  );

  // Global listeners for drag continuation outside container
  useEffect(() => {
    const move = (e) => handlePointerMove(e);
    const up = () => handlePointerUp();

    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);

    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [handlePointerMove, handlePointerUp]);

  const isDefaultAdjust = offsetX === 0 && offsetY === 0 && scale === 1;

  return (
    <div className="canvas-wrapper">
      <div
        ref={containerRef}
        className={`canvas-area${hasImage ? ' interactive-canvas' : ''}${isInteracting ? ' dragging' : ''}`}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          className="output-canvas canvas-visible"
          aria-label="Generated HH Goa frame preview"
        />

        {/* Empty State */}
        {!canGenerate && (
          <div className="empty-state" aria-hidden="true">
            <div className="empty-hhg">
              <span className="empty-hhg-h">H</span>
              <span className="empty-hhg-h">H</span>
              <span className="empty-hhg-g">G</span>
            </div>
            <div className="empty-text">
              UPLOAD A PHOTO<br />TO START BUILDING
            </div>
            <div className="empty-sub">NO LOGIN · CLIENT-SIDE GENERATION</div>
          </div>
        )}

        {/* Direct Touch / Drag Hint Overlay */}
        {hasImage && (
          <div className={`canvas-gesture-hint${isInteracting ? ' hidden' : ''}`} aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
            </svg>
            <span>DRAG IMAGE TO POSITION · PINCH TO ZOOM</span>
          </div>
        )}
      </div>

      {/* Floating Canvas Toolbar (Zoom Slider & Quick Controls) */}
      {hasImage && onAdjustChange && (
        <div className="canvas-adjust-toolbar" aria-label="Photo adjustment tools">
          <div className="canvas-zoom-controls">
            <span className="canvas-toolbar-label">ZOOM</span>
            <button
              type="button"
              className="zoom-btn"
              onClick={() => onAdjustChange({ ...adjust, scale: Math.max(1, parseFloat((scale - 0.15).toFixed(2))) })}
              aria-label="Zoom out"
              disabled={scale <= 1}
            >
              −
            </button>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={scale}
              onChange={(e) => onAdjustChange({ ...adjust, scale: parseFloat(e.target.value) })}
              className="canvas-zoom-slider"
              aria-label={`Zoom: ${scale.toFixed(1)}x`}
            />
            <button
              type="button"
              className="zoom-btn"
              onClick={() => onAdjustChange({ ...adjust, scale: Math.min(2.5, parseFloat((scale + 0.15).toFixed(2))) })}
              aria-label="Zoom in"
              disabled={scale >= 2.5}
            >
              +
            </button>
            <span className="zoom-val">{scale.toFixed(1)}×</span>
          </div>

          {!isDefaultAdjust && (
            <button
              type="button"
              className="canvas-reset-btn"
              onClick={() => onAdjustChange({ offsetX: 0, offsetY: 0, scale: 1 })}
            >
              RESET POSITION
            </button>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

import './styles.css';

import ModeSwitcher from './components/ModeSwitcher.jsx';
import UploadZone from './components/UploadZone.jsx';
import BuilderForm from './components/BuilderForm.jsx';
import SquadBuilder from './components/SquadBuilder.jsx';
import ActionBar from './components/ActionBar.jsx';
import PhotoAdjuster from './components/PhotoAdjuster.jsx';
import TemplateSelector from './components/TemplateSelector.jsx';
import StampPicker from './components/StampPicker.jsx';
import Countdown from './components/Countdown.jsx';

import { renderFrame } from './renderers/frameRenderer.js';
import { renderBuilderId } from './renderers/builderIdRenderer.js';
import { renderSquad } from './renderers/squadRenderer.js';

import { loadImageFile } from './utils/imageProcessing.js';
import { makeBuilderClass } from './utils/builderClass.js';
import { downloadPNG, shareToX } from './utils/shareUtils.js';
import { fireConfetti } from './utils/confetti.js';

// ── Helpers ─────────────────────────────────────────────────────────────────

function safeFilename(name, mode) {
  const namePart = (name || 'builder')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'builder';
  const modePart = mode.toLowerCase().replace(/\s+/g, '-');
  return `hh-goa-2026-${modePart}-${namePart}.png`;
}

function revokeAll(people) {
  people.forEach((p) => {
    if (p.objectUrl) URL.revokeObjectURL(p.objectUrl);
  });
}

// ── App ──────────────────────────────────────────────────────────────────────

function App() {
  const [mode, setMode] = useState('FRAME');
  const [template, setTemplate] = useState('classic');
  const [stamp, setStamp] = useState(null);
  const [profile, setProfile] = useState({ name: '', role: '' });
  const [squadPeople, setSquadPeople] = useState([]);
  const [singlePerson, setSinglePerson] = useState(null);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);
  const [canvasVisible, setCanvasVisible] = useState(false);
  const canvasRef = useRef(null);
  const renderScheduled = useRef(false);

  const builderClass = makeBuilderClass(profile.role);

  // ── Derived ────────────────────────────────────────────────────────────────

  const canGenerate =
    mode === 'SQUAD'
      ? squadPeople.length > 0
      : Boolean(singlePerson?.image);

  // ── Canvas render dispatch ─────────────────────────────────────────────────

  const doRender = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      if (mode === 'FRAME') {
        renderFrame(canvas, {
          image: singlePerson?.image || null,
          adjust: singlePerson?.adjust || {},
          template,
          stamp,
        });
      } else if (mode === 'BUILDER ID') {
        renderBuilderId(canvas, {
          image: singlePerson?.image || null,
          name: profile.name,
          role: profile.role,
          builderClass,
          adjust: singlePerson?.adjust || {},
          template,
          stamp,
        });
      } else if (mode === 'SQUAD') {
        renderSquad(canvas, { people: squadPeople, template, stamp });
      }
      setHasRendered(true);
      // Trigger canvas fade-in
      setCanvasVisible(false);
      requestAnimationFrame(() => setCanvasVisible(true));
    } catch (err) {
      console.error('Render error:', err);
      setError('Something went wrong rendering the image. Please try again.');
    }
  }, [mode, singlePerson, profile, squadPeople, builderClass, template, stamp]);

  // Live preview: re-render whenever inputs change
  useEffect(() => {
    if (!canGenerate) return;
    if (renderScheduled.current) return;
    renderScheduled.current = true;
    requestAnimationFrame(() => {
      doRender();
      renderScheduled.current = false;
    });
  }, [doRender, canGenerate]);

  // ── Mode switch ────────────────────────────────────────────────────────────

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setError('');
    setHasRendered(false);
    setCanvasVisible(false);
  }, []);

  // ── File upload — single (FRAME / BUILDER ID) ─────────────────────────────

  const handleSingleFiles = useCallback(async (files) => {
    setError('');
    const file = Array.from(files)[0];
    if (!file) return;
    try {
      if (singlePerson?.objectUrl) URL.revokeObjectURL(singlePerson.objectUrl);
      const result = await loadImageFile(file);
      setSinglePerson({ image: result.image, objectUrl: result.url, adjust: { offsetX: 0, offsetY: 0, scale: 1 } });
    } catch (err) {
      setError(err.message || 'Could not read that image. Try JPG, PNG, or HEIC.');
    }
  }, [singlePerson]);

  // ── File upload — squad ────────────────────────────────────────────────────

  const handleSquadFiles = useCallback(async (files, insertIdx = null) => {
    setError('');
    try {
      const incoming = Array.from(files);
      const results = [];
      for (const file of incoming.slice(0, 3)) {
        const result = await loadImageFile(file);
        results.push({
          image: result.image,
          objectUrl: result.url,
          name: '',
          role: '',
          adjust: { offsetX: 0, offsetY: 0, scale: 1 },
        });
      }

      setSquadPeople((prev) => {
        const next = [...prev];
        if (insertIdx !== null && insertIdx < next.length) {
          if (next[insertIdx].objectUrl) URL.revokeObjectURL(next[insertIdx].objectUrl);
          next[insertIdx] = {
            ...next[insertIdx],
            image: results[0].image,
            objectUrl: results[0].objectUrl,
            adjust: { offsetX: 0, offsetY: 0, scale: 1 },
          };
          return next;
        }
        const remaining = 3 - next.length;
        return [...next, ...results.slice(0, remaining)];
      });
    } catch (err) {
      setError(err.message || 'Could not read that image. Try JPG, PNG, or HEIC.');
    }
  }, []);

  const handleUpdatePerson = useCallback((idx, key, value) => {
    setSquadPeople((prev) => prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p)));
  }, []);

  const handleUpdatePersonAdjust = useCallback((idx, newAdjust) => {
    setSquadPeople((prev) => prev.map((p, i) => (i === idx ? { ...p, adjust: newAdjust } : p)));
  }, []);

  const handleRemovePerson = useCallback((idx) => {
    setSquadPeople((prev) => {
      const next = [...prev];
      if (next[idx]?.objectUrl) URL.revokeObjectURL(next[idx].objectUrl);
      next.splice(idx, 1);
      return next;
    });
  }, []);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleGenerate = useCallback(() => {
    if (!canGenerate || isGenerating) return;
    setIsGenerating(true);
    setError('');
    requestAnimationFrame(() => {
      try {
        doRender();
      } catch (err) {
        setError('Render failed. Please try again.');
      } finally {
        setTimeout(() => setIsGenerating(false), 300);
      }
    });
  }, [canGenerate, isGenerating, doRender]);

  const handleDownload = useCallback(async () => {
    if (!canGenerate) return;
    try {
      doRender();
      await new Promise((r) => requestAnimationFrame(r));
      const filename = safeFilename(
        mode === 'SQUAD' ? (squadPeople[0]?.name || 'squad') : profile.name,
        mode
      );
      await downloadPNG(canvasRef.current, filename);
      // 🎉 Confetti on successful download
      fireConfetti();
    } catch (err) {
      setError('Download failed. Please try right-clicking the preview and saving instead.');
    }
  }, [canGenerate, doRender, mode, profile.name, squadPeople]);

  const handleShareX = useCallback(async () => {
    if (!canGenerate) return;
    try {
      doRender();
      await new Promise((r) => requestAnimationFrame(r));
      const result = await shareToX({
        canvas: canvasRef.current,
        name: profile.name,
      });
      if (result.method === 'x-intent') {
        const filename = safeFilename(profile.name, mode);
        await downloadPNG(canvasRef.current, filename);
        fireConfetti();
      }
    } catch (err) {
      if (err?.name !== 'AbortError') {
        setError('Share failed. Please download the image and post it manually.');
      }
    }
  }, [canGenerate, doRender, profile.name, mode]);

  // ── Cleanup on unmount ────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      if (singlePerson?.objectUrl) URL.revokeObjectURL(singlePerson.objectUrl);
      revokeAll(squadPeople);
    };
  }, []); // eslint-disable-line

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <header className="topbar" role="banner">
        <div className="brand-lockup">
          <div className="brand-hh" aria-label="HH">HH</div>
          <div className="brand-divider" aria-hidden="true" />
          <div>
            <div className="brand-goa">GOA</div>
            <div className="brand-year">2026</div>
          </div>
        </div>
        <div className="topbar-center" aria-hidden="true">
          <span className="topbar-tagline">BUILD YOUR IDENTITY</span>
        </div>
        <div className="topbar-meta">
          <span>GOA, INDIA</span>
          <span className="meta-sep">·</span>
          <span className="meta-date">28–31 OCT 2026</span>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="hero" aria-labelledby="hero-headline">
        <div className="hero-content">
          <h1 id="hero-headline" className="hero-h1">
            BUILD YOUR<br />
            <span className="hero-accent">HH GOA</span><br />
            IDENTITY.
          </h1>
          <p className="hero-sub">
            Frame it. Stamp it. Ship it. No login. No cropping. Seconds from upload to share.
          </p>
        </div>
        <Countdown />
      </section>

      {/* ── Workbench ── */}
      <main className="workbench" id="workbench" aria-label="Frame generator">
        {/* ── Left: Controls ── */}
        <section className="controls-panel" aria-label="Controls">
          <ModeSwitcher mode={mode} onChange={handleModeChange} />

          {/* Template selector */}
          <TemplateSelector template={template} onChange={setTemplate} />

          {/* Stamp picker */}
          <StampPicker stamp={stamp} onChange={setStamp} />

          {/* Upload zone */}
          {mode !== 'SQUAD' ? (
            <UploadZone
              onFiles={handleSingleFiles}
              multiple={false}
              label={singlePerson ? 'REPLACE PHOTO' : 'DROP PHOTO HERE'}
            />
          ) : squadPeople.length === 0 ? (
            <UploadZone
              onFiles={(files) => handleSquadFiles(files, null)}
              multiple={true}
              label="DROP SQUAD PHOTOS (UP TO 3)"
            />
          ) : null}

          {/* Photo adjuster — FRAME and BUILDER ID */}
          {mode !== 'SQUAD' && singlePerson?.objectUrl && (
            <PhotoAdjuster
              objectUrl={singlePerson.objectUrl}
              adjust={singlePerson.adjust}
              onChange={(newAdjust) => setSinglePerson((p) => ({ ...p, adjust: newAdjust }))}
            />
          )}

          {/* FRAME info chip */}
          {mode === 'FRAME' && singlePerson && (
            <div className="info-chip">
              <span className="info-chip-dot" aria-hidden="true" />
              THE ORIGINAL HH GOA FRAME · PROFILE READY
            </div>
          )}

          {/* Builder ID form */}
          {mode === 'BUILDER ID' && (
            <BuilderForm
              profile={profile}
              onChange={setProfile}
              builderClass={builderClass}
            />
          )}

          {/* Squad builder */}
          {mode === 'SQUAD' && (
            <SquadBuilder
              people={squadPeople}
              onFiles={handleSquadFiles}
              onUpdatePerson={handleUpdatePerson}
              onUpdatePersonAdjust={handleUpdatePersonAdjust}
              onRemovePerson={handleRemovePerson}
            />
          )}

          {/* Error */}
          {error && (
            <div className="error-msg" role="alert" aria-live="assertive">
              <span aria-hidden="true">⚠</span> {error}
            </div>
          )}

          {/* Actions */}
          <ActionBar
            canGenerate={canGenerate}
            isGenerating={isGenerating}
            mode={mode}
            onGenerate={handleGenerate}
            onDownload={handleDownload}
            onShareX={handleShareX}
          />
        </section>

        {/* ── Right: Preview ── */}
        <section className="preview-panel" aria-label="Live preview">
          <div className="preview-head">
            <span className="preview-head-label">LIVE OUTPUT</span>
            <div className="preview-head-right">
              <span className="preview-template-badge">{template.toUpperCase()}</span>
              <span className={`preview-status${canGenerate ? ' ready' : ''}`}>
                {canGenerate ? '● READY' : '○ AWAITING INPUT'}
              </span>
            </div>
          </div>

          <div className="canvas-area">
            <canvas
              ref={canvasRef}
              className={`output-canvas${canvasVisible ? ' canvas-visible' : ''}`}
              aria-label="Generated HH Goa frame preview"
            />
            {!canGenerate && (
              <div className="empty-state" aria-hidden="true">
                <div className="empty-hhg">
                  <span className="empty-hhg-h">H</span>
                  <span className="empty-hhg-h">H</span>
                  <span className="empty-hhg-g">G</span>
                </div>
                <div className="empty-text">UPLOAD A PHOTO<br />TO START BUILDING</div>
                <div className="empty-sub">NO LOGIN · NO ACCOUNT · CLIENT-SIDE</div>
              </div>
            )}
          </div>

          <div className="preview-foot">
            <span>LESS NOISE.</span>
            <span>MORE <strong>SIGNAL.</strong></span>
            <span className="preview-hashtag">#FrameInGoa</span>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="footer" role="contentinfo">
        <span>© 2026 HH GOA · 2:47 PM STUDIO</span>
        <span className="footer-hashtag">#FrameInGoa</span>
      </footer>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);

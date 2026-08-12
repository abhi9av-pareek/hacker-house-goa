import React from 'react';

export default function ActionBar({
  canGenerate,
  isGenerating,
  onGenerate,
  onDownload,
  onShareX,
  mode,
}) {
  return (
    <div className="action-bar">
      <button
        className="btn-primary"
        disabled={!canGenerate || isGenerating}
        onClick={onGenerate}
        id="btn-generate"
        aria-busy={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="btn-spinner" aria-hidden="true" />
            GENERATING…
          </>
        ) : (
          <>GENERATE {mode === 'SQUAD' ? 'SQUAD' : mode === 'BUILDER ID' ? 'ID CARD' : 'FRAME'} →</>
        )}
      </button>

      <button
        className="btn-secondary"
        disabled={!canGenerate}
        onClick={onDownload}
        id="btn-download"
        aria-label="Download as PNG"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M8 2v8M8 10l-3-3M8 10l3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 13h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
        DOWNLOAD PNG
      </button>

      <button
        className="btn-secondary btn-x"
        disabled={!canGenerate}
        onClick={onShareX}
        id="btn-share-x"
        aria-label="Share to X (Twitter)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
          <path d="M8.07 5.93 13.07 0h-1.19L7.54 5.15 4.14 0H0l5.25 7.64L0 14h1.19l4.59-5.34L9.86 14H14L8.07 5.93Zm-1.63 1.9-.53-.76L1.6.88h1.82l3.41 4.88.53.76 4.43 6.34h-1.82L6.44 7.83Z"/>
        </svg>
        SHARE TO X
      </button>
    </div>
  );
}

import React from 'react';

const MODES = [
  { id: 'FRAME', label: 'FRAME', sub: 'Profile pic' },
  { id: 'BUILDER ID', label: 'BUILDER ID', sub: 'Identity card' },
  { id: 'SQUAD', label: 'SQUAD', sub: '1–3 builders' },
];

export default function ModeSwitcher({ mode, onChange }) {
  return (
    <div className="mode-switcher" role="tablist" aria-label="Generator mode">
      {MODES.map((m) => (
        <button
          key={m.id}
          role="tab"
          aria-selected={mode === m.id}
          className={`mode-btn${mode === m.id ? ' active' : ''}`}
          onClick={() => onChange(m.id)}
          id={`mode-tab-${m.id.replace(/\s+/g, '-').toLowerCase()}`}
        >
          <span className="mode-btn-label">{m.label}</span>
          <span className="mode-btn-sub">{m.sub}</span>
        </button>
      ))}
    </div>
  );
}

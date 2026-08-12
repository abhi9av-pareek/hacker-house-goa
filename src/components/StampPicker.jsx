import React from 'react';

const STAMPS = [
  { id: 'shipping', label: 'SHIPPING', emoji: '🚀', color: '#e2f542' },
  { id: 'building', label: 'BUILDING', emoji: '⚡', color: '#e8368f' },
  { id: 'hacking',  label: 'HACKING',  emoji: '🛠', color: '#e2f542' },
  { id: 'vibing',   label: 'VIBING',   emoji: '🌊', color: '#60efff' },
  { id: 'lockedin', label: 'LOCKED IN', emoji: '🔒', color: '#e2f542' },
];

export default function StampPicker({ stamp, onChange }) {
  return (
    <div className="stamp-picker">
      <div className="stamp-picker-label">STAMP OVERLAY</div>
      <div className="stamp-chips">
        {STAMPS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`stamp-chip${stamp === s.id ? ' active' : ''}`}
            onClick={() => onChange(stamp === s.id ? null : s.id)}
            aria-pressed={stamp === s.id}
            aria-label={`${stamp === s.id ? 'Remove' : 'Apply'} ${s.label} stamp`}
            style={{ '--stamp-color': s.color }}
          >
            <span className="stamp-chip-emoji" aria-hidden="true">{s.emoji}</span>
            <span className="stamp-chip-label">{s.label}</span>
          </button>
        ))}
        {stamp && (
          <button
            type="button"
            className="stamp-chip stamp-chip-clear"
            onClick={() => onChange(null)}
            aria-label="Remove stamp"
          >
            ✕ NONE
          </button>
        )}
      </div>
    </div>
  );
}

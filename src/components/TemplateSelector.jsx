import React from 'react';

const TEMPLATES = [
  {
    id: 'classic',
    label: 'CLASSIC',
    sub: 'Dark forest · Acid yellow',
    bg: '#0d1a10',
    accent: '#e2f542',
    ring: '#e2f542',
  },
  {
    id: 'neon',
    label: 'NEON',
    sub: 'Deep space · Electric cyan',
    bg: '#050a0f',
    accent: '#00f5ff',
    ring: '#00f5ff',
  },
  {
    id: 'minimal',
    label: 'MINIMAL',
    sub: 'Pitch black · Pure white',
    bg: '#0a0a0a',
    accent: '#ffffff',
    ring: '#ffffff',
  },
  {
    id: 'vintage',
    label: 'VINTAGE',
    sub: 'Warm dark · Aged gold',
    bg: '#1a1208',
    accent: '#f0c040',
    ring: '#f0c040',
  },
];

export default function TemplateSelector({ template, onChange }) {
  return (
    <div className="template-selector">
      <div className="template-selector-label">TEMPLATE</div>
      <div className="template-grid">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`template-btn${template === t.id ? ' active' : ''}`}
            onClick={() => onChange(t.id)}
            aria-pressed={template === t.id}
            aria-label={`${t.label} template`}
            style={{ '--t-bg': t.bg, '--t-accent': t.accent, '--t-ring': t.ring }}
          >
            {/* Mini swatch */}
            <div className="template-swatch" aria-hidden="true">
              <div className="template-swatch-bg" />
              <div className="template-swatch-circle" />
              <div className="template-swatch-bar" />
            </div>
            <div className="template-btn-label">{t.label}</div>
            <div className="template-btn-sub">{t.sub}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
